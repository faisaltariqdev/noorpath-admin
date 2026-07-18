"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Letter } from "../types";
import { qaidaAudio } from "../audio/QaidaAudioService";
import GameShell from "./GameShell";

interface SoundMatchProps {
  letters: Letter[];
  onComplete: (stars: 1 | 2 | 3) => void;
  onClose: () => void;
  /** When set, every round matches this letter (letter-focused practice). */
  focusLetter?: Letter;
}

const ROUNDS = 5;
const TIME_LIMIT = 60;

export default function SoundMatch({ letters, onComplete, onClose, focusLetter }: SoundMatchProps) {
  const targets = useMemo(
    () =>
      focusLetter
        ? Array.from({ length: ROUNDS }, () => focusLetter)
        : [...letters].sort(() => Math.random() - 0.5).slice(0, ROUNDS),
    [letters, focusLetter],
  );
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const completedRef = useRef(false);
  const target = targets[Math.min(round, targets.length - 1)];
  const options = useMemo(() => {
    const distractors = letters.filter((letter) => letter.id !== target.id).sort(() => Math.random() - 0.5).slice(0, 3);
    return [target, ...distractors].sort(() => Math.random() - 0.5);
  }, [letters, target]);

  const playTarget = useCallback((mode: "normal" | "slow" = "normal") => {
    void qaidaAudio.pronounce({
      key: `letter-${target.id}`,
      fallbackText: target.letter,
      mode,
      policy: "replace",
    });
  }, [target]);

  const finish = useCallback((finalScore: number) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFinished(true);
    const stars: 1 | 2 | 3 = finalScore === ROUNDS && mistakes === 0 ? 3 : finalScore >= 3 ? 2 : 1;
    void qaidaAudio.effect("reward");
    window.setTimeout(() => onComplete(stars), 1100);
  }, [mistakes, onComplete]);

  useEffect(() => {
    playTarget();
  }, [playTarget]);

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
      qaidaAudio.feedback("Listen once more and try the matching shape.");
    }

    window.setTimeout(() => {
      if (round + 1 >= ROUNDS) finish(nextScore);
      else {
        setRound((value) => value + 1);
        setSelected(null);
      }
    }, 900);
  };

  const stars: 1 | 2 | 3 = score === ROUNDS && mistakes === 0 ? 3 : score >= 3 ? 2 : 1;

  return (
    <GameShell
      title="Sound Match"
      instruction="Listen carefully and choose the matching Arabic letter."
      icon="🎵"
      round={round + 1}
      totalRounds={ROUNDS}
      score={score}
      mistakes={mistakes}
      timeLeft={timeLeft}
      timeLimit={TIME_LIMIT}
      finished={finished}
      stars={stars}
      resultText={`You matched ${score} of ${ROUNDS} sounds.`}
      onClose={onClose}
      paused={paused}
      onPauseToggle={() => setPaused((value) => !value)}
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 overflow-x-hidden overflow-y-auto rounded-[1.5rem] bg-gradient-to-br from-fuchsia-100 to-sky-100 p-3 sm:gap-6 sm:p-4">
        <motion.button
          type="button"
          className="qaida-premium-button flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-700 text-4xl text-white shadow-xl sm:h-28 sm:w-28 sm:text-5xl"
          onClick={() => playTarget()}
          animate={{ boxShadow: ["0 12px 28px rgba(99,102,241,.25)", "0 18px 45px rgba(217,70,239,.4)", "0 12px 28px rgba(99,102,241,.25)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-label="Play target letter sound"
        >
          🔊
        </motion.button>
        <button
          type="button"
          className="min-h-11 rounded-full bg-white px-5 py-2 text-sm font-black text-indigo-800 shadow-md"
          onClick={() => playTarget("slow")}
        >
          Play slowly
        </button>

        <div className="grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {options.map((letter) => {
            const chosen = selected === letter.id;
            const correct = letter.id === target.id;
            return (
              <motion.button
                key={letter.id}
                className={`flex min-h-20 flex-col items-center justify-center rounded-[1.5rem] border-2 px-2 pb-2 pt-2.5 shadow-lg sm:min-h-28 sm:pb-2.5 sm:pt-3 ${
                  chosen ? (correct ? "border-emerald-500 bg-emerald-100 text-emerald-800" : "border-rose-400 bg-rose-50 text-rose-700") : "border-white bg-white text-indigo-950"
                }`}
                onClick={() => choose(letter)}
                disabled={selected !== null}
                whileHover={selected === null ? { y: -4, scale: 1.03 } : undefined}
                whileTap={selected === null ? { scale: 0.96 } : undefined}
                aria-label={`Choose ${letter.name}, pronounce ${letter.sound}`}
              >
                <span className="flex h-12 w-full items-center justify-center sm:h-14" aria-hidden="true">
                  <span className="qaida-arabic block text-4xl font-bold leading-[1.4] sm:text-5xl" lang="ar" dir="rtl">
                    {letter.letter}
                  </span>
                </span>
                <span className="mt-1 border-t border-black/5 pt-1 text-center text-[11px] font-black leading-tight" dir="ltr">
                  {letter.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
