"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import DialogueBubble from "../components/DialogueBubble";
import MagicalScene from "../components/MagicalScene";
import NooriMascot, { type NooriAction, type NooriMood } from "../components/NooriMascot";
import SparkBurst from "../components/SparkBurst";
import { buildDialogueForStep } from "../lib/dialogue";
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
  const reduce = useReducedMotion();
  const quiz = useMemo(() => pickQuestions(lesson.questions, ageBand), [lesson.questions, ageBand]);

  const [phase, setPhase] = useState<"learn" | "quiz" | "done">("learn");
  const [stepIndex, setStepIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [typedReady, setTypedReady] = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [stars, setStars] = useState<1 | 2 | 3>(1);
  const [spark, setSpark] = useState(false);
  const [shake, setShake] = useState(false);
  const [balloons, setBalloons] = useState(false);
  const [nooriAction, setNooriAction] = useState<NooriAction>("wave");
  const [nooriMood, setNooriMood] = useState<NooriMood>("happy");
  const [sceneKey, setSceneKey] = useState(0);

  const step = lesson.steps[stepIndex];
  const dialogue = useMemo(
    () => (step ? buildDialogueForStep(step, stepIndex) : []),
    [step, stepIndex],
  );
  const line = dialogue[lineIndex];
  const question = quiz[qIndex];
  const isLastLine = lineIndex >= dialogue.length - 1;
  const isChallenge = line?.kind === "challenge";

  useEffect(() => {
    setTypedReady(false);
    setNooriMood(line?.kind === "cheer" ? "cheer" : line?.kind === "challenge" ? "listen" : "happy");
    setNooriAction(line?.kind === "challenge" ? "point" : lineIndex === 0 ? "wave" : "idle");
  }, [line?.id, line?.kind, lineIndex]);

  function celebrateSoft() {
    setSpark(true);
    setShake(true);
    setBalloons(true);
    setNooriAction("bounce");
    setNooriMood("cheer");
    window.setTimeout(() => setSpark(false), 800);
    window.setTimeout(() => setShake(false), 450);
    window.setTimeout(() => setBalloons(false), 1600);
  }

  function advanceDialogue() {
    if (!typedReady && !reduce) return;
    if (isChallenge && !challengeDone) return;

    if (!isLastLine) {
      setLineIndex((i) => i + 1);
      setNooriAction("walk");
      setSceneKey((k) => k + 1);
      return;
    }

    // Finished all dialogue for this curriculum step
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex((i) => i + 1);
      setLineIndex(0);
      setChallengeDone(false);
      setNooriAction("bounce");
      setSceneKey((k) => k + 1);
      celebrateSoft();
      return;
    }

    setPhase("quiz");
    setNooriAction("point");
    setNooriMood("listen");
  }

  function onChallengeTap() {
    if (!isChallenge || challengeDone) return;
    setChallengeDone(true);
    celebrateSoft();
    setTypedReady(true);
  }

  function checkAnswer(answer: string) {
    if (!question || feedback) return;
    const expected = Array.isArray(question.answer) ? question.answer[0] : question.answer;
    const ok =
      question.kind === "fill_blank"
        ? answer.trim().toLowerCase().replace(/[^\w\u0600-\u06FF]/g, "") ===
          String(expected).toLowerCase().replace(/[^\w\u0600-\u06FF]/g, "")
        : answer === expected;

    if (ok) {
      setFeedback("correct");
      setCorrect((c) => c + 1);
      celebrateSoft();
    } else {
      setFeedback("wrong");
      setNooriMood("sad");
      setNooriAction("idle");
    }

    window.setTimeout(() => {
      const nextCorrect = ok ? correct + 1 : correct;
      if (qIndex < quiz.length - 1) {
        setQIndex((i) => i + 1);
        setSelected(null);
        setFillValue("");
        setFeedback(null);
        setNooriAction("point");
        setNooriMood("happy");
      } else {
        const total = quiz.length;
        const ratio = total > 0 ? nextCorrect / total : 1;
        const s: 1 | 2 | 3 = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
        setStars(s);
        setPhase("done");
        setNooriAction("bounce");
        setNooriMood("cheer");
        celebrateSoft();
        onComplete(nextCorrect, total);
      }
    }, ok ? 1000 : 1200);
  }

  const ctaLabel = (() => {
    if (phase !== "learn") return "";
    if (isChallenge && !challengeDone) return "Tap the picture ↑";
    if (!typedReady && !reduce) return "…";
    if (!isLastLine) return lineIndex === 0 ? "YES!" : "Next →";
    if (stepIndex < lesson.steps.length - 1) return "Next adventure →";
    return "Play Quiz 🎮";
  })();

  return (
    <motion.div
      className={`ik-dialogue-root ${shake ? "ik-shake" : ""}`}
      animate={shake && !reduce ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <MagicalScene />
      {balloons && !reduce && (
        <div className="ik-balloons" aria-hidden>
          {["🎈", "⭐", "✨", "🌙", "🎈"].map((b, i) => (
            <motion.span
              key={i}
              className="ik-balloon"
              style={{ left: `${15 + i * 16}%` }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: -120, opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, delay: i * 0.08 }}
            >
              {b}
            </motion.span>
          ))}
        </div>
      )}

      <button type="button" className="ik-back ik-hover-lift" onClick={onBack}>
        ← Back
      </button>

      <div className="ik-dialogue-stage">
        <aside className="ik-dialogue-buddy">
          <NooriMascot
            mood={nooriMood}
            action={nooriAction}
            size={148}
            lookAt="right"
            caption={phase === "quiz" ? "Your turn!" : "Noori"}
          />
        </aside>

        <div className="ik-dialogue-panel">
          {phase === "learn" && line && (
            <>
              <div className="ik-progress-dots" aria-label="Lesson progress">
                {lesson.steps.map((_, i) => (
                  <span key={i} className={`ik-dot ${i <= stepIndex ? "on" : ""}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${step?.id}-${line.id}-${sceneKey}`}
                  className="ik-dialogue-frame"
                  initial={reduce ? false : { opacity: 0, x: 40, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <SparkBurst show={spark} />

                  {(isChallenge || step?.emoji) && (
                    <motion.button
                      type="button"
                      className={`ik-tap-object ${isChallenge && !challengeDone ? "ik-tap-pulse" : ""}`}
                      whileHover={{ scale: 1.1, rotate: [-3, 3, 0] }}
                      whileTap={{ scale: 0.92 }}
                      onClick={isChallenge ? onChallengeTap : undefined}
                      aria-label={isChallenge ? "Tap to reveal" : "Lesson picture"}
                    >
                      <span className="ik-tap-object-emoji">{step?.emoji || "⭐"}</span>
                      {isChallenge && !challengeDone && <span className="ik-tap-hint">👆 Tap!</span>}
                      {challengeDone && isChallenge && <span className="ik-tap-hint">🎉 Yay!</span>}
                    </motion.button>
                  )}

                  <DialogueBubble
                    key={line.id}
                    text={line.text}
                    emoji={line.emoji}
                    kind={line.kind}
                    onTyped={() => setTypedReady(true)}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="ik-actions">
                {stepIndex + lineIndex > 0 && (
                  <motion.button
                    type="button"
                    className="ik-btn ik-btn-ghost"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (lineIndex > 0) {
                        setLineIndex((i) => i - 1);
                        setChallengeDone(false);
                      } else if (stepIndex > 0) {
                        setStepIndex((i) => i - 1);
                        setLineIndex(0);
                        setChallengeDone(false);
                      }
                    }}
                  >
                    Back
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  className="ik-btn ik-btn-primary ik-btn-pulse"
                  disabled={(!typedReady && !reduce) || (isChallenge && !challengeDone)}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={advanceDialogue}
                >
                  {ctaLabel}
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
                  className="ik-dialogue-frame"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                >
                  <SparkBurst show={spark} />
                  <DialogueBubble
                    text={question.prompt}
                    emoji="❓"
                    kind="talk"
                    onTyped={() => setTypedReady(true)}
                  />
                  {feedback === "wrong" && (
                    <DialogueBubble text="Let's try together 😊" emoji="💛" kind="cheer" />
                  )}
                  {feedback === "correct" && (
                    <DialogueBubble text="Amazing! Great job!!" emoji="🎉" kind="cheer" />
                  )}

                  {(question.kind === "mcq" || question.kind === "true_false" || question.kind === "tap_select") && (
                    <div className="ik-options ik-options-play">
                      {question.options?.map((opt, idx) => {
                        const isAnswer = opt.id === question.answer;
                        const cls =
                          feedback && selected === opt.id
                            ? feedback === "correct"
                              ? "correct"
                              : "soft-miss"
                            : feedback === "wrong" && isAnswer
                              ? "correct"
                              : "";
                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            className={`ik-option ${cls}`}
                            disabled={!!feedback}
                            whileHover={feedback ? undefined : { scale: 1.04, y: -3 }}
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
                        placeholder="Type here…"
                        onChange={(e) => setFillValue(e.target.value)}
                        disabled={!!feedback}
                      />
                      <motion.button
                        type="button"
                        className="ik-btn ik-btn-primary"
                        disabled={!fillValue.trim() || !!feedback}
                        onClick={() => checkAnswer(fillValue)}
                      >
                        Check
                      </motion.button>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {phase === "done" && (
            <motion.div
              className="ik-dialogue-frame ik-celebrate"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <SparkBurst show />
              <DialogueBubble text="MashaAllah! You did it!" emoji="🏆" kind="cheer" />
              <div className="ik-stars">{"⭐".repeat(stars)}</div>
              <div className="ik-reward-row">
                <span className="ik-chip">+XP</span>
                <span className="ik-chip">+Coins</span>
                <span className="ik-chip">
                  {correct}/{quiz.length}
                </span>
              </div>
              <motion.button
                type="button"
                className="ik-btn ik-btn-primary ik-btn-pulse"
                whileHover={{ scale: 1.06 }}
                onClick={onBack}
              >
                Continue exploring →
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
