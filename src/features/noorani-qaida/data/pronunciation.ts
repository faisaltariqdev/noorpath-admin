/**
 * Canonical Noorani Qaida English pronunciations (Title Case).
 * Use ONLY these spellings for letter names and vowelled drills.
 */
export type QaidaPronunciation = {
  /** Stable ASCII id for example keys — do not change once shipped */
  id: string;
  arabic: string;
  /** Isolated letter name shown on alphabet cards */
  name: string;
  fatha: string;
  kasra: string;
  damma: string;
  fathatain: string;
  kasratain: string;
  dammatain: string;
  /** أَ + letter + ْ */
  sukoon: string;
  shaddah: string;
  maddAlif: string;
  maddWaw: string;
  maddYa: string;
};

/** Alif / Hamza-seat forms used at the start of short-vowel rows */
export const ALIF_PRONUNCIATION = {
  name: "Alif",
  fatha: "Aa",
  kasra: "Ee",
  damma: "Oo",
  fathatain: "Aan",
  kasratain: "Een",
  dammatain: "Oon",
  maddAlif: "Aa",
  maddWaw: "Oo",
  maddYa: "Ee",
} as const;

/**
 * Ba → Yaa drill letters (27). Names match the enterprise standard table.
 * ت and ط both use "Taa"; ح and ه both use "Haa" — Arabic distinguishes them.
 */
