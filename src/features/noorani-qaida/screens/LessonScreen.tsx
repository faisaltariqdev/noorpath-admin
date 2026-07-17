"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { Letter, QaidaProgress } from "../types";
import { qaidaAudio, type PronunciationMode } from "../audio/QaidaAudioService";
import ScenicLearningBackground from "../animations/ScenicLearningBackground";
import SparkleBurst from "../animations/SparkleBurst";
import StarBurst from "../animations/StarBurst";
import LetterCard from "../characters/LetterCard";
import OwlMascot from "../characters/OwlMascot";
import ZaydMascot, { type ZaydAction } from "../characters/ZaydMascot";
import {
  INITIAL_LESSON_FLOW,
  LESSON_STEPS,
  lessonFlowReducer,
  lessonStepProgress,
  type LessonStep,
} from "../lesson/flow";
import { useMotionBudget } from "../motion/useMotionBudget";
import FullscreenButton from "../ui/FullscreenButton";

const ConfettiExplosion = dynamic(() => import("../animations/ConfettiExplosion"), { ssr: false });
const TracingCanvas = dynamic(() => import("../ui/TracingCanvas"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-2xl bg-emerald-50" aria-label="Loading tracing activity" />,
});

const GAMES = [
  { id: "bubble-pop", label: "Bubble Pop", icon: "🫧", accent: "from-fuchsia-400 to-violet-600" },
  { id: "find-letter", label: "Find Letter", icon: "🔎", accent: "from-sky-400 to-blue-600" },
  { id: "letter-train", label: "Letter Train", icon: "🚂", accent: "from-orange-400 to-rose-500" },
  { id: "memory-match", label: "Match It", icon: "🃏", accent: "from-emerald-400 to-teal-600" },
  { id: "quick-challenge", label: "Quick Quiz", icon: "❓", accent: "from-amber-400 to-pink-500" },
  { id: "puzzle", label: "Puzzle", icon: "🧩", accent: "from-indigo-400 to-purple-600" },
  { id: "sound-match", label: "Sound Match", icon: "🎵", accent: "from-pink-400 to-rose-600" },
] as const;

type ActionTab = "trace" | "write" | "listen" | "repeat";

interface LessonScreenProps {
  letter: Letter;
  progress: QaidaProgress;
  onComplete: () => void;
  onGameSelect: (gameId: string) => void;
  audioEnabled?: boolean;
  gameCompletionCount?: number;
}

const ACTIONS: { id: ActionTab; icon: string; label: string; surface: string }[] = [
  { id: "trace", icon: "✏️", label: "Trace", surface: "from-amber-100 to-orange-100 text-orange-700" },
  { id: "write", icon: "🖍️", label: "Write", surface: "from-violet-100 to-fuchsia-100 text-violet-700" },
  { id: "listen", icon: "🔊", label: "Listen", surface: "from-emerald-100 to-green-100 text-emerald-700" },
  { id: "repeat", icon: "🎙️", label: "Repeat", surface: "from-purple-100 to-indigo-100 text-purple-700" },
];

const FLOW_LABELS: Partial<Record<LessonStep, string>> = {
  introduce: "Meet",
  listen: "Hear",
  trace: "Trace",
  repeat: "Repeat",
  game: "Play",
  reward: "Reward",
};

