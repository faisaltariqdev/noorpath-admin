"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import type { Letter, QaidaProgress } from "../types";
import { LETTERS } from "../data/curriculum";
import { qaidaAudio } from "../audio/QaidaAudioService";

interface QaidaEbookProps {
  progress: QaidaProgress;
  currentLetterId: string;
  onSelectLetter: (letterId: string) => void;
  reducedMotion: boolean;
  audioEnabled?: boolean;
}

export default function QaidaEbook({
  progress,
  currentLetterId,
  onSelectLetter,
  reducedMotion,
  audioEnabled = true,
}: QaidaEbookProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [pulseId, setPulseId] = useState<number | null>(null);
  const activeLetter = activeId ? LETTERS[activeId - 1] ?? null : null;

  const pronounce = useCallback(
    (letter: Letter, mode: "normal" | "slow" = "normal") => {
      setActiveId(letter.id);
      setPulseId(letter.id);
      if (audioEnabled) {
        void qaidaAudio.pronounce({ key: `letter-${letter.id}`, fallbackText: letter.letter, mode, policy: "replace" });
      }
      window.setTimeout(() => setPulseId(null), reducedMotion ? 80 : 480);
    },
    [audioEnabled, reducedMotion],
  );

  return (
    <div className="relative flex flex-col gap-4">
      {/* Paper page */}
      <motion.div
        className="relative overflow-hidden rounded-[1.75rem] border-2 border-amber-200/70 bg-gradient-to-b from-[#fdf8ec] via-[#faf2df] to-[#f4e9cf] p-4 shadow-[0_26px_60px_-26px_rgba(120,80,20,0.5)] sm:p-6"
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
      >
        {/* Inner ruled border */}
        <div className="pointer-events-none absolute inset-2.5 rounded-[1.45rem] border border-amber-300/50" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-3.5 rounded-[1.3rem] border border-amber-200/40" aria-hidden="true" />

        {/* Ornamental header */}
        <div className="relative z-10 text-center">
          <p className="qaida-arabic text-base text-amber-800/80 sm:text-lg" lang="ar" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h2 className="qaida-arabic mt-1 text-3xl font-black text-emerald-900 sm:text-4xl" lang="ar" dir="rtl">
            اَلْقَاعِدَةُ النُّورَانِيَّة
          </h2>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700/70">
            Noorani Qaida · The Arabic Letters
          </p>
          <div className="mx-auto mt-3 flex items-center justify-center gap-2 text-amber-400" aria-hidden="true">
            <span className="h-px w-14 bg-gradient-to-r from-transparent to-amber-300" />
            <span className="text-sm">❁</span>
            <span className="h-px w-14 bg-gradient-to-l from-transparent to-amber-300" />
          </div>
        </div>

        {/* Letters grid — traditional right-to-left reading order */}
        <div dir="rtl" className="relative z-10 mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-2.5 lg:grid-cols-7">
          {LETTERS.map((letter, idx) => {
            const completed = progress.completed.includes(`letter-${letter.id}`);
            const isActive = activeId === letter.id;
            const isCurrent = `letter-${letter.id}` === currentLetterId;
            return (
              <motion.button
                key={letter.id}
                type="button"
                onClick={() => pronounce(letter)}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: reducedMotion ? 0 : Math.min(0.5, idx * 0.02), type: "spring", stiffness: 300, damping: 22 }}
                whileHover={reducedMotion ? undefined : { y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                aria-label={`${letter.name}, pronunciation ${letter.sound}, tap to hear`}
                className={`group relative flex min-h-[118px] flex-col items-center rounded-xl border px-1.5 pb-2.5 pt-4 transition-colors sm:min-h-[132px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                  isActive
                    ? "border-emerald-400 bg-emerald-50 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
                    : isCurrent
                      ? "border-emerald-300 bg-white"
                      : "border-amber-200/70 bg-white/70 hover:border-emerald-300 hover:bg-white"
                }`}
              >
                <span className="absolute right-1 top-0.5 text-[9px] font-bold text-amber-600/60" aria-hidden="true">{letter.id}</span>
                {completed && (
                  <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                )}
                {/* Dedicated glyph zone so descenders (ج ح خ ع غ) never cover the English label */}
                <span className="flex h-[3.25rem] w-full items-center justify-center sm:h-[3.75rem]" aria-hidden="true">
                  <motion.span
                    className={`qaida-arabic block text-4xl font-black leading-[1.4] sm:text-5xl ${completed ? "text-emerald-800" : "text-slate-800"}`}
                    lang="ar"
                    dir="rtl"
                    animate={pulseId === letter.id && !reducedMotion ? { scale: [1, 1.28, 1] } : undefined}
                    transition={{ duration: 0.5 }}
                  >
                    {letter.letter}
                  </motion.span>
                </span>
                <span className={`mt-1 flex w-full flex-col items-center gap-0.5 border-t border-amber-100/80 pt-1.5 ${
                  isActive || isCurrent ? "text-emerald-700" : "text-slate-600"
                }`}>
                  <span className="max-w-full truncate text-[11px] font-black leading-tight tracking-wide sm:text-xs">
                    {letter.name}
                  </span>
                  <span className="max-w-full truncate text-[10px] font-semibold leading-tight text-slate-500 sm:text-[11px]" dir="ltr">
                    “{letter.sound}”
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        <p className="relative z-10 mt-4 text-center text-xs font-semibold text-amber-800/70">
          Tap any letter to hear it · {progress.completed.filter((id) => id.startsWith("letter-")).length}/28 learned
        </p>
      </motion.div>

      {/* Reading bar */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            key="reading-bar"
            className="sticky bottom-2 z-20 mx-auto flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl border border-emerald-900/10 bg-white/95 p-3 shadow-[0_18px_40px_-18px_rgba(6,78,59,0.5)] backdrop-blur-md"
            initial={reducedMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            role="status"
            aria-live="polite"
          >
            <span className="qaida-arabic flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-emerald-50 text-4xl font-black text-emerald-800" lang="ar" dir="rtl">
              {activeLetter.letter}
            </span>
            <div className="min-w-0 flex-1" dir="ltr">
              <p className="text-base font-black text-slate-900">{activeLetter.name}</p>
              <p className="truncate text-xs text-slate-500">
                Pronounce “{activeLetter.sound}” · as in {activeLetter.example} ({activeLetter.meaning})
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => pronounce(activeLetter, "normal")}
                className="qaida-premium-button bg-emerald-600 px-4 py-2 text-sm font-black text-white"
                aria-label={`Hear ${activeLetter.name} again`}
              >
                🔊 Again
              </button>
              <button
                type="button"
                onClick={() => pronounce(activeLetter, "slow")}
                className="qaida-premium-button border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800"
              >
                🐢 Slow
              </button>
              <button
                type="button"
                onClick={() => onSelectLetter(`letter-${activeLetter.id}`)}
                className="qaida-premium-button border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700"
              >
                📖 Lesson →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
