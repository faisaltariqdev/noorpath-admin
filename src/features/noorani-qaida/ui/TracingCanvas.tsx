"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { validateTrace } from "./tracingValidation";

interface Point {
  x: number;
  y: number;
}

interface TracingCanvasProps {
  letter: string;
  onComplete?: () => void;
}

const COMPLETION_SCORE = 68;

export default function TracingCanvas({ letter, onComplete }: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideMaskRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Point[][]>([]);
  const activeStrokeRef = useRef<Point[] | null>(null);
  const completedRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState("Trace over the dotted letter shape.");

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    const fontSize = Math.min(height * 0.68, width * 0.48, 150);
    const arabicFont = getComputedStyle(canvas).getPropertyValue("--font-qaida-arabic").trim() || "serif";
    const font = `700 ${fontSize}px ${arabicFont}, serif`;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.direction = "rtl";
    context.font = font;
    context.fillStyle = "rgba(22, 101, 52, 0.08)";
    context.fillText(letter, width / 2, height / 2);
    context.setLineDash([5, 7]);
    context.strokeStyle = "rgba(16, 185, 129, 0.42)";
    context.lineWidth = 2;
    context.strokeText(letter, width / 2, height / 2);
    context.setLineDash([]);

    const drawStroke = (stroke: Point[]) => {
      if (stroke.length < 2) return;
      context.beginPath();
      context.moveTo(stroke[0].x, stroke[0].y);
      stroke.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.strokeStyle = "#10b981";
      context.lineWidth = 9;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.shadowColor = "rgba(16, 185, 129, 0.75)";
      context.shadowBlur = 10;
      context.stroke();
      context.shadowBlur = 0;
    };

    strokesRef.current.forEach(drawStroke);
    if (activeStrokeRef.current) drawStroke(activeStrokeRef.current);

    const guide = guideMaskRef.current ?? document.createElement("canvas");
    guideMaskRef.current = guide;
    guide.width = canvas.width;
    guide.height = canvas.height;
    const guideContext = guide.getContext("2d");
    if (!guideContext) return;
    guideContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    guideContext.clearRect(0, 0, width, height);
    guideContext.textAlign = "center";
    guideContext.textBaseline = "middle";
    guideContext.direction = "rtl";
    guideContext.font = font;
    guideContext.fillStyle = "#000";
    guideContext.fillText(letter, width / 2, height / 2);
  }, [letter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(drawScene);
    observer.observe(canvas);
    drawScene();
    return () => observer.disconnect();
  }, [drawScene]);

  useEffect(() => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    completedRef.current = false;
    setCompleted(false);
    setScore(0);
    setStatus("Trace over the dotted letter shape.");
    drawScene();
  }, [drawScene, letter]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rectangle = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rectangle.left, y: event.clientY - rectangle.top };
  };

  const evaluate = useCallback(() => {
    const canvas = canvasRef.current;
    const guide = guideMaskRef.current;
    const guideContext = guide?.getContext("2d");
    if (!canvas || !guide || !guideContext) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const points = strokesRef.current.flat();
    if (points.length < 8) {
      setStatus("Keep tracing along the letter shape.");
      return;
    }

    const image = guideContext.getImageData(0, 0, guide.width, guide.height);
    let matchingPoints = 0;
    let distance = 0;

    strokesRef.current.forEach((stroke) => {
      stroke.forEach((point, index) => {
        if (index > 0) {
          distance += Math.hypot(point.x - stroke[index - 1].x, point.y - stroke[index - 1].y);
        }

        const pixelX = Math.max(0, Math.min(guide.width - 1, Math.round(point.x * dpr)));
        const pixelY = Math.max(0, Math.min(guide.height - 1, Math.round(point.y * dpr)));
        let matched = false;
        const radius = Math.round(15 * dpr);
        for (let y = -radius; y <= radius && !matched; y += Math.max(1, Math.round(3 * dpr))) {
          for (let x = -radius; x <= radius; x += Math.max(1, Math.round(3 * dpr))) {
            const sampleX = pixelX + x;
            const sampleY = pixelY + y;
            if (sampleX < 0 || sampleY < 0 || sampleX >= guide.width || sampleY >= guide.height) continue;
            if (image.data[(sampleY * guide.width + sampleX) * 4 + 3] > 20) {
              matched = true;
              break;
            }
          }
        }
        if (matched) matchingPoints += 1;
      });
    });

    const validation = validateTrace({
      matchingPoints,
      totalPoints: points.length,
      distance,
      targetDistance: Math.max(180, canvas.clientWidth * 0.75),
      strokeCount: strokesRef.current.length,
    }, COMPLETION_SCORE);
    const { accuracy, score: nextScore } = validation;
    setScore((current) => Math.max(current, nextScore));

    if (validation.complete && !completedRef.current) {
      completedRef.current = true;
      setCompleted(true);
      setStatus("Excellent tracing. The letter shape is complete.");
      onComplete?.();
    } else if (accuracy < 0.45) {
      setStatus("Try staying closer to the dotted letter.");
    } else {
      setStatus("Good tracing. Add another careful stroke.");
    }
  }, [onComplete]);

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (completedRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    activeStrokeRef.current = [getPoint(event)];
    setIsDrawing(true);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeStrokeRef.current || completedRef.current) return;
    activeStrokeRef.current.push(getPoint(event));
    drawScene();
  };

  const finish = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeStrokeRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    strokesRef.current.push(activeStrokeRef.current);
    activeStrokeRef.current = null;
    setIsDrawing(false);
    drawScene();
    evaluate();
  };

  const clear = () => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    completedRef.current = false;
    setCompleted(false);
    setScore(0);
    setStatus("Canvas cleared. Trace over the dotted letter shape.");
    drawScene();
  };

  const completeKeyboardAlternative = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    setScore(100);
    setStatus("Guided letter-shape review completed.");
    onComplete?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="qaida-trace-stage relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 shadow-inner">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-crosshair touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={finish}
          aria-label={`Interactive tracing area for Arabic letter ${letter}`}
        />

        <AnimatePresence>
          {completed && (
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-emerald-500/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-2xl bg-white px-6 py-3 text-center shadow-xl"
                initial={{ scale: 0.7, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <div className="text-2xl" aria-hidden="true">★★★</div>
                <div className="font-black text-emerald-800">Excellent tracing</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
          <motion.div className="h-full rounded-full bg-emerald-500" animate={{ width: `${score}%` }} />
        </div>
        <span className="qaida-progress-value text-xs font-black text-emerald-800">{score}%</span>
      </div>

      <p className="text-sm font-semibold text-slate-600" role="status" aria-live="polite">{status}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-11 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200"
          onClick={clear}
        >
          Clear and retry
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800 hover:bg-emerald-50"
          onClick={completeKeyboardAlternative}
        >
          Keyboard alternative: shape reviewed
        </button>
      </div>
    </div>
  );
}
