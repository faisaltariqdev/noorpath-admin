"use client";

import { useCallback, useEffect, useState } from "react";
import type { IKProgress } from "../types";
import {
  completeLesson,
  createInitialProgress,
  loadProgress,
  saveProgress,
} from "./progress";

export function useIslamicKnowledgeState() {
  const [progress, setProgress] = useState<IKProgress>(createInitialProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveProgress(progress);
  }, [progress, hydrated]);

  const finishLesson = useCallback(
    (lessonId: string, topicId: string, correct: number, total: number, badgeId?: string) => {
      const result = completeLesson(progress, lessonId, topicId, correct, total, badgeId);
      setProgress(result.progress);
      return result;
    },
    [progress],
  );

  const resetProgress = useCallback(() => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    saveProgress(fresh);
  }, []);

  return { progress, hydrated, finishLesson, resetProgress, setProgress };
}
