"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { manifestToAudioAssets, QAIDA_AUDIO_MANIFEST } from "@/features/noorani-qaida/audio/manifest";
import { qaidaAudio } from "@/features/noorani-qaida/audio/QaidaAudioService";
import { KALMA_LESSONS } from "@/features/noorani-qaida/data/kalmas";
import { NAMAZ_LESSONS } from "@/features/noorani-qaida/data/namaz";
import SalahLessonScreen from "@/features/noorani-qaida/screens/SalahLessonScreen";
import TopicLessonScreen from "@/features/noorani-qaida/screens/TopicLessonScreen";

const ALL_LESSONS = [...NAMAZ_LESSONS, ...KALMA_LESSONS];

/**
 * Query params: ?lesson=<lessonId>&step=<0-based index>&rm=1
 * Namaz lessons render SalahLessonScreen; Kalma lessons render TopicLessonScreen
 * (with the real audio manifest so recordings can be tested without login).
 */
export default function NamazPreviewClient() {
  const params = useSearchParams();
  const initialLesson = params.get("lesson");
  const initialStep = Number(params.get("step") ?? 0) || 0;

  const [lessonId, setLessonId] = useState(
    ALL_LESSONS.some((l) => l.id === initialLesson) ? (initialLesson as string) : NAMAZ_LESSONS[2]?.id ?? NAMAZ_LESSONS[0].id,
  );
  const [reducedMotion, setReducedMotion] = useState(params.get("rm") === "1");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [completed, setCompleted] = useState<string | null>(null);
  const lesson = ALL_LESSONS.find((l) => l.id === lessonId) ?? NAMAZ_LESSONS[0];
  const isKalima = lesson.moduleId === "kalmas";

  // Same wiring the real shell does in useQaidaState — real recordings first, TTS fallback.
  useEffect(() => {
    qaidaAudio.configure(manifestToAudioAssets(QAIDA_AUDIO_MANIFEST));
  }, []);
  useEffect(() => {
    qaidaAudio.setEnabled(audioEnabled);
  }, [audioEnabled]);

  return (
    <div className="flex min-h-screen flex-col bg-emerald-50">
      <div className="flex flex-wrap items-center gap-3 border-b border-emerald-100 bg-white px-4 py-2 text-xs">
        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-black text-amber-800">DEV PREVIEW</span>
        <label className="flex items-center gap-2 font-bold text-slate-700">
          Lesson
          <select
            value={lessonId}
            onChange={(e) => {
              setLessonId(e.target.value);
              setCompleted(null);
            }}
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
          >
            <optgroup label="Namaz">
              {NAMAZ_LESSONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Kalmas (real recordings)">
              {KALMA_LESSONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="flex items-center gap-1.5 font-bold text-slate-700">
          <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
          Reduced motion
        </label>
        <label className="flex items-center gap-1.5 font-bold text-slate-700">
          <input type="checkbox" checked={audioEnabled} onChange={(e) => setAudioEnabled(e.target.checked)} />
          Audio
        </label>
        {completed ? <span className="font-black text-emerald-700">✓ onComplete fired for {completed}</span> : null}
      </div>
      <div className="flex-1">
        {isKalima ? (
          <TopicLessonScreen
            key={lesson.id}
            lesson={lesson}
            reducedMotion={reducedMotion}
            audioEnabled={audioEnabled}
            onComplete={() => setCompleted(lesson.id)}
          />
        ) : (
          <SalahLessonScreen
            key={lesson.id}
            lesson={lesson}
            reducedMotion={reducedMotion}
            audioEnabled={audioEnabled}
            initialStepIndex={lesson.id === initialLesson ? initialStep : 0}
            onComplete={() => setCompleted(lesson.id)}
          />
        )}
      </div>
    </div>
  );
}
