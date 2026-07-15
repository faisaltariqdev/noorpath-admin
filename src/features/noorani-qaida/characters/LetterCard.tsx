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
}

const sizeMap = {
  sm: { card: "w-24 h-28", text: "text-5xl", name: "text-sm" },
  md: { card: "w-40 h-48", text: "text-7xl", name: "text-base" },
  lg: { card: "w-52 h-64", text: "text-9xl", name: "text-xl" },
};

export default function LetterCard({ letter, size = "md", showForms, onTap, interactive = true, completed }: LetterCardProps) {
  const [tapped, setTapped] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [starBurst, setStarBurst] = useState(false);
  const s = sizeMap[size];

  const handleTap = useCallback(() => {
    if (!interactive) return;
    setTapped(true);
    setSparkle(true);
    speakArabic(letter.letter);
    if (onTap) onTap();
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
        className={`relative ${s.card} cursor-pointer overflow-hidden rounded-3xl border-4 ${
          completed
            ? "border-yellow-400 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50"
            : "border-green-200 bg-gradient-to-br from-sky-50 via-white to-green-50"
        } shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400`}
        whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
        whileTap={{ scale: 0.95 }}
        animate={tapped ? {
          rotate: [0, -5, 5, -3, 3, 0],
          scale: [1, 1.08, 0.98, 1.04, 1],
        } : {
          y: [0, -6, 0],
        }}
        transition={tapped ? { duration: 0.5 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
          <motion.div
            className={`${s.text} font-bold leading-none text-green-800`}
            style={{ fontFamily: "serif", direction: "rtl" }}
            animate={tapped ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            {letter.letter}
          </motion.div>
        </div>

        {/* Sparkle overlay */}
        <SparkleBurst active={sparkle} />
        <StarBurst active={starBurst} count={6} size="sm" />
      </motion.button>

      {/* Letter name */}
      <div className={`font-bold text-green-900 ${s.name}`}>{letter.name}</div>

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
