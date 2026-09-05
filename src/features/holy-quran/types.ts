export type HolyQuranSurface = "admin" | "tutor" | "parent";

export type HolyQuranView = "home" | "paras" | "surahs" | "bookmarks" | "history" | "knowledge" | "guide" | "reader";

export interface QuranAyah {
  surah: number;
  ayah: number;
  juz: number;
  text: string;
  global: number;
}

export interface ParaFile {
  juz: number;
  ayahs: QuranAyah[];
}

export interface ParaMeta {
  number: number;
  name: string;
  arabicName: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  ayahCount: number;
}

export interface ReadingPosition {
  para: number;
  surah: number;
  ayah: number;
}

export interface ReadingHistoryItem extends ReadingPosition {
  leftAt: string;
}

export type BookmarkKind = "ayah" | "para" | "surah";

export interface QuranBookmark {
  id: string;
  kind: BookmarkKind;
  para: number;
  surah?: number;
  ayah?: number;
  createdAt: string;
}

export interface HolyQuranProgress {
  lastPosition: ReadingPosition | null;
  readAyahKeys: string[];
  bookmarks: QuranBookmark[];
  readingHistory: ReadingHistoryItem[];
}

export interface ReaderTarget {
  para: number;
  surah?: number;
  ayah?: number;
}

export type ReaderLayout = "line" | "page";

export type InkMode = "normal" | "letters" | "tajweed";

export interface HolyQuranPrefs {
  layout: ReaderLayout;
  ink: InkMode;
  zoom: number;
  muted: boolean;
  reciter: "alafasy" | "qariah";
  practice: boolean;
}

export interface QuranSearchHit {
  kind: "para" | "surah" | "ayah";
  para: number;
  surah?: number;
  ayah?: number;
  title: string;
  subtitle: string;
}
