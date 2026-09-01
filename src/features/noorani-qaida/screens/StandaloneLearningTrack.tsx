"use client";

import { CheckCircle2 } from "lucide-react";
import { CURRICULUM_MODULES, TOPIC_LESSON_BY_ID } from "../data/modules";
import type { QaidaProgress } from "../types";
import SalahLessonScreen from "./SalahLessonScreen";
import TopicLessonScreen from "./TopicLessonScreen";

interface StandaloneLearningTrackProps {
  moduleId: "daily-duas" | "namaz" | "kalmas";
  currentScreenId: string;
  progress: QaidaProgress;
  reducedMotion: boolean;
  audioEnabled: boolean;
  onSelectLesson: (id: string) => void;
  onCompleteLesson: (moduleId: "daily-duas" | "namaz" | "kalmas", id: string) => void;
}

export default function StandaloneLearningTrack({
  moduleId,
  currentScreenId,
  progress,
  reducedMotion,
  audioEnabled,
  onSelectLesson,
  onCompleteLesson,
}: StandaloneLearningTrackProps) {
  const moduleDefinition = CURRICULUM_MODULES.find((item) => item.id === moduleId);
  if (!moduleDefinition) return null;

  const selectedId = moduleDefinition.screenIds.includes(currentScreenId)
    ? currentScreenId
    : moduleDefinition.screenIds[0];
  const lesson = TOPIC_LESSON_BY_ID[selectedId];
  if (!lesson) return null;

  const completed = moduleDefinition.screenIds.filter((id) => progress.completed.includes(id)).length;

  return (
    <div className="qaida-scroll h-full overflow-y-auto bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="sticky top-0 z-30 border-b border-emerald-900/10 bg-white/95 px-3 py-3 shadow-sm backdrop-blur sm:px-5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600">Interactive learning</p>
              <h2 className="text-lg font-black text-slate-900">{moduleDefinition.title}</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              {completed}/{moduleDefinition.screenIds.length} completed
            </span>
          </div>

          <nav className="qaida-scroll flex gap-2 overflow-x-auto pb-1" aria-label={`${moduleDefinition.title} lessons`}>
            {moduleDefinition.screenIds.map((id, index) => {
              const item = TOPIC_LESSON_BY_ID[id];
              const active = id === selectedId;
              const done = progress.completed.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectLesson(id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 min-w-max items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                    active
                      ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
                  }`}
                >
                  {done ? <CheckCircle2 size={15} aria-hidden="true" /> : <span aria-hidden="true">{index + 1}</span>}
                  <span>{item?.title ?? `Lesson ${index + 1}`}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {lesson.kind === "salah" ? (
        <SalahLessonScreen
          key={lesson.id}
          lesson={lesson}
          reducedMotion={reducedMotion}
          audioEnabled={audioEnabled}
          onComplete={() => onCompleteLesson(moduleId, lesson.id)}
        />
      ) : (
        <TopicLessonScreen
          key={lesson.id}
          lesson={lesson}
          reducedMotion={reducedMotion}
          audioEnabled={audioEnabled}
          onComplete={() => onCompleteLesson(moduleId, lesson.id)}
        />
      )}
    </div>
  );
}
