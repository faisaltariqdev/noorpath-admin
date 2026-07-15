"use client";

import { motion } from "framer-motion";
import type { QaidaProgress } from "../types";
import { getOverallCurriculumProgress } from "../state/curriculumProgress";

export default function CertificateScreen({ progress }: { progress: QaidaProgress }) {
  const passed = progress.assessmentAttempts.some((attempt) => attempt.screenId === "final-assessment" && attempt.passed);
  const overall = getOverallCurriculumProgress(progress);

  if (!passed) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center overflow-y-auto bg-emerald-50 p-6">
        <div className="max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-7 text-center shadow-xl">
          <div className="text-5xl" aria-hidden="true">🔒</div>
          <h1 className="mt-3 text-2xl font-black text-slate-900">Certificate locked</h1>
          <p className="mt-2 text-sm text-slate-600">Complete the curriculum and pass the final assessment before the certificate is available.</p>
          <p className="mt-4 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">{overall.percent}% curriculum complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qaida-scroll h-full overflow-y-auto bg-gradient-to-br from-emerald-100 via-amber-50 to-sky-100 p-4 sm:p-8">
      <motion.article
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border-8 border-double border-amber-400 bg-[#fffaf0] p-8 text-center shadow-2xl sm:p-14"
      >
        <div className="absolute left-5 top-5 text-3xl text-amber-500" aria-hidden="true">❁</div>
        <div className="absolute right-5 top-5 text-3xl text-amber-500" aria-hidden="true">❁</div>
        <p className="qaida-arabic text-2xl font-black text-emerald-900" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.28em] text-amber-700">NoorPath Learning</p>
        <h1 className="mt-2 text-4xl font-black text-emerald-900 sm:text-5xl">Certificate of Completion</h1>
        <p className="qaida-arabic mt-2 text-3xl font-bold text-amber-700" lang="ar" dir="rtl">القَاعِدَةُ النُّورَانِيَّة</p>
        <div className="mx-auto my-7 h-px max-w-xl bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <p className="text-lg text-slate-600">This recognises the successful completion of the</p>
        <p className="mt-2 text-2xl font-black text-slate-900">Interactive Noorani Qaida Curriculum</p>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-600">
          The learner completed eleven progressive modules covering letters, Harakaat, Tanween, Sukoon, Shaddah, Madd, joining, word reading, Quranic recognition, revision, and final review.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-2xl font-black text-emerald-800">{progress.xp}</p><p className="text-xs font-bold text-slate-500">XP earned</p></div>
          <div className="rounded-2xl bg-amber-50 p-4"><p className="text-2xl font-black text-amber-800">{progress.stars}</p><p className="text-xs font-bold text-slate-500">Stars earned</p></div>
          <div className="rounded-2xl bg-sky-50 p-4"><p className="text-2xl font-black text-sky-800">{progress.streak}</p><p className="text-xs font-bold text-slate-500">Day streak</p></div>
        </div>
        <p className="mt-7 text-xs font-semibold text-slate-500">Digital completion record · Pronunciation and Makharij should be verified by a qualified teacher.</p>
      </motion.article>
    </div>
  );
}
