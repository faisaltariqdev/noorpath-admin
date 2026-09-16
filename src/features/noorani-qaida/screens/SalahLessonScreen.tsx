"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Footprints, MessageSquareText, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { qaidaAudio } from "../audio/QaidaAudioService";
import type { SalahStep, TopicLesson } from "../types";
import ScenicLearningBackground from "../animations/ScenicLearningBackground";
import SalahPostureStage from "../salah/SalahPostureStage";
import FullscreenButton from "../ui/FullscreenButton";

/** Seconds each step stays on screen in Watch mode (longer when there is Arabic to read). */
const WATCH_SECONDS_SHORT = 3.5;
const WATCH_SECONDS_ARABIC = 6;

/**
 * Teaching mode — "At first, focus only on movements. Once your child is
 * comfortable, slowly add the words."
 *  - movements: Arabic / transliteration hidden; child copies the body only.
 *  - words:     full lesson with Arabic, transliteration and meaning.
 */
type TeachingMode = "movements" | "words";
const MODE_STORAGE_KEY = "qaida-namaz-teaching-mode";

function readStoredMode(): TeachingMode {
  try {
    return window.localStorage.getItem(MODE_STORAGE_KEY) === "movements" ? "movements" : "words";
  } catch {
    return "words";
  }
}

interface SalahLessonScreenProps {
  lesson: TopicLesson;
  reducedMotion: boolean;
  audioEnabled: boolean;
  onComplete: () => void;
  /** Optional starting step (0-based). Used by the dev preview harness. */
  initialStepIndex?: number;
}

