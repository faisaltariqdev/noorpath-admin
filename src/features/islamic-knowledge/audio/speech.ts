let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;
let resumeTimer: number | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve([]);
  const current = window.speechSynthesis.getVoices();
  if (current.length) {
    cachedVoices = current;
    return Promise.resolve(current);
  }
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cachedVoices = synth.getVoices();
      resolve(cachedVoices);
    };
    synth.addEventListener("voiceschanged", finish, { once: true });
    window.setTimeout(finish, 1200);
  });
  return voicesPromise;
}

function bestEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find((voice) => voice.lang.toLowerCase().startsWith("en-gb"))
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us"))
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
}

export function cancelKnowledgeSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (resumeTimer != null) window.clearInterval(resumeTimer);
  resumeTimer = null;
  window.speechSynthesis.cancel();
}

export function unlockKnowledgeSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  void loadVoices();
  try {
    const warmup = new SpeechSynthesisUtterance(" ");
    warmup.volume = 0;
    window.speechSynthesis.speak(warmup);
    window.speechSynthesis.cancel();
  } catch {
    // Speech remains optional when the browser or operating system has no voice.
  }
}

export async function speakKnowledgeText(text: string, rate = 0.88): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;
  const synth = window.speechSynthesis;
  const voices = await loadVoices();
  synth.cancel();
  await new Promise((resolve) => window.setTimeout(resolve, 35));

  const utterance = new SpeechSynthesisUtterance(text.replace(/[^\S\r\n]+/g, " ").trim());
  const voice = bestEnglishVoice(voices);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? "en-GB";
  utterance.rate = rate;
  utterance.pitch = 1.05;
  utterance.volume = 1;

  if (resumeTimer != null) window.clearInterval(resumeTimer);
  resumeTimer = window.setInterval(() => {
    if (synth.speaking && synth.paused) synth.resume();
    if (!synth.speaking && !synth.pending && resumeTimer != null) {
      window.clearInterval(resumeTimer);
      resumeTimer = null;
    }
  }, 250);

  try {
    synth.speak(utterance);
  } catch {
    cancelKnowledgeSpeech();
  }
}
