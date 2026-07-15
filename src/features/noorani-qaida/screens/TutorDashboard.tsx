import Link from "next/link";
import { createTutorProgressSnapshot } from "../data/progressAdapters";

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
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Noorani Qaida insights</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Monitor verified student progress once Noorani Qaida learning records are connected to the academy account.
          </p>
        </header>

        {snapshot.status === "unavailable" && (
          <section className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 sm:p-7" aria-labelledby="qaida-data-status">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-amber-900">Integration-ready dashboard</p>
                <h2 id="qaida-data-status" className="mt-1 text-xl font-black text-slate-950">No verified class data is available yet</h2>
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

        <section className="mt-5 grid gap-4 md:grid-cols-3" aria-label="Future verified insights">
          {[
            ["Lesson progress", "Letter and lesson completion from connected student records."],
            ["Practice consistency", "Verified study activity and streak trends by student."],
            ["Teacher support", "Letters needing review based on real attempts and outcomes."],
          ].map(([title, description]) => (
            <article key={title} className="qaida-panel p-5">
              <h2 className="font-black text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              <span className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Awaiting verified data</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
