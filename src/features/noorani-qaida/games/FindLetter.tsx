"use client";
import { motion } from "framer-motion";
import { useState, useCallback, useMemo, useEffect } from "react";
import type { Letter } from "../types";
import { qaidaAudio } from "../audio/QaidaAudioService";
import GameShell from "./GameShell";

interface FindLetterProps {
  letters: Letter[];
  onComplete: (stars: 1 | 2 | 3) => void;
  onClose: () => void;
  /** When set, this letter is always the target (letter-focused practice). */
  focusLetter?: Letter;
}

export default function FindLetter({ letters, onComplete, onClose, focusLetter }: FindLetterProps) {
  const ROUNDS = 5;
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [paused, setPaused] = useState(false);

  const { target, options } = useMemo(() => {
    void round;
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    const tgt = focusLetter ?? shuffled[0];
    const distractors = shuffled.filter((letter) => letter.id !== tgt.id).slice(0, 3);
    const opts = [tgt, ...distractors];
    return { target: tgt, options: opts.sort(() => Math.random() - 0.5) };
  }, [letters, round, focusLetter]);

  useEffect(() => {
    void qaidaAudio.pronounce({ key: `letter-${target.id}`, fallbackText: target.letter });
  }, [target]);

  useEffect(() => {
    if (finished || paused) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setFinished(true);
          const stars: 1 | 2 | 3 = score >= 4 ? 3 : score >= 2 ? 2 : 1;
          window.setTimeout(() => onComplete(stars), 900);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finished, onComplete, paused, score]);

  const handleSelect = useCallback((letter: Letter) => {
    if (feedback || finished) return;
    setSelected(letter.id);
    const correct = letter.id === target.id;
    setFeedback(correct ? "correct" : "wrong");

    if (correct) {
      setScore((s) => s + 1);
      void qaidaAudio.effect("correct");
    } else {
      setMistakes((m) => m + 1);
      qaidaAudio.feedback("حاول مرة أخرى", "ar");
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
    <GameShell
      title="Find the Letter"
      instruction="Find the matching Arabic letter."
      icon="🔍"
      round={round + 1}
      totalRounds={ROUNDS}
      score={score}
      mistakes={mistakes}
      timeLeft={timeLeft}
      timeLimit={60}
      finished={finished}
      stars={score === ROUNDS && mistakes === 0 ? 3 : score >= 3 ? 2 : 1}
      resultText={`You found ${score} of ${ROUNDS} letters.`}
      onClose={onClose}
      paused={paused}
      onPauseToggle={() => setPaused((value) => !value)}
    >
      {/* Target letter */}
      <motion.div
        className="mx-1 mb-3 flex flex-col items-center rounded-3xl bg-gradient-to-br from-sky-50 to-blue-100 p-4 shadow-md sm:mx-4 sm:mb-4 sm:p-6"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        key={`target-${round}`}
      >
        <div className="text-xs font-medium uppercase tracking-wider text-blue-500">Find this letter</div>
        <span className="mt-2 flex h-20 w-full items-center justify-center sm:h-28" aria-hidden="true">
          <motion.span
            className="qaida-arabic block text-6xl font-black leading-[1.35] text-blue-800 sm:text-8xl"
            lang="ar"
            dir="rtl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            key={target.id}
          >
            {target.letter}
          </motion.span>
        </span>
        <div className="mt-1 flex flex-col items-center gap-0.5 border-t border-blue-200/70 pt-2">
          <span className="text-lg font-bold leading-tight text-blue-700">{target.name}</span>
          <span className="text-sm font-semibold text-blue-600/80" dir="ltr">“{target.sound}”</span>
        </div>
        <button
          className="mt-2 flex min-h-11 items-center gap-1 rounded-full bg-blue-200 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-300"
          onClick={() => void qaidaAudio.pronounce({ key: `letter-${target.id}`, fallbackText: target.letter })}
          aria-label="Hear pronunciation"
        >
          🔊 Hear it
        </button>
      </motion.div>

      {/* Options grid */}
      <div className="qaida-game-field min-h-0 flex-1 overflow-hidden pt-2 sm:pt-4">
        <div className="grid h-full grid-cols-2 gap-2.5 sm:gap-4">
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
                className={`relative flex min-h-[5.5rem] items-center justify-center rounded-2xl sm:min-h-[7rem] ${bg} shadow-md transition-colors`}
                onClick={() => handleSelect(opt)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                animate={isSelected && feedback === "correct" ? { scale: [1, 1.1, 1] } : {}}
                aria-label={`Select letter ${opt.name}`}
              >
                <span className="qaida-arabic text-4xl font-black text-gray-800 sm:text-5xl" lang="ar" dir="rtl">
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

    </GameShell>
  );
}
