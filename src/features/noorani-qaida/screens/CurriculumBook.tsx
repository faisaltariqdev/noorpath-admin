"use client";

import { Lock, Play, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { CURRICULUM_MODULES, TOPIC_LESSON_BY_ID } from "../data/modules";
import { qaidaAudio } from "../audio/QaidaAudioService";
import { getModuleProgress, isCurriculumScreenUnlocked } from "../state/curriculumProgress";
import type { ModuleId, QaidaProgress, ScreenId, TopicLesson } from "../types";
import ExampleTile from "../ui/ExampleTile";
import PageTurnViewer from "../ui/PageTurnViewer";
import QaidaEbook from "./QaidaEbook";

interface CurriculumBookProps {
  progress: QaidaProgress;
  currentScreenId: ScreenId;
  onOpenScreen: (id: ScreenId) => void;
  reducedMotion: boolean;
  audioEnabled: boolean;
}

function TopicPage({
  lesson,
  unlocked,
  onOpen,
  audioEnabled,
  reducedMotion,
}: {
  lesson: TopicLesson;
  unlocked: boolean;
  onOpen: () => void;
  audioEnabled: boolean;
  reducedMotion: boolean;
}) {
  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border-2 border-amber-200/70 bg-gradient-to-b from-[#fffaf0] via-[#fdf6e7] to-[#f6ead1] p-5 shadow-[0_26px_60px_-26px_rgba(120,80,20,0.5)] sm:p-8">
      <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-amber-300/45" aria-hidden="true" />
      <div className="relative z-10">
        <div className="text-center">
          <p className="qaida-arabic text-3xl font-black leading-[1.45] text-emerald-900 sm:text-4xl" lang="ar" dir="rtl">{lesson.arabicTitle}</p>
          <h3 className="mt-1 text-xl font-black text-slate-900">{lesson.title}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{lesson.childExplanation}</p>
        </div>

        <div dir="rtl" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lesson.examples.map((item) => (
            <ExampleTile
              key={item.id}
              item={item}
              disabled={!unlocked}
              reducedMotion={reducedMotion}
              showSpeaker
              onClick={() => {
                if (!audioEnabled) return;
                void qaidaAudio.pronounce({ key: item.audioKey, fallbackText: item.arabic });
              }}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Teacher tip</p>
            <p className="mt-1 text-sm text-emerald-950">{lesson.teacherTip}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-amber-700">Parent tip</p>
            <p className="mt-1 text-sm text-amber-950">{lesson.parentTip}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
            <ShieldCheck size={14} aria-hidden="true" /> Qari review pending
          </span>
          <button
            type="button"
            disabled={!unlocked}
            onClick={onOpen}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-2.5 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            {unlocked ? <Play size={16} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
            {unlocked ? "Open interactive lesson" : "Complete the previous lesson"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CurriculumBook({
  progress,
  currentScreenId,
  onOpenScreen,
  reducedMotion,
  audioEnabled,
}: CurriculumBookProps) {
  const activeModule = CURRICULUM_MODULES.find((item) => item.screenIds.includes(currentScreenId));
  const [moduleId, setModuleId] = useState<ModuleId>(activeModule?.id ?? "alphabet");
  const chapter = CURRICULUM_MODULES.find((item) => item.id === moduleId) ?? CURRICULUM_MODULES[0];
  const moduleProgress = getModuleProgress(progress, chapter.id);

  const pages = useMemo(() => {
    if (chapter.id === "alphabet") {
      return [{
        id: "alphabet-book",
        label: "Arabic alphabet",
        content: (
          <QaidaEbook
            progress={progress}
            currentLetterId={currentScreenId.startsWith("letter-") ? currentScreenId : "letter-1"}
            onSelectLetter={onOpenScreen}
            reducedMotion={reducedMotion}
            audioEnabled={audioEnabled}
          />
        ),
      }];
    }
    return chapter.screenIds.filter((id) => id !== "certificate").map((id) => {
      const topic = TOPIC_LESSON_BY_ID[id];
      return {
        id,
        label: topic?.title ?? id,
        content: topic ? (
          <TopicPage
            lesson={topic}
            unlocked={isCurriculumScreenUnlocked(progress, id)}
            onOpen={() => onOpenScreen(id)}
            audioEnabled={audioEnabled}
            reducedMotion={reducedMotion}
          />
        ) : null,
      };
    });
  }, [audioEnabled, chapter, currentScreenId, onOpenScreen, progress, reducedMotion]);

  return (
    <div className="flex flex-col gap-4">
      <nav className="qaida-scroll flex gap-2 overflow-x-auto pb-1" aria-label="Qaida chapters">
        {CURRICULUM_MODULES.map((item) => {
          const state = getModuleProgress(progress, item.id);
          const active = item.id === chapter.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setModuleId(item.id)}
              className={`relative flex min-w-[150px] flex-none items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${
                active ? "border-emerald-500 bg-emerald-50 shadow-md" : "border-slate-200 bg-white hover:border-emerald-300"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className={`qaida-arabic flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-black text-white ${item.accent}`} lang="ar">{item.icon}</span>
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Module {item.order}</span>
                <span className="block truncate text-sm font-black text-slate-800">{item.title}</span>
                <span className="block text-[10px] font-bold text-emerald-700">{state.unlocked ? `${state.percent}% complete` : "Locked"}</span>
              </span>
              {!state.unlocked && <Lock className="absolute right-2 top-2 text-slate-400" size={13} aria-hidden="true" />}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-white/90 p-4 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">Module {chapter.order} of 11</p>
          <h2 className="text-xl font-black text-slate-900">{chapter.title}</h2>
          <p className="text-sm text-slate-500">{chapter.description}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
          {moduleProgress.completed}/{moduleProgress.total} lessons
        </span>
      </div>

      {moduleProgress.unlocked ? (
        <PageTurnViewer pages={pages} reducedMotion={reducedMotion} direction="rtl" />
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Lock size={38} className="text-slate-400" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-black text-slate-800">{chapter.title} is locked</h3>
          <p className="mt-1 max-w-md text-sm text-slate-500">Complete {chapter.prerequisite?.replaceAll("-", " ")} before opening this chapter.</p>
        </div>
      )}
    </div>
  );
}
