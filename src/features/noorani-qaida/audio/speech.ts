let voices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const loadVoices = () => { voices = window.speechSynthesis.getVoices(); };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function getBestArabicVoice(): SpeechSynthesisVoice | null {
  const arabic = voices.filter((v) => v.lang.startsWith("ar"));
  return arabic[0] ?? voices.find((v) => v.lang.startsWith("ar")) ?? null;
}

export function speakArabic(text: string, rate = 0.8, pitch = 1.1): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = getBestArabicVoice();
  if (voice) utter.voice = voice;
  utter.lang = "ar-SA";
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = 1;
  window.speechSynthesis.speak(utter);
}

export function speakEnglish(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-GB";
  utter.rate = 0.85;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

export function cancelSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
