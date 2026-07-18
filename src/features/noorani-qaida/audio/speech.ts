let voices: SpeechSynthesisVoice[] = [];
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;
let resumeTimer: number | null = null;

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
      if (synth.getVoices().length || Date.now() - started > 1500) {
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

function getBestArabicVoice(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const arabic = list.filter((v) => v.lang.toLowerCase().startsWith("ar"));
  return (
    arabic.find((v) => v.localService && v.lang.toLowerCase().includes("sa"))
    || arabic.find((v) => v.lang.toLowerCase().includes("sa"))
    || arabic.find((v) => v.localService)
    || arabic[0]
    || null
  );
}

/** Prefer natural English voices that read whole words (not spellers). */
function getBestEnglishVoice(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = list.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const score = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    let value = 0;
    if (voice.localService) value += 20;
    if (name.includes("google")) value += 15;
    if (name.includes("samantha") || name.includes("daniel") || name.includes("karen")) value += 12;
    if (name.includes("microsoft") && (name.includes("aria") || name.includes("guy") || name.includes("jenny"))) value += 14;
    if (name.includes("zira") || name.includes("david")) value += 8;
    if (name.includes("spell")) value -= 50;
    return value;
  };
  return [...english].sort((a, b) => score(b) - score(a))[0] || null;
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
  }, 250);
}

function stopResumeWatch() {
  if (resumeTimer == null) return;
  window.clearInterval(resumeTimer);
  resumeTimer = null;
}

function speakUtterance(utter: SpeechSynthesisUtterance): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      stopResumeWatch();
      resolve();
    };

    utter.onend = finish;
    utter.onerror = finish;
    startResumeWatch();

    try {
      window.speechSynthesis.cancel();
      window.setTimeout(() => {
        try {
          window.speechSynthesis.speak(utter);
        } catch {
          finish();
        }
      }, 30);
    } catch {
      finish();
    }
  });
}

/**
 * Speak a Qaida letter name as ONE word (Alif / Baa / Taa…).
 * Never spell letter-by-letter.
 */
export async function speakEnglish(text: string, rate = 0.9, pitch = 1.05): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

  const list = await ensureVoices();
  // Trailing period + slightly slower rate discourages A-L-I-F spelling mode.
  const utter = new SpeechSynthesisUtterance(`${text.trim()}.`);
  const voice = getBestEnglishVoice(list);
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang || "en-US";
  } else {
    utter.lang = "en-US";
  }
  utter.rate = Math.min(rate, 0.95);
  utter.pitch = pitch;
  utter.volume = 1;
  await speakUtterance(utter);
}

export async function speakArabic(text: string, rate = 0.8, pitch = 1.1): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

  const list = await ensureVoices();
  const utter = new SpeechSynthesisUtterance(text.trim());
  const voice = getBestArabicVoice(list);
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang || "ar-SA";
  } else {
    utter.lang = "ar-SA";
  }
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = 1;
  await speakUtterance(utter);
}

export function cancelSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    stopResumeWatch();
    window.speechSynthesis.cancel();
  }
}

export function unlockSpeechAudio(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  void ensureVoices();
  try {
    const warm = new SpeechSynthesisUtterance("ready");
    warm.volume = 0;
    warm.rate = 2;
    warm.lang = "en-US";
    window.speechSynthesis.speak(warm);
  } catch {
    /* ignore */
  }
}
