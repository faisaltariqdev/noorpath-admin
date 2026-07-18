"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Letter } from "../types";
import { qaidaAudio } from "../audio/QaidaAudioService";
import GameShell from "./GameShell";

interface LetterPuzzleProps {
  letters: Letter[];
  onComplete: (stars: 1 | 2 | 3) => void;
  onClose: () => void;
}

const ROUNDS = 5;
const TIME_LIMIT = 60;

export default function LetterPuzzle({ letters, onComplete, onClose }: LetterPuzzleProps) {
  const targets = useMemo(
    () => [...letters.slice(1, -1)].sort(() => Math.random() - 0.5).slice(0, ROUNDS),
    [letters],
  );
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const completedRef = useRef(false);
  const target = targets[Math.min(round, targets.length - 1)];
  const targetIndex = letters.findIndex((letter) => letter.id === target.id);
  const options = useMemo(() => {
    const distractors = letters.filter((letter) => letter.id !== target.id).sort(() => Math.random() - 0.5).slice(0, 3);
    return [target, ...distractors].sort(() => Math.random() - 0.5);
  }, [letters, target]);

  const finish = useCallback((finalScore: number) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFinished(true);
    const stars: 1 | 2 | 3 = finalScore === ROUNDS && mistakes === 0 ? 3 : finalScore >= 3 ? 2 : 1;
    void qaidaAudio.effect("reward");
    window.setTimeout(() => onComplete(stars), 1100);
  }, [mistakes, onComplete]);

  useEffect(() => {
    if (finished || paused) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          finish(score);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finish, finished, paused, score]);

  const choose = (letter: Letter) => {
    if (selected !== null || finished) return;
    setSelected(letter.id);
    const correct = letter.id === target.id;
    const nextScore = score + (correct ? 1 : 0);
    if (correct) {
      setScore(nextScore);
      void qaidaAudio.effect("correct");
    } else {
      setMistakes((value) => value + 1);
      qaidaAudio.feedback("Almost. Look at the letters on both sides.");
    }

    window.setTimeout(() => {
      if (round + 1 >= ROUNDS) finish(nextScore);
      else {
        setRound((value) => value + 1);
        setSelected(null);
      }
    }, 850);
  };

  const stars: 1 | 2 | 3 = score === ROUNDS && mistakes === 0 ? 3 : score >= 3 ? 2 : 1;

  return (
    <GameShell
      title="Letter Puzzle"
      instruction="Choose the missing letter between its neighbours."
      icon="🧩"
      round={round + 1}
      totalRounds={ROUNDS}
      score={score}
      mistakes={mistakes}
      timeLeft={timeLeft}
      timeLimit={TIME_LIMIT}
      finished={finished}
      stars={stars}
      resultText={`You solved ${score} of ${ROUNDS} puzzles.`}
      onClose={onClose}
      paused={paused}
      onPauseToggle={() => setPaused((value) => !value)}
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 overflow-x-hidden overflow-y-auto rounded-[1.5rem] bg-gradient-to-br from-indigo-100 to-amber-50 p-3 sm:gap-6 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3" aria-label="Letter sequence puzzle">
          {[letters[targetIndex - 1], null, letters[targetIndex + 1]].map((letter, index) => (
            <motion.div
              key={letter?.id ?? "missing"}
              className={`qaida-arabic flex h-20 w-20 items-center justify-center rounded-[1.5rem] border-4 text-4xl font-bold sm:h-28 sm:w-28 sm:text-5xl ${
                letter ? "border-white bg-white text-indigo-900 shadow-lg" : "border-dashed border-amber-400 bg-amber-50 text-amber-700"
              }`}
              animate={!letter ? { scale: [1, 1.04, 1] } : undefined}
              lang="ar"
              dir="rtl"
            >
              {letter?.letter ?? "؟"}
            </motion.div>
          ))}
        </div>

        <div className="grid w-full max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {options.map((letter) => {
            const chosen = selected === letter.id;
            const correct = letter.id === target.id;
            return (
              <motion.button
                key={letter.id}
                className={`qaida-arabic min-h-14 rounded-2xl border-2 text-3xl font-bold shadow-md sm:min-h-20 sm:text-4xl ${
                  chosen ? (correct ? "border-emerald-500 bg-emerald-100 text-emerald-800" : "border-rose-400 bg-rose-50 text-rose-700") : "border-white bg-white text-indigo-900"
                }`}
                onClick={() => choose(letter)}
                disabled={selected !== null}
                whileHover={selected === null ? { y: -3, scale: 1.03 } : undefined}
                whileTap={selected === null ? { scale: 0.96 } : undefined}
                lang="ar"
                dir="rtl"
              >
                {letter.letter}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
