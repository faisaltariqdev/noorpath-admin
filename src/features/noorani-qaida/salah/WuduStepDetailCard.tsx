"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Droplets, Sparkles, ZoomIn, X, BookOpen, Image as ImageIcon } from "lucide-react";
import type { SalahStep } from "../types";
import { getStepDetail, WUDU_STEP_DETAILS, NAMAZ_STEP_DETAILS, type SalahStepVisualDetail } from "./salahVisualData";

export { WUDU_STEP_DETAILS, NAMAZ_STEP_DETAILS };
export type WuduStepDetail = SalahStepVisualDetail;

interface WuduStepDetailCardProps {
  step: SalahStep;
  reducedMotion?: boolean;
}

export default function WuduStepDetailCard({ step, reducedMotion = false }: WuduStepDetailCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const detail = getStepDetail(step.id, step.posture);

  const isWudu = step.id.startsWith("w-") || step.posture.startsWith("wudu-");
  // Default is hidden as requested
  const [showBanner, setShowBanner] = useState(false);

  if (!detail) return null;

  return (
    <>
      <motion.div
        key={`salah-detail-${step.id}`}
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-1 flex flex-col gap-3.5 rounded-2xl border border-emerald-100/90 bg-gradient-to-b from-white via-emerald-50/40 to-teal-50/50 p-3.5 shadow-sm"
      >
        {/* Header Label */}
        <div className="flex items-center justify-between gap-2 border-b border-emerald-100/80 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles size={14} className="text-emerald-600 animate-pulse shrink-0" aria-hidden="true" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 truncate">
              {isWudu ? "Wudu Visual Guide & Sunnah Detail" : "Sunnah Posture Guide"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowBanner((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/90 bg-white/95 hover:bg-emerald-50 active:scale-95 px-2 py-0.5 text-[11px] font-bold text-emerald-800 transition cursor-pointer shadow-2xs"
              title={showBanner ? "Hide Image Preview" : "Show Image Preview"}
            >
              <ImageIcon size={12} className="text-emerald-600" />
              <span>{showBanner ? "Hide Image" : "Show Image"}</span>
            </button>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
              {detail.postureBadge ?? `Step ${step.order}`}
            </span>
          </div>
        </div>

        {/* Character Visual Image Banner (Collapsible - Hidden by Default) */}
        <AnimatePresence initial={false}>
          {showBanner && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-emerald-200/80 bg-slate-900/5 shadow-inner">
                <motion.div
                  className="relative h-full w-full"
                  initial={false}
                  animate={reducedMotion ? undefined : { scale: [1, 1.025, 1] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src={detail.image}
                    alt={`${step.title} 3D illustration`}
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={step.order <= 3}
                  />
                </motion.div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                  <p className="text-xs font-black drop-shadow-md text-white/95">{detail.focusTitle}</p>
                  <button
                    type="button"
                    onClick={() => setIsZoomed(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-black/50 px-2.5 py-1 text-[10px] font-bold backdrop-blur-md transition hover:bg-black/70 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
                    title="Click to zoom high-resolution preview"
                  >
                    <ZoomIn size={12} />
                    <span>Zoom</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key Focus Points */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-700">
            Key Sunnah Checklist:
          </p>
          <div className="grid gap-1.5">
            {detail.focusPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-xl bg-white/95 p-2 text-xs text-slate-800 shadow-2xs border border-emerald-100/70"
              >
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span className="font-semibold leading-snug">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Reminder / Caution */}
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/90 p-2.5 text-xs text-amber-950">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
          <div>
            <span className="font-black text-amber-800">Kid-Friendly Reminder: </span>
            <span className="leading-relaxed">{detail.reminder}</span>
          </div>
        </div>

        {/* Sunnah Note */}
        <div className="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/80 p-2 text-[11px] text-sky-950">
          {isWudu ? (
            <Droplets size={14} className="mt-0.5 shrink-0 text-sky-600" aria-hidden="true" />
          ) : (
            <BookOpen size={14} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
          )}
          <p className="leading-relaxed">
            <span className="font-black text-sky-900">Sunnah Teaching: </span>
            {detail.sunnahNote}
          </p>
        </div>
      </motion.div>

      {/* Lightbox Modal for Zooming Image */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-white/20"
            >
              <div className="relative aspect-video w-screen max-w-3xl">
                <Image
                  src={detail.image}
                  alt={`${step.title} high resolution preview`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-white p-3.5">
                <div>
                  <p className="text-sm font-black text-slate-800">
                    Step {step.order}: {step.title}
                  </p>
                  <p className="text-xs font-semibold text-emerald-700">{detail.focusTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
