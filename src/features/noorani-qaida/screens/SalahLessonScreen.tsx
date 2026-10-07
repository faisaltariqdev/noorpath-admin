"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink, Film, Footprints, Info, MessageSquareText, Pause, Play, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { qaidaAudio } from "../audio/QaidaAudioService";
import type { SalahStep, TopicLesson } from "../types";
import ScenicLearningBackground from "../animations/ScenicLearningBackground";
import SalahPostureStage from "../salah/SalahPostureStage";
import WuduStepDetailCard from "../salah/WuduStepDetailCard";
import FullscreenButton from "../ui/FullscreenButton";

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("?")[0];
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v");
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  }
  return null;
}

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
  const videoIframeRef = useRef<HTMLIFrameElement>(null);
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
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showTeacherNote, setShowTeacherNote] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const movementsOnly = mode === "movements";

  const [activeLessonVideoUrl, setActiveLessonVideoUrl] = useState<string | undefined>(
    lesson.videoPhases?.[0]?.url ?? lesson.videoUrl,
  );

  useEffect(() => {
    setActiveLessonVideoUrl(lesson.videoPhases?.[0]?.url ?? lesson.videoUrl);
    setShowVideoModal(false);
  }, [lesson.id, lesson.videoUrl, lesson.videoPhases]);

  // Resume YouTube video after Google Meet / screen-share briefly hides the page.
  // YouTube's embedded player auto-pauses on visibilitychange → "hidden"; we
  // send a playVideo command when the page becomes visible again so the video
  // keeps playing without the tutor having to tap play repeatedly.
  useEffect(() => {
    if (!showVideoModal) return;
    function onVisibilityChange() {
      if (document.visibilityState === "visible" && videoIframeRef.current) {
        videoIframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: "" }),
          "https://www.youtube-nocookie.com",
        );
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [showVideoModal]);

  const lessonVideoId = useMemo(
    () => extractYouTubeId(activeLessonVideoUrl ?? lesson.videoUrl),
    [activeLessonVideoUrl, lesson.videoUrl],
  );
  const step: SalahStep | undefined = steps[stepIndex];

  // Reset activePartIndex when step changes
  useEffect(() => {
    setActivePartIndex(0);
  }, [step?.id]);

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

  const isLast = stepIndex >= steps.length - 1;
  const progressPct = steps.length ? Math.round(((stepIndex + 1) / steps.length) * 100) : 0;
  const practicedCount = steps.filter((s) => practiced[s.id]).length;

  const speak = useCallback((textToSpeak?: string) => {
    if (!audioEnabled) return;
    const currentPart = step?.recitationParts && activePartIndex >= 0 ? step.recitationParts[activePartIndex] : null;
    const text = typeof textToSpeak === "string" ? textToSpeak : (currentPart ? currentPart.arabic : step?.arabic);
    if (!text) return;
    void qaidaAudio.pronounce({
      key: `salah-${lesson.id}-${step?.id}-${activePartIndex}`,
      fallbackText: text,
      policy: "replace",
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
    });
  }, [audioEnabled, lesson.id, step, activePartIndex]);

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
      className="relative min-h-full w-full max-w-full overflow-x-hidden bg-emerald-50 fullscreen:h-screen fullscreen:overflow-y-auto"
    >
      <ScenicLearningBackground reducedMotion={reducedMotion} />
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-5xl flex-col gap-3.5 p-2.5 sm:p-5">
        {/* Unified Top Command Header */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/80 bg-white/95 p-3 sm:p-4 shadow-sm backdrop-blur-md flex flex-col gap-2.5 w-full max-w-full">
          {/* Row 1: Context & Control Strip (Fully Responsive for Phones & Tablets) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Top row on mobile / Left on desktop: Step Tag, Title & Fullscreen button */}
            <div className="flex items-center justify-between gap-2 min-w-0 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="shrink-0 inline-flex items-center rounded-lg bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-800">
                  Step {step.order}/{steps.length}
                </span>
                <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                  {lesson.title}
                </h1>
                {practicedCount > 0 && (
                  <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 shrink-0">
                    ⭐ {practicedCount} done
                  </span>
                )}
              </div>
              <div className="sm:hidden shrink-0">
                <FullscreenButton
                  targetRef={lessonRef}
                  label={lesson.title}
                  className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 min-h-7 px-2 py-1 text-xs"
                />
              </div>
            </div>

            {/* Controls row: Mode Switcher + Auto-Play + Video + Fullscreen (desktop) */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
              {/* Teaching Mode Toggle */}
              <div
                role="radiogroup"
                aria-label="Teaching mode"
                className="inline-flex rounded-xl bg-slate-100/90 p-0.5 border border-slate-200/80 text-xs font-black shadow-inner shrink-0"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={movementsOnly}
                  onClick={() => changeMode("movements")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-black transition cursor-pointer ${
                    movementsOnly
                      ? "bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-300"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Movements only - copy postures without words"
                >
                  <Footprints size={12} aria-hidden="true" />
                  <span>Movements</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={!movementsOnly}
                  onClick={() => changeMode("words")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-black transition cursor-pointer ${
                    !movementsOnly
                      ? "bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-300"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Add recitation words & meanings"
                >
                  <MessageSquareText size={12} aria-hidden="true" />
                  <span>Words</span>
                </button>
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Watch / Auto-walkthrough */}
                <button
                  type="button"
                  onClick={toggleWatch}
                  aria-pressed={watching}
                  className={`inline-flex min-h-7 sm:min-h-8 items-center gap-1 sm:gap-1.5 rounded-xl px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 cursor-pointer ${
                    watching
                      ? "bg-amber-100 text-amber-900 ring-2 ring-amber-300"
                      : "bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm"
                  }`}
                  title={watching ? "Pause auto-walkthrough" : "Play step-by-step walkthrough"}
                >
                  {watching ? <Pause size={11} aria-hidden="true" /> : <Play size={11} aria-hidden="true" />}
                  <span className="hidden sm:inline">{watching ? "Pause" : "Auto-Walkthrough"}</span>
                  <span className="sm:hidden">{watching ? "Pause" : "Play"}</span>
                </button>

                {/* Overall Lesson Video */}
                {lesson.videoUrl && lessonVideoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setWatching(false);
                      setShowVideoModal(true);
                    }}
                    className="inline-flex min-h-7 sm:min-h-8 items-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-black text-white shadow-sm hover:from-amber-600 hover:to-orange-600 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 cursor-pointer active:scale-95"
                    title={lesson.videoTitle ?? "Watch Video Lesson"}
                  >
                    <Film size={11} aria-hidden="true" />
                    <span className="hidden sm:inline">Watch Video</span>
                    <span className="sm:hidden">Video</span>
                    <span className="rounded-full bg-white/25 px-1 sm:px-1.5 py-0.2 text-[9px] font-black uppercase">
                      HD
                    </span>
                  </button>
                )}

                <div className="hidden sm:inline-flex">
                  <FullscreenButton
                    targetRef={lessonRef}
                    label={lesson.title}
                    className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 min-h-8 px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thin Integrated Progress Bar */}
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-100/70"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.35 }}
            />
          </div>

          {/* Step Navigation Pill Strip */}
          <nav className="qaida-scroll flex items-center gap-1.5 overflow-x-auto py-0.5" aria-label="Namaz steps">
            {steps.map((item, index) => {
              const active = index === stepIndex;
              const done = index < stepIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`flex-none inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-black transition cursor-pointer ${
                    active
                      ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300"
                      : done
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100"
                      : "bg-slate-50 text-slate-600 border border-slate-200/70 hover:bg-slate-100"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-black ${
                      active
                        ? "bg-white text-emerald-800"
                        : done
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {done ? "✓" : item.order}
                  </span>
                  <span className="truncate max-w-[8rem] sm:max-w-[12rem]">{item.title}</span>
                  {practiced[item.id] && <span className="text-[10px]">⭐</span>}
                  {item.videoUrl && <span className="text-[10px]">🎬</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lesson Video Spotlight Card */}
        {lesson.videoUrl && lessonVideoId && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50/70 p-3 sm:p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                <Film size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/90 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-amber-900 uppercase tracking-wider">
                    🎬 Video Guide
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-950 truncate">
                    {lesson.videoTitle ?? "Lesson Video Guide"}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-700 leading-snug line-clamp-2 sm:line-clamp-none">
                  {lesson.videoDescription ?? "Engaging visual guidance and step-by-step video practice for students."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 shrink-0 w-full sm:w-auto">
              {lesson.videoPhases && lesson.videoPhases.length > 1 ? (
                lesson.videoPhases.map((phase, idx) => {
                  const shortLabel = phase.label.includes("(Video A)") || phase.label.includes("Video A")
                    ? "Video (A)"
                    : phase.label.includes("(Video B)") || phase.label.includes("Video B")
                    ? "Video (B)"
                    : phase.label;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setWatching(false);
                        setActiveLessonVideoUrl(phase.url);
                        setShowVideoModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-2.5 sm:px-3.5 py-2 text-xs font-black text-white hover:from-amber-700 hover:to-orange-700 transition cursor-pointer shadow-sm active:scale-95"
                    >
                      <Play size={11} fill="currentColor" aria-hidden="true" />
                      <span className="sm:hidden">{shortLabel}</span>
                      <span className="hidden sm:inline">{phase.label}</span>
                    </button>
                  );
                })
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setWatching(false);
                    setShowVideoModal(true);
                  }}
                  className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-xs font-black text-white hover:from-amber-700 hover:to-orange-700 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <Play size={13} fill="currentColor" aria-hidden="true" />
                  <span>Watch Video</span>
                </button>
              )}
            </div>
          </div>
        )}

        <section className="grid gap-3.5 sm:gap-4 lg:grid-cols-12 items-start w-full max-w-full">
          {/* Posture Stage & Visual Cue */}
          <div className="min-w-0 max-w-full w-full flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-white/80 bg-white/95 p-3 sm:p-4 shadow-sm backdrop-blur-md lg:col-span-6">
            <SalahPostureStage
              step={step}
              reducedMotion={reducedMotion}
              practiced={Boolean(practiced[step.id])}
              onInteract={() => setWatching(false)}
              onPracticed={(id) => setPracticed((prev) => ({ ...prev, [id]: true }))}
            />
            {step.visualCue && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-xs leading-relaxed text-slate-800 break-words">
                <span className="font-black text-emerald-800 shrink-0">Look:</span>
                <span className="break-words">{step.visualCue}</span>
              </div>
            )}
          </div>

          <AnimatePresence initial={false}>
          <motion.div
            key={`${step.id}-${mode}`}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="min-w-0 max-w-full w-full flex flex-col gap-3.5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-white/80 bg-white/95 p-3 sm:p-5 shadow-sm backdrop-blur-md lg:col-span-6"
          >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                    {step.arabicTitle ?? "Action"}
                  </p>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">{step.title}</h2>
                </div>
              </div>

              {movementsOnly ? (
                <div className="flex flex-1 flex-col justify-center gap-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-center">
                  <Footprints size={30} aria-hidden="true" className="mx-auto text-emerald-600" />
                  <div>
                    <p className="text-sm font-black text-emerald-900">Movements only — no words yet</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700">
                      Watch the 3D picture, then copy the body shape.
                      {step.arabic ? " When comfortable, switch to add the words." : ""}
                    </p>
                  </div>
                  {step.arabic && (
                    <button
                      type="button"
                      onClick={() => changeMode("words")}
                      className="mx-auto inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-black text-emerald-800 transition hover:bg-emerald-100 cursor-pointer shadow-xs"
                    >
                      <MessageSquareText size={13} aria-hidden="true" />
                      <span>Add the words →</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* If step has multiple parts: sleek horizontal chips selector */}
                  {step.recitationParts && step.recitationParts.length > 0 && (
                    <div className="qaida-scroll flex items-center gap-1.5 overflow-x-auto py-0.5" aria-label="Recitation parts">
                      {step.recitationParts.map((part, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePartIndex(idx)}
                          className={`shrink-0 inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black transition cursor-pointer ${
                            activePartIndex === idx
                              ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300"
                              : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/60"
                          }`}
                        >
                          <span>Part {idx + 1}</span>
                          <span className="hidden sm:inline font-medium text-[11px] opacity-90">
                            · {part.title.replace(/^\d+\.\s*/, "")}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setActivePartIndex(-1)}
                        className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-black transition cursor-pointer ${
                          activePartIndex === -1
                            ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
                        }`}
                      >
                        All Combined
                      </button>
                    </div>
                  )}

                  {/* ACTIVE PART OR SINGLE STEP ARABIC CARD (HERO - AT THE TOP, LEVEL WITH 3D IMAGE) */}
                  {(() => {
                    const hasParts = Boolean(step.recitationParts && step.recitationParts.length > 0);
                    const isAllCombined = hasParts && activePartIndex === -1;
                    const curPart = hasParts && activePartIndex >= 0 ? step.recitationParts?.[activePartIndex] : null;

                    if (isAllCombined && step.recitationParts) {
                      return (
                        <div className="flex flex-col gap-2.5 max-h-[28rem] overflow-y-auto qaida-scroll pr-1">
                          {step.recitationParts.map((part, pIdx) => {
                            const isPartArabic = /[\u0600-\u06FF]/.test(part.arabic);
                            return (
                              <div
                                key={pIdx}
                                className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-yellow-50/30 p-3 shadow-2xs"
                              >
                                <div className="flex items-center justify-between border-b border-amber-100 pb-1 mb-1.5">
                                  <span className="text-xs font-black text-emerald-900">{part.title}</span>
                                  <button
                                    type="button"
                                    onClick={() => speak(part.arabic)}
                                    className="text-[11px] font-bold text-amber-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Volume2 size={12} className="text-amber-700" />
                                    <span>Listen</span>
                                  </button>
                                </div>
                                <p
                                  className={
                                    isPartArabic
                                      ? "qaida-arabic text-xl leading-loose text-center text-emerald-950 my-1"
                                      : "text-base sm:text-lg font-black text-center text-emerald-950 my-1 tracking-wide"
                                  }
                                  lang={isPartArabic ? "ar" : "en"}
                                  dir={isPartArabic ? "rtl" : "ltr"}
                                >
                                  {part.arabic}
                                </p>
                                <p className="mt-1.5 text-xs font-black text-slate-700 leading-relaxed">{part.transliteration}</p>
                                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{part.translation}</p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    const arabicText = curPart ? curPart.arabic : step.arabic;
                    const transliterationText = curPart ? curPart.transliteration : step.transliteration;
                    const translationText = curPart ? curPart.translation : step.translation;
                    const instructionText = curPart?.instruction;

                    if (arabicText) {
                      const isArabic = /[\u0600-\u06FF]/.test(arabicText);
                      return (
                        <div className="flex flex-col gap-2.5">
                          {/* Hero Recitation / Formula Card */}
                          <button
                            type="button"
                            onClick={() => speak(arabicText)}
                            className="w-full max-w-full rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/40 p-3 sm:p-4 text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 group shadow-xs transition hover:border-amber-400 cursor-pointer"
                            aria-label={`Hear recitation`}
                          >
                            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-200/60 text-xs">
                              <span className="font-black uppercase tracking-wider text-emerald-800 text-[10px] sm:text-[11px] truncate mr-2">
                                {curPart ? curPart.title : isArabic ? (step.arabicTitle ?? "Recitation") : (step.title ?? "Breakdown")}
                              </span>
                              <span className="font-bold text-amber-800 group-hover:underline inline-flex items-center gap-1 shrink-0">
                                <Volume2 size={13} className="text-amber-700 animate-pulse shrink-0" />
                                <span>{isArabic ? "Pronounce" : "Listen"}</span>
                              </span>
                            </div>

                            <motion.p
                              className={
                                isArabic
                                  ? "qaida-arabic qaida-arabic-recitation w-full text-emerald-950 leading-loose my-2 select-all text-xl sm:text-2xl break-words"
                                  : "w-full text-center text-emerald-950 font-black text-lg sm:text-2xl leading-normal my-2 select-all tracking-wide break-words"
                              }
                              lang={isArabic ? "ar" : "en"}
                              dir={isArabic ? "rtl" : "ltr"}
                              animate={isPlaying && !reducedMotion ? { scale: [1, 1.025, 1] } : undefined}
                            >
                              {arabicText}
                            </motion.p>

                            {transliterationText && (
                              <p className="mt-2.5 whitespace-normal border-t border-amber-200/70 pt-2 text-left text-xs sm:text-sm font-black leading-relaxed text-slate-700 break-words" dir="ltr">
                                {transliterationText}
                              </p>
                            )}
                          </button>

                          {/* Collapsible Info Drawers */}
                          <div className="flex flex-col gap-2 pt-0.5">
                            {/* Meaning & Rule Drawer */}
                            {(translationText || instructionText) && (
                              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 overflow-hidden transition">
                                <button
                                  type="button"
                                  onClick={() => setShowMeaning((prev) => !prev)}
                                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-black text-emerald-900 hover:bg-emerald-100/70 transition cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Info size={13} className="text-emerald-700" />
                                    <span>Meaning & Recitation Rule</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                    <span>{showMeaning ? "Collapse" : "Expand info"}</span>
                                    {showMeaning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </span>
                                </button>

                                <AnimatePresence initial={false}>
                                  {showMeaning && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="overflow-hidden border-t border-emerald-100/80 p-3 flex flex-col gap-2 text-xs"
                                    >
                                      {instructionText && (
                                        <div className="rounded-lg bg-amber-50 border border-amber-200/80 p-2 text-amber-950">
                                          <strong className="text-amber-900 block mb-0.5">Recitation Rule:</strong>
                                          <span>{instructionText}</span>
                                        </div>
                                      )}
                                      {translationText && (
                                        <div>
                                          <strong className="text-emerald-950 block mb-0.5">English Translation:</strong>
                                          <p className="text-slate-700 leading-relaxed">{translationText}</p>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            {/* Teacher Note Drawer */}
                            {step.teacherNote && (
                              <div className="rounded-xl border border-sky-100 bg-sky-50/60 overflow-hidden transition">
                                <button
                                  type="button"
                                  onClick={() => setShowTeacherNote((prev) => !prev)}
                                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-black text-sky-950 hover:bg-sky-100/70 transition cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Info size={13} className="text-sky-700" />
                                    <span>Teacher Guidance Note</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700">
                                    <span>{showTeacherNote ? "Collapse" : "Expand note"}</span>
                                    {showTeacherNote ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </span>
                                </button>

                                <AnimatePresence initial={false}>
                                  {showTeacherNote && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="overflow-hidden border-t border-sky-100/80 p-3 text-xs text-sky-950 leading-relaxed"
                                    >
                                      {step.teacherNote}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // For posture steps without Arabic (action only)
                    return (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-2xs">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                          What to do
                        </p>
                        <p className="mt-2 whitespace-normal text-sm leading-relaxed text-slate-800" dir="ltr">
                          {step.translation}
                        </p>
                      </div>
                    );
                  })()}
                </>
              )}

              <WuduStepDetailCard step={step} reducedMotion={reducedMotion} />
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

        <div className="flex items-center justify-between gap-2.5 pb-4 w-full max-w-full">
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={() => goTo(Math.max(0, stepIndex - 1))}
            className="qaida-premium-button min-h-10 sm:min-h-11 border border-slate-200 bg-white px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={() => goTo(Math.min(steps.length - 1, stepIndex + 1))}
              className="qaida-premium-button min-h-10 sm:min-h-11 bg-emerald-700 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-white"
            >
              Next step →
            </button>
          ) : (
            <motion.button
              type="button"
              onClick={onComplete}
              whileHover={reducedMotion ? undefined : { y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="qaida-premium-button min-h-11 sm:min-h-12 bg-gradient-to-r from-emerald-600 to-teal-700 px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-black text-white shadow-xl"
            >
              Complete · 25 XP
            </motion.button>
          )}
        </div>
      </div>

      {/* Full Cartoon Video Modal */}
      <AnimatePresence>
        {showVideoModal && lessonVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideoModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col w-full max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 border border-amber-300/40 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xs">
                    <Film size={16} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-white truncate">
                      {lesson.videoTitle ?? "Lesson Video Guide"}
                    </h3>
                    <p className="text-[10px] font-bold text-amber-400 truncate">
                      Interactive Video Practice • {lesson.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(false)}
                    className="rounded-xl bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                    aria-label="Close video dialog"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Multiple Video Tabs Selector if videoPhases present */}
              {lesson.videoPhases && lesson.videoPhases.length > 1 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">Select Video:</span>
                  {lesson.videoPhases.map((phase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveLessonVideoUrl(phase.url)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-black transition cursor-pointer shrink-0 ${
                        activeLessonVideoUrl === phase.url
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {phase.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Video Player Frame */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  ref={videoIframeRef}
                  src={`https://www.youtube-nocookie.com/embed/${lessonVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                  title={lesson.videoTitle ?? "Lesson video player"}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Modal Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950/90 px-4 py-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-[11px] min-w-0">
                  <span className="shrink-0 rounded-full bg-emerald-900/60 border border-emerald-500/40 px-2 py-0.5 font-bold text-emerald-300">
                    🎬 Video Guide
                  </span>
                  <span className="hidden sm:inline text-slate-400 truncate">
                    {lesson.videoDescription ?? "Teaches students step-by-step through engaging visual guidance"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {lessonVideoId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${lessonVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-black text-white shadow-xs transition active:scale-95"
                    >
                      <ExternalLink size={13} />
                      <span>Open in YouTube App</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(false)}
                    className="rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-black text-white hover:bg-emerald-600 transition cursor-pointer"
                  >
                    Back to Steps
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
