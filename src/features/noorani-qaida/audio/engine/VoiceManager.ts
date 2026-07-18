import type { VoiceScore } from "./types";
import { detectBrowserProfile, type BrowserProfile } from "./BrowserCompat";

const VOICE_CACHE_KEY = "noorpath.qaida.arabicVoice.v2";

/**
 * Enterprise Arabic voice ranking.
 * Never pick "first available". Score every Arabic voice explicitly.
 */
export class VoiceManager {
  private profile: BrowserProfile = detectBrowserProfile();
  private voices: SpeechSynthesisVoice[] = [];
  private selected: SpeechSynthesisVoice | null = null;
  private readyPromise: Promise<SpeechSynthesisVoice[]> | null = null;
  private ready = false;

  isReady() {
    return this.ready;
  }

  getSelected() {
    return this.selected;
  }

  async ensureReady(timeoutMs = 4000): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.ready = true;
      return [];
    }

    if (this.ready && this.voices.length) return this.voices;
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise((resolve) => {
      const synth = window.speechSynthesis;
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        this.voices = synth.getVoices();
        this.selected = this.pickBest(this.voices);
        this.ready = true;
        resolve(this.voices);
      };

      const immediate = synth.getVoices();
      if (immediate.length) {
        finish();
        return;
      }

      synth.addEventListener("voiceschanged", finish, { once: true });
      const started = Date.now();
      const poll = window.setInterval(() => {
        if (synth.getVoices().length || Date.now() - started > timeoutMs) {
          window.clearInterval(poll);
          finish();
        }
      }, 50);
    });

    return this.readyPromise;
  }

  refreshIfChanged() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const next = window.speechSynthesis.getVoices();
    if (!next.length) return;
    const same =
      next.length === this.voices.length
      && next.every((voice, index) => voice.voiceURI === this.voices[index]?.voiceURI);
    if (same) return;
    this.voices = next;
    this.selected = this.pickBest(next);
  }

  scoreVoice(voice: SpeechSynthesisVoice): VoiceScore {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    const reasons: string[] = [];
    let score = 0;

    if (!lang.startsWith("ar")) {
      return { voice, score: -1000, reasons: ["not-arabic"] };
    }

    score += 100;
    reasons.push("arabic-lang");

    // Priority table from product requirements
    if (name.includes("microsoft") && (lang.includes("sa") || name.includes("saudi") || name.includes("naayf"))) {
      score += 500;
      reasons.push("microsoft-arabic-saudi");
    } else if (name.includes("microsoft") && lang.startsWith("ar")) {
      score += 400;
      reasons.push("microsoft-arabic");
    } else if (name.includes("google") && lang.startsWith("ar")) {
      score += 300;
      reasons.push("google-arabic");
    } else if ((name.includes("apple") || name.includes("siri") || name.includes("maged") || name.includes("laila")) && lang.startsWith("ar")) {
      score += 280;
      reasons.push("apple-arabic");
    } else if (name.includes("samsung") && lang.startsWith("ar")) {
      score += 250;
      reasons.push("samsung-arabic");
    } else {
      score += 150;
      reasons.push("generic-arabic");
    }

    if (lang.includes("sa")) {
      score += 40;
      reasons.push("ar-SA");
    } else if (lang.includes("eg")) {
      score += 20;
      reasons.push("ar-EG");
    }

    // Prefer local/offline voices for lower latency
    if (voice.localService) {
      score += 60;
      reasons.push("local");
    }

    // Penalize known-noisy / transliteration-oriented English hybrids
    if (name.includes("english") || lang.startsWith("en")) {
      score -= 800;
      reasons.push("english-penalty");
    }

    return { voice, score, reasons };
  }

  private pickBest(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    const arabic = list.filter((voice) => voice.lang.toLowerCase().startsWith("ar"));
    if (!arabic.length) {
      this.clearCache();
      return null;
    }

    const ranked = arabic
      .map((voice) => this.scoreVoice(voice))
      .sort((a, b) => b.score - a.score);

    const cachedUri = this.readCache();
    if (cachedUri) {
      const cached = ranked.find((item) => item.voice.voiceURI === cachedUri);
      if (cached && cached.score > 0) {
        return cached.voice;
      }
    }

    const best = ranked[0]?.voice || null;
    if (best) this.writeCache(best.voiceURI);
    return best;
  }

  private readCache(): string | null {
    try {
      return localStorage.getItem(VOICE_CACHE_KEY);
    } catch {
      return null;
    }
  }

  private writeCache(uri: string) {
    try {
      localStorage.setItem(VOICE_CACHE_KEY, uri);
    } catch {
      /* ignore */
    }
  }

  private clearCache() {
    try {
      localStorage.removeItem(VOICE_CACHE_KEY);
    } catch {
      /* ignore */
    }
  }
}
