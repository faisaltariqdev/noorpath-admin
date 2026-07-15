"use client";
import { motion } from "framer-motion";
import { LETTERS } from "../data/curriculum";
import type { QaidaProgress } from "../types";
import FloatingParticles from "../animations/FloatingParticles";

interface JourneyMapProps {
  progress: QaidaProgress;
  onSelectLetter: (letterId: string) => void;
}

const UNIT_COLORS = [
  "from-green-400 to-emerald-600",
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-pink-400 to-rose-600",
  "from-orange-400 to-amber-600",
  "from-teal-400 to-cyan-600",
  "from-indigo-400 to-indigo-600",
];

const GROUPS = [
  { title: "Group 1 – Alif Family", letters: [1, 2, 3, 4, 5, 6, 7] },
  { title: "Group 2 – Dal Family", letters: [8, 9, 10, 11, 12, 13, 14] },
  { title: "Group 3 – Saad Family", letters: [15, 16, 17, 18, 19, 20, 21] },
  { title: "Group 4 – Final Letters", letters: [22, 23, 24, 25, 26, 27, 28] },
];

export default function JourneyMap({ progress, onSelectLetter }: JourneyMapProps) {
  const completedCount = LETTERS.filter((l) => progress.completed.includes(`letter-${l.id}`)).length;
  const pct = Math.round((completedCount / 28) * 100);

  return (
    <div className="relative min-h-0 overflow-y-auto p-4">
      <FloatingParticles count={12} />

      {/* Header */}
      <motion.div
        className="mb-6 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-black text-gray-900">Alphabet Journey 🌟</h1>
        <p className="text-sm text-gray-500">Complete all 28 Arabic letters of the Quran</p>

        {/* Overall progress */}
        <div className="mx-auto mt-3 max-w-sm">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{completedCount} / 28 letters</span>
            <span>{pct}% complete</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Letter groups */}
      {GROUPS.map((group, gi) => (
        <motion.div
          key={group.title}
          className="mb-8"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: gi * 0.15 }}
        >
          <div className={`mb-3 inline-block rounded-full bg-gradient-to-r ${UNIT_COLORS[gi % UNIT_COLORS.length]} px-4 py-1 text-sm font-bold text-white shadow-md`}>
            {group.title}
          </div>

          {/* Path connector */}
          <div className="relative">
            <div className="absolute left-10 top-10 h-[calc(100%-40px)] w-1 rounded-full bg-gradient-to-b from-green-200 to-gray-100" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {group.letters.map((lid, idx) => {
                const letter = LETTERS[lid - 1];
                if (!letter) return null;
                const id = `letter-${lid}`;
                const isCompleted = progress.completed.includes(id);
                const prevId = lid === 1 ? null : `letter-${lid - 1}`;
                const isUnlocked = lid === 1 || (prevId ? progress.completed.includes(prevId) : false) || isCompleted;

                return (
                  <motion.button
                    key={id}
                    className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 shadow-md transition-all ${
                      isCompleted
                        ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50"
                        : isUnlocked
                        ? "border-green-300 bg-white hover:border-green-400 hover:bg-green-50"
                        : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => isUnlocked && onSelectLetter(id)}
                    whileHover={isUnlocked ? { scale: 1.05, y: -3 } : {}}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.1 + idx * 0.05 }}
                    disabled={!isUnlocked}
                    aria-label={`${letter.name} - ${isCompleted ? "completed" : isUnlocked ? "available" : "locked"}`}
                  >
                    {/* Status badge */}
                    {isCompleted && (
                      <motion.div
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs text-yellow-900 shadow"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ⭐
                      </motion.div>
                    )}
                    {!isUnlocked && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-xs text-white">
                        🔒
                      </div>
                    )}

                    {/* Letter number */}
                    <div className="text-[10px] font-medium text-gray-400">{lid}</div>

                    {/* Arabic letter */}
                    <motion.div
                      className={`text-3xl font-bold leading-none ${isCompleted ? "text-amber-600" : "text-green-800"}`}
                      style={{ fontFamily: "serif", direction: "rtl" }}
                      animate={isCompleted ? { scale: [1, 1.05, 1] } : isUnlocked ? { y: [0, -2, 0] } : {}}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {letter.letter}
                    </motion.div>

                    {/* Letter name */}
                    <div className="text-[10px] font-semibold text-gray-600">{letter.name}</div>

                    {/* Star rating */}
                    {isCompleted && (
                      <div className="text-[10px] text-yellow-500">
                        {"⭐".repeat(progress.ratings[id] ?? 3)}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Completion banner */}
      {completedCount === 28 && (
        <motion.div
          className="mx-auto max-w-md rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 p-6 text-center shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="text-5xl">🏆</div>
          <h2 className="mt-2 text-xl font-black text-white">MashaAllah!</h2>
          <p className="text-sm text-amber-100">You have completed all 28 Arabic letters!</p>
        </motion.div>
      )}
    </div>
  );
}
