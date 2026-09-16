"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Sparkles, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import StarBurst from "../animations/StarBurst";
import type { SalahStep } from "../types";
import SalahPostureFigure from "./SalahPostureFigure";
import WuduVisual, { WUDU_META } from "./WuduVisual";
import { isWuduPosture, specFor } from "./postureRig";

interface SalahPostureStageProps {
  step: SalahStep;
  reducedMotion: boolean;
  /** Called when the child completes a "Now you try" hold. */
  onPracticed?: (stepId: string) => void;
  /** Called when the child starts interacting (replay / hold) — lets the parent pause Watch mode. */
  onInteract?: () => void;
  practiced?: boolean;
}

const HOLD_SECONDS = 5;

export default function SalahPostureStage({ step, reducedMotion, onPracticed, onInteract, practiced }: SalahPostureStageProps) {
  const [replayToken, setReplayToken] = useState(0);
  const [holding, setHolding] = useState(false);
  const [holdLeft, setHoldLeft] = useState(HOLD_SECONDS);
  const [burst, setBurst] = useState(false);
  const timerRef = useRef<number | null>(null);

  const wudu = isWuduPosture(step.posture) || (step.posture === "overview" && step.id.startsWith("w-"));
  const spec = specFor(step.posture);
  const wuduMeta = wudu ? WUDU_META[step.posture as keyof typeof WUDU_META] : null;

  const salamSide: "right" | "left" | undefined =
    step.posture === "salam" ? (/left/i.test(step.title) ? "left" : "right") : undefined;

  const checks = wuduMeta ? wuduMeta.checks : spec.checks.map((c) => c.label);
  const name = wuduMeta ? wuduMeta.name : spec.name;
  const arabic = wuduMeta ? wuduMeta.arabic : spec.arabic;

  // Reset practice state on step change
  useEffect(() => {
    setHolding(false);
    setHoldLeft(HOLD_SECONDS);
    setBurst(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, [step.id]);

  useEffect(() => {
    if (!holding) return;
    timerRef.current = window.setInterval(() => {
      setHoldLeft((v) => {
        if (v <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setHolding(false);
          setBurst(true);
          onPracticed?.(step.id);
          window.setTimeout(() => setBurst(false), 1400);
          return HOLD_SECONDS;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holding]);

  const holdPct = ((HOLD_SECONDS - holdLeft) / HOLD_SECONDS) * 100;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
            {wudu ? "Wudu step" : "Body posture"}
            {wuduMeta ? <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-sky-800">{wuduMeta.times}</span> : null}
          </p>
          <p className="truncate text-base font-black text-emerald-900 sm:text-lg">{name}</p>
        </div>
        <p className="qaida-arabic shrink-0 text-xl font-black leading-none text-emerald-800" lang="ar" dir="rtl">
          {arabic}
        </p>
      </div>

      {/* Stage */}
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-b from-sky-50 via-white to-emerald-50/70">
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #0f766e 1px, transparent 0)", backgroundSize: "18px 18px" }} />
        <AnimatePresence mode="wait" initial={false}>
          {wudu ? (
            <motion.div
              key={`wudu-${step.posture}`}
              className="relative flex h-full min-h-[15rem] w-full items-center justify-center p-3"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25 }}
            >
              <WuduVisual posture={step.posture as keyof typeof WUDU_META} reducedMotion={reducedMotion} className="h-full max-h-[17rem] w-full" />
            </motion.div>
          ) : (
            <motion.div key="rig" className="relative flex h-full min-h-[15rem] w-full items-center justify-center p-2">
              <SalahPostureFigure
                posture={step.posture}
                salamSide={salamSide}
                reducedMotion={reducedMotion}
                replayToken={replayToken}
                className="h-full max-h-[19rem] w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hold ring overlay */}
        <AnimatePresence>
          {holding && (
            <motion.div
              key="hold"
              className="absolute inset-x-0 bottom-3 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-center gap-3 rounded-full border border-amber-200 bg-white/95 px-4 py-2 shadow-lg">
                <div className="relative h-9 w-9">
                  <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#fde68a" strokeWidth="4" />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="94.2"
                      animate={{ strokeDashoffset: 94.2 - (94.2 * holdPct) / 100 }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-amber-800">{holdLeft}</span>
                </div>
                <p className="text-xs font-black text-amber-900">Hold the pose like the picture…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <StarBurst active={burst} count={10} size="lg" />
        </div>
      </div>

      {/* Body checks */}
      <ul className="flex flex-wrap gap-1.5" aria-label="Body checks">
        {checks.map((c, i) => (
          <motion.li
            key={`${step.id}-${c}`}
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.35 + i * 0.12 }}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-900"
          >
            <Check size={12} className="text-emerald-600" aria-hidden="true" />
            {c}
          </motion.li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {!wudu ? (
          <button
            type="button"
            onClick={() => {
              onInteract?.();
              setReplayToken((t) => t + 1);
            }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-800 transition hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            <RotateCcw size={14} aria-hidden="true" /> Replay movement
          </button>
        ) : null}
        <button
          type="button"
          disabled={holding}
          onClick={() => {
            onInteract?.();
            setHoldLeft(HOLD_SECONDS);
            setHolding(true);
          }}
          className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:opacity-60 ${
            practiced
              ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
              : "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md hover:from-amber-500 hover:to-orange-600"
          }`}
        >
          {practiced ? <Sparkles size={14} aria-hidden="true" /> : <Timer size={14} aria-hidden="true" />}
          {practiced ? "Practised · do it again" : `Now you try · hold ${HOLD_SECONDS}s`}
        </button>
      </div>
    </div>
  );
}