export const QAIDA_PRONUNCIATIONS: readonly QaidaPronunciation[] = [
  { id: "baa", arabic: "ب", name: "Baa", fatha: "Baa", kasra: "Bee", damma: "Boo", fathatain: "Baan", kasratain: "Been", dammatain: "Boon", sukoon: "Ab", shaddah: "BBaa", maddAlif: "Baa", maddWaw: "Boo", maddYa: "Bee" },
  { id: "taa", arabic: "ت", name: "Taa", fatha: "Taa", kasra: "Tee", damma: "Too", fathatain: "Taan", kasratain: "Teen", dammatain: "Toon", sukoon: "At", shaddah: "TTaa", maddAlif: "Taa", maddWaw: "Too", maddYa: "Tee" },
  { id: "thaa", arabic: "ث", name: "Thaa", fatha: "Thaa", kasra: "Thee", damma: "Thoo", fathatain: "Thaan", kasratain: "Theen", dammatain: "Thoon", sukoon: "Ath", shaddah: "ThThaa", maddAlif: "Thaa", maddWaw: "Thoo", maddYa: "Thee" },
  { id: "jeem", arabic: "ج", name: "Jeem", fatha: "Jaa", kasra: "Jee", damma: "Joo", fathatain: "Jaan", kasratain: "Jeen", dammatain: "Joon", sukoon: "Aj", shaddah: "JJaa", maddAlif: "Jaa", maddWaw: "Joo", maddYa: "Jee" },
  { id: "haa-throat", arabic: "ح", name: "Haa", fatha: "Haa", kasra: "Hee", damma: "Hoo", fathatain: "Haan", kasratain: "Heen", dammatain: "Hoon", sukoon: "Ah", shaddah: "HHaa", maddAlif: "Haa", maddWaw: "Hoo", maddYa: "Hee" },
  { id: "khaa", arabic: "خ", name: "Khaa", fatha: "Khaa", kasra: "Khee", damma: "Khoo", fathatain: "Khaan", kasratain: "Kheen", dammatain: "Khoon", sukoon: "Akh", shaddah: "KhKhaa", maddAlif: "Khaa", maddWaw: "Khoo", maddYa: "Khee" },
  { id: "daal", arabic: "د", name: "Daal", fatha: "Daa", kasra: "Dee", damma: "Doo", fathatain: "Daan", kasratain: "Deen", dammatain: "Doon", sukoon: "Ad", shaddah: "DDaa", maddAlif: "Daa", maddWaw: "Doo", maddYa: "Dee" },
  { id: "zaal", arabic: "ذ", name: "Zaal", fatha: "Zaa", kasra: "Zee", damma: "Zoo", fathatain: "Zaan", kasratain: "Zeen", dammatain: "Zoon", sukoon: "Az", shaddah: "ZZaa", maddAlif: "Zaa", maddWaw: "Zoo", maddYa: "Zee" },
  { id: "raa", arabic: "ر", name: "Raa", fatha: "Raa", kasra: "Ree", damma: "Roo", fathatain: "Raan", kasratain: "Reen", dammatain: "Roon", sukoon: "Ar", shaddah: "RRaa", maddAlif: "Raa", maddWaw: "Roo", maddYa: "Ree" },
  { id: "zay", arabic: "ز", name: "Zay", fatha: "Zaa", kasra: "Zee", damma: "Zoo", fathatain: "Zaan", kasratain: "Zeen", dammatain: "Zoon", sukoon: "Az", shaddah: "ZZaa", maddAlif: "Zaa", maddWaw: "Zoo", maddYa: "Zee" },
  { id: "seen", arabic: "س", name: "Seen", fatha: "Saa", kasra: "See", damma: "Soo", fathatain: "Saan", kasratain: "Seen", dammatain: "Soon", sukoon: "As", shaddah: "SSaa", maddAlif: "Saa", maddWaw: "Soo", maddYa: "See" },
  { id: "sheen", arabic: "ش", name: "Sheen", fatha: "Shaa", kasra: "Shee", damma: "Shoo", fathatain: "Shaan", kasratain: "Sheen", dammatain: "Shoon", sukoon: "Ash", shaddah: "ShShaa", maddAlif: "Shaa", maddWaw: "Shoo", maddYa: "Shee" },
  { id: "saad", arabic: "ص", name: "Saad", fatha: "Saa", kasra: "See", damma: "Soo", fathatain: "Saan", kasratain: "Seen", dammatain: "Soon", sukoon: "As", shaddah: "SSaa", maddAlif: "Saa", maddWaw: "Soo", maddYa: "See" },
  { id: "daad", arabic: "ض", name: "Daad", fatha: "Daa", kasra: "Dee", damma: "Doo", fathatain: "Daan", kasratain: "Deen", dammatain: "Doon", sukoon: "Ad", shaddah: "DDaa", maddAlif: "Daa", maddWaw: "Doo", maddYa: "Dee" },
  { id: "taa-emphatic", arabic: "ط", name: "Taa", fatha: "Taa", kasra: "Tee", damma: "Too", fathatain: "Taan", kasratain: "Teen", dammatain: "Toon", sukoon: "At", shaddah: "TTaa", maddAlif: "Taa", maddWaw: "Too", maddYa: "Tee" },
  { id: "zaa", arabic: "ظ", name: "Zaa", fatha: "Zaa", kasra: "Zee", damma: "Zoo", fathatain: "Zaan", kasratain: "Zeen", dammatain: "Zoon", sukoon: "Az", shaddah: "ZZaa", maddAlif: "Zaa", maddWaw: "Zoo", maddYa: "Zee" },
  { id: "ayn", arabic: "ع", name: "Ayn", fatha: "Aa", kasra: "Ee", damma: "Oo", fathatain: "Aan", kasratain: "Een", dammatain: "Oon", sukoon: "A'", shaddah: "AAa", maddAlif: "Aa", maddWaw: "Oo", maddYa: "Ee" },
  { id: "ghayn", arabic: "غ", name: "Ghayn", fatha: "Ghaa", kasra: "Ghee", damma: "Ghoo", fathatain: "Ghaan", kasratain: "Gheen", dammatain: "Ghoon", sukoon: "Agh", shaddah: "GhGhaa", maddAlif: "Ghaa", maddWaw: "Ghoo", maddYa: "Ghee" },
  { id: "faa", arabic: "ف", name: "Faa", fatha: "Faa", kasra: "Fee", damma: "Foo", fathatain: "Faan", kasratain: "Feen", dammatain: "Foon", sukoon: "Af", shaddah: "FFaa", maddAlif: "Faa", maddWaw: "Foo", maddYa: "Fee" },
  { id: "qaaf", arabic: "ق", name: "Qaaf", fatha: "Qaa", kasra: "Qee", damma: "Qoo", fathatain: "Qaan", kasratain: "Qeen", dammatain: "Qoon", sukoon: "Aq", shaddah: "QQaa", maddAlif: "Qaa", maddWaw: "Qoo", maddYa: "Qee" },
  { id: "kaaf", arabic: "ك", name: "Kaaf", fatha: "Kaa", kasra: "Kee", damma: "Koo", fathatain: "Kaan", kasratain: "Keen", dammatain: "Koon", sukoon: "Ak", shaddah: "KKaa", maddAlif: "Kaa", maddWaw: "Koo", maddYa: "Kee" },
  { id: "laam", arabic: "ل", name: "Laam", fatha: "Laa", kasra: "Lee", damma: "Loo", fathatain: "Laan", kasratain: "Leen", dammatain: "Loon", sukoon: "Al", shaddah: "LLaa", maddAlif: "Laa", maddWaw: "Loo", maddYa: "Lee" },
  { id: "meem", arabic: "م", name: "Meem", fatha: "Maa", kasra: "Mee", damma: "Moo", fathatain: "Maan", kasratain: "Meen", dammatain: "Moon", sukoon: "Am", shaddah: "MMaa", maddAlif: "Maa", maddWaw: "Moo", maddYa: "Mee" },
  { id: "noon", arabic: "ن", name: "Noon", fatha: "Naa", kasra: "Nee", damma: "Noo", fathatain: "Naan", kasratain: "Neen", dammatain: "Noon", sukoon: "An", shaddah: "NNaa", maddAlif: "Naa", maddWaw: "Noo", maddYa: "Nee" },
  { id: "haa-soft", arabic: "ه", name: "Haa", fatha: "Haa", kasra: "Hee", damma: "Hoo", fathatain: "Haan", kasratain: "Heen", dammatain: "Hoon", sukoon: "Ah", shaddah: "HHaa", maddAlif: "Haa", maddWaw: "Hoo", maddYa: "Hee" },
  { id: "waaw", arabic: "و", name: "Waaw", fatha: "Waa", kasra: "Wee", damma: "Woo", fathatain: "Waan", kasratain: "Ween", dammatain: "Woon", sukoon: "Aw", shaddah: "WWaa", maddAlif: "Waa", maddWaw: "Woo", maddYa: "Wee" },
  { id: "yaa", arabic: "ي", name: "Yaa", fatha: "Yaa", kasra: "Yee", damma: "Yoo", fathatain: "Yaan", kasratain: "Yeen", dammatain: "Yoon", sukoon: "Ay", shaddah: "YYaa", maddAlif: "Yaa", maddWaw: "Yoo", maddYa: "Yee" },
] as const;

export const HAMZAH_NAME = "Hamzah";

export const LETTER_NAME_BY_ARABIC = Object.fromEntries([
  ["ا", "Alif"],
  ["أ", "Alif"],
  ["إ", "Alif"],
  ["آ", "Alif"],
  ["ء", HAMZAH_NAME],
  ...QAIDA_PRONUNCIATIONS.map((item) => [item.arabic, item.name] as const),
]) as Record<string, string>;

export function pronunciationForArabic(arabic: string): QaidaPronunciation | undefined {
  return QAIDA_PRONUNCIATIONS.find((item) => item.arabic === arabic);
}
