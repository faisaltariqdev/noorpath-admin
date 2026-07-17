"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import SparkleBurst from "../animations/SparkleBurst";
import StarBurst from "../animations/StarBurst";
import { speakArabic } from "../audio/speech";
import type { Letter } from "../types";

interface LetterCardProps {
  letter: Letter;
  size?: "sm" | "md" | "lg";
  showForms?: boolean;
  onTap?: () => void;
  interactive?: boolean;
  completed?: boolean;
  pronouncing?: boolean;
  reducedMotion?: boolean;
}

const sizeMap = {
  sm: { card: "w-24 h-28", text: "text-5xl", name: "text-sm" },
  md: { card: "w-40 h-48", text: "text-7xl", name: "text-base" },
  lg: {
    card: "h-48 w-40 sm:h-52 sm:w-44 xl:h-56 xl:w-48",
    text: "text-7xl sm:text-8xl xl:text-9xl",
    name: "text-base sm:text-lg",
  },
};

export default function LetterCard({
  letter,
  size = "md",
  showForms,
  onTap,
  interactive = true,
  completed,
  pronouncing = false,
  reducedMotion = false,
}: LetterCardProps) {
  const [tapped, setTapped] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [starBurst, setStarBurst] = useState(false);
  const s = sizeMap[size];

  const handleTap = useCallback(() => {
    if (!interactive) return;
    setTapped(true);
    setSparkle(true);
    if (onTap) onTap();
    else speakArabic(letter.letter);
    setTimeout(() => setTapped(false), 600);
    setTimeout(() => setSparkle(false), 900);
    if (completed) {
      setStarBurst(true);
      setTimeout(() => setStarBurst(false), 1000);
    }
  }, [interactive, letter.letter, onTap, completed]);

  return (
    <div className="relative flex flex-col items-center gap-2">
      <motion.button
        className={`qaida-premium-button relative ${s.card} cursor-pointer overflow-hidden rounded-3xl border-4 ${
          completed
            ? "border-yellow-400 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50"
            : "border-green-200 bg-gradient-to-br from-sky-50 via-white to-green-50"
        } shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400`}
        whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
        whileTap={{ scale: 0.95 }}
        animate={tapped ? {
          rotate: [0, -5, 5, -3, 3, 0],
          scale: [1, 1.08, 0.98, 1.04, 1],
        } : pronouncing && !reducedMotion ? {
          scale: [1, 1.035, 1],
          boxShadow: [
            "0 18px 38px rgba(14,79,45,.18)",
            "0 22px 52px rgba(245,197,24,.38)",
            "0 18px 38px rgba(14,79,45,.18)",
          ],
        } : !reducedMotion ? {
          y: [0, -6, 0],
        } : undefined}
        transition={tapped ? { duration: 0.5 } : { duration: pronouncing ? 1.2 : 3, repeat: Infinity, ease: "easeInOut" }}
        onClick={handleTap}
        aria-label={`Arabic letter ${letter.name}, tap to hear pronunciation`}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          animate={tapped ? {
            boxShadow: ["0 0 0px #f5c518", "0 0 40px #f5c518", "0 0 0px #f5c518"],
          } : {
            boxShadow: ["0 0 0px transparent", "0 0 20px rgba(74,222,128,0.3)", "0 0 0px transparent"],
          }}
          transition={{ duration: tapped ? 0.6 : 2.5, repeat: tapped ? 0 : Infinity }}
        />

        {/* Gold badge for completed */}
        {completed && (
          <motion.div
            className="absolute right-2 top-2 text-lg"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⭐
          </motion.div>
        )}

        {/* Main letter */}
        <div className="flex h-full flex-col items-center justify-center">
          <motion.span
            className={`qaida-arabic ${s.text} relative z-10 font-bold leading-[1.35] text-green-800`}
            lang="ar"
            dir="rtl"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.72, filter: "blur(8px)" }}
            animate={tapped
              ? { scale: [1, 1.2, 1], opacity: 1, filter: "blur(0px)" }
              : { scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
          >
            {letter.letter}
          </motion.span>
          {pronouncing && (
            <span className="qaida-waveform relative z-10 mt-3 flex h-5 items-center gap-1" aria-hidden="true">
              {[8, 14, 20, 14, 8].map((height, index) => (
                <motion.i
                  key={`${height}-${index}`}
                  className="w-1 rounded-full bg-emerald-600"
                  animate={reducedMotion ? { height } : { height: [6, height, 6] }}
                  transition={{ duration: 0.55, repeat: Infinity, delay: index * 0.08 }}
                />
              ))}
            </span>
          )}
        </div>

        {/* Sparkle overlay */}
        <SparkleBurst active={sparkle} />
        <StarBurst active={starBurst} count={6} size="sm" />
      </motion.button>

      {/* Letter name + pronunciation — kept outside the glyph so descenders never cover it */}
      <div className={`flex flex-col items-center gap-0.5 text-center ${s.name}`}>
        <span className="font-bold leading-tight text-green-900">{letter.name}</span>
        <span className="text-xs font-semibold leading-tight text-green-700/80" dir="ltr">“{letter.sound}”</span>
      </div>

      {/* Letter forms */}
      <AnimatePresence>
        {showForms && (
          <motion.div
            className="flex gap-3 rounded-2xl bg-white/80 px-3 py-2 shadow-md"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {letter.forms.map((form, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-xl font-bold text-green-800" style={{ fontFamily: "serif" }}>{form}</span>
                <span className="text-[10px] text-gray-500">
                  {["Isolated", "Initial", "Medial", "Final"][i]}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
