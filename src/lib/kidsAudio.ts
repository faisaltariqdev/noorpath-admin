// ============================================================
// NoorPath Kids Studio — Accurate Arabic audio engine
// ------------------------------------------------------------
// Strategy for 100% consistent pronunciation across all devices:
//   1. Google Translate TTS (neural Arabic voice, identical on
//      every device — no dependency on locally installed voices)
//   2. Curated Arabic letter-NAME map (with tashkeel) so bare
//      letters are spoken by their correct name (Alif, Baa …)
//   3. Web Speech API fallback (with a properly selected Arabic
//      voice) when the network audio can't be reached.
// ============================================================

// Bare Arabic letters → correct spoken NAME (fully vowelled for TTS)
const LETTER_NAMES: Record<string, string> = {
  "ا": "أَلِفْ", "أ": "أَلِفْ", "إ": "أَلِفْ", "آ": "أَلِفْ", "ٱ": "أَلِفْ",
  "ب": "بَاءْ", "ت": "تَاءْ", "ث": "ثَاءْ", "ج": "جِيمْ",
  "ح": "حَاءْ", "خ": "خَاءْ", "د": "دَالْ", "ذ": "ذَالْ",
  "ر": "رَاءْ", "ز": "زَايْ", "س": "سِينْ", "ش": "شِينْ",
  "ص": "صَادْ", "ض": "ضَادْ", "ط": "طَاءْ", "ظ": "ظَاءْ",
  "ع": "عَيْنْ", "غ": "غَيْنْ", "ف": "فَاءْ", "ق": "قَافْ",
  "ك": "كَافْ", "ل": "لَامْ", "م": "مِيمْ", "ن": "نُونْ",
  "ه": "هَاءْ", "ة": "هَاءْ", "و": "وَاوْ", "ي": "يَاءْ", "ى": "يَاءْ",
  "ء": "هَمْزَةْ",
};

/** Resolve what should actually be *spoken* for a given Arabic string. */
export function resolveSpoken(arabic: string): string {
  const t = (arabic || "").trim();
  return LETTER_NAMES[t] ?? t;
}

// ── Voice cache for Web Speech fallback ────────────────────────────────────
let arVoice: SpeechSynthesisVoice | null = null;
let enVoice: SpeechSynthesisVoice | null = null;

function refreshVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return;
  arVoice =
    voices.find(v => v.lang?.toLowerCase().startsWith("ar") && /male|majed|tarik|natural|google/i.test(v.name)) ||
    voices.find(v => v.lang?.toLowerCase().startsWith("ar")) ||
    null;
  enVoice =
    voices.find(v => v.lang?.toLowerCase().startsWith("en") && /google|natural|samantha|daniel/i.test(v.name)) ||
    voices.find(v => v.lang?.toLowerCase().startsWith("en")) ||
    null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

// ── Audio element cache (Google TTS) ───────────────────────────────────────
const audioCache = new Map<string, HTMLAudioElement>();
let currentAudio: HTMLAudioElement | null = null;

function ttsUrl(text: string, lang: string) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`;
}

function webSpeech(text: string, lang: "ar" | "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ar" ? "ar-SA" : "en-US";
    const v = lang === "ar" ? arVoice : enVoice;
    if (v) u.voice = v;
    u.rate = lang === "ar" ? 0.68 : 0.85;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op */
  }
}

function playTts(text: string, lang: "ar" | "en") {
  if (typeof window === "undefined" || !text) return;
  const key = `${lang}|${text}`;
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    let audio = audioCache.get(key);
    if (!audio) {
      audio = new Audio(ttsUrl(text, lang));
      audio.preload = "auto";
      audio.addEventListener("error", () => webSpeech(text, lang), { once: true });
      audioCache.set(key, audio);
    }
    currentAudio = audio;
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => webSpeech(text, lang));
    }
  } catch {
    webSpeech(text, lang);
  }
}

/** Speak an Arabic letter / word with the correct pronunciation. */
export function speakArabic(arabic: string) {
  playTts(resolveSpoken(arabic), "ar");
}

/** Speak an English label (e.g. the romanised name). */
export function speakEnglish(text: string) {
  playTts(text, "en");
}

/** Warm the cache so the next taps are instant. */
export function preloadArabic(items: string[]) {
  if (typeof window === "undefined") return;
  items.forEach(a => {
    const text = resolveSpoken(a);
    const key = `ar|${text}`;
    if (!audioCache.has(key)) {
      const audio = new Audio(ttsUrl(text, "ar"));
      audio.preload = "auto";
      audioCache.set(key, audio);
    }
  });
}

// ── Cartoon sound effects (Web Audio, no assets needed) ────────────────────
let ac: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ac) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AC) ac = new AC();
  }
  return ac;
}

/** Playful "pop" when a letter is tapped. */
export function playPop() {
  const c = ctx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(420, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(880, c.currentTime + 0.12);
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.2);
}

/** Happy chime for correct answers / celebrations. */
export function playChime() {
  const c = ctx();
  if (!c) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    const t = c.currentTime + i * 0.09;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.34);
  });
}
