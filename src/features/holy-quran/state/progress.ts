import type { HolyQuranProgress, ParaMeta, QuranBookmark, ReadingHistoryItem, ReadingPosition } from "../types";
import { TOTAL_AYAHS, ayahKey } from "../data/paras";

export const HQ_STORAGE_KEY = "noorpath-holy-quran-v1";
const HISTORY_LIMIT = 24;

export function createInitialQuranProgress(): HolyQuranProgress {
  return {
    lastPosition: null,
    readAyahKeys: [],
    bookmarks: [],
    readingHistory: [],
  };
}

export function loadQuranProgress(): HolyQuranProgress {
  if (typeof window === "undefined") return createInitialQuranProgress();
  try {
    const raw = window.localStorage.getItem(HQ_STORAGE_KEY);
    if (!raw) return createInitialQuranProgress();
    const parsed = JSON.parse(raw) as HolyQuranProgress;
    return {
      lastPosition: parsed.lastPosition ?? null,
      readAyahKeys: Array.isArray(parsed.readAyahKeys) ? parsed.readAyahKeys : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      readingHistory: Array.isArray(parsed.readingHistory) ? parsed.readingHistory : [],
    };
  } catch {
    return createInitialQuranProgress();
  }
}

export function saveQuranProgress(progress: HolyQuranProgress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HQ_STORAGE_KEY, JSON.stringify(progress));
}

export function markAyahRead(progress: HolyQuranProgress, surah: number, ayah: number): HolyQuranProgress {
  const key = ayahKey(surah, ayah);
  if (progress.readAyahKeys.includes(key)) return progress;
  return { ...progress, readAyahKeys: [...progress.readAyahKeys, key] };
}

export function setLastPosition(progress: HolyQuranProgress, position: ReadingPosition): HolyQuranProgress {
  return { ...progress, lastPosition: position };
}

export function pushReadingHistory(
  history: ReadingHistoryItem[],
  position: ReadingPosition,
): ReadingHistoryItem[] {
  const item: ReadingHistoryItem = { ...position, leftAt: new Date().toISOString() };
  const rest = history.filter((row) => !(row.surah === position.surah && row.ayah === position.ayah));
  const head = rest[0];
  if (head && head.para === position.para && head.surah === position.surah) {
    return [item, ...rest.slice(1)].slice(0, HISTORY_LIMIT);
  }
  return [item, ...rest].slice(0, HISTORY_LIMIT);
}

export function rememberReading(progress: HolyQuranProgress, position: ReadingPosition): HolyQuranProgress {
  const next = markAyahRead(setLastPosition(progress, position), position.surah, position.ayah);
  return { ...next, readingHistory: pushReadingHistory(next.readingHistory || [], position) };
}

export function clearReadingHistory(progress: HolyQuranProgress): HolyQuranProgress {
  return { ...progress, readingHistory: [] };
}

export function formatHistoryTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function toggleBookmark(
  progress: HolyQuranProgress,
  bookmark: Omit<QuranBookmark, "id" | "createdAt">,
): HolyQuranProgress {
  const existing = progress.bookmarks.find((item) =>
    item.kind === bookmark.kind
    && item.para === bookmark.para
    && item.surah === bookmark.surah
    && item.ayah === bookmark.ayah,
  );
  if (existing) {
    return { ...progress, bookmarks: progress.bookmarks.filter((item) => item.id !== existing.id) };
  }
  const next: QuranBookmark = {
    ...bookmark,
    id: `${bookmark.kind}-${bookmark.para}-${bookmark.surah ?? 0}-${bookmark.ayah ?? 0}`,
    createdAt: new Date().toISOString(),
  };
  return { ...progress, bookmarks: [next, ...progress.bookmarks] };
}

export function hasBookmark(
  progress: HolyQuranProgress,
  kind: QuranBookmark["kind"],
  para: number,
  surah?: number,
  ayah?: number,
): boolean {
  return progress.bookmarks.some((item) =>
    item.kind === kind
    && item.para === para
    && item.surah === surah
    && item.ayah === ayah,
  );
}

export function progressPercent(progress: HolyQuranProgress): number {
  if (TOTAL_AYAHS === 0) return 0;
  return Math.min(100, Math.round((progress.readAyahKeys.length / TOTAL_AYAHS) * 100));
}

function isInPara(para: ParaMeta, surah: number, ayah: number): boolean {
  if (surah < para.startSurah || surah > para.endSurah) return false;
  if (surah === para.startSurah && ayah < para.startAyah) return false;
  if (surah === para.endSurah && ayah > para.endAyah) return false;
  return true;
}

export function paraReadCount(progress: HolyQuranProgress, para: ParaMeta): number {
  return progress.readAyahKeys.reduce((count, key) => {
    const [surah, ayah] = key.split(":").map(Number);
    return isInPara(para, surah, ayah) ? count + 1 : count;
  }, 0);
}
