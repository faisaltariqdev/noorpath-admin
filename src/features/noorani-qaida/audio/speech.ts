let voices: SpeechSynthesisVoice[] = [];
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;
let resumeTimer: number | null = null;

function isWindowsBrowser() {
  return typeof navigator !== "undefined" && /Windows/i.test(navigator.userAgent || "");
}

function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }

  const synth = window.speechSynthesis;
  const current = synth.getVoices();
  if (current.length) {
    voices = current;
    return Promise.resolve(current);
  }

  if (voicesReady) return voicesReady;

  voicesReady = new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      voices = synth.getVoices();
      resolve(voices);
    };

    synth.addEventListener("voiceschanged", finish, { once: true });
    const started = Date.now();
    const poll = window.setInterval(() => {
      if (synth.getVoices().length || Date.now() - started > 2500) {
        window.clearInterval(poll);
        finish();
      }
    }, 100);
  });

  return voicesReady;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  void ensureVoices();
}

/** Prefer local Microsoft Arabic voices; Google cloud voices often show "speaking" with no audio on Windows. */
function rankArabicVoices(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const arabic = list.filter((v) => v.lang.toLowerCase().startsWith("ar"));
  const score = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let value = 0;
    if (lang.includes("sa")) value += 40;
    if (lang.includes("eg")) value += 20;
    if (name.includes("microsoft")) value += 30;
    if (name.includes("naayf") || name.includes("hoda") || name.includes("zahra")) value += 15;
    if (voice.localService) value += 25;
    if (name.includes("google")) value -= 20; // frequently silent for Arabic letters on Windows Chrome
    if (name.includes("online") || name.includes("remote")) value -= 10;
    return value;
  };
  return [...arabic].sort((a, b) => score(b) - score(a));
}

function getBestEnglishVoice(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    list.find((v) => v.localService && v.lang.toLowerCase().startsWith("en"))
    || list.find((v) => v.lang.toLowerCase().startsWith("en-gb"))
    || list.find((v) => v.lang.toLowerCase().startsWith("en-us"))
    || list.find((v) => v.lang.toLowerCase().startsWith("en"))
    || null
  );
}

/** Single isolated letters are often "spoken" as zero-audio on Windows TTS — add a short vowel cue. */
function normalizeArabicSpeechText(text: string): string {
  const trimmed = text.trim();
  if ([...trimmed].length === 1 && /[\u0600-\u06FF]/.test(trimmed)) {
    return `${trimmed}\u064E`; // fatha — helps engines vocalize the letter
  }
  return trimmed;
}

function startResumeWatch() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (resumeTimer != null) return;
  resumeTimer = window.setInterval(() => {
    if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
      stopResumeWatch();
    }
  }, 200);
}

function stopResumeWatch() {
  if (resumeTimer == null) return;
  window.clearInterval(resumeTimer);
  resumeTimer = null;
}

type SpeakResult = { ok: boolean; durationMs: number };

function speakUtterance(utter: SpeechSynthesisUtterance): Promise<SpeakResult> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve({ ok: false, durationMs: 0 });
      return;
    }

    const startedAt = performance.now();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      stopResumeWatch();
      resolve({ ok, durationMs: performance.now() - startedAt });
    };

    utter.onstart = () => startResumeWatch();
    utter.onend = () => finish(true);
    utter.onerror = () => finish(false);

    try {
      // Windows Chromium: cancel() immediately before speak can mute the next utterance.
      if (isWindowsBrowser()) {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } else {
        window.speechSynthesis.cancel();
      }

      window.setTimeout(() => {
        try {
          window.speechSynthesis.speak(utter);
          // If engine never starts, fail fast so callers can fall back.
          window.setTimeout(() => {
            if (!done && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
              finish(false);
            }
          }, 900);
        } catch {
          finish(false);
        }
      }, isWindowsBrowser() ? 80 : 40);
    } catch {
      finish(false);
    }
  });
}

async function speakWithVoice(
  text: string,
  voice: SpeechSynthesisVoice | null,
  lang: string,
  rate: number,
  pitch: number,
): Promise<SpeakResult> {
  const utter = new SpeechSynthesisUtterance(text);
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang || lang;
  } else {
    utter.lang = lang;
  }
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = 1;
  return speakUtterance(utter);
}

/**
 * Speak Arabic with Windows-safe voice selection.
 * Optionally falls back to an English cue (letter name) when Arabic is silent.
 */
export async function speakArabic(
  text: string,
  rate = 0.8,
  pitch = 1.1,
  englishFallback?: string,
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

  const list = await ensureVoices();
  const arabicText = normalizeArabicSpeechText(text);
  const arabicVoices = rankArabicVoices(list);

  // Try top Arabic voices — first that produces a real audible duration wins.
  const candidates: Array<SpeechSynthesisVoice | null> = arabicVoices.length
    ? arabicVoices.slice(0, 4)
    : [null];

  for (const voice of candidates) {
    const result = await speakWithVoice(arabicText, voice, voice?.lang || "ar-SA", rate, pitch);
    // Silent "success" on Windows is usually <120ms for a letter.
    if (result.ok && result.durationMs >= 140) return;
  }

  // Audible English fallback (letter name / sound) so learners still get feedback.
  if (englishFallback?.trim()) {
    await speakEnglish(englishFallback.trim());
  }
}

export async function speakEnglish(text: string): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

  const list = await ensureVoices();
  const englishVoice = getBestEnglishVoice(list);
  await speakWithVoice(text.trim(), englishVoice, englishVoice?.lang || "en-GB", 0.9, 1.05);
}

export function cancelSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    stopResumeWatch();
    window.speechSynthesis.cancel();
  }
}

/** Call once from a tap/click so browsers unlock audio + warm TTS voices. */
export function unlockSpeechAudio(): void {
  if (typeof window === "undefined") return;
  void ensureVoices();
  if (!("speechSynthesis" in window)) return;

  try {
    // Do NOT cancel immediately after speak — that breaks the next utterance on Windows Chrome.
    const warm = new SpeechSynthesisUtterance(".");
    warm.volume = 0.01;
    warm.rate = 2;
    warm.lang = "en-US";
    window.speechSynthesis.speak(warm);
  } catch {
    /* ignore */
  }
}

export function listArabicVoicesForDebug(): string[] {
  return rankArabicVoices(voices).map((v) => `${v.name} (${v.lang})${v.localService ? " local" : " remote"}`);
}
