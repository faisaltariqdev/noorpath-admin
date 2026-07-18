"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { ScreenId } from "../types";
import { qaidaAudio } from "../audio/QaidaAudioService";
import { manifestToAudioAssets, preloadQaidaAudio, QAIDA_AUDIO_MANIFEST } from "../audio/manifest";
import {
  DEFAULT_PROGRESS,
  getCurrentCurriculumScreen,
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
    qaidaAudio.configure(manifestToAudioAssets(QAIDA_AUDIO_MANIFEST));
    try {
      const current = localStorage.getItem(PROGRESS_STORAGE_KEY);
      const legacy = LEGACY_PROGRESS_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ?? null;
      dispatch({ type: "hydrate", value: parseProgress(current ?? legacy) });
      dispatch({ type: "update_streak" });
    } catch (error) {
      console.error("[Noorani Qaida] Failed to hydrate progress — resetting local state", error);
      dispatch({ type: "reset" });
    }
  }, []);

  useEffect(() => {
    if (!progress.hydrated) return;
    preloadQaidaAudio([progress.currentScreenId]);
  }, [progress.currentScreenId, progress.hydrated]);

  // Persist to localStorage
  useEffect(() => {
    if (progress.hydrated) {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      setAudioEnabled(progress.settings.audioEnabled);
      qaidaAudio.setEnabled(progress.settings.audioEnabled);
      setScreen(progress.currentScreenId || getCurrentCurriculumScreen(progress));
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
    dispatch({ type: "set_current_screen", id });
    window.scrollTo({ top: 0, behavior: "auto" });
    return true;
  }, [announce, progress]);

  const completeScreen = useCallback((id: ScreenId) => {
    dispatch({ type: "complete_screen", id });
    celebrate("MashaAllah! Amazing! 🌟");
  }, [celebrate]);

  const updateAudioEnabled = useCallback((enabled: boolean) => {
    setAudioEnabled(enabled);
    qaidaAudio.setEnabled(enabled);
    dispatch({ type: "update_settings", settings: { audioEnabled: enabled } });
  }, []);

  return {
    screen,
    navigate,
    progress,
    dispatch,
    feedback,
    announce,
    audioEnabled,
    setAudioEnabled: updateAudioEnabled,
    showCelebration,
    celebrationMessage,
    celebrate,
    completeScreen,
    currentLesson: getCurrentLesson(progress),
    currentCurriculumScreen: getCurrentCurriculumScreen(progress),
  };
}
