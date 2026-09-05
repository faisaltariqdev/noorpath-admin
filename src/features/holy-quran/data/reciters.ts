export type ReciterId = "alafasy" | "qariah";

export interface Reciter {
  id: ReciterId;
  name: string;
  shortName: string;
  gender: "male" | "female";
  enabled: boolean;
  verifiedCompleteQuran: boolean;
  edition: string;
}

const ALAFASY_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    shortName: "Male",
    gender: "male",
    enabled: true,
    verifiedCompleteQuran: true,
    edition: "ar.alafasy",
  },
  {
    id: "qariah",
    name: "Female Qariah",
    shortName: "Female",
    gender: "female",
    enabled: false,
    verifiedCompleteQuran: false,
    edition: "",
  },
];

export const DEFAULT_RECITER: ReciterId = "alafasy";

export function getReciter(id: string | undefined): Reciter {
  return RECITERS.find((item) => item.id === id) || RECITERS[0];
}

export function parseReciterId(value: unknown): ReciterId {
  return value === "qariah" ? "qariah" : "alafasy";
}

/** Only verified complete editions resolve. Unknown/disabled reciters keep Alafasy. */
export function recitationUrlFor(reciterId: string | undefined, globalAyah: number): string {
  const reciter = getReciter(reciterId);
  if (!reciter.enabled || !reciter.verifiedCompleteQuran || !reciter.edition) {
    return `${ALAFASY_BASE}/${globalAyah}.mp3`;
  }
  return `https://cdn.islamic.network/quran/audio/128/${reciter.edition}/${globalAyah}.mp3`;
}
