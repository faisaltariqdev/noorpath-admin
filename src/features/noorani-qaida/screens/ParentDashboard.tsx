"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LETTERS } from "../data/curriculum";
import { createParentProgressSnapshot, type ParentProgressSnapshot } from "../data/progressAdapters";
import { PROGRESS_STORAGE_KEY } from "../state/progress";

function formatPracticeTime(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

export default function ParentDashboard({ embedded = false }: { embedded?: boolean }) {
  const [snapshot, setSnapshot] = useState<ParentProgressSnapshot | null>(null);

  useEffect(() => {
    const read = () => setSnapshot(createParentProgressSnapshot(localStorage.getItem(PROGRESS_STORAGE_KEY)));
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  if (!snapshot) {
    return (
      <main className={`${embedded ? "h-full" : "min-h-screen"} qaida-root flex items-center justify-center bg-emerald-50 p-6`}>
        <p className="font-bold text-emerald-800" role="status">Loading device progress…</p>
      </main>
    );
  }

  const { progress } = snapshot;
  const currentLetter = LETTERS.find((letter) => !progress.completed.includes(`letter-${letter.id}`)) ?? null;

  return (
    <main
      className={`${embedded ? "min-h-full" : "min-h-screen"} qaida-root bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 sm:p-6`}
    >
      <div className="qaida-dashboard">
        <header className="qaida-panel overflow-hidden p-5 sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Parent view</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Noorani Qaida progress</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                This report shows only learning activity stored in this browser. It is not yet synced across devices or to academy records.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-sky-100 px-4 py-2 text-xs font-black text-sky-800">
              Source: this device
            </span>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Verified progress summary">
          {[
            ["Letters completed", `${snapshot.lettersCompleted}/${LETTERS.length}`, "📖"],
            ["Stored XP", progress.xp.toString(), "⭐"],
            ["Current streak", `${progress.streak} day${progress.streak === 1 ? "" : "s"}`, "🔥"],
            ["Practice recorded", formatPracticeTime(progress.totalPracticeSeconds), "⏱️"],
          ].map(([label, value, icon], index) => (
            <motion.article
              key={label}
              className="qaida-panel p-4 sm:p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-2xl" aria-hidden="true">{icon}</span>
              <strong className="qaida-progress-value mt-2 block text-xl font-black text-slate-950 sm:text-2xl">{value}</strong>
              <span className="text-xs font-bold text-slate-600 sm:text-sm">{label}</span>
            </motion.article>
          ))}
        </section>

        <div className="qaida-dashboard-grid mt-5">
          <section className="qaida-panel col-span-12 p-5 lg:col-span-8" aria-labelledby="letter-progress-title">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="letter-progress-title" className="text-lg font-black text-slate-950">Arabic letter journey</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {currentLetter ? `Next device lesson: ${currentLetter.name}` : "All 28 letter lessons are marked complete."}
                </p>
              </div>
              <span className="qaida-progress-value rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">
                {snapshot.completionPercent}%
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400"
                initial={{ width: 0 }}
                animate={{ width: `${snapshot.completionPercent}%` }}
              />
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-10">
              {LETTERS.map((letter) => {
                const complete = progress.completed.includes(`letter-${letter.id}`);
                return (
                  <div
                    key={letter.id}
                    className={`qaida-arabic flex aspect-square items-center justify-center rounded-xl border text-xl font-bold ${
                      complete
                        ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                    title={`${letter.name}: ${complete ? "completed" : "not completed"}`}
                    lang="ar"
                    dir="rtl"
                  >
                    {letter.letter}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="qaida-panel col-span-12 p-5 lg:col-span-4" aria-labelledby="earned-badges-title">
            <h2 id="earned-badges-title" className="text-lg font-black text-slate-950">Earned badges</h2>
            <p className="mt-1 text-sm text-slate-600">{snapshot.earnedBadges} verified on this device</p>
            <div className="mt-4 space-y-2">
              {progress.badges.filter((badge) => badge.earned).length ? (
                progress.badges.filter((badge) => badge.earned).map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3">
                    <span className="text-2xl" aria-hidden="true">{badge.icon}</span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{badge.label}</h3>
                      <p className="text-xs text-slate-600">{badge.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No badges have been earned on this device yet.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
