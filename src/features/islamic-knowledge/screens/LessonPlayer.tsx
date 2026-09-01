"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import DialogueBubble from "../components/DialogueBubble";
import MagicalScene from "../components/MagicalScene";
import NooriMascot, { type NooriAction, type NooriMood } from "../components/NooriMascot";
import SparkBurst from "../components/SparkBurst";
import StepVisual from "../components/StepVisual";
import { buildDialogueForStep } from "../lib/dialogue";
import { pickQuestions } from "../lib/quiz";
import { cancelKnowledgeSpeech, speakKnowledgeText, unlockKnowledgeSpeech } from "../audio/speech";
import type { AgeBand, IKLesson, IKLessonReward } from "../types";

const VOICE_STORAGE_KEY = "noorpath-ik-voice";

interface LessonPlayerProps {
  lesson: IKLesson;
  ageBand: AgeBand;
  onBack: () => void;
  onComplete: (correct: number, total: number) => IKLessonReward;
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
  const [attempts, setAttempts] = useState(0);
  const [answerSettled, setAnswerSettled] = useState(false);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<string[]>([]);
  const [reward, setReward] = useState<IKLessonReward | null>(null);
  const [stars, setStars] = useState<1 | 2 | 3>(1);
  const [spark, setSpark] = useState(false);
  const [shake, setShake] = useState(false);
  const [balloons, setBalloons] = useState(false);
  const [nooriAction, setNooriAction] = useState<NooriAction>("wave");
  const [nooriMood, setNooriMood] = useState<NooriMood>("happy");
  const [sceneKey, setSceneKey] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVoiceEnabled(window.localStorage.getItem(VOICE_STORAGE_KEY) !== "off");
  }, []);

  const step = lesson.steps[stepIndex];
  const dialogue = useMemo(
    () => (step ? buildDialogueForStep(step, stepIndex, ageBand) : []),
    [ageBand, step, stepIndex],
  );
  const line = dialogue[lineIndex];
  const question = quiz[qIndex];
  const isLastLine = lineIndex >= dialogue.length - 1;
  const isChallenge = line?.kind === "challenge";

  useEffect(() => {
    setTypedReady(false);
    const curriculumMood = step?.mascotMood as NooriMood | undefined;
    setNooriMood(line?.kind === "cheer" ? "cheer" : line?.kind === "challenge" ? "listen" : curriculumMood ?? "happy");
    setNooriAction(line?.kind === "challenge" ? "point" : step?.type === "mascot" ? "wave" : lineIndex === 0 ? "listen" : "idle");
  }, [line?.id, line?.kind, lineIndex, step?.mascotMood, step?.type]);

  useEffect(() => {
    setSortOrder(question?.kind === "sorting" ? question.options?.map((option) => option.id) ?? [] : []);
    setMatchingAnswers({});
  }, [question?.id, question?.kind, question?.options]);

  useEffect(() => () => cancelKnowledgeSpeech(), []);

  useEffect(() => {
    if (!voiceEnabled || phase !== "learn" || !line?.text) return;
    void speakKnowledgeText(line.text, ageBand === "young" ? 0.82 : ageBand === "older" ? 0.94 : 0.88);
  }, [ageBand, line?.id, line?.text, phase, voiceEnabled]);

  useEffect(() => {
    if (!voiceEnabled || phase !== "quiz" || !question) return;
    const choices = question.options?.map((option, index) => `Option ${index + 1}: ${option.label}`).join(". ");
    const matches = question.pairs?.map((pair) => pair.left).join(", ");
    const matchChoices = question.pairs?.map((pair) => pair.right).join(", ");
    const speech = [
      question.prompt,
      choices,
      question.kind === "matching" && matches ? `Match these items: ${matches}. Choices: ${matchChoices}.` : "",
      question.kind === "sorting" ? "Put the choices in the correct order." : "",
    ].filter(Boolean).join(" ");
    void speakKnowledgeText(speech, ageBand === "young" ? 0.82 : 0.9);
  }, [ageBand, phase, question, voiceEnabled]);

  useEffect(() => {
    if (!voiceEnabled || phase !== "done") return;
    void speakKnowledgeText(
      `MashaAllah! You finished ${lesson.title}. You answered ${correct} out of ${quiz.length} questions correctly and earned ${stars} ${stars === 1 ? "star" : "stars"}.`,
      0.9,
    );
  }, [correct, lesson.title, phase, quiz.length, stars, voiceEnabled]);

  function celebrateSoft() {
    setSpark(true);
    setShake(true);
    setBalloons(true);
    setNooriAction("clap");
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

  function normalizeAnswer(value: string) {
    return value.trim().toLowerCase().replace(/[^\w\u0600-\u06FF]/g, "");
  }

  function isAnswerCorrect(answer: string | string[] | Record<string, string>): boolean {
    if (!question) return false;
    if (question.kind === "matching") {
      return Boolean(question.pairs?.every((pair) => !Array.isArray(answer) && typeof answer === "object" && answer[pair.left] === pair.right));
    }
    if (question.kind === "sorting") {
      return Array.isArray(answer) && Boolean(question.order?.every((id, index) => answer[index] === id));
    }
    const expected = Array.isArray(question.answer) ? question.answer[0] : question.answer;
    return question.kind === "fill_blank"
      ? normalizeAnswer(String(answer)) === normalizeAnswer(String(expected))
      : answer === expected;
  }

  function checkAnswer(answer: string | string[] | Record<string, string>) {
    if (!question || feedback) return;
    const ok = isAnswerCorrect(answer);

    if (ok) {
      setFeedback("correct");
      setAnswerSettled(true);
      setCorrect((c) => c + 1);
      celebrateSoft();
      if (voiceEnabled) void speakKnowledgeText(`Correct. ${question.explanation ?? question.hint ?? "Well done."}`);
    } else {
      setFeedback("wrong");
      setAnswerSettled(attempts >= 1);
      setAttempts((count) => count + 1);
      setNooriMood("sad");
      setNooriAction("idle");
      if (voiceEnabled) {
        const message = attempts === 0
          ? `Not quite. Here is Noori's hint. ${question.hint ?? "Look carefully and try once more."}`
          : `The correct answer is now highlighted. ${question.explanation ?? question.hint ?? ""}`;
        void speakKnowledgeText(message);
      }
    }
  }

  function resetQuestionInteraction() {
    setSelected(null);
    setFillValue("");
    setFeedback(null);
    setAnswerSettled(false);
    setMatchingAnswers({});
    setSortOrder([]);
    setNooriAction("point");
    setNooriMood("happy");
  }

  function retryQuestion() {
    setSelected(null);
    setFillValue("");
    setMatchingAnswers({});
    setFeedback(null);
    setAnswerSettled(false);
    setNooriAction("point");
    setNooriMood("hint");
  }

  function advanceQuestion() {
    if (!answerSettled) return;
    if (qIndex < quiz.length - 1) {
      setQIndex((i) => i + 1);
      setAttempts(0);
      resetQuestionInteraction();
      return;
    }
    const total = quiz.length;
    const ratio = total > 0 ? correct / total : 1;
    const nextStars: 1 | 2 | 3 = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    setStars(nextStars);
    setReward(onComplete(correct, total));
    setPhase("done");
    setNooriAction("clap");
    setNooriMood("cheer");
    celebrateSoft();
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
      <MagicalScene topicId={lesson.topicId} />
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

      <div className="ik-lesson-toolbar">
        <button type="button" className="ik-back ik-hover-lift" onClick={onBack}>← Back</button>
        <button
          type="button"
          className="ik-voice-toggle"
          aria-pressed={voiceEnabled}
          onClick={() => {
            unlockKnowledgeSpeech();
            setVoiceEnabled((enabled) => {
              if (enabled) cancelKnowledgeSpeech();
              window.localStorage.setItem(VOICE_STORAGE_KEY, enabled ? "off" : "on");
              return !enabled;
            });
          }}
        >
          {voiceEnabled ? "🔊 Voice on" : "🔇 Voice off"}
        </button>
        <button
          type="button"
          className="ik-voice-toggle"
          onClick={() => {
            unlockKnowledgeSpeech();
            const text = phase === "learn"
              ? line?.text
              : phase === "quiz"
                ? `${question?.prompt ?? ""}. ${question?.options?.map((option) => option.label).join(". ") ?? ""}`
                : "MashaAllah. You completed the lesson.";
            if (text) void speakKnowledgeText(text);
          }}
        >
          ↻ Read again
        </button>
      </div>

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

                  {step && (
                    <motion.button
                      type="button"
                      className={`ik-visual-button ${isChallenge && !challengeDone ? "ik-tap-pulse" : ""}`}
                      whileHover={{ scale: 1.025 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={isChallenge ? onChallengeTap : undefined}
                      aria-label={isChallenge ? `Explore ${step.title ?? "this lesson visual"}` : `${step.title ?? "Lesson"} visual`}
                      aria-disabled={!isChallenge}
                    >
                      <StepVisual topicId={lesson.topicId} step={step} />
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
                  {feedback === "wrong" && !answerSettled && (
                    <DialogueBubble text={question.hint ? `Noori's hint: ${question.hint}` : "Look closely and try once more."} emoji="💡" kind="talk" />
                  )}
                  {feedback === "wrong" && answerSettled && (
                    <DialogueBubble text={question.explanation ?? question.hint ?? "Let's remember the correct answer for next time."} emoji="💛" kind="talk" />
                  )}
                  {feedback === "correct" && (
                    <DialogueBubble text={question.explanation ? `Correct! ${question.explanation}` : "Correct! You thought carefully."} emoji="🎉" kind="cheer" />
                  )}

                  {(question.kind === "mcq" || question.kind === "true_false" || question.kind === "tap_select") && (
                    <fieldset className="ik-options ik-options-play" aria-describedby={`${question.id}-feedback`}>
                      <legend className="ik-sr-only">Choose one answer</legend>
                      {question.options?.map((opt, idx) => {
                        const isAnswer = Array.isArray(question.answer) ? question.answer.includes(opt.id) : opt.id === question.answer;
                        const cls =
                          feedback && selected === opt.id
                            ? feedback === "correct"
                              ? "correct"
                              : "soft-miss"
                            : feedback === "wrong" && answerSettled && isAnswer
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
                    </fieldset>
                  )}

                  {question.kind === "fill_blank" && (
                    <>
                      <label className="ik-question-label" htmlFor={`${question.id}-answer`}>Type the missing word</label>
                      <input
                        id={`${question.id}-answer`}
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

                  {question.kind === "matching" && (
                    <div className="ik-match-grid" role="group" aria-label="Match each item">
                      {question.pairs?.map((pair) => (
                        <label key={pair.left} className="ik-match-row">
                          <span>{pair.left}</span>
                          <select
                            value={matchingAnswers[pair.left] ?? ""}
                            disabled={!!feedback}
                            onChange={(event) => setMatchingAnswers((current) => ({ ...current, [pair.left]: event.target.value }))}
                          >
                            <option value="">Choose a match</option>
                            {[...(question.pairs ?? [])].reverse().map((choice) => (
                              <option key={choice.right} value={choice.right}>{choice.right}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                      <button
                        type="button"
                        className="ik-btn ik-btn-primary"
                        disabled={!!feedback || Object.keys(matchingAnswers).length !== question.pairs?.length}
                        onClick={() => checkAnswer(matchingAnswers)}
                      >
                        Check matches
                      </button>
                    </div>
                  )}

                  {question.kind === "sorting" && (
                    <div className="ik-sort-list" role="group" aria-label="Put the items in order">
                      {sortOrder.map((id, index) => {
                        const item = question.options?.find((option) => option.id === id);
                        return (
                          <div key={id} className="ik-sort-row">
                            <span className="ik-option-letter">{index + 1}</span>
                            <strong>{item?.label}</strong>
                            <span className="ik-sort-actions">
                              <button
                                type="button"
                                aria-label={`Move ${item?.label} up`}
                                disabled={!!feedback || index === 0}
                                onClick={() => setSortOrder((current) => {
                                  const next = [...current];
                                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                  return next;
                                })}
                              >↑</button>
                              <button
                                type="button"
                                aria-label={`Move ${item?.label} down`}
                                disabled={!!feedback || index === sortOrder.length - 1}
                                onClick={() => setSortOrder((current) => {
                                  const next = [...current];
                                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                                  return next;
                                })}
                              >↓</button>
                            </span>
                          </div>
                        );
                      })}
                      <button type="button" className="ik-btn ik-btn-primary" disabled={!!feedback || sortOrder.length === 0} onClick={() => checkAnswer(sortOrder)}>
                        Check order
                      </button>
                    </div>
                  )}

                  <div id={`${question.id}-feedback`} className="ik-quiz-actions" aria-live="polite">
                    {feedback === "wrong" && !answerSettled && (
                      <button type="button" className="ik-btn ik-btn-primary" onClick={retryQuestion}>Try again with Noori's hint</button>
                    )}
                    {answerSettled && (
                      <button type="button" className="ik-btn ik-btn-primary" onClick={advanceQuestion}>
                        {qIndex < quiz.length - 1 ? "Next question →" : "See my results →"}
                      </button>
                    )}
                  </div>
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
                <span className="ik-chip">+{reward?.earnedXp ?? 0} XP</span>
                <span className="ik-chip">+{reward?.earnedCoins ?? 0} Coins</span>
                <span className="ik-chip">
                  {correct}/{quiz.length}
                </span>
              </div>
              {reward?.levelUp && <DialogueBubble text="Level up! Your learning journey is growing." emoji="🌟" kind="cheer" />}
              {reward && reward.newBadges.length > 0 && (
                <div className="ik-unlocked-badges" aria-live="polite">
                  <strong>New badge{reward.newBadges.length > 1 ? "s" : ""} unlocked</strong>
                  <span>{reward.newBadges.map((id) => id.replaceAll("-", " ")).join(" · ")}</span>
                </div>
              )}
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
