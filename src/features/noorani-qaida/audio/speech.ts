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
    // Some Windows browsers never fire voiceschanged; poll briefly.
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
    arabic.find((v) => v.lang.toLowerCase().includes("sa"))
    || arabic.find((v) => v.lang.toLowerCase().includes("eg"))
    || arabic[0]
    || null
  );
}

function getBestEnglishVoice(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    list.find((v) => v.lang.toLowerCase().startsWith("en-gb"))
    || list.find((v) => v.lang.toLowerCase().startsWith("en-us"))
    || list.find((v) => v.lang.toLowerCase().startsWith("en"))
    || null
  );
}

/** Chrome/Edge on Windows often pauses speechSynthesis mid-utterance. */
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

export async function speakArabic(text: string, rate = 0.8, pitch = 1.1): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

  const list = await ensureVoices();
  const synth = window.speechSynthesis;
  synth.cancel();

  // Tiny delay after cancel — required on some Windows Chromium builds.
  await new Promise((resolve) => window.setTimeout(resolve, 40));

  const utter = new SpeechSynthesisUtterance(text);
  const arabicVoice = getBestArabicVoice(list);
  if (arabicVoice) {
    utter.voice = arabicVoice;
    utter.lang = arabicVoice.lang || "ar-SA";
  } else {
    // No Arabic pack installed — still attempt ar-SA; OS may synthesize or fail silently.
    utter.lang = "ar-SA";
  }
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = 1;

  await speakUtterance(utter);
}

export async function speakEnglish(text: string): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

  const list = await ensureVoices();
  const synth = window.speechSynthesis;
  synth.cancel();
  await new Promise((resolve) => window.setTimeout(resolve, 40));

  const utter = new SpeechSynthesisUtterance(text);
  const englishVoice = getBestEnglishVoice(list);
  if (englishVoice) {
    utter.voice = englishVoice;
    utter.lang = englishVoice.lang || "en-GB";
  } else {
    utter.lang = "en-GB";
  }
  utter.rate = 0.85;
  utter.pitch = 1.1;
  utter.volume = 1;

  await speakUtterance(utter);
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
      window.speechSynthesis.speak(utter);
      // If the engine never starts (common when no voice pack), don't hang callers.
      window.setTimeout(() => {
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) finish();
      }, 800);
    } catch {
      finish();
    }
  });
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
  if ("speechSynthesis" in window) {
    try {
      // Warm-up utterance (silent) helps Edge/Chrome on Windows after first gesture.
      const warm = new SpeechSynthesisUtterance(" ");
      warm.volume = 0;
      warm.rate = 2;
      window.speechSynthesis.speak(warm);
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}
