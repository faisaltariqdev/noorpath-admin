"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import type { QaidaProgress } from "../types";
import { LETTERS } from "../data/curriculum";
import { qaidaAudio } from "../audio/QaidaAudioService";
import FloatingParticles from "../animations/FloatingParticles";
import SparkleBurst from "../animations/SparkleBurst";
import ZaydMascot, { type ZaydAction } from "../characters/ZaydMascot";

interface NooraniBookProps {
  progress: QaidaProgress;
  currentLetterId: string;
  onSelectLetter: (letterId: string) => void;
  reducedMotion: boolean;
  particleCount: number;
  audioEnabled?: boolean;
}

const GROUPS = [
  { title: "Alif Family", subtitle: "Letters 1–7", ids: [1, 2, 3, 4, 5, 6, 7], accent: "from-emerald-500 to-teal-600" },
  { title: "Dal Family", subtitle: "Letters 8–14", ids: [8, 9, 10, 11, 12, 13, 14], accent: "from-sky-500 to-blue-600" },
  { title: "Saad Family", subtitle: "Letters 15–21", ids: [15, 16, 17, 18, 19, 20, 21], accent: "from-violet-500 to-purple-600" },
  { title: "Final Letters", subtitle: "Letters 22–28", ids: [22, 23, 24, 25, 26, 27, 28], accent: "from-amber-500 to-orange-600" },
];

function BookRing({ pct, reduced }: { pct: number; reduced: boolean }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative flex h-20 w-20 flex-none items-center justify-center" aria-hidden="true">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="7" />
        <motion.circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#fde68a"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduced ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduced ? 0 : 1.1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-base font-black text-white">{pct}%</span>
    </div>
  );
}

