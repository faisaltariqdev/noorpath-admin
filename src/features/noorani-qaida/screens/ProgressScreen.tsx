"use client";
import { motion } from "framer-motion";
import type { QaidaProgress } from "../types";
import FloatingParticles from "../animations/FloatingParticles";
import { CURRICULUM_MODULES } from "../data/modules";
import { getModuleProgress, getOverallCurriculumProgress } from "../state/curriculumProgress";

interface ProgressScreenProps {
  progress: QaidaProgress;
}

export default function ProgressScreen({ progress }: ProgressScreenProps) {
  const overall = getOverallCurriculumProgress(progress);
  const moduleProgress = CURRICULUM_MODULES.map((module) => ({ module, state: getModuleProgress(progress, module.id) }));
  const modulesDone = moduleProgress.filter(({ state }) => state.complete).length;
  const badges = (Array.isArray(progress.badges) ? progress.badges : []).filter(
    (b): b is NonNullable<typeof b> => Boolean(b && typeof b === "object" && typeof b.label === "string"),
  );
  const earnedBadges = badges.filter((b) => b.earned);

  const stats = [
    { icon: "📖", label: "Curriculum", value: `${modulesDone}/${CURRICULUM_MODULES.length}`, sub: "modules completed" },
    { icon: "⚡", label: "XP", value: progress.xp, sub: `Level ${progress.level}` },
    { icon: "🪙", label: "Coins", value: progress.coins, sub: "earned total" },
    { icon: "⭐", label: "Stars", value: progress.stars, sub: "star ratings" },
    { icon: "🔥", label: "Streak", value: `${progress.streak}d`, sub: "days in a row" },
    { icon: "🎮", label: "Games", value: progress.gamesCompleted, sub: "games played" },
  ];

  return (
    <div className="relative overflow-x-hidden p-[var(--qaida-space-page)] sm:p-6">
      <FloatingParticles count={10} />

      <motion.h1
        className="mb-4 text-xl font-black text-gray-900 sm:mb-6 sm:text-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        My Progress 📊
      </motion.h1>

      {/* Overall progress */}
      <motion.div
        className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 p-4 text-white shadow-2xl sm:mb-6 sm:p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-emerald-200">Overall completion</div>
            <div className="text-4xl font-black sm:text-5xl">{overall.percent}%</div>
            <div className="text-sm text-emerald-200 sm:text-base">{overall.completed} of {overall.total} curriculum lessons</div>
          </div>
          <div className="hidden text-7xl opacity-30 sm:block" aria-hidden="true">📖</div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-emerald-900/50">
          <motion.div
            className="h-full rounded-full bg-white shadow-md"
            initial={{ width: 0 }}
            animate={{ width: `${overall.percent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {moduleProgress.map(({ module, state }) => (
          <div key={module.id} className={`rounded-2xl border p-4 ${state.unlocked ? "border-emerald-100 bg-white" : "border-slate-200 bg-slate-50 opacity-60"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-slate-800">{module.order}. {module.title}</span>
              <span className="text-xs font-black text-emerald-700">{state.unlocked ? `${state.percent}%` : "Locked"}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${state.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats grid */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:mb-6 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="rounded-2xl bg-white p-3 shadow-md sm:p-4"
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
        className="rounded-3xl bg-white p-4 shadow-lg sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Badges ({earnedBadges.length}/{badges.length})
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6">
          {badges.map((badge) => (
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
