"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { ScreenId } from "../types";
import {
  DEFAULT_PROGRESS,
  getCurrentLesson,
  isScreenUnlocked,
  LEGACY_PROGRESS_KEYS,
  parseProgress,
  PROGRESS_STORAGE_KEY,
  progressReducer,
} from "./progress";

export function useQaidaState() {
  const [screen, setScreen] = useState<ScreenId>("cover");
  const [progress, dispatch] = useReducer(progressReducer, DEFAULT_PROGRESS);
  const [feedback, setFeedback] = useState("");
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();

  // Hydrate from localStorage
  useEffect(() => {
    const current = localStorage.getItem(PROGRESS_STORAGE_KEY);
    const legacy = LEGACY_PROGRESS_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ?? null;
    dispatch({ type: "hydrate", value: parseProgress(current ?? legacy) });
    // Update streak on load
    dispatch({ type: "update_streak" });
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (progress.hydrated) {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  const announce = useCallback((msg: string) => {
    setFeedback(msg);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(""), 3500);
  }, []);

  const celebrate = useCallback((message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  }, []);

  const navigate = useCallback((id: ScreenId) => {
    if (!isScreenUnlocked(progress, id)) {
      announce("Complete the previous lesson to unlock this one!");
      return false;
    }
    setScreen(id);
    window.scrollTo({ top: 0, behavior: "auto" });
    return true;
  }, [announce, progress]);

  const completeScreen = useCallback((id: ScreenId) => {
    dispatch({ type: "complete_screen", id });
    dispatch({ type: "earn_xp", amount: 25 });
    celebrate("MashaAllah! Amazing! 🌟");
  }, [celebrate]);

  return {
    screen,
    navigate,
    progress,
    dispatch,
    feedback,
    announce,
    audioEnabled,
    setAudioEnabled,
    showCelebration,
    celebrationMessage,
    celebrate,
    completeScreen,
    currentLesson: getCurrentLesson(progress),
  };
}
