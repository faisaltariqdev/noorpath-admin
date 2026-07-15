"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { pageVariants } from "../motion/config";

interface GameShellProps {
  title: string;
  instruction: string;
  icon: string;
  round: number;
  totalRounds: number;
  score: number;
  mistakes?: number;
  timeLeft?: number;
  timeLimit?: number;
  finished?: boolean;
  stars?: 1 | 2 | 3;
  resultText?: string;
  onClose: () => void;
  paused?: boolean;
  onPauseToggle?: () => void;
  children: ReactNode;
}

export default function GameShell({
  title,
  instruction,
  icon,
  round,
  totalRounds,
  score,
  mistakes = 0,
  timeLeft,
  timeLimit,
  finished = false,
  stars = 1,
  resultText,
  onClose,
  paused = false,
  onPauseToggle,
  children,
}: GameShellProps) {
  const timePercent = timeLeft !== undefined && timeLimit
    ? Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100))
    : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if ((event.key === "p" || event.key === "P") && onPauseToggle) onPauseToggle();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPauseToggle]);

  return (
    <motion.main
      className="qaida-game-stage flex h-full min-h-0 flex-col bg-gradient-to-b from-white to-emerald-50"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/10 bg-white/90 px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700 hover:bg-slate-200"
            aria-label="Exit game"
          >
            ←
          </button>
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black text-slate-950 sm:text-lg">{title}</h1>
            <p className="truncate text-xs text-slate-600 sm:text-sm">{instruction}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-black sm:text-sm" aria-label="Game status">
          {onPauseToggle && (
            <button
              type="button"
              className="flex min-h-11 items-center rounded-full bg-slate-100 px-3 text-slate-700 hover:bg-slate-200"
              onClick={onPauseToggle}
              aria-pressed={paused}
            >
              {paused ? "Resume" : "Pause"}
            </button>
          )}
          <span className="rounded-full bg-emerald-100 px-3 py-2 text-emerald-800">
            {Math.min(round, totalRounds)}/{totalRounds}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-2 text-amber-900">Score {score}</span>
          {mistakes > 0 && <span className="rounded-full bg-rose-100 px-3 py-2 text-rose-800">Retry {mistakes}</span>}
        </div>
      </header>

      <div className="h-1.5 flex-none bg-slate-100" aria-hidden="true">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-lime-400"
          animate={{ width: `${Math.max(4, (Math.min(round, totalRounds) / totalRounds) * 100)}%` }}
        />
      </div>

      {timePercent !== null && (
        <div className="flex items-center gap-3 px-4 pt-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className={`h-full rounded-full ${timePercent > 40 ? "bg-emerald-500" : timePercent > 20 ? "bg-amber-500" : "bg-rose-500"}`}
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className="qaida-progress-value w-10 text-right text-xs font-black text-slate-600">{timeLeft}s</span>
        </div>
      )}

      <section className="relative min-h-0 flex-1 overflow-hidden p-3 sm:p-4">{children}</section>

      <AnimatePresence>
        {paused && !finished && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Game paused"
          >
            <div className="rounded-[1.5rem] bg-white p-6 text-center shadow-2xl">
              <h2 className="text-xl font-black text-slate-950">Game paused</h2>
              <p className="mt-1 text-sm text-slate-600">Take a short break whenever you need one.</p>
              <button
                type="button"
                className="mt-4 min-h-11 rounded-full bg-emerald-700 px-6 py-2 font-black text-white"
                onClick={onPauseToggle}
              >
                Continue game
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finished && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-emerald-950/45 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-result-title"
          >
            <motion.div
              className="w-full max-w-sm rounded-[1.75rem] border border-amber-200 bg-white p-7 text-center shadow-2xl"
              initial={{ scale: 0.72, y: 28 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <div className="text-4xl text-amber-500" aria-label={`${stars} stars`}>
                {"★".repeat(stars)}<span className="text-slate-200">{"★".repeat(3 - stars)}</span>
              </div>
              <h2 id="game-result-title" className="mt-2 text-2xl font-black text-emerald-900">MashaAllah!</h2>
              <p className="mt-1 text-sm text-slate-600">{resultText ?? `You scored ${score}.`}</p>
              <p className="mt-4 text-xs font-bold text-emerald-700">Your reward is being added…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
