"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Letter } from "../types";
import { qaidaAudio } from "../audio/QaidaAudioService";
import GameShell from "./GameShell";

interface LetterTrainProps {
  letters: Letter[];
  onComplete: (stars: 1 | 2 | 3) => void;
  onClose: () => void;
}

export default function LetterTrain({ letters, onComplete, onClose }: LetterTrainProps) {
  const sequence = useMemo(
    () => [...letters].sort(() => Math.random() - 0.5).slice(0, 5).sort((a, b) => a.id - b.id),
    [letters],
  );
  const choices = useMemo(() => [...sequence].sort(() => Math.random() - 0.5), [sequence]);
  const [selected, setSelected] = useState<Letter[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const completedRef = useRef(false);

  const finish = useCallback((score: number) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFinished(true);
    const stars: 1 | 2 | 3 = score === sequence.length && mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    void qaidaAudio.effect("reward");
    window.setTimeout(() => onComplete(stars), 1100);
  }, [mistakes, onComplete, sequence.length]);

  useEffect(() => {
    if (finished || paused) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          finish(selected.length);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finish, finished, paused, selected.length]);

  const choose = (letter: Letter) => {
    if (finished || selected.some((item) => item.id === letter.id)) return;
    const expected = sequence[selected.length];
    if (letter.id !== expected.id) {
      setMistakes((value) => value + 1);
      qaidaAudio.feedback("Let's try the next letter in order.");
      return;
    }

    const next = [...selected, letter];
    setSelected(next);
    void qaidaAudio.pronounce({ key: `letter-${letter.id}`, fallbackText: letter.letter });
    if (next.length === sequence.length) finish(next.length);
  };

  return (
    <GameShell
      title="Letter Train"
      instruction="Build the train from the earliest letter to the latest."
      icon="🚂"
      round={selected.length}
      totalRounds={sequence.length}
      score={selected.length}
      mistakes={mistakes}
      timeLeft={timeLeft}
      timeLimit={45}
      finished={finished}
      stars={mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1}
      resultText={`Train completed with ${selected.length} letters.`}
      onClose={onClose}
      paused={paused}
      onPauseToggle={() => setPaused((value) => !value)}
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 overflow-x-hidden overflow-y-auto rounded-[1.5rem] bg-gradient-to-b from-sky-100 to-emerald-100 p-3 sm:gap-6 sm:p-4">
        <div className="flex min-h-20 w-full max-w-3xl items-center gap-1.5 overflow-x-auto rounded-2xl bg-white/80 p-2.5 sm:min-h-24 sm:gap-2 sm:p-3" aria-label="Letter train">
          <span className="flex-none text-4xl sm:text-5xl" aria-hidden="true">🚂</span>
          {sequence.map((letter, index) => {
            const placed = selected[index];
            return (
              <motion.div
                key={letter.id}
                className="qaida-arabic flex h-14 w-14 flex-none items-center justify-center rounded-2xl border-2 border-emerald-300 bg-white text-2xl font-bold text-emerald-800 sm:h-16 sm:w-16 sm:text-3xl"
                animate={placed ? { scale: [0.8, 1.08, 1] } : undefined}
                lang="ar"
                dir="rtl"
              >
                {placed?.letter ?? "?"}
              </motion.div>
            );
          })}
        </div>

        <div className="grid w-full max-w-2xl grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
          {choices.map((letter) => {
            const used = selected.some((item) => item.id === letter.id);
            return (
              <motion.button
                key={letter.id}
                className={`qaida-arabic min-h-14 rounded-2xl border-2 text-3xl font-bold sm:min-h-20 sm:text-4xl ${
                  used ? "border-emerald-200 bg-emerald-100 text-emerald-400" : "border-white bg-white text-emerald-800 shadow-md"
                }`}
                onClick={() => choose(letter)}
                disabled={used}
                whileHover={used ? undefined : { y: -3, scale: 1.03 }}
                whileTap={used ? undefined : { scale: 0.96 }}
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
