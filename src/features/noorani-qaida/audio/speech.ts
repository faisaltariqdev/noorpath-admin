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

function getBestEnglishVoice(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    list.find((v) => v.localService && v.lang.toLowerCase().startsWith("en-gb"))
    || list.find((v) => v.localService && v.lang.toLowerCase().startsWith("en-us"))
    || list.find((v) => v.localService && v.lang.toLowerCase().startsWith("en"))
    || list.find((v) => v.lang.toLowerCase().startsWith("en-gb"))
    || list.find((v) => v.lang.toLowerCase().startsWith("en-us"))
    || list.find((v) => v.lang.toLowerCase().startsWith("en"))
    || null
  );
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

/** Clear English letter names: “Alif”, “Baa”, “Taa” — primary kids pronunciation. */
export async function speakEnglish(text: string, rate = 0.88, pitch = 1.08): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

  const list = await ensureVoices();
  const utter = new SpeechSynthesisUtterance(text.trim());
  const voice = getBestEnglishVoice(list);
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang || "en-GB";
  } else {
    utter.lang = "en-GB";
  }
  utter.rate = rate;
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
    const warm = new SpeechSynthesisUtterance(" ");
    warm.volume = 0;
    warm.rate = 2;
    warm.lang = "en-GB";
    window.speechSynthesis.speak(warm);
  } catch {
    /* ignore */
  }
}
