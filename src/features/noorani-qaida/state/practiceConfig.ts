"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameId } from "../types";
import { ALL_GAME_IDS } from "../data/games";

export type PracticeMode = "auto" | "custom";

export interface PracticeConfig {
  mode: PracticeMode;
  /** Games enabled when mode === "custom". */
  enabledGames: GameId[];
}

export const PRACTICE_CONFIG_STORAGE_KEY = "noorpath-qaida-practice-config-v1";

export const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  mode: "auto",
  enabledGames: [...ALL_GAME_IDS],
};

function sanitize(value: unknown): PracticeConfig {
  if (!value || typeof value !== "object") return DEFAULT_PRACTICE_CONFIG;
  const record = value as Partial<PracticeConfig>;
  const mode: PracticeMode = record.mode === "custom" ? "custom" : "auto";
  const enabled = Array.isArray(record.enabledGames)
    ? record.enabledGames.filter((id): id is GameId => ALL_GAME_IDS.includes(id as GameId))
    : DEFAULT_PRACTICE_CONFIG.enabledGames;
  return { mode, enabledGames: enabled.length ? enabled : [...ALL_GAME_IDS] };
}

/**
 * Teacher/admin practice preferences persisted on the device.
 * Deliberately client-only (localStorage) to avoid backend/schema changes,
 * mirroring how lesson progress is already stored in this module.
 */
export function usePracticeConfig() {
  const [config, setConfig] = useState<PracticeConfig>(DEFAULT_PRACTICE_CONFIG);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRACTICE_CONFIG_STORAGE_KEY);
      if (raw) setConfig(sanitize(JSON.parse(raw)));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: PracticeConfig) => {
    setConfig(next);
    try {
      window.localStorage.setItem(PRACTICE_CONFIG_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, []);

  const setMode = useCallback(
    (mode: PracticeMode) => persist({ ...config, mode }),
    [config, persist],
  );

  const toggleGame = useCallback(
    (id: GameId) => {
      const isEnabled = config.enabledGames.includes(id);
      const enabledGames = isEnabled
        ? config.enabledGames.filter((game) => game !== id)
        : [...config.enabledGames, id];
      // Never allow zero games while in custom mode.
      persist({ ...config, enabledGames: enabledGames.length ? enabledGames : config.enabledGames });
    },
    [config, persist],
  );

  const resetToAuto = useCallback(
    () => persist({ mode: "auto", enabledGames: [...ALL_GAME_IDS] }),
    [persist],
  );

  return { config, hydrated, setMode, toggleGame, resetToAuto };
}

/** Resolves the ordered list of game ids that should appear for a lesson. */
export function resolveEnabledGames(config: PracticeConfig): GameId[] {
  if (config.mode === "auto") return [...ALL_GAME_IDS];
  return ALL_GAME_IDS.filter((id) => config.enabledGames.includes(id));
}
