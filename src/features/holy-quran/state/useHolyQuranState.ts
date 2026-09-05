"use client";

import { useCallback, useEffect, useState } from "react";
import type { HolyQuranProgress, QuranBookmark, ReadingPosition } from "../types";
import {
  clearReadingHistory,
  createInitialQuranProgress,
  loadQuranProgress,
  rememberReading,
  saveQuranProgress,
  toggleBookmark,
} from "./progress";

export function useHolyQuranState() {
  const [progress, setProgress] = useState<HolyQuranProgress>(createInitialQuranProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(loadQuranProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveQuranProgress(progress);
  }, [hydrated, progress]);

  const rememberPosition = useCallback((position: ReadingPosition) => {
    setProgress((current) => rememberReading(current, position));
  }, []);

  const flipBookmark = useCallback((bookmark: Omit<QuranBookmark, "id" | "createdAt">) => {
    setProgress((current) => toggleBookmark(current, bookmark));
  }, []);

  const wipeHistory = useCallback(() => {
    setProgress((current) => clearReadingHistory(current));
  }, []);

  return { progress, hydrated, rememberPosition, flipBookmark, wipeHistory };
}
