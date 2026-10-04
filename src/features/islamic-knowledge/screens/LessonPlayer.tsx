"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import DialogueBubble from "../components/DialogueBubble";
import MagicalScene from "../components/MagicalScene";
import NooriMascot, { COMPANIONS, type NooriAction, type NooriMood } from "../components/NooriMascot";
import SparkBurst from "../components/SparkBurst";
import StepVisual from "../components/StepVisual";
import { buildDialogueForStep, buildRecap } from "../lib/dialogue";
import { buildQuizSession, correctAnswerLabel, createRng, hashString, KIND_LABELS, shuffle, speakableQuestion } from "../lib/quiz";
import { cancelKnowledgeSpeech, speakKnowledgeText, subscribeKnowledgeSpeaking, unlockKnowledgeSpeech } from "../audio/speech";
import type { AgeBand, IKCompanionId, IKLesson, IKLessonReward, IKQuestion, IKQuizOutcome } from "../types";

const VOICE_STORAGE_KEY = "noorpath-ik-voice";

type Phase = "learn" | "recap" | "quiz" | "done";
type AnswerValue = string | string[] | Record<string, string>;

interface LessonPlayerProps {
  lesson: IKLesson;
  ageBand: AgeBand;
  companion?: IKCompanionId;
  /** Question ids served in the previous attempt — the engine avoids them. */
  recentQuestionIds?: string[];
  /** Number of previous attempts on this lesson. */
  attempt?: number;
  /** "challenge" skips the story and goes straight to the quiz with a different header. */
  mode?: "lesson" | "challenge";
  onBack: () => void;
  onComplete: (outcome: IKQuizOutcome) => IKLessonReward;
}

const PRAISE = ["MashaAllah!", "Excellent!", "Brilliant!", "You've got it!", "Wonderful!", "Superb!"];
const ENCOURAGE = ["Almost — have another look.", "Not quite yet. Try once more!", "Hmm, let's look again together.", "Close! Think about the lesson."];

