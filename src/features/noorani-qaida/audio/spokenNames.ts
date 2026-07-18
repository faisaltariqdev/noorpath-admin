/**
 * TTS-safe spoken forms for Qaida letter names.
 * Browsers often spell unknown Title-Case words (A-L-I-F). These forms
 * force a single natural word: Alif, Baa, Taa, Thaa, Jeem, Haa…
 */
const SPOKEN_BY_DISPLAY_NAME: Record<string, string> = {
  Alif: "Aleef",
  Baa: "Bah",
  Taa: "Tah",
  Thaa: "Thah",
  Jeem: "Jeem",
  Haa: "Hah",
  Khaa: "Khah",
  Daal: "Daal",
  Zaal: "Zaal",
  Raa: "Rah",
  Zay: "Zay",
  Seen: "Seen",
  Sheen: "Sheen",
  Saad: "Saad",
  Daad: "Daad",
  Zaa: "Zah",
  Ayn: "Ayn",
  Ghayn: "Ghayn",
  Faa: "Fah",
  Qaaf: "Qaaf",
  Kaaf: "Kaaf",
  Laam: "Laam",
  Meem: "Meem",
  Noon: "Noon",
  Waaw: "Wow",
  Yaa: "Yah",
  Hamzah: "Hamzah",
};

/** One clear spoken word for speechSynthesis (never letter-by-letter). */
export function toSpokenQaidaName(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return trimmed;
  return SPOKEN_BY_DISPLAY_NAME[trimmed] || trimmed;
}
