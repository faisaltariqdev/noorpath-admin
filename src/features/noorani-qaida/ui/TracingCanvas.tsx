"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TracingCanvasProps {
  letter: string;
  onComplete?: () => void;
}

export default function TracingCanvas({ letter, onComplete }: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw guide letter faintly
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Guide letter
    ctx.globalAlpha = 0.12;
    ctx.font = `bold ${Math.min(canvas.height * 0.6, 100)}px serif`;
    ctx.fillStyle = "#166534";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = "rtl";
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);
    ctx.globalAlpha = 1;

    // Dotted trace path hint
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.25;
    ctx.font = `bold ${Math.min(canvas.height * 0.6, 100)}px serif`;
    ctx.strokeText(letter, canvas.width / 2, canvas.height / 2);
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
  }, [letter]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (completed) return;
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
  }, [completed]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || completed) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "#10b981";
    ctx.shadowBlur = 8;
    ctx.stroke();
    lastPos.current = pos;
  }, [isDrawing, completed]);

  const endDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStrokeCount((prev) => {
      const next = prev + 1;
      if (next >= 3 && !completed) {
        setCompleted(true);
        onComplete?.();
      }
      return next;
    });
  }, [isDrawing, completed, onComplete]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.12;
    ctx.font = `bold ${Math.min(canvas.height * 0.6, 100)}px serif`;
    ctx.fillStyle = "#166534";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);
    ctx.globalAlpha = 1;

    setStrokeCount(0);
    setCompleted(false);
  }, [letter]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-amber-50 shadow-inner" style={{ height: 160 }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          aria-label={`Tracing canvas for letter ${letter}`}
          role="img"
        />

        <AnimatePresence>
          {completed && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-green-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-2xl bg-white px-6 py-3 text-center shadow-xl"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-3xl">⭐</div>
                <div className="font-bold text-green-700">Excellent Tracing!</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {completed ? "✅ Tracing complete!" : `Draw ${Math.max(0, 3 - strokeCount)} more strokes to complete`}
        </div>
        <motion.button
          className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
          onClick={clearCanvas}
          whileTap={{ scale: 0.97 }}
          aria-label="Clear canvas and try again"
        >
          🔄 Clear
        </motion.button>
      </div>
    </div>
  );
}
