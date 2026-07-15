"use client";
import { motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import type { Letter } from "../types";
import { qaidaAudio } from "../audio/QaidaAudioService";
import GameShell from "./GameShell";

interface QuickChallengeProps {
  letters: Letter[];
  onComplete: (stars: 1 | 2 | 3) => void;
  onClose: () => void;
}

interface Question {
  prompt: string;
  arabic: string;
  options: string[];
  correct: string;
  letter: Letter;
}

function buildQuestions(letters: Letter[]): Question[] {
  const shuffled = [...letters].sort(() => Math.random() - 0.5).slice(0, 5);
  return shuffled.map((letter) => {
    const others = letters.filter((l) => l.id !== letter.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [letter.name, ...others.map((o) => o.name)].sort(() => Math.random() - 0.5);
    return {
      prompt: `What is this letter?`,
      arabic: letter.letter,
      options,
      correct: letter.name,
      letter,
    };
  });
}

export default function QuickChallenge({ letters, onComplete, onClose }: QuickChallengeProps) {
  const [questions] = useState(() => buildQuestions(letters));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const q = questions[current];

  useEffect(() => {
    if (finished || paused || selected) return;
    void qaidaAudio.pronounce({ key: `letter-${q.letter.id}`, fallbackText: q.arabic });
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setSelected("__timeout__");
          window.setTimeout(() => {
            const next = current + 1;
            if (next >= questions.length) {
              setFinished(true);
              const stars: 1 | 2 | 3 = score >= 4 ? 3 : score >= 2 ? 2 : 1;
              window.setTimeout(() => onComplete(stars), 900);
            } else {
              setCurrent(next);
              setSelected(null);
              setTimeLeft(15);
            }
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [current, finished, onComplete, paused, q, questions.length, score, selected]);

  const handleAnswer = useCallback((answer: string) => {
    if (selected || finished) return;
    setSelected(answer);
    const correct = answer === q.correct;
    if (correct) {
      setScore((s) => s + 1);
      void qaidaAudio.effect("correct");
    }
    setTimeout(() => {
      const next = current + 1;
      if (next >= questions.length) {
        setFinished(true);
        const stars = score + (correct ? 1 : 0) >= 4 ? 3 : score + (correct ? 1 : 0) >= 2 ? 2 : 1;
        setTimeout(() => onComplete(stars as 1 | 2 | 3), 1200);
      } else {
        setCurrent(next);
        setSelected(null);
        setTimeLeft(15);
      }
    }, 900);
  }, [selected, finished, q, current, questions, score, onComplete]);

  return (
    <GameShell
      title="Quick Challenge"
      instruction="Name the letter before the timer reaches zero."
      icon="⚡"
      round={current + 1}
      totalRounds={questions.length}
      score={score}
      timeLeft={timeLeft}
      timeLimit={15}
      finished={finished}
      stars={score >= 4 ? 3 : score >= 2 ? 2 : 1}
      resultText={`You answered ${score} of ${questions.length} correctly.`}
      onClose={onClose}
      paused={paused}
      onPauseToggle={() => setPaused((value) => !value)}
    >
      {/* Question */}
      <motion.div
        className="flex flex-col items-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-100 p-5 text-center shadow-md"
        key={current}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="text-sm font-medium text-indigo-500 uppercase tracking-wider">{q.prompt}</div>
        <motion.div
          className="qaida-arabic mt-3 text-7xl font-black text-indigo-900 sm:text-8xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {q.arabic}
        </motion.div>
        <button
          className="mt-2 flex items-center gap-1 rounded-full bg-indigo-200 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-300"
          onClick={() => void qaidaAudio.pronounce({ key: `letter-${q.letter.id}`, fallbackText: q.arabic })}
          aria-label="Hear pronunciation"
        >
          🔊 Hear
        </button>
      </motion.div>

      {/* Options */}
      <div className="grid min-h-[220px] flex-1 grid-cols-2 gap-3 pt-4">
        {q.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = opt === q.correct;
          let style = "bg-white border-2 border-gray-200 text-gray-800 hover:border-indigo-300";
          if (selected) {
            if (isCorrect) style = "bg-green-50 border-2 border-green-500 text-green-800";
            else if (isSelected) style = "bg-red-50 border-2 border-red-400 text-red-800";
            else style = "bg-gray-50 border-2 border-gray-200 text-gray-400";
          }
          return (
            <motion.button
              key={opt}
              className={`flex items-center justify-center rounded-2xl ${style} p-4 font-bold shadow-md transition-colors`}
              onClick={() => handleAnswer(opt)}
              whileHover={!selected ? { scale: 1.03, y: -2 } : {}}
              whileTap={!selected ? { scale: 0.97 } : {}}
              disabled={!!selected}
            >
              <span className="text-center">{opt}</span>
              {isSelected && (
                <span className="ml-2">{isCorrect ? "✅" : "❌"}</span>
              )}
            </motion.button>
          );
        })}
      </div>

    </GameShell>
  );
}