function ActivityWorkspace({
  activeTab,
  letter,
  onActivityComplete,
  onTracingComplete,
  speak,
}: {
  activeTab: ActionTab;
  letter: Letter;
  onActivityComplete: (tab: ActionTab) => void;
  onTracingComplete: () => void;
  speak: () => void;
}) {
  if (activeTab === "listen") return null;

  return (
    <motion.section
      className="rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-[0_14px_35px_rgba(15,62,41,0.16)] backdrop-blur-md sm:p-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      aria-live="polite"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700">Practice activity</p>
          <h3 className="text-lg font-black text-slate-900">
            {activeTab === "trace" ? `Trace ${letter.name}` : activeTab === "write" ? `Write ${letter.name}` : `Repeat ${letter.name}`}
          </h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Step 2 of 5</span>
      </div>

      {activeTab === "trace" ? (
        <TracingCanvas letter={letter.letter} onComplete={onTracingComplete} />
      ) : (
        <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-amber-50 p-5 text-center">
          <div className="font-serif text-7xl font-bold text-emerald-700" dir="rtl">{letter.letter}</div>
          <p className="mt-2 max-w-lg text-sm font-semibold text-slate-600">
            {activeTab === "write"
              ? "Copy the letter slowly, keeping the shape and direction clear."
              : "Listen carefully, then repeat the sound in a calm and clear voice."}
          </p>
          <motion.button
            className="mt-4 min-h-11 rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-900/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            onClick={() => {
              if (activeTab === "repeat") speak();
              onActivityComplete(activeTab);
            }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {activeTab === "repeat" ? "Hear and repeat" : "I finished writing"}
          </motion.button>
        </div>
      )}
    </motion.section>
  );
}

