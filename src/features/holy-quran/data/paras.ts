import { SURAHS } from "../../../data/surahs";
import type { ParaMeta } from "../types";

/** Traditional Juz names (not Quranic verses). Ranges match the imported Tanzil dataset. */
export const PARAS: ParaMeta[] = [
  { number: 1, name: "Alif Lam Meem", arabicName: "الم", startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141, ayahCount: 148 },
  { number: 2, name: "Sayaqool", arabicName: "سيقول", startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252, ayahCount: 111 },
  { number: 3, name: "Tilkar Rusul", arabicName: "تلك الرسل", startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92, ayahCount: 126 },
  { number: 4, name: "Lan Tanaaloo", arabicName: "لن تنالوا", startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23, ayahCount: 131 },
  { number: 5, name: "Wal Muhsanat", arabicName: "والمحصنات", startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147, ayahCount: 124 },
  { number: 6, name: "La Yuhibbullah", arabicName: "لا يحب الله", startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81, ayahCount: 110 },
  { number: 7, name: "Wa Iza Samiu", arabicName: "وإذا سمعوا", startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110, ayahCount: 149 },
  { number: 8, name: "Wa Law Annana", arabicName: "ولو أننا", startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87, ayahCount: 142 },
  { number: 9, name: "Qalal Mala", arabicName: "قال الملأ", startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40, ayahCount: 159 },
  { number: 10, name: "Wa Alamoo", arabicName: "واعلموا", startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92, ayahCount: 127 },
  { number: 11, name: "Yatazirun", arabicName: "يعتذرون", startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5, ayahCount: 151 },
  { number: 12, name: "Wa Ma Min Dabbah", arabicName: "وما من دابة", startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52, ayahCount: 170 },
  { number: 13, name: "Wa Ma Ubariu", arabicName: "وما أبرئ", startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52, ayahCount: 154 },
  { number: 14, name: "Rubama", arabicName: "ربما", startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128, ayahCount: 227 },
  { number: 15, name: "Subhanalladhi", arabicName: "سبحان الذي", startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74, ayahCount: 185 },
  { number: 16, name: "Qal Alam", arabicName: "قال ألم", startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135, ayahCount: 269 },
  { number: 17, name: "Iqtaraba", arabicName: "اقترب", startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78, ayahCount: 190 },
  { number: 18, name: "Qad Aflaha", arabicName: "قد أفلح", startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20, ayahCount: 202 },
  { number: 19, name: "Wa Qalalladhina", arabicName: "وقال الذين", startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55, ayahCount: 339 },
  { number: 20, name: "Aman Khalaq", arabicName: "أمن خلق", startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45, ayahCount: 171 },
  { number: 21, name: "Utlu Ma Oohiya", arabicName: "اتل ما أوحي", startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30, ayahCount: 178 },
  { number: 22, name: "Wa Man Yaqnut", arabicName: "ومن يقنت", startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27, ayahCount: 169 },
  { number: 23, name: "Wa Ma Liya", arabicName: "وما لي", startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31, ayahCount: 357 },
  { number: 24, name: "Faman Azlam", arabicName: "فمن أظلم", startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46, ayahCount: 175 },
  { number: 25, name: "Ilayhi Yuraddu", arabicName: "إليه يرد", startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37, ayahCount: 246 },
  { number: 26, name: "Ha Meem", arabicName: "حم", startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30, ayahCount: 195 },
  { number: 27, name: "Qala Fama Khatbukum", arabicName: "قال فما خطبكم", startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29, ayahCount: 399 },
  { number: 28, name: "Qad Sami Allah", arabicName: "قد سمع الله", startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12, ayahCount: 137 },
  { number: 29, name: "Tabarakalladhi", arabicName: "تبارك الذي", startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50, ayahCount: 431 },
  { number: 30, name: "Amma", arabicName: "عم", startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6, ayahCount: 564 },
];

export const TOTAL_AYAHS = PARAS.reduce((sum, para) => sum + para.ayahCount, 0);
export const TOTAL_PARAS = PARAS.length;
export const TOTAL_SURAHS = SURAHS.length;

export function getPara(number: number): ParaMeta | undefined {
  return PARAS.find((para) => para.number === number);
}

export function surahName(number: number): string {
  return SURAHS.find((surah) => surah.number === number)?.name || `Surah ${number}`;
}

export function surahArabic(number: number): string {
  return SURAHS.find((surah) => surah.number === number)?.arabic || "";
}

export function paraStartLabel(para: ParaMeta): string {
  return `${surahName(para.startSurah)} ${para.startSurah}:${para.startAyah}`;
}

export function paraEndLabel(para: ParaMeta): string {
  return `${surahName(para.endSurah)} ${para.endSurah}:${para.endAyah}`;
}

export function ayahKey(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

export function paraForAyah(surah: number, ayah: number): number {
  const match = PARAS.find((para) => {
    if (surah < para.startSurah || surah > para.endSurah) return false;
    if (surah === para.startSurah && ayah < para.startAyah) return false;
    if (surah === para.endSurah && ayah > para.endAyah) return false;
    return true;
  });
  return match?.number || 1;
}

export function startingParaForSurah(surah: number): number {
  return paraForAyah(surah, 1);
}
