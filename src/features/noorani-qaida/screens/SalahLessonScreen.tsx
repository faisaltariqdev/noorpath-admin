"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import { qaidaAudio } from "../audio/QaidaAudioService";
import type { SalahPosture, SalahStep, TopicLesson } from "../types";
import ScenicLearningBackground from "../animations/ScenicLearningBackground";
import FullscreenButton from "../ui/FullscreenButton";

interface SalahLessonScreenProps {
  lesson: TopicLesson;
  reducedMotion: boolean;
  audioEnabled: boolean;
  onComplete: () => void;
}

const POSTURE_LABEL: Record<SalahPosture, string> = {
  overview: "Prepare",
  standing: "Standing (Qiyam)",
  takbir: "Takbir",
  bowing: "Bowing (Ruku)",
  rising: "Rising",
  prostration: "Prostration (Sujood)",
  sitting: "Sitting (Jalsa)",
  salam: "Salam",
  "wudu-hands": "Wash hands",
  "wudu-mouth": "Rinse mouth",
  "wudu-nose": "Clean nose",
  "wudu-face": "Wash face",
  "wudu-arms": "Wash arms",
  "wudu-head": "Wipe head",
  "wudu-ears": "Wipe ears",
  "wudu-feet": "Wash feet",
};

/** Simple silhouette illustrations for prayer / wudu postures */
function PostureVisual({ posture }: { posture: SalahPosture }) {
  const common = "fill-emerald-800/90 stroke-emerald-950 stroke-[1.5]";
  switch (posture) {
    case "takbir":
      return (
        <svg viewBox="0 0 120 160" className="h-40 w-32" aria-hidden="true">
          <circle cx="60" cy="28" r="14" className={common} />
          <path d="M60 42 v48" className={`${common} fill-none`} />
          <path d="M60 55 L28 38 M60 55 L92 38" className={`${common} fill-none`} />
          <path d="M60 90 L42 140 M60 90 L78 140" className={`${common} fill-none`} />
        </svg>
      );
    case "bowing":
      return (
        <svg viewBox="0 0 120 160" className="h-40 w-32" aria-hidden="true">
          <circle cx="48" cy="42" r="14" className={common} />
          <path d="M48 56 L78 78" className={`${common} fill-none`} />
          <path d="M58 68 L38 72 M58 68 L78 58" className={`${common} fill-none`} />
          <path d="M78 78 L62 140 M78 78 L94 140" className={`${common} fill-none`} />
        </svg>
      );
    case "prostration":
      return (
        <svg viewBox="0 0 140 120" className="h-36 w-40" aria-hidden="true">
          <ellipse cx="70" cy="98" rx="48" ry="8" className="fill-emerald-200/80" />
          <circle cx="42" cy="72" r="12" className={common} />
          <path d="M52 78 L90 70 L110 88" className={`${common} fill-none`} />
          <path d="M70 74 L55 98 M70 74 L88 98" className={`${common} fill-none`} />
          <path d="M90 70 L100 98" className={`${common} fill-none`} />
        </svg>
      );
    case "sitting":
      return (
        <svg viewBox="0 0 120 140" className="h-36 w-32" aria-hidden="true">
          <circle cx="60" cy="32" r="14" className={common} />
          <path d="M60 46 v36" className={`${common} fill-none`} />
          <path d="M60 60 L40 78 M60 60 L80 78" className={`${common} fill-none`} />
          <path d="M45 82 H75 L82 110 H38 Z" className={`${common} fill-emerald-700/40`} />
        </svg>
      );
    case "salam":
      return (
        <svg viewBox="0 0 120 160" className="h-40 w-32" aria-hidden="true">
          <circle cx="60" cy="28" r="14" className={common} />
          <path d="M60 42 v48" className={`${common} fill-none`} />
          <path d="M60 58 L44 78 M60 58 L76 78" className={`${common} fill-none`} />
          <path d="M60 90 L46 140 M60 90 L74 140" className={`${common} fill-none`} />
          <path d="M74 22 Q98 28 88 48" className="fill-none stroke-amber-500 stroke-2" />
        </svg>
      );
    case "rising":
    case "standing":
      return (
        <svg viewBox="0 0 120 160" className="h-40 w-32" aria-hidden="true">
          <circle cx="60" cy="28" r="14" className={common} />
          <path d="M60 42 v48" className={`${common} fill-none`} />
          <path d="M60 58 L44 88 M60 58 L76 88" className={`${common} fill-none`} />
          <path d="M60 90 L46 140 M60 90 L74 140" className={`${common} fill-none`} />
        </svg>
      );
    case "wudu-hands":
      return (
        <svg viewBox="0 0 120 120" className="h-36 w-36" aria-hidden="true">
          <ellipse cx="60" cy="70" rx="36" ry="28" className="fill-sky-100 stroke-sky-400 stroke-2" />
          <path d="M40 55 Q50 35 60 50 Q70 35 80 55" className={`${common} fill-none`} />
          <circle cx="48" cy="48" r="3" className="fill-sky-400" />
          <circle cx="72" cy="48" r="3" className="fill-sky-400" />
        </svg>
      );
    case "wudu-face":
      return (
        <svg viewBox="0 0 120 120" className="h-36 w-36" aria-hidden="true">
          <circle cx="60" cy="55" r="28" className={`${common} fill-emerald-100`} />
          <circle cx="50" cy="50" r="3" className="fill-emerald-900" />
          <circle cx="70" cy="50" r="3" className="fill-emerald-900" />
          <path d="M52 66 Q60 72 68 66" className="fill-none stroke-emerald-900 stroke-2" />
          <path d="M40 30 Q60 18 80 30" className="fill-none stroke-sky-400 stroke-2" />
        </svg>
      );
    case "wudu-arms":
      return (
        <svg viewBox="0 0 140 100" className="h-32 w-40" aria-hidden="true">
          <path d="M20 50 H120" className={`${common} fill-none stroke-[8] stroke-linecap-round`} />
          <circle cx="28" cy="50" r="10" className={common} />
          <path d="M50 35 Q70 20 90 35" className="fill-none stroke-sky-400 stroke-2" />
        </svg>
      );
    case "wudu-feet":
      return (
        <svg viewBox="0 0 140 100" className="h-32 w-40" aria-hidden="true">
          <ellipse cx="50" cy="62" rx="22" ry="12" className={common} />
          <ellipse cx="95" cy="62" rx="22" ry="12" className={common} />
          <path d="M40 40 Q70 28 100 40" className="fill-none stroke-sky-400 stroke-2" />
        </svg>
      );
    case "wudu-mouth":
    case "wudu-nose":
    case "wudu-head":
    case "wudu-ears":
    case "overview":
    default:
      return (
        <svg viewBox="0 0 120 140" className="h-36 w-32" aria-hidden="true">
          <circle cx="60" cy="36" r="16" className={`${common} fill-emerald-100`} />
          <path d="M60 52 v40" className={`${common} fill-none`} />
          <path d="M60 68 L38 92 M60 68 L82 92" className={`${common} fill-none`} />
          <path d="M60 92 L48 128 M60 92 L72 128" className={`${common} fill-none`} />
          <circle cx="60" cy="20" r="4" className="fill-amber-400" />
        </svg>
      );
  }
}

