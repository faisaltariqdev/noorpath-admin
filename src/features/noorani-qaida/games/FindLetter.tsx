"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { Letter } from "../types";
import { speakArabic } from "../audio/speech";

interface FindLetterProps {
  letters: Letter[];
  onComplete: (stars: 1 | 2 | 3) => void;
  onClose: () => void;
}

export default function FindLetter({ letters, onComplete, onClose }: FindLetterProps) {
  const ROUNDS = 5;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);

  const { target, options } = useMemo(() => {
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    const tgt = shuffled[0];
    const opts = shuffled.slice(0, 4);
    if (!opts.find((o) => o.id === tgt.id)) opts[3] = tgt;
    return { target: tgt, options: opts.sort(() => Math.random() - 0.5) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letters, round]);

  useEffect(() => {
    speakArabic(target.letter);
  }, [target]);

  const handleSelect = useCallback((letter: Letter) => {
    if (feedback || finished) return;
    setSelected(letter.id);
    const correct = letter.id === target.id;
    setFeedback(correct ? "correct" : "wrong");

    if (correct) {
      setScore((s) => s + 1);
      speakArabic("صح");
    } else {
      setMistakes((m) => m + 1);
      speakArabic("حاول مرة أخرى");
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      const nextRound = round + 1;
      setRound(nextRound);
      if (nextRound >= ROUNDS) {
        setFinished(true);
        const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        setTimeout(() => onComplete(stars as 1 | 2 | 3), 1200);
      }
    }, 1000);
  }, [feedback, finished, round, target, mistakes, onComplete]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">← Back</button>
        <div className="flex gap-3 text-sm font-semibold text-gray-700">
          <span>🔍 Round {Math.min(round + 1, ROUNDS)}/{ROUNDS}</span>
          <span className="text-green-600">✅ {score}</span>
          {mistakes > 0 && <span className="text-red-500">❌ {mistakes}</span>}
        </div>
      </div>

      {/* Target letter */}
      <motion.div
        className="mx-4 mb-4 flex flex-col items-center rounded-3xl bg-gradient-to-br from-sky-50 to-blue-100 p-6 shadow-md"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        key={`target-${round}`}
      >
        <div className="text-xs font-medium uppercase tracking-wider text-blue-500">Find this letter</div>
        <motion.div
          className="mt-2 text-8xl font-black text-blue-800"
          style={{ fontFamily: "serif", direction: "rtl" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          key={target.id}
        >
          {target.letter}
        </motion.div>
        <div className="mt-1 text-lg font-bold text-blue-700">{target.name}</div>
        <button
          className="mt-2 flex items-center gap-1 rounded-full bg-blue-200 px-3 py-1 text-xs text-blue-700 hover:bg-blue-300"
          onClick={() => speakArabic(target.letter)}
          aria-label="Hear pronunciation"
        >
          🔊 Hear it
        </button>
      </motion.div>

      {/* Options grid */}
      <div className="flex-1 overflow-hidden px-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          {options.map((opt) => {
            const isSelected = selected === opt.id;
            const isCorrect = opt.id === target.id;
            let bg = "bg-white border-2 border-gray-200 hover:border-green-300";
            if (isSelected) {
              bg = feedback === "correct" && isCorrect
                ? "bg-green-50 border-2 border-green-400 shadow-green-200 shadow-lg"
                : "bg-red-50 border-2 border-red-400 shadow-red-200 shadow-lg";
            }

            return (
              <motion.button
                key={opt.id}
                className={`flex items-center justify-center rounded-2xl ${bg} shadow-md transition-colors`}
                onClick={() => handleSelect(opt)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                animate={isSelected && feedback === "correct" ? { scale: [1, 1.1, 1] } : {}}
                aria-label={`Select letter ${opt.name}`}
              >
                <span className="text-5xl font-black text-gray-800" style={{ fontFamily: "serif", direction: "rtl" }}>
                  {opt.letter}
                </span>
                {isSelected && (
                  <motion.span
                    className="absolute top-2 right-2 text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {feedback === "correct" && isCorrect ? "✅" : "❌"}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="p-3 text-center text-xs text-gray-400">Tap the matching Arabic letter!</div>

      <AnimatePresence>
        {finished && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="rounded-3xl bg-white p-8 text-center shadow-2xl"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="text-5xl">🌟</div>
              <div className="mt-2 text-xl font-black">{"⭐".repeat(score >= ROUNDS ? 3 : score >= 3 ? 2 : 1)}</div>
              <h2 className="text-gray-900">Score: {score}/{ROUNDS}</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
