"use client";
import { motion } from "framer-motion";
import type { QaidaProgress } from "../types";
import { LETTERS } from "../data/curriculum";
import FloatingParticles from "../animations/FloatingParticles";

interface ProgressScreenProps {
  progress: QaidaProgress;
}

export default function ProgressScreen({ progress }: ProgressScreenProps) {
  const lettersDone = LETTERS.filter((l) => progress.completed.includes(`letter-${l.id}`)).length;
  const pct = Math.round((lettersDone / 28) * 100);
  const earnedBadges = progress.badges.filter((b) => b.earned);

  const stats = [
    { icon: "📖", label: "Letters", value: `${lettersDone}/28`, sub: "completed" },
    { icon: "⚡", label: "XP", value: progress.xp, sub: `Level ${progress.level}` },
    { icon: "🪙", label: "Coins", value: progress.coins, sub: "earned total" },
    { icon: "⭐", label: "Stars", value: progress.stars, sub: "star ratings" },
    { icon: "🔥", label: "Streak", value: `${progress.streak}d`, sub: "days in a row" },
    { icon: "🎮", label: "Games", value: progress.gamesCompleted, sub: "games played" },
  ];

  return (
    <div className="relative p-6">
      <FloatingParticles count={10} />

      <motion.h1
        className="mb-6 text-2xl font-black text-gray-900"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        My Progress 📊
      </motion.h1>

      {/* Overall progress */}
      <motion.div
        className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 p-6 text-white shadow-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-emerald-200">Overall completion</div>
            <div className="text-5xl font-black">{pct}%</div>
            <div className="text-emerald-200">{lettersDone} of 28 letters</div>
          </div>
          <div className="text-7xl opacity-30">📖</div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-900/50">
          <motion.div
            className="h-full rounded-full bg-white shadow-md"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="rounded-2xl bg-white p-4 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="text-2xl">{stat.icon}</div>
            <div className="mt-1 text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
            <div className="text-[10px] text-gray-400">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <motion.div
        className="rounded-3xl bg-white p-6 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Badges ({earnedBadges.length}/{progress.badges.length})
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {progress.badges.map((badge) => (
            <motion.div
              key={badge.id}
              className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center ${
                badge.earned
                  ? "bg-gradient-to-br from-yellow-50 to-amber-100 shadow-md"
                  : "bg-gray-50 opacity-50"
              }`}
              whileHover={badge.earned ? { scale: 1.05 } : {}}
              title={badge.description}
            >
              <span className="text-3xl">{badge.earned ? badge.icon : "🔒"}</span>
              <span className="text-[10px] font-semibold leading-tight text-gray-700">{badge.label}</span>
              {badge.earned && badge.earnedAt && (
                <span className="text-[8px] text-gray-400">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
