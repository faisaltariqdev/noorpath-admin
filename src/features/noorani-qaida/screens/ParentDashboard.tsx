"use client";
import { useEffect, useReducer } from "react";
import { motion } from "framer-motion";
import { LETTERS } from "../data/curriculum";
import { DEFAULT_PROGRESS, parseProgress, PROGRESS_STORAGE_KEY, progressReducer } from "../state/progress";
import type { QaidaProgress } from "../types";
import FloatingParticles from "../animations/FloatingParticles";

function useChildProgress(): QaidaProgress {
  const [progress, dispatch] = useReducer(progressReducer, DEFAULT_PROGRESS);
  useEffect(() => {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    dispatch({ type: "hydrate", value: parseProgress(raw) });
  }, []);
  return progress;
}

export default function ParentQaidaDashboard() {
  const progress = useChildProgress();
  const lettersDone = LETTERS.filter((l) => progress.completed.includes(`letter-${l.id}`)).length;
  const pct = Math.round((lettersDone / 28) * 100);
  const earnedBadges = progress.badges.filter((b) => b.earned).length;

  const weeklyData = [
    { day: "Mon", mins: 12 }, { day: "Tue", mins: 18 }, { day: "Wed", mins: 8 },
    { day: "Thu", mins: 22 }, { day: "Fri", mins: 15 }, { day: "Sat", mins: 20 }, { day: "Sun", mins: 5 },
  ];
  const maxMins = Math.max(...weeklyData.map((d) => d.mins));

  return (
    <div className="relative min-h-screen overflow-auto bg-gradient-to-br from-green-50 to-sky-50 p-6">
      <FloatingParticles count={8} />

      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-black text-gray-900">Parent Dashboard 👨‍👩‍👧</h1>
        <p className="text-sm text-gray-500">Track your child's Noorani Qaida progress</p>
      </motion.div>

      {/* Child progress overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: "📖", label: "Letters Learned", value: `${lettersDone}/28`, color: "from-green-400 to-emerald-600" },
          { icon: "⚡", label: "Total XP", value: progress.xp, color: "from-yellow-400 to-amber-500" },
          { icon: "🔥", label: "Study Streak", value: `${progress.streak} days`, color: "from-orange-400 to-red-500" },
          { icon: "🏆", label: "Badges Earned", value: `${earnedBadges}/${progress.badges.length}`, color: "from-purple-400 to-purple-600" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-5 text-white shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="text-3xl">{stat.icon}</div>
            <div className="mt-2 text-3xl font-black">{stat.value}</div>
            <div className="text-sm opacity-80">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <motion.div
        className="mb-6 rounded-3xl bg-white p-6 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Alphabet Progress</h2>
          <span className="text-lg font-bold text-green-600">{pct}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Your child has learned {lettersDone} out of 28 Arabic letters. 
          {lettersDone < 28 ? ` Next: ${LETTERS.find((l) => !progress.completed.includes(`letter-${l.id}`))?.name ?? "—"}.` : " All letters complete! 🎉"}
        </p>
      </motion.div>

      {/* Weekly practice chart */}
      <motion.div
        className="mb-6 rounded-3xl bg-white p-6 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-bold text-gray-900">Weekly Practice (minutes)</h2>
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {weeklyData.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                className="w-full rounded-t-lg bg-gradient-to-t from-green-500 to-emerald-400"
                initial={{ height: 0 }}
                animate={{ height: `${(d.mins / maxMins) * 100}px` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <span className="text-xs text-gray-500">{d.day}</span>
              <span className="text-[10px] font-bold text-gray-700">{d.mins}m</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        className="rounded-3xl bg-white p-6 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="mb-4 text-lg font-bold text-gray-900">Parent Tips</h2>
        <div className="space-y-3">
          {[
            { icon: "⏰", tip: "Practice 10–15 minutes daily for best results." },
            { icon: "🎯", tip: "Focus on letters your child finds difficult before moving forward." },
            { icon: "🏆", tip: "Celebrate every badge earned — positive reinforcement helps!" },
            { icon: "📱", tip: "Use the games section to make learning fun and interactive." },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 rounded-2xl bg-green-50 p-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-gray-700">{item.tip}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
