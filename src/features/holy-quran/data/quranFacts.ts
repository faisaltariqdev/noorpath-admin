import { SURAHS } from "../../../data/surahs";
import { PARAS, TOTAL_AYAHS, TOTAL_PARAS, TOTAL_SURAHS } from "./paras";

export const QURAN_FACTS = {
  surahs: TOTAL_SURAHS,
  paras: TOTAL_PARAS,
  ayahs: TOTAL_AYAHS,
  makki: SURAHS.filter((surah) => surah.type === "Meccan").length,
  madani: SURAHS.filter((surah) => surah.type === "Medinan").length,
  firstSurah: SURAHS[0],
  lastSurah: SURAHS[SURAHS.length - 1],
  longestSurah: SURAHS.reduce((best, surah) => (surah.verses > best.verses ? surah : best)),
  shortestSurah: SURAHS.reduce((best, surah) => (surah.verses < best.verses ? surah : best)),
};

export function classificationLabel(type: "Meccan" | "Medinan"): "Makki" | "Madani" {
  return type === "Meccan" ? "Makki" : "Madani";
}

export function surahsByType(filter: "all" | "Meccan" | "Medinan") {
  if (filter === "all") return SURAHS;
  return SURAHS.filter((surah) => surah.type === filter);
}

export { PARAS, SURAHS };