export default function LessonScreen({
  letter,
  progress,
  onComplete,
  onGameSelect,
  audioEnabled = true,
  gameCompletionCount = 0,
}: LessonScreenProps) {
  const lessonRef = useRef<HTMLElement>(null);
  const motionBudget = useMotionBudget(progress.settings.reducedMotion);
  const [flow, flowDispatch] = useReducer(lessonFlowReducer, INITIAL_LESSON_FLOW);
  const [activeTab, setActiveTab] = useState<ActionTab>("listen");
  const [showConfetti, setShowConfetti] = useState(false);
  const [starBurst, setStarBurst] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "excited" | "celebrating">("happy");
  const [mascotAction, setMascotAction] = useState<ZaydAction>("wave");
  const [mascotSpeech, setMascotSpeech] = useState(`Assalamu Alaikum!\nToday we will learn ${letter.name}`);
  const [completedActivities, setCompletedActivities] = useState<Set<ActionTab>>(new Set());
  const [tracingCompleted, setTracingCompleted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isPronouncing, setIsPronouncing] = useState(false);

  const isCompleted = progress.completed.includes(`letter-${letter.id}`);
  const totalActivities = 5;
  const doneActivities = Math.min(totalActivities, completedActivities.size + (gameCompleted ? 1 : 0));
  const activityProgress = Math.max(
    Math.round((doneActivities / totalActivities) * 100),
    lessonStepProgress(flow),
  );

  const speak = useCallback((mode: PronunciationMode = "normal", repeat = 1) => {
    if (!audioEnabled) return;
    void qaidaAudio.pronounce({
      key: `letter-${letter.id}`,
      fallbackText: letter.letter,
      mode,
      repeat,
      onStart: () => {
        setIsPronouncing(true);
        setMascotMood("excited");
        setMascotAction("point");
        setMascotSpeech(`Listen carefully: ${letter.name}`);
        setSparkle(true);
      },
      onEnd: () => {
        setIsPronouncing(false);
        setMascotMood("happy");
        setMascotAction("idle");
        setMascotSpeech(`${letter.example} means “${letter.meaning}”`);
        setSparkle(false);
        setCompletedActivities((previous) => new Set([...previous, "listen"]));
        flowDispatch({ type: "complete", step: "listen" });
      },
    });
  }, [audioEnabled, letter]);

  useEffect(() => {
    qaidaAudio.setEnabled(audioEnabled);
    setMascotAction("wave");
    flowDispatch({ type: "complete", step: "welcome" });
    const timer = window.setTimeout(() => {
      flowDispatch({ type: "complete", step: "introduce" });
      speak();
    }, motionBudget.reduced ? 150 : 700);
    return () => {
      window.clearTimeout(timer);
      qaidaAudio.stop();
    };
  }, [audioEnabled, motionBudget.reduced, speak]);

  useEffect(() => {
    if (gameCompletionCount < 1) return;
    setGameCompleted(true);
    setMascotMood("happy");
    setMascotAction("clap");
    setMascotSpeech("Fantastic game! You earned a star!");
    flowDispatch({ type: "complete", step: "game" });
  }, [gameCompletionCount]);

  const handleActivityComplete = useCallback((tab: ActionTab) => {
    setCompletedActivities((previous) => new Set([...previous, tab]));
    setMascotMood("happy");
    setMascotAction("clap");
    setMascotSpeech("Excellent! Keep going!");
    const lessonStep: LessonStep = tab === "trace" ? "trace" : tab === "repeat" ? "repeat" : "listen";
    flowDispatch({ type: "complete", step: lessonStep });
    void qaidaAudio.effect("correct");
  }, []);

  const handleComplete = useCallback(() => {
    setShowConfetti(true);
    setStarBurst(true);
    setMascotMood("celebrating");
    setMascotAction("dance");
    setMascotSpeech("MashaAllah! You did it!");
    flowDispatch({ type: "complete", step: "reward" });
    void qaidaAudio.effect("reward");
    window.setTimeout(() => {
      setShowConfetti(false);
      setStarBurst(false);
      onComplete();
    }, motionBudget.reduced ? 600 : 2800);
  }, [motionBudget.reduced, onComplete]);

  return (
    <>
      <ConfettiExplosion active={showConfetti} particleCount={motionBudget.celebrationParticles} />

      <main ref={lessonRef} className="relative min-h-full overflow-x-hidden bg-emerald-100 fullscreen:h-screen fullscreen:overflow-y-auto">
        <ScenicLearningBackground reducedMotion={motionBudget.reduced} />

        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1600px] flex-col gap-3 p-3 sm:p-4 xl:gap-4 xl:p-5">
          <div className="flex items-center gap-2">
            <nav
              className="qaida-panel flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto p-2 sm:justify-center"
              aria-label="Lesson adventure progress"
            >
              {LESSON_STEPS.filter((step) => FLOW_LABELS[step]).map((step, index) => {
                const complete = flow.completedSteps.includes(step);
                const current = flow.step === step;
                return (
                  <div key={step} className="flex flex-none items-center gap-1.5">
                    {index > 0 && <span className="h-px w-3 bg-emerald-900/15 sm:w-6" aria-hidden="true" />}
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-black ${
                        current
                          ? "bg-emerald-700 text-white"
                          : complete
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-white/70 text-slate-500"
                      }`}
                      aria-current={current ? "step" : undefined}
                    >
                      {complete ? "✓ " : ""}{FLOW_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </nav>
            <FullscreenButton
              targetRef={lessonRef}
              label={`${letter.name} lesson`}
              className="flex-none border border-emerald-900/10 bg-white text-emerald-800 hover:bg-emerald-50"
            />
          </div>

          <section className="grid gap-3 lg:grid-cols-12 xl:gap-4">
            <motion.div
              className="relative flex min-h-[280px] items-end justify-center overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/[0.16] px-3 pt-20 shadow-[0_18px_45px_rgba(13,71,47,0.2)] backdrop-blur-[2px] lg:col-span-4 xl:col-span-3"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="absolute left-4 top-4 rounded-2xl border border-white/70 bg-amber-50/95 px-4 py-3 shadow-lg">
                <p className="max-w-44 whitespace-pre-line text-xs font-bold leading-relaxed text-slate-700">{mascotSpeech}</p>
              </div>
              <ZaydMascot
                mood={mascotMood}
                action={mascotAction}
                lookAt={mascotAction === "point" ? "right" : "center"}
                size={150}
                className="translate-y-8"
              />
            </motion.div>

            <motion.div
              className="relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border-2 border-amber-300/90 bg-gradient-to-br from-amber-50/95 via-white/95 to-yellow-100/95 p-4 shadow-[0_18px_50px_rgba(161,98,7,0.26)] lg:col-span-4 xl:col-span-4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <SparkleBurst active={sparkle} />
              <button
                type="button"
                onClick={() => speak()}
                className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg shadow-md transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                aria-label={`Hear pronunciation of ${letter.name}`}
              >
                🔊
              </button>
              <LetterCard
                letter={letter}
                size="lg"
                onTap={() => speak()}
                completed={isCompleted}
                pronouncing={isPronouncing}
                reducedMotion={motionBudget.reduced}
              />
              <div className="relative z-20 mt-1 flex flex-wrap justify-center gap-2">
                <motion.button
                  className="qaida-premium-button flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-2.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(6,95,70,0.34)]"
                  onClick={() => speak("normal")}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isPronouncing}
                >
                  <span aria-hidden="true">🔊</span> Normal
                </motion.button>
                <motion.button
                  className="qaida-premium-button border-emerald-200 bg-white px-4 py-2.5 text-sm font-black text-emerald-800"
                  onClick={() => speak("slow")}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isPronouncing}
                >
                  Slow
                </motion.button>
                <motion.button
                  className="qaida-premium-button border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-900"
                  onClick={() => speak("normal", 2)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isPronouncing}
                >
                  Repeat ×2
                </motion.button>
              </div>
              <span className="qaida-live-region" role="status" aria-live="polite">
                {isPronouncing ? `Playing ${letter.name} pronunciation` : ""}
              </span>
            </motion.div>

            <motion.div
              className="flex min-h-[280px] flex-col gap-3 lg:col-span-4 xl:col-span-5"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex-1 rounded-[1.75rem] border border-white/80 bg-[#fffaf0]/95 p-5 shadow-[0_16px_40px_rgba(15,62,41,0.17)] backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-emerald-600">Letter {letter.id}</p>
                    <h2 className="text-2xl font-black leading-tight text-emerald-900 sm:text-3xl">
                      {letter.name}{" "}
                      <span className="qaida-arabic font-black text-emerald-700" lang="ar" dir="rtl">– {letter.letter}</span>
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-700" dir="ltr">
                      Pronounce “{letter.sound}” · as in {letter.example}
                    </p>
                    <p className="text-sm text-slate-600">Makharij: {letter.makharij}</p>
                  </div>
                  <div className="hidden text-5xl sm:block" aria-hidden="true">📖</div>
                </div>

                <div className="mt-4 flex min-w-0 items-start gap-3 rounded-2xl bg-emerald-100/80 p-3">
                  <span className="text-xl" aria-hidden="true">🌟</span>
                  <p className="min-w-0 break-words text-sm font-semibold leading-relaxed text-emerald-950">
                    <span dir="rtl" className="font-black">{letter.example}</span> means “{letter.meaning}” in Arabic.
                    Every Quranic word is built from letters like this.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] border border-white/80 bg-[#fffaf0]/95 p-3 shadow-[0_14px_32px_rgba(15,62,41,0.16)] sm:grid-cols-4">
                {ACTIONS.map((action) => {
                  const done = completedActivities.has(action.id) || (action.id === "trace" && tracingCompleted);
                  const selected = activeTab === action.id;
                  return (
                    <motion.button
                      key={action.id}
                      className={`relative flex min-h-[78px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br p-2 font-black shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${action.surface} ${selected ? "ring-2 ring-emerald-600 ring-offset-2" : ""}`}
                      onClick={() => {
                        setActiveTab(action.id);
                        flowDispatch({
                          type: "go",
                          step: action.id === "trace" ? "trace" : action.id === "repeat" ? "repeat" : "listen",
                        });
                        if (action.id === "listen") {
                          speak();
                        }
                      }}
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      aria-pressed={selected}
                    >
                      {done && <span className="absolute right-1.5 top-1.5 text-xs" aria-label="Completed">✅</span>}
                      <span className="text-2xl" aria-hidden="true">{action.icon}</span>
                      <span className="mt-1 text-xs">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </section>

          <AnimatePresence mode="wait">
            <ActivityWorkspace
              key={activeTab}
              activeTab={activeTab}
              letter={letter}
              onActivityComplete={handleActivityComplete}
              onTracingComplete={() => {
                setTracingCompleted(true);
                handleActivityComplete("trace");
              }}
              speak={speak}
            />
          </AnimatePresence>

          <section className="grid gap-3 lg:grid-cols-12 xl:gap-4">
            <motion.div
              className="overflow-hidden rounded-[1.5rem] border border-emerald-200/50 bg-[#073e39]/[0.96] p-3 shadow-[0_18px_42px_rgba(4,47,38,0.28)] lg:col-span-9"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-2 flex items-center gap-2 px-1">
                <span aria-hidden="true">⭐</span>
                <h3 className="text-sm font-black text-white sm:text-base">Let&apos;s Practice with Fun!</h3>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {GAMES.map((game) => (
                  <motion.button
                    key={game.id}
                    className="group w-[104px] flex-none overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-left shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
                    onClick={() => {
                      flowDispatch({ type: "go", step: "game" });
                      setMascotAction("point");
                      setMascotSpeech("Choose a game and practise!");
                      onGameSelect(game.id);
                    }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className={`flex h-[76px] items-center justify-center bg-gradient-to-br text-4xl ${game.accent}`} aria-hidden="true">
                      {game.icon}
                    </span>
                    <span className="block truncate px-2 py-2 text-center text-[11px] font-black text-white">{game.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative flex min-h-[154px] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-purple-300/70 bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-700 p-4 text-center text-white shadow-[0_18px_42px_rgba(88,28,135,0.3)] lg:col-span-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <StarBurst active={starBurst} count={6} size="sm" />
              <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-1 text-xs" aria-hidden="true">🔒</span>
              <p className="text-sm font-black">Reward</p>
              <motion.div
                className="my-1 text-5xl"
                animate={motionBudget.reduced ? undefined : { rotate: [0, 4, -4, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                aria-hidden="true"
              >
                🎁
              </motion.div>
              <p className="text-xs text-purple-100">{isCompleted ? "Lesson completed — reward unlocked!" : "Complete the lesson to unlock your reward."}</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-purple-950/45">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-400" animate={{ width: `${activityProgress}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-purple-100">{doneActivities} / {totalActivities} activities</p>
            </motion.div>
          </section>

          <section className="grid gap-3 lg:grid-cols-12 xl:gap-4">
            <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/70 bg-white/[0.88] p-4 shadow-lg backdrop-blur-md lg:col-span-4">
              <span className="text-4xl" aria-hidden="true">🎯</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-900">Today&apos;s Goal</p>
                <p className="text-xs text-slate-600">Complete 5 activities</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <motion.div className="h-full rounded-full bg-lime-500" animate={{ width: `${activityProgress}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{doneActivities}/5</span>
                </div>
              </div>
            </div>

            <div className="flex min-h-[104px] items-center justify-center rounded-[1.35rem] border border-white/70 bg-white/[0.88] px-3 shadow-lg backdrop-blur-md lg:col-span-4">
              <OwlMascot
                size={72}
                message={doneActivities >= 3 ? "Great job! Keep learning!" : "You are doing great!"}
                mood={doneActivities >= 3 ? "excited" : "happy"}
              />
            </div>

            <div className="flex flex-col justify-center rounded-[1.35rem] border border-white/70 bg-white/[0.88] p-4 shadow-lg backdrop-blur-md lg:col-span-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-900">Your Badges</p>
                  <div className="mt-2 flex gap-1.5">
                    {progress.badges.slice(0, 5).map((badge) => (
                      <span
                        key={badge.id}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm shadow-sm ${badge.earned ? "bg-amber-200" : "bg-slate-200 grayscale"}`}
                        title={`${badge.label}: ${badge.description}`}
                      >
                        {badge.earned ? badge.icon : "🔒"}
                      </span>
                    ))}
                  </div>
                </div>
                <motion.button
                  className="min-h-11 flex-none rounded-full bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-900/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                  onClick={handleComplete}
                  whileHover={{ x: 2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Next <span aria-hidden="true">→</span>
                </motion.button>
              </div>
            </div>
          </section>

          <footer className="rounded-full bg-[#073e39]/[0.92] px-4 py-2 text-center text-[11px] font-bold tracking-wide text-emerald-50 shadow-lg">
            <span className="hidden sm:inline">❤️ Learn with Love&nbsp;&nbsp; • &nbsp;&nbsp;</span>
            🎮 Practice with Fun&nbsp;&nbsp; • &nbsp;&nbsp;📈 Progress with Imaan 🌙
          </footer>
        </div>
      </main>
    </>
  );
}
