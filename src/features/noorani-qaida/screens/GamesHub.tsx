"use client";
import { motion } from "framer-motion";
import type { QaidaProgress } from "../types";
import FloatingParticles from "../animations/FloatingParticles";

const GAMES = [
  { id: "bubble-pop",       icon: "🫧", label: "Bubble Pop",       desc: "Pop the correct Arabic letter bubbles!",    color: "from-purple-400 to-purple-600",  stars: 3 },
  { id: "find-letter",      icon: "🔍", label: "Find the Letter",  desc: "Spot the correct letter from 4 choices!",   color: "from-blue-400 to-blue-600",      stars: 4 },
  { id: "memory-match",     icon: "🃏", label: "Memory Match",     desc: "Match Arabic letters with their names!",    color: "from-green-400 to-emerald-600",  stars: 2 },
  { id: "quick-challenge",  icon: "⚡", label: "Quick Challenge",  desc: "Answer fast before the timer runs out!",    color: "from-yellow-400 to-amber-600",   stars: 5 },
  { id: "letter-train",     icon: "🚂", label: "Letter Train",     desc: "Collect letters in the right order!",       color: "from-orange-400 to-red-500",     stars: 0 },
  { id: "puzzle",           icon: "🧩", label: "Letter Puzzle",    desc: "Piece together the Arabic alphabet!",       color: "from-indigo-400 to-indigo-600",  stars: 0 },
  { id: "sound-match",      icon: "🎵", label: "Sound Match",      desc: "Listen and tap the matching letter!",       color: "from-pink-400 to-rose-600",      stars: 0 },
];

interface GamesHubProps {
  onGameSelect: (gameId: string) => void;
  progress: QaidaProgress;
}

export default function GamesHub({ onGameSelect, progress }: GamesHubProps) {
  return (
    <div className="relative p-6">
      <FloatingParticles count={10} />

      <motion.div
        className="mb-6 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-black text-gray-900">Games Hub 🎮</h1>
        <p className="text-sm text-gray-500">Learn Arabic letters through fun games!</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="font-semibold text-green-600">🎮 {progress.gamesCompleted} games played</span>
          <span className="font-semibold text-yellow-600">⭐ {progress.stars} stars earned</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game, i) => {
          const isComingSoon = game.stars === 0;
          return (
            <motion.button
              key={game.id}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${game.color} p-5 text-left shadow-xl ${
                isComingSoon ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={() => !isComingSoon && onGameSelect(game.id)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={!isComingSoon ? { scale: 1.03, y: -4 } : {}}
              whileTap={!isComingSoon ? { scale: 0.97 } : {}}
              disabled={isComingSoon}
              aria-label={`${game.label}${isComingSoon ? " - Coming soon" : ""}`}
            >
              {/* Background decoration */}
              <div className="absolute -right-4 -top-4 text-7xl opacity-20">{game.icon}</div>

              <div className="relative z-10">
                <div className="text-4xl">{game.icon}</div>
                <h3 className="mt-2 text-lg font-black text-white">{game.label}</h3>
                <p className="mt-1 text-sm text-white/80">{game.desc}</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-white/60">
                    {isComingSoon ? (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-white">Coming Soon</span>
                    ) : game.stars > 0 ? (
                      <span>Best: {"⭐".repeat(Math.min(game.stars, 3))}</span>
                    ) : (
                      <span>Not played yet</span>
                    )}
                  </div>
                  {!isComingSoon && (
                    <motion.div
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
