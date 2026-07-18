import Link from "next/link";
import { createTutorProgressSnapshot } from "../data/progressAdapters";

/**
 * Teacher Qaida workspace.
 * Honest about missing class-synced progress; gives actionable classroom steps
 * that do not invent fake student statistics.
 */
export default function TutorDashboard({ embedded = false }: { embedded?: boolean }) {
  const snapshot = createTutorProgressSnapshot();

  return (
    <main
      id={embedded ? undefined : "qaida-main"}
      className={`${embedded ? "h-full overflow-y-auto" : "min-h-screen"} qaida-root bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 sm:p-6`}
    >
      <div className="qaida-dashboard">
        <header className="qaida-panel p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Teacher workspace</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Noorani Qaida classroom tools</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Run letter-focused practice in class today. Verified multi-student analytics appear here once academy progress sync is connected.
          </p>
        </header>

        <section className="mt-5 grid gap-4 md:grid-cols-3" aria-label="Teacher actions">
          {[
            {
              title: "1. Assign one letter",
              body: "Open Lessons, pick today’s letter, and stay on it for the whole session so games stay letter-scoped.",
            },
            {
              title: "2. Curate games",
              body: "In Practice → Teacher settings, choose Automatic (focus games first) or pick only the games you want this week.",
            },
            {
              title: "3. Check listening",
              body: "Use Hear / Slow / Sound Match for pronunciation. Ask the child to repeat after the Arabic voice — not English letter names.",
            },
          ].map((item) => (
            <article key={item.title} className="qaida-panel p-5">
              <h2 className="font-black text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </article>
          ))}
        </section>

        {snapshot.status === "unavailable" && (
          <section className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 sm:p-7" aria-labelledby="qaida-data-status">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-amber-900">Class analytics</p>
                <h2 id="qaida-data-status" className="mt-1 text-xl font-black text-slate-950">
                  No verified class data yet
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-700">{snapshot.reason}</p>
                <p className="mt-1 text-sm text-slate-600">{snapshot.requiredIntegration}</p>
              </div>
              {!embedded && (
                <Link
                  href="/tutor/students"
                  className="inline-flex min-h-11 flex-none items-center justify-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-black text-white"
                >
                  View enrolled students
                </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
