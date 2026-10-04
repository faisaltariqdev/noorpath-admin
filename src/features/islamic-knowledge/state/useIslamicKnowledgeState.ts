"use client";

import { useCallback, useEffect, useState } from "react";
import type { IKCompanionId, IKProgress, IKQuizOutcome } from "../types";
import {
  completeDailyChallenge,
  completeLesson,
  createInitialProgress,
  loadProgress,
  markLessonOpened,
  saveProgress,
  setCompanion as setCompanionState,
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
    (lessonId: string, topicId: string, outcome: IKQuizOutcome, badgeId?: string) => {
      const result = completeLesson(progress, lessonId, topicId, outcome.correct, outcome.total, badgeId, outcome);
      setProgress(result.progress);
      return result;
    },
    [progress],
  );

  const finishDailyChallenge = useCallback(
    (outcome: IKQuizOutcome) => {
      const result = completeDailyChallenge(progress, outcome.correct, outcome.total, outcome.bestCombo);
      setProgress(result.progress);
      return result;
    },
    [progress],
  );

  const chooseCompanion = useCallback((companion: IKCompanionId) => {
    setProgress((current) => setCompanionState(current, companion));
  }, []);

  const rememberLesson = useCallback((lessonId: string) => {
    setProgress((current) => markLessonOpened(current, lessonId));
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    saveProgress(fresh);
  }, []);

  return { progress, hydrated, finishLesson, finishDailyChallenge, chooseCompanion, rememberLesson, resetProgress, setProgress };
}