export default function LessonPlayer({
  lesson,
  ageBand,
  companion = "noori",
  recentQuestionIds,
  attempt = 0,
  mode = "lesson",
  onBack,
  onComplete,
}: LessonPlayerProps) {
  const reduce = useReducedMotion();
  const buddy = COMPANIONS[companion].name;
  const hasStory = lesson.steps.length > 0 && mode === "lesson";

  /* ---------------- quiz session ---------------- */
  const [sessionSeed, setSessionSeed] = useState(() => Date.now());
  const [practiceIds, setPracticeIds] = useState<string[] | null>(null);
  const quiz = useMemo(
    () =>
      buildQuizSession(lesson.questions, {
        ageBand,
        recentIds: recentQuestionIds,
        attempt,
        seed: sessionSeed,
        onlyIds: practiceIds ?? undefined,
        count: practiceIds ? practiceIds.length : undefined,
      }),
    [ageBand, attempt, lesson.questions, practiceIds, recentQuestionIds, sessionSeed],
  );

  /* ---------------- phase + story state ---------------- */
  const [phase, setPhase] = useState<Phase>(hasStory ? "learn" : "quiz");
  const [stepIndex, setStepIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [typedReady, setTypedReady] = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);

  /* ---------------- quiz state ---------------- */
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [answerSettled, setAnswerSettled] = useState(false);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string[]>([]);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [served, setServed] = useState<string[]>([]);

  /* ---------------- results ---------------- */
  const [reward, setReward] = useState<IKLessonReward | null>(null);
  const [stars, setStars] = useState<1 | 2 | 3>(1);
  const [practiceResult, setPracticeResult] = useState<{ correct: number; total: number } | null>(null);
  const [firstRun, setFirstRun] = useState<{ correct: number; total: number; missed: IKQuestion[] } | null>(null);

  /* ---------------- fx + mascot ---------------- */
  const [spark, setSpark] = useState(false);
  const [shake, setShake] = useState(false);
  const [balloons, setBalloons] = useState(false);
  const [nooriAction, setNooriAction] = useState<NooriAction>("wave");
  const [nooriMood, setNooriMood] = useState<NooriMood>("happy");
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVoiceEnabled(window.localStorage.getItem(VOICE_STORAGE_KEY) !== "off");
  }, []);
  useEffect(() => subscribeKnowledgeSpeaking(setSpeaking), []);
  useEffect(() => () => cancelKnowledgeSpeech(), []);

  const step = lesson.steps[stepIndex];
  const dialogue = useMemo(
    () => (phase === "recap" ? buildRecap(lesson, ageBand) : step ? buildDialogueForStep(step, stepIndex, ageBand, lesson.id) : []),
    [ageBand, lesson, phase, step, stepIndex],
  );
  const line = dialogue[lineIndex];
  const question = quiz[qIndex];
  const isLastLine = lineIndex >= dialogue.length - 1;
  const isChallenge = line?.kind === "challenge";

  // Right-hand column for matching (stable per question, shuffled so left/right don't line up).
  const matchRights = useMemo(() => {
    if (!question?.pairs) return [];
    const rng = createRng(hashString(`${question.id}:${sessionSeed}`));
    let rights = shuffle(question.pairs.map((pair) => pair.right), rng);
    if (question.pairs.length > 1 && rights.every((right, index) => right === question.pairs![index].right)) {
      rights = [...rights.slice(1), rights[0]];
    }
    return rights;
  }, [question, sessionSeed]);

  /* ---------------- mascot reactions ---------------- */
  useEffect(() => {
    setTypedReady(false);
    if (phase !== "learn" && phase !== "recap") return;
    const curriculumMood = step?.mascotMood as NooriMood | undefined;
    setNooriMood(line?.kind === "cheer" ? "cheer" : line?.kind === "challenge" ? "listen" : line?.kind === "recap" ? "think" : curriculumMood ?? "happy");
    setNooriAction(line?.kind === "challenge" ? "point" : line?.kind === "recap" ? "chin" : step?.type === "mascot" ? "wave" : lineIndex === 0 ? "listen" : "idle");
  }, [line?.id, line?.kind, lineIndex, phase, step?.mascotMood, step?.type]);

  useEffect(() => {
    setSortOrder(question?.kind === "sorting" ? question.options?.map((option) => option.id) ?? [] : []);
    setMatchingAnswers({});
    setActiveLeft(null);
  }, [question]);

  useEffect(() => {
    if (phase === "quiz" && question) setServed((ids) => (ids.includes(question.id) ? ids : [...ids, question.id]));
  }, [phase, question]);

  /* ---------------- voice ---------------- */
  const rate = ageBand === "young" ? 0.82 : ageBand === "older" ? 0.94 : 0.88;

  useEffect(() => {
    if (!voiceEnabled || (phase !== "learn" && phase !== "recap") || !line?.text) return;
    void speakKnowledgeText(line.text, rate);
  }, [line?.id, line?.text, phase, rate, voiceEnabled]);

  useEffect(() => {
    if (!voiceEnabled || phase !== "quiz" || !question) return;
    void speakKnowledgeText(speakableQuestion(question), ageBand === "young" ? 0.82 : 0.9);
  }, [ageBand, phase, question, voiceEnabled]);

  useEffect(() => {
    if (!voiceEnabled || phase !== "done") return;
    const total = practiceResult?.total ?? quiz.length;
    const score = practiceResult?.correct ?? correct;
    void speakKnowledgeText(
      practiceResult
        ? `Practice finished. You got ${score} out of ${total} this time.`
        : `MashaAllah! You finished ${lesson.title}. You answered ${score} out of ${total} correctly and earned ${stars} ${stars === 1 ? "star" : "stars"}.`,
      0.9,
    );
  }, [correct, lesson.title, phase, practiceResult, quiz.length, stars, voiceEnabled]);

  /* ---------------- fx helpers ---------------- */
  function celebrateSoft(action: NooriAction = "clap") {
    setSpark(true);
    setShake(true);
    setBalloons(true);
    setNooriAction(action);
    setNooriMood("cheer");
    window.setTimeout(() => setSpark(false), 800);
    window.setTimeout(() => setShake(false), 450);
    window.setTimeout(() => setBalloons(false), 1600);
  }

  /* ---------------- story navigation ---------------- */
  function startQuiz() {
    setPhase("quiz");
    setLineIndex(0);
    setNooriAction("point");
    setNooriMood("listen");
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

    if (phase === "recap") {
      startQuiz();
      return;
    }

    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex((i) => i + 1);
      setLineIndex(0);
      setChallengeDone(false);
      setNooriAction("bounce");
      setSceneKey((k) => k + 1);
      celebrateSoft("bounce");
      return;
    }

    const recap = buildRecap(lesson, ageBand);
    if (recap.length > 0) {
      setPhase("recap");
      setLineIndex(0);
      setSceneKey((k) => k + 1);
      return;
    }
    startQuiz();
  }

  function goBackDialogue() {
    if (lineIndex > 0) {
      setLineIndex((i) => i - 1);
      setChallengeDone(false);
      return;
    }
    if (phase === "recap") {
      setPhase("learn");
      setStepIndex(lesson.steps.length - 1);
      setLineIndex(0);
      return;
    }
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      setLineIndex(0);
      setChallengeDone(false);
    }
  }

  function onChallengeTap() {
    if (!isChallenge || challengeDone) return;
    setChallengeDone(true);
    celebrateSoft("thumbs");
    setTypedReady(true);
  }

  /* ---------------- answer checking ---------------- */
  function normalizeAnswer(value: string) {
    return value.trim().toLowerCase().replace(/[^\w\u0600-\u06FF]/g, "");
  }

  function isAnswerCorrect(answer: AnswerValue): boolean {
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

  const explanationFor = useCallback((q: IKQuestion) => q.explanation ?? `The answer is ${correctAnswerLabel(q)}.`, []);

  function checkAnswer(answer: AnswerValue) {
    if (!question || feedback) return;
    const ok = isAnswerCorrect(answer);
    const praise = PRAISE[hashString(question.id + sessionSeed) % PRAISE.length];

    if (ok) {
      setFeedback("correct");
      setAnswerSettled(true);
      if (attempts === 0) {
        const nextCombo = combo + 1;
        setCorrect((count) => count + 1);
        setCombo(nextCombo);
        setBestCombo((best) => Math.max(best, nextCombo));
      }
      celebrateSoft(attempts === 0 && combo >= 2 ? "thumbs" : "clap");
      if (voiceEnabled) void speakKnowledgeText(`${praise} ${explanationFor(question)}`, rate);
      return;
    }

    setFeedback("wrong");
    const settled = attempts >= 1;
    setAnswerSettled(settled);
    setAttempts((count) => count + 1);
    setCombo(0);
    if (attempts === 0) setMissed((ids) => (ids.includes(question.id) ? ids : [...ids, question.id]));
    setNooriMood(settled ? "hint" : "sad");
    setNooriAction(settled ? "point" : "idle");
    if (voiceEnabled) {
      const message = settled
        ? `${explanationFor(question)}`
        : `${ENCOURAGE[hashString(question.id) % ENCOURAGE.length]} ${question.hint ?? ""}`;
      void speakKnowledgeText(message, rate);
    }
  }

  function resetQuestionInteraction() {
    setSelected(null);
    setFillValue("");
    setFeedback(null);
    setAnswerSettled(false);
    setMatchingAnswers({});
    setActiveLeft(null);
    setNooriAction("point");
    setNooriMood("happy");
  }

  function retryQuestion() {
    resetQuestionInteraction();
    setNooriMood("hint");
    setSortOrder(question?.kind === "sorting" ? question.options?.map((option) => option.id) ?? [] : []);
  }

  function finishQuiz() {
    const total = quiz.length;
    if (practiceIds) {
      setPracticeResult({ correct, total });
      setPhase("done");
      setNooriAction("clap");
      setNooriMood("cheer");
      celebrateSoft();
      return;
    }
    const ratio = total > 0 ? correct / total : 1;
    const nextStars: 1 | 2 | 3 = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    setStars(nextStars);
    setFirstRun({ correct, total, missed: quiz.filter((q) => missed.includes(q.id)) });
    setReward(onComplete({ correct, total, servedQuestionIds: served, missedQuestionIds: missed, bestCombo }));
    setPhase("done");
    setNooriAction("clap");
    setNooriMood("cheer");
    celebrateSoft();
  }

  function advanceQuestion() {
    if (!answerSettled) return;
    if (qIndex < quiz.length - 1) {
      setQIndex((i) => i + 1);
      setAttempts(0);
      resetQuestionInteraction();
      return;
    }
    finishQuiz();
  }

  function restartQuizState() {
    setQIndex(0);
    setCorrect(0);
    setAttempts(0);
    setCombo(0);
    setServed([]);
    resetQuestionInteraction();
  }

  function practiceMissed() {
    const ids = firstRun?.missed.map((q) => q.id) ?? [];
    if (ids.length === 0) return;
    setPracticeIds(ids);
    setSessionSeed(Date.now());
    setPracticeResult(null);
    setMissed([]);
    restartQuizState();
    setPhase("quiz");
    setNooriAction("point");
    setNooriMood("listen");
  }

  function replayLesson() {
    setPracticeIds(null);
    setPracticeResult(null);
    setFirstRun(null);
    setReward(null);
    setMissed([]);
    setBestCombo(0);
    setSessionSeed(Date.now());
    restartQuizState();
    setStepIndex(0);
    setLineIndex(0);
    setChallengeDone(false);
    setPhase(hasStory ? "learn" : "quiz");
    setNooriAction("wave");
    setNooriMood("happy");
  }

  /* ---------------- derived UI ---------------- */
  const ctaLabel = (() => {
    if (phase === "recap") {
      if (!typedReady && !reduce) return "…";
      return isLastLine ? "Play Quiz 🎮" : "Next →";
    }
    if (phase !== "learn") return "";
    if (isChallenge && !challengeDone) return "Tap the picture ↑";
    if (!typedReady && !reduce) return "…";
    if (!isLastLine) return lineIndex === 0 ? "YES!" : "Next →";
    if (stepIndex < lesson.steps.length - 1) return "Next adventure →";
    return "Recap →";
  })();

  const totalSteps = lesson.steps.length;
  const learnPct = phase === "recap" ? 100 : totalSteps ? Math.round(((stepIndex + (dialogue.length ? (lineIndex + 1) / dialogue.length : 1)) / totalSteps) * 100) : 0;
  const quizPct = quiz.length ? Math.round(((qIndex + (answerSettled ? 1 : 0)) / quiz.length) * 100) : 0;
  const doneScore = practiceResult ?? { correct, total: quiz.length };
  const donePct = doneScore.total ? Math.round((doneScore.correct / doneScore.total) * 100) : 100;

  const mascotCaption = phase === "quiz" ? (combo >= 2 ? `${buddy} · 🔥 ${combo} in a row` : `${buddy} · Your turn!`) : buddy;

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
        <div className="ik-lesson-title-chip" title={lesson.subtitle}>
          <span>{mode === "challenge" ? "📅" : "📖"}</span>
          <strong>{lesson.title}</strong>
        </div>
        <div className="ik-toolbar-spacer" />
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
            const text = phase === "learn" || phase === "recap"
              ? line?.text
              : phase === "quiz" && question
                ? speakableQuestion(question)
                : "MashaAllah. You completed the lesson.";
            if (text) void speakKnowledgeText(text, rate);
          }}
        >
          ↻ Read again
        </button>
      </div>

      {/* Journey bar */}
      <div className="ik-journey" aria-label="Lesson journey">
        <div className={`ik-journey-stage ${phase === "learn" || phase === "recap" ? "active" : "done"}`}>
          <span className="ik-journey-icon">📖</span>
          <span>Learn</span>
          <div className="ik-journey-bar"><div style={{ width: `${phase === "learn" || phase === "recap" ? learnPct : 100}%` }} /></div>
        </div>
        <div className={`ik-journey-stage ${phase === "quiz" ? "active" : phase === "done" ? "done" : ""}`}>
          <span className="ik-journey-icon">🎮</span>
          <span>Quiz</span>
          <div className="ik-journey-bar"><div style={{ width: `${phase === "quiz" ? quizPct : phase === "done" ? 100 : 0}%` }} /></div>
        </div>
        <div className={`ik-journey-stage ${phase === "done" ? "active" : ""}`}>
          <span className="ik-journey-icon">🏆</span>
          <span>Reward</span>
          <div className="ik-journey-bar"><div style={{ width: phase === "done" ? "100%" : "0%" }} /></div>
        </div>
      </div>

      <div className="ik-dialogue-stage">
        <aside className="ik-dialogue-buddy">
          <NooriMascot
            mood={nooriMood}
            action={nooriAction}
            speaking={speaking}
            character={companion}
            size={148}
            lookAt="right"
            caption={mascotCaption}
          />
        </aside>

        <div className="ik-dialogue-panel">
          {(phase === "learn" || phase === "recap") && line && (
            <>
              <div className="ik-step-header">
                <span className="ik-step-count">{phase === "recap" ? "Recap" : `Step ${stepIndex + 1} of ${totalSteps}`}</span>
                {phase === "learn" && step?.title && <span className="ik-scene-title">{step.emoji} {step.title}</span>}
                <div className="ik-progress-dots" aria-hidden>
                  {lesson.steps.map((_, i) => (
                    <span key={i} className={`ik-dot ${i < stepIndex || phase === "recap" ? "on done" : i === stepIndex ? "on" : ""}`} />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${phase}-${step?.id}-${line.id}-${sceneKey}`}
                  className="ik-dialogue-frame"
                  initial={reduce ? false : { opacity: 0, x: 40, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <SparkBurst show={spark} />

                  {phase === "learn" && step && (
                    step.videoUrl ? (
                      <div className="ik-visual-button ik-visual-button--video">
                        <StepVisual topicId={lesson.topicId} step={step} />
                      </div>
                    ) : (
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
                    )
                  )}


                  {phase === "recap" && (
                    <div className="ik-recap-card">
                      {lesson.steps.slice(1).filter((s) => s.title).map((s) => (
                        <span key={s.id} className="ik-recap-chip">{s.emoji} {s.title}</span>
                      ))}
                    </div>
                  )}

                  <DialogueBubble
                    key={line.id}
                    text={line.text}
                    emoji={line.emoji}
                    kind={line.kind}
                    speaker={buddy}
                    onTyped={() => setTypedReady(true)}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="ik-actions">
                {(stepIndex + lineIndex > 0 || phase === "recap") && (
                  <motion.button type="button" className="ik-btn ik-btn-ghost" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={goBackDialogue}>
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
                {phase === "learn" && (
                  <button type="button" className="ik-skip-link" onClick={() => { setPhase("recap"); setLineIndex(0); }}>
                    Skip to quiz
                  </button>
                )}
              </div>
            </>
          )}

          {phase === "quiz" && question && (
            <>
              <div className="ik-step-header">
                <span className="ik-step-count">{practiceIds ? "Practice · " : ""}Question {qIndex + 1} of {quiz.length}</span>
                <span className={`ik-kind-chip kind-${question.kind}`}>{KIND_LABELS[question.kind]}</span>
                <span className={`ik-diff-chip diff-${question.difficulty}`}>{question.difficulty}</span>
                {combo >= 2 && <span className="ik-combo-chip">🔥 {combo} in a row</span>}
                <div className="ik-progress-dots" aria-hidden>
                  {quiz.map((q, i) => (
                    <span key={q.id} className={`ik-dot ${i < qIndex ? (missed.includes(q.id) ? "on miss" : "on done") : i === qIndex ? "on" : ""}`} />
                  ))}
                </div>
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
                  <DialogueBubble text={question.prompt} emoji="❓" kind="talk" speaker={buddy} onTyped={() => setTypedReady(true)} />

                  {feedback === "wrong" && !answerSettled && (
                    <DialogueBubble typewriter={false} text={question.hint ? `${ENCOURAGE[hashString(question.id) % ENCOURAGE.length]} Hint: ${question.hint}` : ENCOURAGE[hashString(question.id) % ENCOURAGE.length]} emoji="💡" kind="hint" />
                  )}
                  {feedback === "wrong" && answerSettled && (
                    <DialogueBubble typewriter={false} text={`The correct answer is ${correctAnswerLabel(question)}. ${question.explanation ?? ""}`.trim()} emoji="💛" kind="why" />
                  )}
                  {feedback === "correct" && (
                    <DialogueBubble typewriter={false} text={`${PRAISE[hashString(question.id + sessionSeed) % PRAISE.length]} ${explanationFor(question)}`} emoji="🎉" kind="cheer" />
                  )}

                  {(question.kind === "mcq" || question.kind === "true_false" || question.kind === "tap_select") && (
                    <fieldset className={`ik-options ik-options-play ${question.kind === "tap_select" ? "ik-options-tiles" : ""}`} aria-describedby={`${question.id}-feedback`}>
                      <legend className="ik-sr-only">Choose one answer</legend>
                      {question.options?.map((opt, idx) => {
                        const isAnswer = Array.isArray(question.answer) ? question.answer.includes(opt.id) : opt.id === question.answer;
                        const cls =
                          feedback && selected === opt.id
                            ? feedback === "correct"
                              ? "correct"
                              : "soft-miss"
                            : feedback === "wrong" && answerSettled && isAnswer
                              ? "correct reveal"
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
                            {question.kind === "tap_select" ? (
                              <>
                                <span className="ik-tile-emoji" aria-hidden>{opt.emoji}</span>
                                <span className="ik-tile-label">{opt.label}</span>
                              </>
                            ) : (
                              <>
                                <span className="ik-option-letter">{String.fromCharCode(65 + idx)}</span>
                                {opt.emoji ? `${opt.emoji} ` : ""}
                                {opt.label}
                              </>
                            )}
                          </motion.button>
                        );
                      })}
                    </fieldset>
                  )}

                  {question.kind === "fill_blank" && (
                    <form
                      className="ik-fill-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (fillValue.trim() && !feedback) checkAnswer(fillValue);
                      }}
                    >
                      <label className="ik-question-label" htmlFor={`${question.id}-answer`}>Type the missing word</label>
                      <input
                        id={`${question.id}-answer`}
                        className="ik-fill-input"
                        value={fillValue}
                        placeholder="Type here…"
                        autoComplete="off"
                        onChange={(e) => setFillValue(e.target.value)}
                        disabled={!!feedback}
                      />
                      <motion.button type="submit" className="ik-btn ik-btn-primary" disabled={!fillValue.trim() || !!feedback}>
                        Check
                      </motion.button>
                    </form>
                  )}

                  {question.kind === "matching" && (
                    <div className="ik-pair-game" role="group" aria-label="Match each item">
                      <p className="ik-question-label">Tap an item on the left, then tap its match on the right.</p>
                      <div className="ik-pair-columns">
                        <div className="ik-pair-col">
                          {question.pairs?.map((pair, index) => {
                            const matchedTo = matchingAnswers[pair.left];
                            const pairIndex = matchedTo ? matchRights.indexOf(matchedTo) : -1;
                            return (
                              <button
                                key={pair.left}
                                type="button"
                                className={`ik-pair-item ${activeLeft === pair.left ? "active" : ""} ${matchedTo ? `paired pair-${(pairIndex >= 0 ? pairIndex : index) % 4}` : ""}`}
                                disabled={!!feedback}
                                onClick={() => setActiveLeft((current) => (current === pair.left ? null : pair.left))}
                              >
                                {pair.left}
                              </button>
                            );
                          })}
                        </div>
                        <div className="ik-pair-col">
                          {matchRights.map((right, index) => {
                            const owner = Object.entries(matchingAnswers).find(([, value]) => value === right)?.[0];
                            return (
                              <button
                                key={right}
                                type="button"
                                className={`ik-pair-item ${owner ? `paired pair-${index % 4}` : ""} ${activeLeft && !owner ? "ready" : ""}`}
                                disabled={!!feedback || (!activeLeft && !owner)}
                                onClick={() => {
                                  if (owner) {
                                    setMatchingAnswers((current) => {
                                      const next = { ...current };
                                      delete next[owner];
                                      return next;
                                    });
                                    return;
                                  }
                                  if (!activeLeft) return;
                                  setMatchingAnswers((current) => ({ ...current, [activeLeft]: right }));
                                  setActiveLeft(null);
                                }}
                              >
                                {right}
                              </button>
                            );
                          })}
                        </div>
                      </div>
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
                        const move = (from: number, to: number) => setSortOrder((current) => {
                          if (to < 0 || to >= current.length) return current;
                          const next = [...current];
                          [next[from], next[to]] = [next[to], next[from]];
                          return next;
                        });
                        return (
                          <motion.div key={id} layout className="ik-sort-row" transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                            <span className="ik-option-letter">{index + 1}</span>
                            <strong>{item?.label}</strong>
                            <span className="ik-sort-actions">
                              <button type="button" aria-label={`Move ${item?.label} up`} disabled={!!feedback || index === 0} onClick={() => move(index, index - 1)}>↑</button>
                              <button type="button" aria-label={`Move ${item?.label} down`} disabled={!!feedback || index === sortOrder.length - 1} onClick={() => move(index, index + 1)}>↓</button>
                            </span>
                          </motion.div>
                        );
                      })}
                      <button type="button" className="ik-btn ik-btn-primary" disabled={!!feedback || sortOrder.length === 0} onClick={() => checkAnswer(sortOrder)}>
                        Check order
                      </button>
                    </div>
                  )}

                  <div id={`${question.id}-feedback`} className="ik-quiz-actions" aria-live="polite">
                    {feedback === "wrong" && !answerSettled && (
                      <button type="button" className="ik-btn ik-btn-primary" onClick={retryQuestion}>Try again 💪</button>
                    )}
                    {answerSettled && (
                      <button type="button" className="ik-btn ik-btn-primary ik-btn-pulse" onClick={advanceQuestion}>
                        {qIndex < quiz.length - 1 ? "Next question →" : "See my results →"}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {phase === "done" && (
            <motion.div className="ik-dialogue-frame ik-celebrate" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <SparkBurst show />
              <div className="ik-result-hero">
                <div className="ik-score-ring" style={{ ["--pct" as string]: `${donePct}%` }} role="img" aria-label={`${doneScore.correct} of ${doneScore.total} correct`}>
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" className="track" />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="52"
                      className="fill"
                      strokeDasharray={2 * Math.PI * 52}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - donePct / 100) }}
                      transition={{ duration: reduce ? 0 : 1.1, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="ik-score-ring-label">
                    <strong>{donePct}%</strong>
                    <span>{doneScore.correct}/{doneScore.total}</span>
                  </div>
                </div>
                <div className="ik-result-copy">
                  <DialogueBubble
                    typewriter={false}
                    text={practiceResult ? (practiceResult.correct === practiceResult.total ? "You fixed every one. That's real learning!" : "Good practice — every try makes it stick.") : donePct === 100 ? "Perfect score! MashaAllah!" : donePct >= 60 ? "MashaAllah! You did it!" : "Well done for finishing — let's practise the tricky ones."}
                    emoji={practiceResult ? "💪" : "🏆"}
                    kind="cheer"
                    speaker={buddy}
                  />
                  {!practiceResult && (
                    <div className="ik-stars" aria-label={`${stars} stars`}>
                      {[1, 2, 3].map((n) => (
                        <motion.span key={n} className={n <= stars ? "lit" : "dim"} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: reduce ? 0 : 0.3 + n * 0.18, type: "spring", stiffness: 300 }}>
                          ⭐
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!practiceResult && (
                <div className="ik-reward-row">
                  <span className="ik-chip">+{reward?.earnedXp ?? 0} XP</span>
                  <span className="ik-chip">+{reward?.earnedCoins ?? 0} Coins</span>
                  {bestCombo >= 2 && <span className="ik-chip">🔥 Best streak {bestCombo}</span>}
                </div>
              )}
              {reward?.levelUp && <DialogueBubble typewriter={false} text="Level up! Your learning journey is growing." emoji="🌟" kind="cheer" />}
              {reward && reward.newBadges.length > 0 && (
                <div className="ik-unlocked-badges" aria-live="polite">
                  <strong>New badge{reward.newBadges.length > 1 ? "s" : ""} unlocked</strong>
                  <span>{reward.newBadges.map((id) => id.replaceAll("-", " ")).join(" · ")}</span>
                </div>
              )}

              {firstRun && firstRun.missed.length > 0 && !practiceResult && (
                <div className="ik-review">
                  <h3>Let's remember these</h3>
                  <ul>
                    {firstRun.missed.map((q) => (
                      <li key={q.id}>
                        <span className="ik-review-q">{q.prompt}</span>
                        <span className="ik-review-a">✅ {correctAnswerLabel(q)}</span>
                        {q.explanation && <span className="ik-review-why">{q.explanation}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ik-actions">
                {firstRun && firstRun.missed.length > 0 && !practiceResult && (
                  <motion.button type="button" className="ik-btn ik-btn-ghost" whileHover={{ scale: 1.04 }} onClick={practiceMissed}>
                    Practise the {firstRun.missed.length} tricky one{firstRun.missed.length > 1 ? "s" : ""}
                  </motion.button>
                )}
                {mode === "lesson" && (
                  <motion.button type="button" className="ik-btn ik-btn-ghost" whileHover={{ scale: 1.04 }} onClick={replayLesson}>
                    ↻ Play again (new questions)
                  </motion.button>
                )}
                <motion.button type="button" className="ik-btn ik-btn-primary ik-btn-pulse" whileHover={{ scale: 1.06 }} onClick={onBack}>
                  Continue exploring →
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
