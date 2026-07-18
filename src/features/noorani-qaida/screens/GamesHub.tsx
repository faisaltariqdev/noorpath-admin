"use client";

import { motion } from "framer-motion";
import type { Letter, QaidaProgress } from "../types";
import { GAME_CATALOG } from "../data/games";
import FloatingParticles from "../animations/FloatingParticles";

interface GamesHubProps {
  letter: Letter;
  onGameSelect: (gameId: string) => void;
  progress: QaidaProgress;
  reducedMotion?: boolean;
}

/**
 * Games are always scoped to the learner's current letter.
 * Distractor-based games still use nearby letters for discrimination practice,
 * but every card label and entry point is about *this* letter — not random content.
 */
export default function GamesHub({
  letter,
  onGameSelect,
  progress,
  reducedMotion = false,
}: GamesHubProps) {
  const focusGames = GAME_CATALOG.filter((game) => game.singleLetter);
  const groupGames = GAME_CATALOG.filter((game) => !game.singleLetter);

  return (
    <div className="qaida-scroll relative mx-auto flex h-full w-full max-w-6xl flex-col gap-5 overflow-y-auto p-4 sm:p-6">
      <FloatingParticles count={reducedMotion ? 0 : 8} />

      <motion.header
        className="rounded-[1.75rem] border border-emerald-900/10 bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-[0_20px_50px_-24px_rgba(6,78,59,0.55)] sm:p-6"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-100">Games for this lesson</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">
          Play with{" "}
          <span className="qaida-arabic" lang="ar" dir="rtl">
            {letter.letter}
          </span>{" "}
          · {letter.name}
        </h1>
        <p className="mt-1 text-sm text-emerald-50/90">
          Every game below trains recognition, listening, or memory for {letter.name} — not unrelated letters.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-emerald-50">
          <span>🎮 {progress.gamesCompleted} games played</span>
          <span>⭐ {progress.stars} stars earned</span>
        </div>
      </motion.header>

      <section aria-label={`${letter.name} focus games`} className="flex flex-col gap-3">
        <h2 className="text-base font-black text-slate-900">Focus on {letter.name}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {focusGames.map((game, index) => (
            <GameCard
              key={game.id}
              icon={game.icon}
              title={game.letterLabel(letter.name)}
              desc={game.desc}
              accent={game.accent}
              badge={`Focus: ${letter.name}`}
              index={index}
              reducedMotion={reducedMotion}
              onSelect={() => onGameSelect(game.id)}
            />
          ))}
        </div>
      </section>

      <section aria-label={`${letter.name} group practice`} className="flex flex-col gap-3">
        <h2 className="text-base font-black text-slate-900">Compare {letter.name} with nearby letters</h2>
        <p className="text-sm text-slate-600">
          These use a small window around {letter.name} so children learn to tell similar shapes apart — a core Qaida skill.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groupGames.map((game, index) => (
            <GameCard
              key={game.id}
              icon={game.icon}
              title={game.letterLabel(letter.name)}
              desc={game.desc}
              accent={game.accent}
              badge={`${letter.name} group`}
              index={index}
              reducedMotion={reducedMotion}
              onSelect={() => onGameSelect(game.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function GameCard({
  icon,
  title,
  desc,
  accent,
  badge,
  index,
  reducedMotion,
  onSelect,
}: {
  icon: string;
  title: string;
  desc: string;
  accent: string;
  badge: string;
  index: number;
  reducedMotion: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reducedMotion ? 0 : Math.min(0.2, index * 0.05) }}
      whileHover={reducedMotion ? undefined : { y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${accent} p-5 text-left shadow-[0_18px_40px_-22px_rgba(15,23,42,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300`}
      aria-label={title}
    >
      <div className="pointer-events-none absolute -right-3 -top-3 text-7xl opacity-20" aria-hidden="true">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="text-3xl" aria-hidden="true">
          {icon}
        </div>
        <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/85">{desc}</p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
          {badge} <span aria-hidden="true">→</span>
        </span>
      </div>
    </motion.button>
  );
}
