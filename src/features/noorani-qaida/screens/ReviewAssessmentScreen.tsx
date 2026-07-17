"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { LETTERS } from "../data/curriculum";
import { TOPIC_LESSONS } from "../data/modules";
import { qaidaAudio } from "../audio/QaidaAudioService";
import ZaydMascot from "../characters/ZaydMascot";

interface ReviewAssessmentScreenProps {
  mode: "revision" | "assessment";
  reducedMotion: boolean;
  audioEnabled: boolean;
  onComplete: (score: number, total: number) => void;
}

interface Question {
  id: string;
  arabic: string;
  answer: string;
  options: string[];
  audioKey: string;
}

function makeQuestions(mode: "revision" | "assessment"): Question[] {
  const letterItems = LETTERS.map((letter) => ({
    id: `review-letter-${letter.id}`,
    arabic: letter.letter,
    answer: letter.name,
    audioKey: letter.audioKey,
  }));
  const topicItems = TOPIC_LESSONS.flatMap((lesson) =>
    lesson.examples.map((item) => ({
      id: item.id,
      arabic: item.arabic,
      answer: item.transliteration,
      audioKey: item.audioKey,
    })),
  );
  const pool = [...letterItems, ...topicItems].sort(() => Math.random() - 0.5);
  const count = mode === "assessment" ? 12 : 8;
  return pool.slice(0, count).map((item) => {
    const distractors = pool.filter((other) => other.answer !== item.answer).sort(() => Math.random() - 0.5).slice(0, 3);
    return { ...item, options: [item.answer, ...distractors.map((other) => other.answer)].sort(() => Math.random() - 0.5) };
  });
}

export default function ReviewAssessmentScreen({
  mode,
  reducedMotion,
  audioEnabled,
  onComplete,
}: ReviewAssessmentScreenProps) {
  const questions = useMemo(() => makeQuestions(mode), [mode]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const question = questions[index];

  const choose = (answer: string) => {
    if (selected || finished) return;
    setSelected(answer);
    const correct = answer === question.answer;
    const nextScore = score + (correct ? 1 : 0);
    if (correct) {
      setScore(nextScore);
      void qaidaAudio.effect("correct");
    } else {
      void qaidaAudio.effect("retry");
    }
    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        setFinished(true);
        onComplete(nextScore, questions.length);
      } else {
        setIndex((value) => value + 1);
        setSelected(null);
      }
    }, reducedMotion ? 250 : 850);
  };

  if (finished) {
    const finalPassed = score / questions.length >= 0.8;
    return (
      <div className="flex h-full min-h-[520px] flex-col items-center justify-center overflow-y-auto bg-gradient-to-br from-emerald-50 to-amber-50 p-6 text-center">
        <ZaydMascot mood={finalPassed ? "celebrating" : "happy"} action={finalPassed ? "dance" : "wave"} size={170} />
        <h1 className="mt-3 text-3xl font-black text-slate-900">{finalPassed ? "MashaAllah! Review complete" : "Good effort — let’s review again"}</h1>
        <p className="mt-2 text-lg font-bold text-emerald-700">{score} of {questions.length} correct</p>
        <p className="mt-2 max-w-lg text-sm text-slate-600">
          {mode === "assessment" && finalPassed
            ? "The digital assessment is complete. A qualified teacher should still verify pronunciation and Makharij."
            : "Use the chapter book to revisit any sound that felt difficult."}
        </p>
      </div>
    );
  }

  return (
    <main className="qaida-scroll h-full overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-600">{mode === "assessment" ? "Final assessment" : "Revision mode"}</p>
            <h1 className="text-2xl font-black text-slate-900">{mode === "assessment" ? "Reading & Recognition Review" : "Mixed Practice"}</h1>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">{index + 1}/{questions.length} · {score} correct</span>
        </header>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" animate={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>

        <motion.section
          key={question.id}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-[2rem] border border-white bg-white/90 p-6 text-center shadow-xl"
        >
          <p className="text-sm font-bold text-slate-500">Listen, read, and choose the matching name or sound.</p>
          <button
            type="button"
            onClick={() => audioEnabled && void qaidaAudio.pronounce({ key: question.audioKey, fallbackText: question.arabic })}
            className="mx-auto mt-5 flex min-h-40 w-full max-w-md items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-amber-50 to-emerald-50 px-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            aria-label="Hear the question"
          >
            <span className="qaida-arabic block text-7xl font-black leading-[1.4] text-emerald-900" lang="ar" dir="rtl">
              {question.arabic}
            </span>
          </button>
          <button type="button" onClick={() => audioEnabled && void qaidaAudio.pronounce({ key: question.audioKey, fallbackText: question.arabic, mode: "slow" })} className="mt-3 min-h-11 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-800">🔊 Play slowly</button>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {question.options.map((option) => {
              const correct = option === question.answer;
              const chosen = option === selected;
              return (
                <motion.button
                  key={option}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => choose(option)}
                  whileHover={!selected ? { y: -3 } : undefined}
                  whileTap={!selected ? { scale: 0.97 } : undefined}
                  className={`min-h-20 rounded-2xl border-2 p-3 text-sm font-black shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${
                    selected
                      ? correct ? "border-emerald-500 bg-emerald-50 text-emerald-800" : chosen ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"
                  }`}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </motion.section>
        <p className="mt-4 text-center text-xs text-slate-400">{mode === "assessment" ? "Passing score: 80%. Teacher verification is required for pronunciation mastery." : "Revision is ungraded and may be repeated anytime."}</p>
      </div>
    </main>
  );
}
