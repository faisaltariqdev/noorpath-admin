"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Letter } from "../types";
import { qaidaAudio } from "../audio/QaidaAudioService";
import GameShell from "./GameShell";

interface Bubble {
  id: number;
  letter: Letter;
  isTarget: boolean;
  x: number;
  y: number;
  size: number;
  color: string;
  popped: boolean;
  duration: number;
}

interface BubblePopProps {
  letters: Letter[];
  targetLetter: Letter;
  onComplete: (stars: 1 | 2 | 3) => void;
  onClose: () => void;
}

const BUBBLE_COLORS = [
  "from-purple-400 to-purple-600",
  "from-blue-400 to-blue-600",
  "from-pink-400 to-rose-600",
  "from-teal-400 to-cyan-600",
  "from-orange-400 to-amber-600",
  "from-green-400 to-emerald-600",
];

export default function BubblePop({ letters, targetLetter, onComplete, onClose }: BubblePopProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [paused, setPaused] = useState(false);
  const totalRounds = 5;

  const generateBubbles = useCallback(() => {
    const pool = [...letters].sort(() => Math.random() - 0.5).slice(0, 5);
    if (!pool.find((l) => l.id === targetLetter.id)) {
      pool[Math.floor(Math.random() * pool.length)] = targetLetter;
    }
    setBubbles(
      pool.map((l, i) => ({
        id: Date.now() + i,
        letter: l,
        isTarget: l.id === targetLetter.id,
        x: 8 + (i * 17) % 80,
        y: 15 + (i * 23) % 60,
        size: 70 + Math.floor(Math.random() * 30),
        color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
        popped: false,
        duration: 3 + (i % 3) * 0.65,
      }))
    );
  }, [letters, targetLetter]);

  useEffect(() => {
    generateBubbles();
    qaidaAudio.feedback(`Find ${targetLetter.name}`);
  }, [generateBubbles, targetLetter]);

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

  const handlePop = useCallback((bubble: Bubble) => {
    if (bubble.popped || finished) return;

    setBubbles((prev) => prev.map((b) => b.id === bubble.id ? { ...b, popped: true } : b));

    if (bubble.isTarget) {
      setScore((s) => s + 1);
      void qaidaAudio.effect("correct");
      const nextRound = rounds + 1;
      setRounds(nextRound);
      if (nextRound >= totalRounds) {
        setFinished(true);
        const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        setTimeout(() => onComplete(stars as 1 | 2 | 3), 1000);
      } else {
        setTimeout(generateBubbles, 800);
      }
    } else {
      setMistakes((m) => m + 1);
      qaidaAudio.feedback("حاول مرة أخرى", "ar");
    }
  }, [finished, rounds, mistakes, generateBubbles, onComplete]);

  return (
    <GameShell
      title="Bubble Pop"
      instruction={`Pop the bubble with ${targetLetter.name}.`}
      icon="🫧"
      round={rounds + 1}
      totalRounds={totalRounds}
      score={score}
      mistakes={mistakes}
      timeLeft={timeLeft}
      timeLimit={45}
      finished={finished}
      stars={mistakes === 0 && score === totalRounds ? 3 : mistakes <= 2 ? 2 : 1}
      resultText={`You found ${score} correct letters.`}
      onClose={onClose}
      paused={paused}
      onPauseToggle={() => setPaused((value) => !value)}
    >
      {/* Target */}
      <motion.div
        className="mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 px-6 py-3 text-center shadow-md"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-xs font-medium uppercase text-amber-600">Pop the bubble with</div>
        <div className="qaida-arabic text-4xl font-black text-amber-800" lang="ar" dir="rtl">{targetLetter.letter}</div>
        <div className="text-sm font-semibold text-amber-700">{targetLetter.name}</div>
      </motion.div>

      {/* Bubble field */}
      <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-blue-200">
        <AnimatePresence>
          {bubbles.filter((b) => !b.popped).map((bubble) => (
            <motion.button
              key={bubble.id}
              className={`absolute flex items-center justify-center rounded-full bg-gradient-to-br ${bubble.color} font-bold text-white shadow-xl`}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
                fontSize: bubble.size * 0.4,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0.9, 1, 0.95, 1],
                y: [0, -10, 0, 10, 0],
                opacity: 1,
              }}
              exit={{ scale: [1, 1.3, 0], opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: bubble.duration, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => handlePop(bubble)}
              whileTap={{ scale: 0.8 }}
              aria-label={`Pop bubble with letter ${bubble.letter.name}`}
            >
              <span className="qaida-arabic" lang="ar" dir="rtl">{bubble.letter.letter}</span>
            </motion.button>
          ))}
        </AnimatePresence>

      </div>
    </GameShell>
  );
}