export default function SalahLessonScreen({
  lesson,
  reducedMotion,
  audioEnabled,
  onComplete,
}: SalahLessonScreenProps) {
  const lessonRef = useRef<HTMLElement>(null);
  const steps = useMemo(
    () => [...(lesson.steps ?? [])].sort((a, b) => a.order - b.order),
    [lesson.steps],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step: SalahStep | undefined = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;
  const progressPct = steps.length ? Math.round(((stepIndex + 1) / steps.length) * 100) : 0;

  const speak = useCallback(() => {
    if (!audioEnabled || !step?.arabic) return;
    void qaidaAudio.pronounce({
      key: `salah-${lesson.id}-${step.id}`,
      fallbackText: step.arabic,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
    });
  }, [audioEnabled, lesson.id, step]);

  if (!step) {
    return (
      <main className="flex min-h-full items-center justify-center bg-emerald-50 p-6">
        <p className="text-sm font-bold text-slate-600">This Namaz lesson has no steps yet.</p>
      </main>
    );
  }

  return (
    <main
      ref={lessonRef}
      className="relative min-h-full overflow-x-hidden bg-emerald-50 fullscreen:h-screen fullscreen:overflow-y-auto"
    >
      <ScenicLearningBackground reducedMotion={reducedMotion} />
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-5xl flex-col gap-4 p-3 sm:p-5">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600">
              Namaz · Step {step.order} of {steps.length}
            </p>
            <h1 className="truncate text-lg font-black text-slate-900">{lesson.title}</h1>
          </div>
          <FullscreenButton
            targetRef={lessonRef}
            label={lesson.title}
            className="border border-emerald-900/10 bg-white text-emerald-800"
          />
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-emerald-100" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.35 }}
          />
        </div>

        <nav className="qaida-scroll flex gap-2 overflow-x-auto pb-1" aria-label="Namaz steps">
          {steps.map((item, index) => {
            const active = index === stepIndex;
            const done = index < stepIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStepIndex(index)}
                className={`flex min-w-[7.5rem] flex-none flex-col rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                  active
                    ? "border-emerald-500 bg-emerald-50 shadow-md"
                    : done
                      ? "border-teal-200 bg-teal-50/80"
                      : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
                aria-current={active ? "step" : undefined}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Step {item.order}
                </span>
                <span className="truncate text-xs font-black text-slate-800">{item.title}</span>
              </button>
            );
          })}
        </nav>

        <AnimatePresence mode="wait">
          <motion.section
            key={step.id}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="grid gap-4 lg:grid-cols-12"
          >
            <div className="flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-white/80 bg-gradient-to-b from-white via-emerald-50/80 to-teal-50 p-6 shadow-lg lg:col-span-5">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                Visual posture
              </p>
              <div className="flex h-48 w-full items-center justify-center rounded-3xl border border-emerald-100 bg-white/70">
                <PostureVisual posture={step.posture} />
              </div>
              <p className="text-center text-sm font-black text-emerald-900">
                {POSTURE_LABEL[step.posture]}
              </p>
              <p className="text-center text-xs leading-relaxed text-slate-600">{step.visualCue}</p>
            </div>

            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-lg lg:col-span-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                  {step.arabicTitle ?? "Action"}
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{step.title}</h2>
              </div>

              {step.arabic ? (
                <button
                  type="button"
                  onClick={speak}
                  className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-yellow-50 px-5 py-5 text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                  aria-label={step.transliteration ? `Hear ${step.transliteration}` : "Hear Arabic"}
                >
                  <motion.p
                    className="qaida-arabic text-3xl font-black leading-[1.55] text-emerald-900 sm:text-4xl"
                    lang="ar"
                    dir="rtl"
                    animate={isPlaying && !reducedMotion ? { scale: [1, 1.03, 1] } : undefined}
                  >
                    {step.arabic}
                  </motion.p>
                  {step.transliteration ? (
                    <p className="mt-3 border-t border-amber-200/80 pt-3 text-sm font-black text-slate-700" dir="ltr">
                      {step.transliteration}
                    </p>
                  ) : null}
                </button>
              ) : null}

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                  English translation
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-800" dir="ltr">
                  {step.translation}
                </p>
              </div>

              {step.teacherNote ? (
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-sky-700">Teacher note</p>
                  <p className="mt-1 text-xs text-sky-950">{step.teacherNote}</p>
                </div>
              ) : null}
            </div>
          </motion.section>
        </AnimatePresence>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">For the child</p>
            <p className="mt-1 text-sm text-emerald-950">{lesson.childExplanation}</p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-amber-700">Parent tip</p>
            <p className="mt-1 text-sm text-amber-950">{lesson.parentTip}</p>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
            className="qaida-premium-button min-h-11 border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))}
              className="qaida-premium-button min-h-11 bg-emerald-700 px-6 py-2.5 text-sm font-black text-white"
            >
              Next step →
            </button>
          ) : (
            <motion.button
              type="button"
              onClick={onComplete}
              whileHover={reducedMotion ? undefined : { y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="qaida-premium-button min-h-12 bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-3 text-base font-black text-white shadow-xl"
            >
              Complete lesson · Earn 25 XP
            </motion.button>
          )}
        </div>
      </div>
    </main>
  );
}
