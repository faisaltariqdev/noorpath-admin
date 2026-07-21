"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import NooriMascot, { type NooriAction, type NooriMood } from "../components/NooriMascot";
import SparkBurst from "../components/SparkBurst";
import type { IKLesson, IKQuestion } from "../types";

interface LessonPlayerProps {
  lesson: IKLesson;
  ageBand: "young" | "mid" | "older";
  onBack: () => void;
  onComplete: (correct: number, total: number) => void;
}

function pickQuestions(questions: IKQuestion[], ageBand: LessonPlayerProps["ageBand"]): IKQuestion[] {
  const easy = questions.filter((q) => q.difficulty === "easy");
  const medium = questions.filter((q) => q.difficulty === "medium");
  const hard = questions.filter((q) => q.difficulty === "hard");
  if (ageBand === "young") return [...easy, ...medium].slice(0, 3);
  if (ageBand === "mid") return [...easy, ...medium, ...hard].slice(0, 4);
  return [...medium, ...hard, ...easy].slice(0, 5);
}

function moodFromStep(mood?: string): NooriMood {
  if (mood === "cheer") return "cheer";
  if (mood === "hint") return "hint";
  if (mood === "think") return "think";
  return "happy";
}

export default function LessonPlayer({ lesson, ageBand, onBack, onComplete }: LessonPlayerProps) {
  const quiz = useMemo(() => pickQuestions(lesson.questions, ageBand), [lesson.questions, ageBand]);
  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");
  const [stepIndex, setStepIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [stars, setStars] = useState<1 | 2 | 3>(1);
  const [tappedReveal, setTappedReveal] = useState(false);
  const [emojiPop, setEmojiPop] = useState(0);
  const [spark, setSpark] = useState(false);
  const [nooriAction, setNooriAction] = useState<NooriAction>("wave");

  const step = lesson.steps[stepIndex];
  const question = quiz[qIndex];
  const needsTap = step?.type === "tap" || step?.type === "fact";

  function goNextStep() {
    if (needsTap && !tappedReveal) {
      setTappedReveal(true);
      setNooriAction("clap");
      setSpark(true);
      window.setTimeout(() => setSpark(false), 700);
      return;
    }
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex((i) => i + 1);
      setTappedReveal(false);
      setNooriAction("bounce");
      return;
    }
    setPhase("quiz");
    setNooriAction("point");
  }

  function checkAnswer(answer: string) {
    if (!question || feedback) return;
    const expected = Array.isArray(question.answer) ? question.answer[0] : question.answer;
    const ok =
      question.kind === "fill_blank"
        ? answer.trim().toLowerCase().replace(/[^\w\u0600-\u06FF]/g, "") ===
          String(expected).toLowerCase().replace(/[^\w\u0600-\u06FF]/g, "")
        : answer === expected;

    setFeedback(ok ? "correct" : "wrong");
    setNooriAction(ok ? "clap" : "idle");
    if (ok) {
      setCorrect((c) => c + 1);
      setSpark(true);
      window.setTimeout(() => setSpark(false), 700);
    }

    window.setTimeout(() => {
      const nextCorrect = ok ? correct + 1 : correct;
      if (qIndex < quiz.length - 1) {
        setQIndex((i) => i + 1);
        setSelected(null);
        setFillValue("");
        setFeedback(null);
        setNooriAction("point");
      } else {
        const total = quiz.length;
        const ratio = total > 0 ? nextCorrect / total : 1;
        const s: 1 | 2 | 3 = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
        setStars(s);
        setPhase("done");
        setNooriAction("bounce");
        onComplete(nextCorrect, total);
      }
    }, 900);
  }

  const speech =
    phase === "done"
      ? "MashaAllah! You shine like a star!"
      : phase === "quiz"
        ? feedback === "correct"
          ? "Yes! Brilliant!"
          : feedback === "wrong"
            ? "Almost — try the next one!"
            : "Tap the best answer!"
        : needsTap && !tappedReveal
          ? "Tap the big picture to reveal!"
          : step?.mascotMood === "cheer"
            ? "You're doing amazing!"
            : step?.mascotMood === "hint"
              ? "Ready for the next surprise?"
              : "Let's learn together!";

  return (
    <div className="ik-lesson">
      <button type="button" className="ik-back ik-hover-lift" onClick={onBack}>
        ← Back
      </button>

      <div className="ik-lesson-stage">
        <aside className="ik-lesson-mascot-rail">
          <NooriMascot
            mood={
              phase === "done"
                ? "cheer"
                : feedback === "wrong"
                  ? "sad"
                  : moodFromStep(step?.mascotMood)
            }
            action={nooriAction}
            size={128}
            speech={speech}
          />
        </aside>

        <div className="ik-lesson-main">
          {phase === "learn" && step && (
            <>
              <div className="ik-progress-dots">
                {lesson.steps.map((_, i) => (
                  <motion.span
                    key={i}
                    className={`ik-dot ${i <= stepIndex ? "on" : ""}`}
                    layout
                    animate={i === stepIndex ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  className="ik-step-card ik-step-card-live"
                  initial={{ opacity: 0, y: 24, rotateX: -8 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <SparkBurst show={spark} />
                  <motion.button
                    type="button"
                    className="ik-step-emoji-btn"
                    whileHover={{ scale: 1.12, rotate: [-2, 2, -2, 0] }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setEmojiPop((n) => n + 1);
                      if (needsTap && !tappedReveal) {
                        setTappedReveal(true);
                        setSpark(true);
                        setNooriAction("clap");
                        window.setTimeout(() => setSpark(false), 700);
                      }
                    }}
                  >
                    <motion.span
                      key={emojiPop}
                      className="ik-step-emoji"
                      animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 0.45 }}
                    >
                      {step.emoji}
                    </motion.span>
                    {needsTap && !tappedReveal && (
                      <span className="ik-tap-hint">👆 Tap me!</span>
                    )}
                  </motion.button>

                  {step.title && <h2>{step.title}</h2>}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={tappedReveal || !needsTap ? "full" : "tease"}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {needsTap && !tappedReveal
                        ? "Something special is hiding here…"
                        : step.text}
                    </motion.p>
                  </AnimatePresence>

                  {(step.type === "card" || step.type === "intro") && (
                    <div className="ik-interact-chips">
                      {["Listen", "Remember", "Smile"].map((label) => (
                        <motion.button
                          key={label}
                          type="button"
                          className="ik-mini-chip"
                          whileHover={{ y: -4, scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setNooriAction("wave");
                            setSpark(true);
                            window.setTimeout(() => setSpark(false), 500);
                          }}
                        >
                          {label === "Listen" ? "👂" : label === "Remember" ? "🧠" : "😊"} {label}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="ik-actions">
                {stepIndex > 0 && (
                  <motion.button
                    type="button"
                    className="ik-btn ik-btn-ghost"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setStepIndex((i) => i - 1);
                      setTappedReveal(false);
                    }}
                  >
                    Back
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  className="ik-btn ik-btn-primary ik-btn-pulse"
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={goNextStep}
                >
                  {needsTap && !tappedReveal
                    ? "Reveal →"
                    : stepIndex < lesson.steps.length - 1
                      ? "Next adventure →"
                      : "Play Quiz 🎮"}
                </motion.button>
              </div>
            </>
          )}

          {phase === "quiz" && question && (
            <>
              <div className="ik-progress-dots">
                {quiz.map((_, i) => (
                  <span key={i} className={`ik-dot ${i <= qIndex ? "on" : ""}`} />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={question.id}
                  className="ik-step-card ik-step-card-live"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                >
                  <SparkBurst show={spark} />
                  <div className="ik-quiz-badge">
                    {question.difficulty.toUpperCase()} · Q{qIndex + 1}/{quiz.length}
                  </div>
                  <h2 style={{ fontSize: "1.35rem" }}>{question.prompt}</h2>
                  {question.hint && (
                    <motion.p
                      className="ik-hint-line"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      💡 {question.hint}
                    </motion.p>
                  )}

                  {(question.kind === "mcq" || question.kind === "true_false" || question.kind === "tap_select") && (
                    <div className="ik-options">
                      {question.options?.map((opt, idx) => {
                        const cls =
                          feedback && selected === opt.id
                            ? feedback === "correct"
                              ? "correct"
                              : "wrong"
                            : feedback && opt.id === question.answer
                              ? "correct"
                              : "";
                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            className={`ik-option ${cls}`}
                            disabled={!!feedback}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.07 }}
                            whileHover={feedback ? undefined : { scale: 1.03, x: 8 }}
                            whileTap={feedback ? undefined : { scale: 0.97 }}
                            onClick={() => {
                              setSelected(opt.id);
                              checkAnswer(opt.id);
                            }}
                          >
                            <span className="ik-option-letter">{String.fromCharCode(65 + idx)}</span>
                            {opt.emoji ? `${opt.emoji} ` : ""}
                            {opt.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {question.kind === "fill_blank" && (
                    <>
                      <input
                        className="ik-fill-input"
                        value={fillValue}
                        placeholder="Type your answer…"
                        onChange={(e) => setFillValue(e.target.value)}
                        disabled={!!feedback}
                      />
                      <div className="ik-actions">
                        <motion.button
                          type="button"
                          className="ik-btn ik-btn-primary"
                          disabled={!fillValue.trim() || !!feedback}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => checkAnswer(fillValue)}
                        >
                          Check answer
                        </motion.button>
                      </div>
                      {feedback && (
                        <p style={{ color: feedback === "correct" ? "#27ae60" : "#e74c3c", fontWeight: 800 }}>
                          {feedback === "correct" ? "MashaAllah! Correct!" : `Almost! Answer: ${question.answer}`}
                        </p>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {phase === "done" && (
            <motion.div
              className="ik-celebrate"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <SparkBurst show />
              <NooriMascot mood="cheer" action="bounce" size={110} />
              <motion.div
                className="ik-stars"
                animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {"⭐".repeat(stars)}
              </motion.div>
              <h2>MashaAllah!</h2>
              <p style={{ color: "var(--ik-muted)", fontSize: "1.1rem" }}>
                You finished <strong>{lesson.title}</strong>
              </p>
              <div className="ik-reward-row">
                <motion.span className="ik-chip" whileHover={{ scale: 1.08 }}>+XP</motion.span>
                <motion.span className="ik-chip" whileHover={{ scale: 1.08 }}>+Coins</motion.span>
                <motion.span className="ik-chip" whileHover={{ scale: 1.08 }}>
                  Score {correct}/{quiz.length}
                </motion.span>
              </div>
              <motion.button
                type="button"
                className="ik-btn ik-btn-primary ik-btn-pulse"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={onBack}
              >
                Continue exploring →
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
