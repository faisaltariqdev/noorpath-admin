"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Letter, QaidaProgress } from "../types";
import { qaidaAudio } from "../audio/QaidaAudioService";
import { GAME_CATALOG, GAME_BY_ID } from "../data/games";
import { resolveEnabledGames, usePracticeConfig } from "../state/practiceConfig";
import FloatingParticles from "../animations/FloatingParticles";

interface PracticeHubProps {
  letter: Letter;
  progress: QaidaProgress;
  onGameSelect: (gameId: string) => void;
  onOpenLesson: () => void;
  reducedMotion: boolean;
  particleCount: number;
  audioEnabled?: boolean;
}

const DRILLS = [
  { key: "listen", icon: "🔊", label: "Listen", tint: "from-emerald-100 to-green-100 text-emerald-700", action: "listen" as const },
  { key: "repeat", icon: "🎙️", label: "Pronounce", tint: "from-sky-100 to-blue-100 text-sky-700", action: "listen" as const },
  { key: "trace", icon: "✏️", label: "Trace", tint: "from-amber-100 to-orange-100 text-orange-700", action: "lesson" as const },
  { key: "write", icon: "🖍️", label: "Write", tint: "from-violet-100 to-fuchsia-100 text-violet-700", action: "lesson" as const },
];

export default function PracticeHub({
  letter,
  progress,
  onGameSelect,
  onOpenLesson,
  reducedMotion,
  particleCount,
  audioEnabled = true,
}: PracticeHubProps) {
  const { config, setMode, toggleGame, resetToAuto } = usePracticeConfig();
  const [teacherPanelOpen, setTeacherPanelOpen] = useState(false);
  const [lastDrill, setLastDrill] = useState<string | null>(null);

  const enabledIds = useMemo(() => resolveEnabledGames(config), [config]);
  const activeGames = useMemo(
    () => enabledIds.map((id) => GAME_BY_ID[id]).filter((game): game is NonNullable<typeof game> => Boolean(game)),
    [enabledIds],
  );

  const pronounce = (mode: "normal" | "slow" = "normal") => {
    if (!audioEnabled) return;
    void qaidaAudio.pronounce({ key: `letter-${letter.id}`, fallbackText: letter.letter, mode, policy: "replace" });
  };

  const runDrill = (drill: (typeof DRILLS)[number]) => {
    setLastDrill(drill.key);
    void qaidaAudio.effect("tap");
    if (drill.action === "listen") {
      pronounce(drill.key === "repeat" ? "slow" : "normal");
      return;
    }
    onOpenLesson();
  };

  return (
    <div className="qaida-scroll relative mx-auto flex h-full w-full max-w-6xl flex-col gap-5 overflow-y-auto p-4 sm:p-6">
      <FloatingParticles count={particleCount} />

      {/* Current letter banner */}
      <motion.header
        className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/15 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 text-white shadow-[0_24px_60px_-20px_rgba(76,29,149,0.55)] sm:p-6"
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => pronounce()}
              className="flex h-24 w-24 flex-none items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
              aria-label={`Hear ${letter.name}`}
            >
              <span className="qaida-arabic text-6xl font-black" lang="ar" dir="rtl">{letter.letter}</span>
            </button>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-50 backdrop-blur-sm">
                <span aria-hidden="true">🎯</span> Practising
              </span>
              <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{letter.name}</h1>
              <p className="mt-1 text-sm text-violet-50/90">Sound “{letter.sound}” · as in {letter.example}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => pronounce("normal")}
                  className="qaida-premium-button bg-white px-4 py-2 text-sm font-black text-violet-800"
                >
                  🔊 Hear it
                </button>
                <button
                  type="button"
                  onClick={onOpenLesson}
                  className="qaida-premium-button border border-white/40 bg-white/10 px-4 py-2 text-sm font-black text-white"
                >
                  📖 Open Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Letter drills */}
      <section aria-label="Letter drills" className="flex flex-col gap-3">
        <h2 className="text-base font-black text-slate-900">Practise the letter</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {DRILLS.map((drill) => (
            <motion.button
              key={drill.key}
              type="button"
              onClick={() => runDrill(drill)}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              whileTap={{ scale: 0.97 }}
              className={`flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-emerald-900/10 bg-gradient-to-br p-3 font-black shadow-[0_10px_28px_-20px_rgba(6,78,59,0.5)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${drill.tint} ${
                lastDrill === drill.key ? "ring-2 ring-emerald-500 ring-offset-2" : ""
              }`}
              aria-label={`${drill.label} ${letter.name}`}
            >
              <span className="text-2xl" aria-hidden="true">{drill.icon}</span>
              <span className="text-xs">{drill.label} {letter.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Games */}
      <section aria-label="Practice games" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-900">Games for {letter.name}</h2>
          <button
            type="button"
            onClick={() => setTeacherPanelOpen((open) => !open)}
            aria-expanded={teacherPanelOpen}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            <span aria-hidden="true">⚙️</span> Teacher settings
          </button>
        </div>

        {/* Teacher configuration panel */}
        <AnimatePresence initial={false}>
          {teacherPanelOpen && (
            <motion.div
              key="teacher-panel"
              initial={reducedMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-black text-slate-900">Which games appear in Practice?</p>
                <p className="mt-0.5 text-xs text-slate-500">Applies to every letter on this device.</p>

                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Practice game mode">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={config.mode === "auto"}
                    onClick={resetToAuto}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${
                      config.mode === "auto"
                        ? "bg-emerald-600 text-white shadow"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    ✅ Automatic (recommended)
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={config.mode === "custom"}
                    onClick={() => setMode("custom")}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${
                      config.mode === "custom"
                        ? "bg-emerald-600 text-white shadow"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                    }`}
                  >
                    🎛️ Choose games
                  </button>
                </div>

                {config.mode === "custom" && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {GAME_CATALOG.map((game) => {
                      const checked = config.enabledGames.includes(game.id);
                      return (
                        <label
                          key={game.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-sm font-semibold transition ${
                            checked ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-emerald-600"
                            checked={checked}
                            onChange={() => toggleGame(game.id)}
                          />
                          <span className="text-lg" aria-hidden="true">{game.icon}</span>
                          <span>{game.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeGames.map((game, index) => (
            <motion.button
              key={game.id}
              type="button"
              onClick={() => onGameSelect(game.id)}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : Math.min(0.24, index * 0.05) }}
              whileHover={reducedMotion ? undefined : { y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${game.accent} p-5 text-left shadow-[0_18px_40px_-22px_rgba(15,23,42,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70`}
            >
              <div className="pointer-events-none absolute -right-3 -top-3 text-7xl opacity-20" aria-hidden="true">{game.icon}</div>
              <div className="relative z-10">
                <div className="text-3xl" aria-hidden="true">{game.icon}</div>
                <h3 className="mt-2 text-lg font-black text-white">{game.letterLabel(letter.name)}</h3>
                <p className="mt-1 text-sm text-white/85">{game.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                  {game.singleLetter ? `Focus: ${letter.name}` : `${letter.name} group`} <span aria-hidden="true">→</span>
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400">
          {progress.gamesCompleted} games played · ⭐ {progress.stars} stars earned
        </p>
      </section>
    </div>
  );
}
