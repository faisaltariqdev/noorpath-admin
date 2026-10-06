"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Compass, ExternalLink, Image as ImageIcon, Pause, Play, RotateCcw, Sparkles, Timer, Video, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import StarBurst from "../animations/StarBurst";
import type { SalahStep } from "../types";
import SalahPostureFigure from "./SalahPostureFigure";
import WuduVisual, { WUDU_META } from "./WuduVisual";
import { isWuduPosture, specFor } from "./postureRig";
import { getStepDetail, type CharacterAngle360 } from "./salahVisualData";

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

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("?")[0];
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v");
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  }
  return null;
}

/** 360-Degree Multi-Angle Character Turntable (Rotates character around in 360° via mouse drag or touch) */
function Interactive360Turntable({
  angles,
  fallbackImage,
  title,
  focusTitle,
  reducedMotion,
  onZoom,
}: {
  angles: CharacterAngle360[];
  fallbackImage: string;
  title: string;
  focusTitle: string;
  reducedMotion: boolean;
  onZoom: (currentImg: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartIndex, setDragStartIndex] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

  // Preload all angle images for instant 60fps rotation without latency
  useEffect(() => {
    angles.forEach((a) => {
      const img = new window.Image();
      img.src = a.image;
    });
  }, [angles]);

  // Auto-spin interval
  useEffect(() => {
    if (!isAutoSpinning || reducedMotion) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % angles.length);
    }, 750);
    return () => window.clearInterval(interval);
  }, [isAutoSpinning, reducedMotion, angles.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsAutoSpinning(false);
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartIndex(currentIndex);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    // Every 35px of drag moves one angle frame around 360 degrees
    const stepsDelta = Math.round(deltaX / 35);
    const newIdx = (dragStartIndex + stepsDelta) % angles.length;
    setCurrentIndex(newIdx < 0 ? newIdx + angles.length : newIdx);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsAutoSpinning(false);
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragStartIndex(currentIndex);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    const stepsDelta = Math.round(deltaX / 35);
    const newIdx = (dragStartIndex + stepsDelta) % angles.length;
    setCurrentIndex(newIdx < 0 ? newIdx + angles.length : newIdx);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const currentAngle = angles[currentIndex] ?? angles[0];
  const activeImage = currentAngle?.image ?? fallbackImage;

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`group relative flex w-full max-w-full aspect-[4/3] sm:aspect-[4/3] sm:min-h-[20rem] max-h-[28rem] flex-col overflow-hidden rounded-2xl bg-slate-950 shadow-xl border border-emerald-400/50 select-none ${
        isDragging ? "cursor-ew-resize" : "cursor-grab"
      }`}
    >
      {/* Pre-rendered 360 Angle Layers for instant 60fps GPU rotation */}
      <div className="relative h-full w-full">
        {angles.map((a, idx) => (
          <Image
            key={a.image}
            src={a.image}
            alt={`${title} - ${a.label}`}
            fill
            sizes="(max-width: 768px) 100vw, 650px"
            priority={idx === 0}
            loading="eager"
            unoptimized
            className={`object-contain sm:object-cover object-center transition-opacity duration-75 ${
              idx === currentIndex ? "opacity-100 z-1" : "opacity-0 pointer-events-none z-0"
            }`}
          />
        ))}
      </div>

      {/* Ambient Dark Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/35" />

      {/* Top Controls: 360 Badge + Auto-Spin Button */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 sm:gap-1.5 z-10"
      >
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-black/65 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black text-white backdrop-blur-md border border-white/20 shadow">
          <Compass size={12} className="text-emerald-400 animate-spin-slow shrink-0" />
          <span className="text-emerald-300 hidden sm:inline">360° View:</span>
          <span className="text-emerald-300 sm:hidden">360°:</span>
          <span className="font-extrabold text-amber-300">{currentAngle.degree}°</span>
          <span className="hidden md:inline text-[9px] font-bold text-white/70 ml-1">
            (Drag left/right)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoSpinning((prev) => !prev);
            }}
            className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-1 text-[10px] font-black backdrop-blur-md border transition cursor-pointer select-none active:scale-95 ${
              isAutoSpinning
                ? "bg-amber-500 text-white border-amber-300 shadow-md ring-2 ring-amber-300"
                : "bg-black/60 text-white/90 border-white/20 hover:bg-black/80"
            }`}
          >
            {isAutoSpinning ? <Pause size={10} /> : <Play size={10} />}
            <span className="hidden sm:inline">{isAutoSpinning ? "Pause Spin" : "Auto-Spin 360°"}</span>
            <span className="sm:hidden">{isAutoSpinning ? "Pause" : "Spin"}</span>
          </button>
        </div>
      </div>

      {/* Middle Angle Quick Dial */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute bottom-9 sm:bottom-11 left-2 right-2 flex items-center justify-center gap-1 z-10 pointer-events-none"
      >
        <div className="inline-flex rounded-full bg-black/75 p-0.5 sm:p-1 backdrop-blur-md border border-white/20 text-[9px] sm:text-[10px] font-bold text-white/90 shadow-md overflow-x-auto max-w-full qaida-scroll pointer-events-auto">
          {angles.map((a, idx) => (
            <button
              key={a.degree}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoSpinning(false);
                setCurrentIndex(idx);
              }}
              className={`px-1.5 sm:px-2 py-0.5 rounded-full transition text-[9px] sm:text-[10px] whitespace-nowrap cursor-pointer ${
                currentIndex === idx
                  ? "bg-emerald-600 text-white font-black shadow-sm"
                  : "hover:bg-white/20 text-white/80"
              }`}
            >
              {a.degree === 0
                ? "Front (0°)"
                : a.degree === 90
                ? "Side (90°)"
                : a.degree === 180
                ? "Back (180°)"
                : a.degree === 270
                ? "Left (270°)"
                : `${a.degree}°`}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Bar: Title & Zoom */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white z-10 min-w-0"
      >
        <p className="text-[11px] sm:text-xs font-black drop-shadow text-white/95 truncate mr-2 min-w-0">
          {focusTitle} · <span className="text-emerald-300">{currentAngle.label}</span>
        </p>
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onZoom(activeImage);
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-black/60 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold backdrop-blur-md transition hover:bg-black/80 hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
          title="Open high-resolution zoom"
        >
          <ZoomIn size={12} />
          <span>Zoom</span>
        </button>
      </div>
    </div>
  );
}

/** Interactive 3D Card that tilts and tracks mouse movement with specular glare */
function Interactive3DStageView({
  image,
  title,
  focusTitle,
  reducedMotion,
  onZoom,
}: {
  image: string;
  title: string;
  focusTitle: string;
  reducedMotion: boolean;
  onZoom: () => void;
}) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 14;
    const rotY = ((x - centerX) / centerX) * 18;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((p) => ({ ...p, opacity: 0 }));
  };

  const setAnglePreset = (angle: "center" | "left" | "right") => {
    if (angle === "center") {
      setRotateX(0);
      setRotateY(0);
    } else if (angle === "left") {
      setRotateX(2);
      setRotateY(-16);
    } else if (angle === "right") {
      setRotateX(2);
      setRotateY(16);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex w-full max-w-full aspect-[4/3] sm:aspect-[4/3] sm:min-h-[20rem] max-h-[28rem] flex-col overflow-hidden rounded-2xl bg-slate-950 shadow-xl border border-emerald-400/50 select-none cursor-grab active:cursor-grabbing"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="relative h-full w-full"
        animate={{
          rotateX,
          rotateY,
          scale: isHovered && !reducedMotion ? 1.015 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 24,
          mass: 0.6,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative h-full w-full">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 650px"
            className="object-contain sm:object-cover object-center"
            priority
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 380px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}), transparent 80%)`,
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/25" />

        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
          <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black text-white backdrop-blur-md border border-white/20 shadow">
            <Compass size={12} className="text-amber-400 animate-spin-slow shrink-0" />
            <span className="sm:hidden">3D View</span>
            <span className="hidden sm:inline">Interactive 3D View</span>
            <span className="hidden md:inline text-[9px] font-bold text-emerald-300 ml-1">
              (Move to tilt)
            </span>
          </div>

          <div className="inline-flex rounded-full bg-black/50 p-0.5 backdrop-blur-md border border-white/20 text-[9px] sm:text-[10px] font-bold text-white/90">
            <button
              type="button"
              onClick={() => setAnglePreset("left")}
              className="px-1.5 sm:px-2 py-0.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="Tilt left"
            >
              ↖ Left
            </button>
            <button
              type="button"
              onClick={() => setAnglePreset("center")}
              className="px-1.5 sm:px-2 py-0.5 rounded-full hover:bg-white/20 transition font-black text-emerald-300 cursor-pointer"
              title="Reset center"
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => setAnglePreset("right")}
              className="px-1.5 sm:px-2 py-0.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="Tilt right"
            >
              Right ↗
            </button>
          </div>
        </div>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white z-10 min-w-0">
          <p className="text-[11px] sm:text-xs font-black drop-shadow-md text-white/95 truncate mr-2 min-w-0">
            {focusTitle}
          </p>
          <button
            type="button"
            onClick={onZoom}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-black/60 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold backdrop-blur-md transition hover:bg-black/80 hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
            title="Open high-resolution zoom"
          >
            <ZoomIn size={12} />
            <span>Zoom</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function SalahPostureStage({
  step,
  reducedMotion,
  onPracticed,
  onInteract,
  practiced,
}: SalahPostureStageProps) {
  const [replayToken, setReplayToken] = useState(0);
  const [holding, setHolding] = useState(false);
  const [holdLeft, setHoldLeft] = useState(HOLD_SECONDS);
  const [burst, setBurst] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isStageZoomed, setIsStageZoomed] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const stepDetail = getStepDetail(step.id, step.posture);
  const has3D = Boolean(stepDetail?.image);

  const [mediaMode, setMediaMode] = useState<"3d" | "figure" | "video">(() => {
    if (has3D) return "3d";
    if (step.videoUrl) return "video";
    return "figure";
  });

  const wudu = isWuduPosture(step.posture) || (step.posture === "overview" && step.id.startsWith("w-"));
  const spec = specFor(step.posture);
  const wuduMeta = wudu ? WUDU_META[step.posture as keyof typeof WUDU_META] : null;

  const salamSide: "right" | "left" | undefined =
    step.posture === "salam" ? (/left/i.test(step.title) ? "left" : "right") : undefined;

  const checks = wuduMeta ? wuduMeta.checks : spec.checks.map((c) => c.label);
  const name = wuduMeta ? wuduMeta.name : spec.name;
  const arabic = wuduMeta ? wuduMeta.arabic : spec.arabic;

  // Reset state on step change
  useEffect(() => {
    setHolding(false);
    setHoldLeft(HOLD_SECONDS);
    setBurst(false);
    setActivePhaseIndex(0);
    setIsStageZoomed(false);
    setZoomedImage(null);

    if (has3D) {
      setMediaMode("3d");
    } else if (step.videoUrl) {
      setMediaMode("video");
    } else {
      setMediaMode("figure");
    }

    if (timerRef.current) window.clearInterval(timerRef.current);
  }, [step.id, step.videoUrl, has3D]);

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
  const currentVideoUrl =
    step.videoPhases && step.videoPhases.length > 0
      ? step.videoPhases[activePhaseIndex]?.url ?? step.videoUrl
      : step.videoUrl;
  const videoId = extractYouTubeId(currentVideoUrl);

  const openZoom = (img?: string) => {
    setZoomedImage(img ?? stepDetail?.image ?? null);
    setIsStageZoomed(true);
  };

  return (
    <div className="flex h-full w-full max-w-full min-w-0 flex-col gap-3">
      {/* Title row & Mode Switcher (Fully Responsive for Phones & Tablets) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-full">
        <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0 w-full sm:w-auto">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600 block">
              {wudu ? "Wudu step" : "Body posture"}
              {wuduMeta && (
                <span className="ml-1.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-sky-800">{wuduMeta.times}</span>
              )}
            </span>
            <p className="truncate text-sm sm:text-lg font-black text-emerald-950">{name}</p>
          </div>
          {arabic && (
            <span className="qaida-arabic text-xl sm:text-2xl font-black text-emerald-800 shrink-0 ml-1 select-none" lang="ar" dir="rtl">
              {arabic}
            </span>
          )}
        </div>

        {/* Interactive Multi-View Switcher (3D Pixar / Cartoon Rig / Video) */}
        <div className="inline-flex items-center self-start sm:self-auto rounded-xl bg-emerald-100/90 p-0.5 text-xs font-black shadow-inner shrink-0 max-w-full overflow-x-auto">
          {has3D && (
            <button
              type="button"
              onClick={() => setMediaMode("3d")}
              className={`inline-flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] transition cursor-pointer whitespace-nowrap ${
                mediaMode === "3d"
                  ? "bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-300"
                  : "text-emerald-800 hover:text-emerald-950"
              }`}
              title="View interactive 3D Pixar character render"
            >
              <Sparkles size={11} aria-hidden="true" />
              <span>{stepDetail?.angles360 ? (
                <>
                  <span className="sm:hidden">360°</span>
                  <span className="hidden sm:inline">360° Spin</span>
                </>
              ) : "3D View"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMediaMode("figure")}
            className={`inline-flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] transition cursor-pointer whitespace-nowrap ${
              mediaMode === "figure"
                ? "bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-300"
                : "text-emerald-800 hover:text-emerald-950"
            }`}
            title="View 2D diagram and posture skeleton"
          >
            <ImageIcon size={11} aria-hidden="true" />
            <span>Diagram</span>
          </button>

          {step.videoUrl && videoId && (
            <button
              type="button"
              onClick={() => setMediaMode("video")}
              className={`inline-flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] transition cursor-pointer whitespace-nowrap ${
                mediaMode === "video"
                  ? "bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-300"
                  : "text-emerald-800 hover:text-emerald-950"
              }`}
            >
              <Video size={11} aria-hidden="true" />
              <span>Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage Canvas */}
      <div className="relative w-full max-w-full aspect-[4/3] sm:aspect-[4/3] sm:min-h-[20rem] max-h-[28rem] overflow-hidden rounded-2xl shadow-md">
        <AnimatePresence mode="wait" initial={false}>
          {mediaMode === "video" && step.videoUrl && videoId ? (
            <motion.div
              key={`video-${step.id}-${activePhaseIndex}`}
              className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl bg-slate-900 p-2 sm:p-3"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {step.videoPhases && step.videoPhases.length > 1 && (
                <div className="mb-2 flex w-full flex-wrap items-center justify-center gap-1.5 z-10">
                  {step.videoPhases.map((phase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhaseIndex(idx)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black transition cursor-pointer ${
                        activePhaseIndex === idx
                          ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300"
                          : "border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
                      }`}
                    >
                      <Video size={11} aria-hidden="true" />
                      <span>{phase.label}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="relative w-full flex-1 overflow-hidden rounded-xl bg-black shadow-inner">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                  title={`${step.title} cartoon video`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="mt-1.5 flex w-full flex-wrap items-center justify-between gap-1.5 px-1 text-[11px] font-bold text-white/90">
                <span className="flex items-center gap-1 truncate min-w-0">
                  <Video size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {step.videoPhases && step.videoPhases.length > 1
                      ? step.videoPhases[activePhaseIndex]?.label ?? "Cartoon Video Lesson"
                      : "Cartoon Video Lesson"}
                  </span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {videoId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-red-600 hover:bg-red-500 px-2 py-0.5 text-[10px] font-black text-white shadow-xs transition active:scale-95"
                      title="Open video directly in YouTube App"
                    >
                      <ExternalLink size={10} />
                      <span>Open in YouTube App</span>
                    </a>
                  )}
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white">
                    Step {step.order}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : mediaMode === "3d" && stepDetail?.image ? (
            <motion.div
              key={`3d-${step.id}`}
              className="relative h-full w-full"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {stepDetail.angles360 && stepDetail.angles360.length > 1 ? (
                <Interactive360Turntable
                  angles={stepDetail.angles360}
                  fallbackImage={stepDetail.image}
                  title={step.title}
                  focusTitle={stepDetail.focusTitle}
                  reducedMotion={reducedMotion}
                  onZoom={openZoom}
                />
              ) : (
                <Interactive3DStageView
                  image={stepDetail.image}
                  title={step.title}
                  focusTitle={stepDetail.focusTitle}
                  reducedMotion={reducedMotion}
                  onZoom={() => openZoom()}
                />
              )}
            </motion.div>
          ) : wudu ? (
            <motion.div
              key={`wudu-${step.posture}`}
              className="relative flex h-full w-full items-center justify-center rounded-2xl border border-emerald-200 bg-gradient-to-b from-sky-50 via-white to-emerald-50 p-3 shadow-inner"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <WuduVisual
                posture={step.posture as keyof typeof WUDU_META}
                reducedMotion={reducedMotion}
                className="h-full w-full max-h-[20rem]"
              />
            </motion.div>
          ) : (
            <motion.div
              key="rig"
              className="relative flex h-full w-full items-center justify-center rounded-2xl border border-emerald-200 bg-gradient-to-b from-sky-50 via-white to-emerald-50 p-3 shadow-inner"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SalahPostureFigure
                posture={step.posture}
                salamSide={salamSide}
                reducedMotion={reducedMotion}
                replayToken={replayToken}
                className="h-full w-full max-h-[21rem]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hold ring overlay */}
        <AnimatePresence>
          {holding && (
            <motion.div
              key="hold"
              className="absolute inset-x-0 bottom-4 flex justify-center z-20 pointer-events-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-center gap-3 rounded-full border border-amber-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur pointer-events-auto">
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
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-amber-800">
                    {holdLeft}
                  </span>
                </div>
                <p className="text-xs font-black text-amber-900">Hold the pose like the 3D picture…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
          <StarBurst active={burst} count={10} size="lg" />
        </div>
      </div>

      {/* Body checks */}
      <ul className="flex flex-wrap gap-1.5 max-w-full" aria-label="Body checks">
        {checks.map((c, i) => (
          <motion.li
            key={`${step.id}-${c}`}
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.35 + i * 0.12 }}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-900 shadow-2xs max-w-full"
          >
            <Check size={12} className="text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="break-words">{c}</span>
          </motion.li>
        ))}
      </ul>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
        <button
          type="button"
          onClick={() => {
            onInteract?.();
            setMediaMode("figure");
            setReplayToken((t) => t + 1);
          }}
          className="w-full inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-800 transition hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 active:scale-98 cursor-pointer"
          title="See animated diagram transition"
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>Replay movement</span>
        </button>

        <button
          type="button"
          disabled={holding}
          onClick={() => {
            onInteract?.();
            setHoldLeft(HOLD_SECONDS);
            setHolding(true);
          }}
          className={`w-full inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:opacity-60 active:scale-98 cursor-pointer ${
            practiced
              ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
              : "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md hover:from-amber-500 hover:to-orange-600"
          }`}
        >
          {practiced ? <Sparkles size={14} aria-hidden="true" /> : <Timer size={14} aria-hidden="true" />}
          <span>{practiced ? "Practised · do it again" : `Now you try · hold ${HOLD_SECONDS}s`}</span>
        </button>
      </div>

      {/* Stage Zoom Lightbox Modal */}
      <AnimatePresence>
        {isStageZoomed && (zoomedImage ?? stepDetail?.image) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsStageZoomed(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-white/20"
            >
              <div className="relative aspect-video w-full max-w-3xl">
                <Image
                  src={zoomedImage ?? stepDetail?.image ?? ""}
                  alt={`${step.title} high resolution 3D preview`}
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
                  <p className="text-xs font-semibold text-emerald-700">{stepDetail?.focusTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStageZoomed(false)}
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
    </div>
  );
}
