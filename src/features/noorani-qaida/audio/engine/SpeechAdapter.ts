import { detectBrowserProfile, type BrowserProfile } from "./BrowserCompat";
import type { VoiceManager } from "./VoiceManager";

export interface SpeakRequest {
  text: string;
  lang: "ar" | "en";
  rate: number;
  pitch: number;
  signal?: AbortSignal;
}

/**
 * Low-level Web Speech adapter.
 * Components must never call speechSynthesis directly — only this adapter.
 */
export class SpeechAdapter {
  private profile: BrowserProfile = detectBrowserProfile();
  private resumeTimer: number | null = null;
  private generation = 0;

  constructor(private readonly voices: VoiceManager) {}

  cancel() {
    this.generation += 1;
    this.stopResumeWatch();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }
  }

  unlock() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const warm = new SpeechSynthesisUtterance(".");
      warm.volume = 0;
      warm.rate = 2;
      warm.lang = "ar-SA";
      window.speechSynthesis.speak(warm);
    } catch {
      /* ignore */
    }
  }

  async speak(request: SpeakRequest): Promise<{ ok: boolean; error?: string }> {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return { ok: false, error: "speech-synthesis-unavailable" };
    }
    if (!request.text.trim()) return { ok: false, error: "empty-text" };
    if (request.signal?.aborted) return { ok: false, error: "aborted" };

    await this.voices.ensureReady();
    this.voices.refreshIfChanged();

    const generation = ++this.generation;
    const synth = window.speechSynthesis;

    // Chromium often needs a brief gap after cancel before the next speak works.
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
    await wait(this.profile.os === "windows" ? 60 : 25);
    if (generation !== this.generation || request.signal?.aborted) {
      return { ok: false, error: "aborted" };
    }

    const utter = new SpeechSynthesisUtterance(request.text.trim());
    utter.rate = request.rate;
    utter.pitch = request.pitch;
    utter.volume = 1;

    if (request.lang === "ar") {
      const arabicVoice = this.voices.getSelected();
      if (arabicVoice) {
        utter.voice = arabicVoice;
        utter.lang = arabicVoice.lang || "ar-SA";
      } else {
        utter.lang = "ar-SA";
      }
    } else {
      utter.lang = "en-US";
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok: boolean, error?: string) => {
        if (settled) return;
        settled = true;
        this.stopResumeWatch();
        resolve({ ok, error });
      };

      if (request.signal) {
        const onAbort = () => {
          try {
            synth.cancel();
          } catch {
            /* ignore */
          }
          finish(false, "aborted");
        };
        if (request.signal.aborted) {
          onAbort();
          return;
        }
        request.signal.addEventListener("abort", onAbort, { once: true });
      }

      utter.onstart = () => {
        if (this.profile.needsResumeWatch) this.startResumeWatch();
      };
      utter.onend = () => finish(true);
      utter.onerror = (event) => finish(false, event.error || "utterance-error");

      try {
        synth.speak(utter);
        // Fail soft if the engine never starts (common when no Arabic pack).
        window.setTimeout(() => {
          if (!settled && generation === this.generation && !synth.speaking && !synth.pending) {
            finish(false, "engine-did-not-start");
          }
        }, 1200);
      } catch (error) {
        finish(false, error instanceof Error ? error.message : "speak-failed");
      }
    });
  }

  private startResumeWatch() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (this.resumeTimer != null) return;
    this.resumeTimer = window.setInterval(() => {
      try {
        if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
          this.stopResumeWatch();
        }
      } catch {
        this.stopResumeWatch();
      }
    }, 200);
  }

  private stopResumeWatch() {
    if (this.resumeTimer == null) return;
    window.clearInterval(this.resumeTimer);
    this.resumeTimer = null;
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}
