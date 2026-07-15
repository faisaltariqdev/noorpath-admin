"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import type { Letter } from "../types";
import { speakArabic } from "../audio/speech";

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
  const [timeLeft, setTimeLeft] = useState(15);

  const q = questions[current];

  useEffect(() => {
    if (finished || selected) return;
    speakArabic(q.arabic);
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setSelected("__timeout__");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, finished]);

  const handleAnswer = useCallback((answer: string) => {
    if (selected || finished) return;
    setSelected(answer);
    const correct = answer === q.correct;
    if (correct) {
      setScore((s) => s + 1);
      speakArabic("ممتاز");
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

  const timerPct = (timeLeft / 15) * 100;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">← Back</button>
        <div className="flex gap-3 text-sm font-semibold">
          <span className="text-gray-700">Question {current + 1}/{questions.length}</span>
          <span className="text-green-600">✅ {score}</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="mx-4 h-2 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className={`h-full rounded-full ${timerPct > 40 ? "bg-green-500" : timerPct > 20 ? "bg-yellow-500" : "bg-red-500"}`}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="mx-4 mt-0.5 text-right text-xs text-gray-400">{timeLeft}s</div>

      {/* Question */}
      <motion.div
        className="mx-4 mt-4 flex flex-col items-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-100 p-6 text-center shadow-md"
        key={current}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="text-sm font-medium text-indigo-500 uppercase tracking-wider">{q.prompt}</div>
        <motion.div
          className="mt-3 text-8xl font-black text-indigo-900"
          style={{ fontFamily: "serif", direction: "rtl" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {q.arabic}
        </motion.div>
        <button
          className="mt-2 flex items-center gap-1 rounded-full bg-indigo-200 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-300"
          onClick={() => speakArabic(q.arabic)}
          aria-label="Hear pronunciation"
        >
          🔊 Hear
        </button>
      </motion.div>

      {/* Options */}
      <div className="flex-1 grid grid-cols-2 gap-3 p-4">
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
            >
              <div className="text-5xl">{score >= 4 ? "🏆" : score >= 2 ? "🌟" : "💪"}</div>
              <h2 className="mt-2 text-xl font-black text-gray-900">
                {"⭐".repeat(score >= 4 ? 3 : score >= 2 ? 2 : 1)}
              </h2>
              <p className="text-gray-600">Score: {score}/{questions.length}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