export default function NooraniBook({
  progress,
  currentLetterId,
  onSelectLetter,
  reducedMotion,
  particleCount,
  audioEnabled = true,
}: NooraniBookProps) {
  const [tappedId, setTappedId] = useState<number | null>(null);
  const [mascotAction, setMascotAction] = useState<ZaydAction>("wave");
  const [mascotSpeech, setMascotSpeech] = useState("Tap a letter and let's learn together!");

  const completedCount = useMemo(
    () => LETTERS.filter((l) => progress.completed.includes(`letter-${l.id}`)).length,
    [progress.completed],
  );
  const pct = Math.round((completedCount / 28) * 100);

  const handleTap = useCallback(
    (id: number, unlocked: boolean, name: string, arabic: string) => {
      if (!unlocked) {
        setMascotAction("point");
        setMascotSpeech(`Finish the letters before ${name} to unlock it!`);
        void qaidaAudio.effect("retry");
        return;
      }
      setTappedId(id);
      setMascotAction("clap");
      setMascotSpeech(`Let's learn ${name}!`);
      if (audioEnabled) {
        void qaidaAudio.pronounce({ key: `letter-${id}`, fallbackText: arabic });
      }
      window.setTimeout(
        () => {
          setTappedId(null);
          onSelectLetter(`letter-${id}`);
        },
        reducedMotion ? 150 : 620,
      );
    },
    [audioEnabled, onSelectLetter, reducedMotion],
  );

  return (
    <div className="qaida-scroll relative mx-auto flex h-full w-full max-w-6xl flex-col gap-5 overflow-y-auto p-4 sm:p-6">
      <FloatingParticles count={particleCount} />

      {/* Book header */}
      <motion.header
        className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/15 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-5 text-white shadow-[0_24px_60px_-20px_rgba(6,78,59,0.6)] sm:p-6"
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-none rounded-2xl bg-white/10 p-1.5 backdrop-blur-sm">
              <ZaydMascot mood="happy" action={mascotAction} size={84} lookAt="center" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-50 backdrop-blur-sm">
                <span aria-hidden="true">📖</span> The Qaida Book
              </span>
              <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">All 28 Arabic Letters</h1>
              <p aria-live="polite" className="mt-1 max-w-sm text-sm text-emerald-50/90">{mascotSpeech}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-3xl bg-white/10 p-3 backdrop-blur-md">
            <BookRing pct={pct} reduced={reducedMotion} />
            <div className="pr-1">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-100/80">Completed</p>
              <p className="text-2xl font-black leading-tight">{completedCount}<span className="text-emerald-100/70">/28</span></p>
              <p className="text-xs text-emerald-100/80">letters mastered</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Letter groups */}
      {GROUPS.map((group, groupIndex) => (
        <section key={group.title} aria-label={group.title} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block rounded-full bg-gradient-to-r ${group.accent} px-3.5 py-1 text-sm font-black text-white shadow-sm`}>
              {group.title}
            </span>
            <span className="text-xs font-semibold text-slate-400">{group.subtitle}</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {group.ids.map((lid, idx) => {
              const letter = LETTERS[lid - 1];
              if (!letter) return null;
              const id = `letter-${lid}`;
              const isCompleted = progress.completed.includes(id);
              const isCurrent = id === currentLetterId;
              const prevCompleted = lid === 1 || progress.completed.includes(`letter-${lid - 1}`);
              const isUnlocked = lid === 1 || prevCompleted || isCompleted;
              const stars = progress.ratings[id] ?? (isCompleted ? 3 : 0);

              return (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => handleTap(lid, isUnlocked, letter.name, letter.letter)}
                  initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reducedMotion ? 0 : Math.min(0.25, groupIndex * 0.04 + idx * 0.03) }}
                  whileHover={reducedMotion || !isUnlocked ? undefined : { y: -4, scale: 1.03 }}
                  whileTap={isUnlocked ? { scale: 0.95 } : undefined}
                  aria-disabled={!isUnlocked}
                  aria-label={`${letter.name}${isCompleted ? ", completed" : isUnlocked ? ", tap to learn" : ", locked"}`}
                  className={`group relative flex min-h-[132px] flex-col items-center justify-center gap-1.5 rounded-[1.25rem] border-2 p-3 text-center shadow-[0_12px_28px_-20px_rgba(6,78,59,0.6)] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                    isCurrent
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400 ring-offset-2"
                      : isCompleted
                        ? "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-100"
                        : isUnlocked
                          ? "border-emerald-900/10 bg-white hover:border-emerald-300"
                          : "cursor-not-allowed border-slate-200 bg-slate-50"
                  }`}
                >
                  <SparkleBurst active={tappedId === lid} />

                  {/* Status corner */}
                  {isCompleted ? (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] text-amber-900 shadow" aria-hidden="true">★</span>
                  ) : !isUnlocked ? (
                    <span className="absolute right-1.5 top-1.5 text-sm opacity-60" aria-hidden="true">🔒</span>
                  ) : isCurrent ? (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">Now</span>
                  ) : null}

                  <span className="text-[10px] font-bold text-slate-400">{lid}</span>
                  <motion.span
                    className={`qaida-arabic text-4xl font-black leading-none ${
                      !isUnlocked ? "text-slate-300" : isCompleted ? "text-amber-600" : "text-emerald-800"
                    }`}
                    lang="ar"
                    dir="rtl"
                    animate={
                      reducedMotion || tappedId !== lid
                        ? undefined
                        : { scale: [1, 1.25, 1] }
                    }
                    transition={{ duration: 0.5 }}
                  >
                    {letter.letter}
                  </motion.span>
                  <span className={`text-xs font-bold ${!isUnlocked ? "text-slate-400" : "text-slate-700"}`}>{letter.name}</span>
                  {isCompleted && (
                    <span className="text-[10px] leading-none text-amber-500" aria-hidden="true">{"★".repeat(Math.max(1, Math.min(3, stars)))}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>
      ))}

      {completedCount === 28 && (
        <motion.div
          className="mx-auto mt-2 max-w-md rounded-[1.5rem] bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center text-white shadow-2xl"
          initial={reducedMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="text-5xl" aria-hidden="true">🏆</div>
          <h2 className="mt-2 text-xl font-black">MashaAllah!</h2>
          <p className="text-sm text-amber-50">You have completed the whole Qaida book!</p>
        </motion.div>
      )}
    </div>
  );
}
