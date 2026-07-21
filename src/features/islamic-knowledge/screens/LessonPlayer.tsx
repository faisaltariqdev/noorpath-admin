"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
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

  const step = lesson.steps[stepIndex];
  const question = quiz[qIndex];

  function goNextStep() {
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    setPhase("quiz");
  }

  function checkAnswer(answer: string) {
    if (!question || feedback) return;
    const expected = Array.isArray(question.answer)
      ? question.answer[0]
      : question.answer;
    const ok =
      question.kind === "fill_blank"
        ? answer.trim().toLowerCase().replace(/[^\w\u0600-\u06FFﷺ]/g, "") ===
          String(expected).toLowerCase().replace(/[^\w\u0600-\u06FFﷺ]/g, "")
        : answer === expected;

    setFeedback(ok ? "correct" : "wrong");
    if (ok) setCorrect((c) => c + 1);

    window.setTimeout(() => {
      const nextCorrect = ok ? correct + 1 : correct;
      if (qIndex < quiz.length - 1) {
        setQIndex((i) => i + 1);
        setSelected(null);
        setFillValue("");
        setFeedback(null);
      } else {
        const total = quiz.length;
        const ratio = total > 0 ? nextCorrect / total : 1;
        const s: 1 | 2 | 3 = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
        setStars(s);
        setPhase("done");
        onComplete(nextCorrect, total);
      }
    }, 850);
  }

  return (
    <div className="ik-lesson">
      <button type="button" className="ik-back" onClick={onBack}>
        ← Back
      </button>

      {phase === "learn" && step && (
        <>
          <div className="ik-progress-dots">
            {lesson.steps.map((_, i) => (
              <span key={i} className={`ik-dot ${i <= stepIndex ? "on" : ""}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              className="ik-step-card"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
            >
              <div className="ik-step-emoji">{step.emoji}</div>
              {step.title && <h2>{step.title}</h2>}
              <p>{step.text}</p>
              <div className="ik-mascot-bubble">
                <span style={{ fontSize: "1.8rem" }}>🦊</span>
                <div>
                  <strong>Noori says:</strong>
                  <div style={{ marginTop: 4, color: "var(--ik-muted)" }}>
                    {step.mascotMood === "cheer"
                      ? "You're doing amazing — keep going!"
                      : step.mascotMood === "hint"
                        ? "Tap Next when you're ready for a tiny tip more!"
                        : "Let's learn this together, little star!"}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="ik-actions">
            {stepIndex > 0 && (
              <button type="button" className="ik-btn ik-btn-ghost" onClick={() => setStepIndex((i) => i - 1)}>
                Back
              </button>
            )}
            <button type="button" className="ik-btn ik-btn-primary" onClick={goNextStep}>
              {stepIndex < lesson.steps.length - 1 ? "Next →" : "Play Quiz 🎮"}
            </button>
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
              className="ik-step-card"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--ik-gold)", letterSpacing: "0.06em" }}>
                {question.difficulty.toUpperCase()} · Q{qIndex + 1}/{quiz.length}
              </div>
              <h2 style={{ fontSize: "1.35rem" }}>{question.prompt}</h2>
              {question.hint && (
                <p style={{ fontSize: "0.95rem" }}>💡 Hint: {question.hint}</p>
              )}

              {(question.kind === "mcq" || question.kind === "true_false" || question.kind === "tap_select") && (
                <div className="ik-options">
                  {question.options?.map((opt) => {
                    const cls =
                      feedback && selected === opt.id
                        ? feedback === "correct"
                          ? "correct"
                          : "wrong"
                        : feedback && opt.id === question.answer
                          ? "correct"
                          : "";
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`ik-option ${cls}`}
                        disabled={!!feedback}
                        onClick={() => {
                          setSelected(opt.id);
                          checkAnswer(opt.id);
                        }}
                      >
                        {opt.emoji ? `${opt.emoji} ` : ""}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {question.kind === "fill_blank" && (
                <>
                  <input
                    className="ik-fill-input"
                    value={fillValue}
                    placeholder="Type your answer"
                    onChange={(e) => setFillValue(e.target.value)}
                    disabled={!!feedback}
                  />
                  <div className="ik-actions">
                    <button
                      type="button"
                      className="ik-btn ik-btn-primary"
                      disabled={!fillValue.trim() || !!feedback}
                      onClick={() => checkAnswer(fillValue)}
                    >
                      Check
                    </button>
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div style={{ fontSize: "4rem" }}>🎉</div>
          <div className="ik-stars">{"⭐".repeat(stars)}</div>
          <h2>MashaAllah!</h2>
          <p style={{ color: "var(--ik-muted)", fontSize: "1.1rem" }}>
            You finished <strong>{lesson.title}</strong>
          </p>
          <div className="ik-reward-row">
            <span className="ik-chip">+XP earned</span>
            <span className="ik-chip">+Coins</span>
            <span className="ik-chip">
              Score {correct}/{quiz.length}
            </span>
          </div>
          <div className="ik-mascot-bubble" style={{ margin: "0 auto 18px" }}>
            <span style={{ fontSize: "1.8rem" }}>🦊</span>
            <div>
              <strong>Noori cheers:</strong>
              <div style={{ marginTop: 4 }}>You make Allah proud with every good lesson!</div>
            </div>
          </div>
          <button type="button" className="ik-btn ik-btn-primary" onClick={onBack}>
            Continue exploring →
          </button>
        </motion.div>
      )}
    </div>
  );
}