export default function SalahLessonScreen({
  lesson,
  reducedMotion,
  audioEnabled,
  onComplete,
  initialStepIndex = 0,
}: SalahLessonScreenProps) {
  const lessonRef = useRef<HTMLElement>(null);
  const steps = useMemo(
    () => [...(lesson.steps ?? [])].sort((a, b) => a.order - b.order),
    [lesson.steps],
  );
  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(Math.max(0, initialStepIndex), Math.max(0, (lesson.steps?.length ?? 1) - 1)),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [watching, setWatching] = useState(false);
  const [practiced, setPracticed] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<TeachingMode>("words");
  const movementsOnly = mode === "movements";

  // Restore the parent's last choice after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    setMode(readStoredMode());
  }, []);

  const changeMode = useCallback((next: TeachingMode) => {
    setMode(next);
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, []);

  const step: SalahStep | undefined = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;
  const progressPct = steps.length ? Math.round(((stepIndex + 1) / steps.length) * 100) : 0;
  const practicedCount = steps.filter((s) => practiced[s.id]).length;

  const speak = useCallback(() => {
    if (!audioEnabled || !step?.arabic) return;
    void qaidaAudio.pronounce({
      key: `salah-${lesson.id}-${step.id}`,
      fallbackText: step.arabic,
      policy: "replace",
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
    });
  }, [audioEnabled, lesson.id, step]);

  // Watch mode: auto-advance through the steps so the child sees the whole
  // movement flow (stand → bow → rise → prostrate → sit → salam) animated.
  useEffect(() => {
    if (!watching || !step) return;
    const withWords = Boolean(step.arabic) && !movementsOnly;
    if (audioEnabled && withWords) speak();
    const seconds = withWords ? WATCH_SECONDS_ARABIC : WATCH_SECONDS_SHORT;
    const t = window.setTimeout(() => {
      if (stepIndex >= steps.length - 1) {
        setWatching(false);
      } else {
        setStepIndex((v) => v + 1);
      }
    }, seconds * 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watching, stepIndex]);

  const goTo = useCallback((index: number) => {
    setWatching(false);
    setStepIndex(index);
  }, []);

  const toggleWatch = useCallback(() => {
    if (watching) {
      setWatching(false);
      return;
    }
    // Restart from the beginning when the lesson is already on the last step.
    if (stepIndex >= steps.length - 1) setStepIndex(0);
    setWatching(true);
  }, [watching, stepIndex, steps.length]);

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
              {practicedCount > 0 ? (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 normal-case tracking-normal text-amber-800">
                  ⭐ {practicedCount} practised
                </span>
              ) : null}
            </p>
            <h1 className="truncate text-lg font-black text-slate-900">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleWatch}
              aria-pressed={watching}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                watching
                  ? "bg-amber-100 text-amber-900 ring-2 ring-amber-300"
                  : "bg-emerald-700 text-white shadow-md hover:bg-emerald-800"
              }`}
            >
              {watching ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
              <span className="hidden sm:inline">{watching ? "Pause" : "Watch the whole movement"}</span>
              <span className="sm:hidden">{watching ? "Pause" : "Watch"}</span>
            </button>
            <FullscreenButton
              targetRef={lessonRef}
              label={lesson.title}
              className="border border-emerald-900/10 bg-white text-emerald-800"
            />
          </div>
        </div>

        {/* Teaching mode: movements first → then the words */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <div
            role="radiogroup"
            aria-label="Teaching mode"
            className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 p-1"
          >
            <button
              type="button"
              role="radio"
              aria-checked={movementsOnly}
              onClick={() => changeMode("movements")}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                movementsOnly ? "bg-emerald-700 text-white shadow" : "text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <Footprints size={14} aria-hidden="true" />
              1 · Movements first
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!movementsOnly}
              onClick={() => changeMode("words")}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                !movementsOnly ? "bg-emerald-700 text-white shadow" : "text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <MessageSquareText size={14} aria-hidden="true" />
              2 · Add the words
            </button>
          </div>
          <p className="text-[11px] font-bold leading-snug text-slate-600">
            {movementsOnly
              ? "Focus only on the movements. Once your child is comfortable, switch to add the words."
              : "Words on. If your child is still learning the body shapes, go back to movements first."}
          </p>
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
                onClick={() => goTo(index)}
                className={`flex min-w-[7.5rem] flex-none flex-col rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                  active
                    ? "border-emerald-500 bg-emerald-50 shadow-md"
                    : done
                      ? "border-teal-200 bg-teal-50/80"
                      : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
                aria-current={active ? "step" : undefined}
              >
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Step {item.order}
                  {item.arabic ? (
                    <span
                      className={`ml-auto rounded-full px-1.5 py-px text-[9px] font-black normal-case tracking-normal ${
                        movementsOnly ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-800"
                      }`}
                      title={movementsOnly ? "Has words — hidden in movements mode" : "Has words"}
                    >
                      {movementsOnly ? "words later" : "words"}
                    </span>
                  ) : null}
                </span>
                <span className="truncate text-xs font-black text-slate-800">
                  {practiced[item.id] ? "⭐ " : ""}
                  {item.title}
                </span>
              </button>
            );
          })}
        </nav>

        <section className="grid gap-4 lg:grid-cols-12">
          {/*
           * The posture stage is NOT keyed on step.id so the figure stays mounted and
           * springs from one posture into the next (the movement is the lesson).
           */}
          <div className="flex flex-col rounded-[1.75rem] border border-white/80 bg-gradient-to-b from-white via-emerald-50/80 to-teal-50 p-4 shadow-lg lg:col-span-6">
            <SalahPostureStage
              step={step}
              reducedMotion={reducedMotion}
              practiced={Boolean(practiced[step.id])}
              onInteract={() => setWatching(false)}
              onPracticed={(id) => setPracticed((prev) => ({ ...prev, [id]: true }))}
            />
            <p className="mt-3 rounded-2xl border border-emerald-100 bg-white/80 px-3 py-2 text-center text-xs leading-relaxed text-slate-700">
              <span className="font-black text-emerald-700">Look: </span>
              {step.visualCue}
            </p>
          </div>

          <AnimatePresence mode="wait">
          <motion.div
            key={`${step.id}-${mode}`}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="flex flex-col gap-4 rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-lg lg:col-span-6"
          >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                  {step.arabicTitle ?? "Action"}
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{step.title}</h2>
              </div>

              {movementsOnly ? (
                <div className="flex flex-1 flex-col justify-center gap-4 rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-5 text-center">
                  <Footprints size={34} aria-hidden="true" className="mx-auto text-emerald-600" />
                  <div>
                    <p className="text-base font-black text-emerald-900">Movements only — no words yet</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      Watch the picture, then copy the body shape. Say nothing for now.
                      {step.arabic ? " The words for this step are waiting for when you're ready." : ""}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-slate-600">Teacher: demonstrate slowly, freeze at the posture, let the child mirror you.</p>
                  {step.arabic ? (
                    <button
                      type="button"
                      onClick={() => changeMode("words")}
                      className="mx-auto inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-black text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                    >
                      <MessageSquareText size={14} aria-hidden="true" />
                      Comfortable? Add the words →
                    </button>
                  ) : null}
                </div>
              ) : null}

              {step.arabic && !movementsOnly ? (
                <button
                  type="button"
                  onClick={speak}
                  className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-yellow-50 px-5 py-5 text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                  aria-label={step.transliteration ? `Hear ${step.transliteration}` : "Hear Arabic"}
                >
                  <motion.p
                    className="qaida-arabic qaida-arabic-recitation w-full text-emerald-900"
                    lang="ar"
                    dir="rtl"
                    animate={isPlaying && !reducedMotion ? { scale: [1, 1.03, 1] } : undefined}
                  >
                    {step.arabic}
                  </motion.p>
                  {step.transliteration ? (
                    <p className="mt-3 whitespace-normal border-t border-amber-200/80 pt-3 text-left text-sm font-black leading-relaxed text-slate-700" dir="ltr">
                      {step.transliteration}
                    </p>
                  ) : null}
                </button>
              ) : null}

              {/* In movements mode the meaning of the Arabic is hidden too; pure action steps stay visible. */}
              {!movementsOnly || !step.arabic ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                    {step.arabic ? "English translation" : "What to do"}
                  </p>
                  <p className="mt-2 whitespace-normal text-sm leading-relaxed text-slate-800" dir="ltr">
                    {step.translation}
                  </p>
                </div>
              ) : null}

              {step.teacherNote ? (
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-sky-700">Teacher note</p>
                  <p className="mt-1 text-xs text-sky-950">{step.teacherNote}</p>
                </div>
              ) : null}
          </motion.div>
          </AnimatePresence>
        </section>

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
            onClick={() => goTo(Math.max(0, stepIndex - 1))}
            className="qaida-premium-button min-h-11 border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={() => goTo(Math.min(steps.length - 1, stepIndex + 1))}
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
