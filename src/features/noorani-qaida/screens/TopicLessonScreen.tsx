"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { LETTERS } from "../data/curriculum";
import { qaidaAudio, type PronunciationMode } from "../audio/QaidaAudioService";
import type { TopicLesson } from "../types";
import ScenicLearningBackground from "../animations/ScenicLearningBackground";
import SparkleBurst from "../animations/SparkleBurst";
import ZaydMascot, { type ZaydAction } from "../characters/ZaydMascot";
import ExampleTile from "../ui/ExampleTile";
import FullscreenButton from "../ui/FullscreenButton";
import { useRef } from "react";

const TracingCanvas = dynamic(() => import("../ui/TracingCanvas"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-2xl bg-emerald-50" />,
});

interface TopicLessonScreenProps {
  lesson: TopicLesson;
  reducedMotion: boolean;
  audioEnabled: boolean;
  onComplete: () => void;
}

export default function TopicLessonScreen({
  lesson,
  reducedMotion,
  audioEnabled,
  onComplete,
}: TopicLessonScreenProps) {
  const lessonRef = useRef<HTMLElement>(null);
  const [activeExample, setActiveExample] = useState(lesson.examples[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [mascotAction, setMascotAction] = useState<ZaydAction>("wave");
  const [message, setMessage] = useState(`Let's learn ${lesson.title}!`);

  const speak = useCallback((mode: PronunciationMode = "normal", repeat = 1) => {
    if (!audioEnabled || !activeExample) return;
    void qaidaAudio.pronounce({
      key: activeExample.audioKey,
      fallbackText: activeExample.arabic,
      mode,
      repeat,
      onStart: () => {
        setIsPlaying(true);
        setMascotAction("point");
        setMessage(`Listen carefully: ${activeExample.transliteration}`);
      },
      onEnd: () => {
        setIsPlaying(false);
        setMascotAction("clap");
        setMessage("Excellent listening! Now try it yourself.");
      },
    });
  }, [activeExample, audioEnabled]);

  const isJoining = lesson.kind === "joining";
  const isDua = lesson.kind === "dua";
  const usesReadingTrack = ["reading", "quranic", "revision", "assessment"].includes(lesson.kind);

  return (
    <main ref={lessonRef} className="relative min-h-full overflow-x-hidden bg-emerald-50 fullscreen:h-screen fullscreen:overflow-y-auto">
      <ScenicLearningBackground reducedMotion={reducedMotion} />
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 p-3 sm:p-5">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600">
              {isDua ? "Daily dua" : "Interactive lesson"}
            </p>
            <h1 className="truncate text-lg font-black text-slate-900">{lesson.title}</h1>
          </div>
          <FullscreenButton targetRef={lessonRef} label={lesson.title} className="border border-emerald-900/10 bg-white text-emerald-800" />
        </div>

        <section className="grid gap-4 lg:grid-cols-12">
          <div className="relative flex min-h-56 items-end justify-center overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/45 px-3 pt-20 shadow-lg backdrop-blur-sm lg:col-span-4">
            <div className="absolute left-4 top-4 max-w-[75%] rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-slate-700 shadow-md" aria-live="polite">
              {message}
            </div>
            <ZaydMascot mood={practiceComplete ? "celebrating" : "happy"} action={mascotAction} lookAt={mascotAction === "point" ? "right" : "center"} size={150} />
          </div>

          <div className="relative flex min-h-56 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-yellow-100 p-5 shadow-xl lg:col-span-4">
            <SparkleBurst active={isPlaying} />
            <p className="qaida-arabic text-3xl font-black leading-[1.45] text-emerald-800" lang="ar" dir="rtl">{lesson.arabicTitle}</p>
            <motion.button
              type="button"
              onClick={() => speak()}
              className={`mt-3 flex w-full flex-col items-center justify-center rounded-3xl px-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                isDua ? "min-h-36 gap-2 py-3" : "min-h-28 px-6"
              }`}
              animate={isPlaying && !reducedMotion ? { scale: [1, 1.06, 1] } : undefined}
              aria-label={`Hear ${activeExample?.transliteration}`}
            >
              <span
                className={`qaida-arabic block w-full font-black text-emerald-900 ${
                  isDua ? "text-center text-2xl leading-[1.85] sm:text-3xl" : "text-6xl leading-[1.4]"
                }`}
                lang="ar"
                dir="rtl"
              >
                {activeExample?.arabic}
              </span>
              <span
                className={`mt-2 w-full border-t border-amber-200/80 pt-2 font-black text-slate-700 ${
                  isDua ? "text-left text-sm leading-relaxed whitespace-normal" : "text-sm leading-tight"
                }`}
                dir="ltr"
              >
                {activeExample?.transliteration}
              </span>
            </motion.button>
            {isDua && activeExample?.meaning ? (
              <p className="mt-3 w-full text-left text-xs font-semibold leading-relaxed text-slate-600 sm:text-sm" dir="ltr">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-emerald-700">English translation</span>
                {activeExample.meaning}
              </p>
            ) : null}
            {lesson.kind === "madd" && (
              <div className="mt-3 flex items-center gap-2" aria-label="Two-count stretch">
                {[1, 2].map((count) => (
                  <motion.span key={count} className="h-3 w-12 rounded-full bg-amber-400" animate={!reducedMotion && isPlaying ? { scaleX: [0.3, 1] } : undefined} transition={{ delay: count * 0.25 }} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-lg backdrop-blur lg:col-span-4">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
              {isDua ? "When to say it" : "What it means"}
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">{lesson.title}</h2>
            {isDua && lesson.whenToSay ? (
              <p className="mt-2 rounded-2xl bg-teal-50 p-3 text-sm font-semibold leading-relaxed text-teal-950">
                {lesson.whenToSay}
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{lesson.childExplanation}</p>
            {lesson.mouthPosition && (
              <div className="mt-3 rounded-2xl bg-sky-50 p-3">
                <p className="text-xs font-black text-sky-700">👄 Mouth position</p>
                <p className="mt-1 text-xs text-sky-950">{lesson.mouthPosition}</p>
              </div>
            )}
            {lesson.writingHint && (
              <div className="mt-3 rounded-2xl bg-violet-50 p-3">
                <p className="text-xs font-black text-violet-700">✍️ Reading / writing direction</p>
                <p className="mt-1 text-xs text-violet-950">{lesson.writingHint}</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/80 bg-white/90 p-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black text-slate-900">
              {isDua ? "Arabic · transliteration · English" : "Listen and explore"}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => speak("normal")} className="qaida-premium-button bg-emerald-700 px-4 py-2 text-sm font-black text-white">🔊 Normal</button>
              <button type="button" onClick={() => speak("slow")} className="qaida-premium-button border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800">🐢 Slow</button>
              <button type="button" onClick={() => speak("normal", 2)} className="qaida-premium-button border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-800">↻ Repeat ×2</button>
            </div>
          </div>
          <div
            dir={isDua ? "ltr" : "rtl"}
            className={`mt-4 grid gap-3 ${
              isDua ? "grid-cols-1 lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {lesson.examples.map((item) => (
              <ExampleTile
                key={item.id}
                item={item}
                fullText={isDua}
                showSpeaker={isDua}
                selected={activeExample?.id === item.id}
                reducedMotion={reducedMotion}
                className={activeExample?.id === item.id ? "" : "!border-slate-200 !bg-white"}
                onClick={() => {
                  setActiveExample(item);
                  setMessage(`Great choice! Tap again to hear ${item.transliteration}.`);
                  if (audioEnabled) void qaidaAudio.pronounce({ key: item.audioKey, fallbackText: item.arabic });
                }}
              />
            ))}
          </div>
        </section>

        {isJoining && (
          <section className="rounded-[1.5rem] border border-white/80 bg-white/90 p-4 shadow-lg">
            <h2 className="text-base font-black text-slate-900">All joining forms</h2>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {LETTERS.map((letter) => (
                <div key={letter.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex min-w-0 flex-col">
                      <span className="font-black leading-tight text-slate-700">{letter.name}</span>
                      <span className="text-xs font-semibold text-slate-500" dir="ltr">“{letter.sound}”</span>
                    </span>
                    <span className="qaida-arabic text-2xl leading-[1.4] text-emerald-800" lang="ar" dir="rtl">{letter.letter}</span>
                  </div>
                  <div className="qaida-arabic mt-2 flex justify-between gap-1 text-xl font-bold leading-[1.4] text-slate-800" dir="rtl" lang="ar">
                    {letter.forms.map((form, index) => (
                      <motion.span key={`${form}-${index}`} initial={reducedMotion ? false : { opacity: 0, x: 8 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}>{form}</motion.span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {usesReadingTrack && activeExample?.segments && (
          <section className="rounded-[1.5rem] border border-emerald-200 bg-[#073e39] p-5 text-white shadow-xl">
            <h2 className="text-base font-black">Animated reading path</h2>
            <div className="mt-4 flex flex-wrap justify-center gap-3" dir="rtl">
              {activeExample.segments.map((segment, index) => (
                <motion.span
                  key={`${segment}-${index}`}
                  className="qaida-arabic rounded-2xl bg-white/10 px-5 py-3 text-4xl font-black"
                  animate={!reducedMotion && isPlaying ? { backgroundColor: ["rgba(255,255,255,.1)", "rgba(250,204,21,.5)", "rgba(255,255,255,.1)"] } : undefined}
                  transition={{ delay: index * 0.45, duration: 0.45 }}
                >
                  {segment}
                </motion.span>
              ))}
            </div>
          </section>
        )}

        {lesson.traceValue && !usesReadingTrack && (
          <section className="rounded-[1.5rem] border border-white/80 bg-white/90 p-4 shadow-lg">
            <h2 className="mb-3 text-base font-black text-slate-900">Tracing preview</h2>
            <TracingCanvas letter={lesson.traceValue} onComplete={() => {
              setPracticeComplete(true);
              setMascotAction("dance");
              setMessage("MashaAllah! Beautiful tracing!");
            }} />
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Teacher guidance</p><p className="mt-1 text-sm text-emerald-950">{lesson.teacherTip}</p></div>
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-amber-700">Parent tip</p><p className="mt-1 text-sm text-amber-950">{lesson.parentTip}</p></div>
        </section>

        <div className="flex justify-center pb-4">
          <motion.button
            type="button"
            onClick={onComplete}
            whileHover={reducedMotion ? undefined : { y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="qaida-premium-button min-h-12 bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-3 text-base font-black text-white shadow-xl"
          >
            Complete lesson · Earn 25 XP
          </motion.button>
        </div>
      </div>
    </main>
  );
}
