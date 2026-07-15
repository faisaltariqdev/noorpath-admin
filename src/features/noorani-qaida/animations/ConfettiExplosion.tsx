"use client";
import { useEffect, useRef } from "react";

interface ConfettiExplosionProps {
  active: boolean;
  particleCount?: number;
  originX?: number;
  originY?: number;
}

const COLORS = ["#f5c518", "#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa", "#34d399"];

interface Particle {
  x: number; y: number; vx: number; vy: number;
  color: string; size: number; rotation: number;
  rotationSpeed: number; opacity: number; shape: "rect" | "circle";
}

export default function ConfettiExplosion({ active, particleCount = 80, originX, originY }: ConfettiExplosionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ox = originX ?? canvas.width / 2;
    const oy = originY ?? canvas.height / 3;

    particles.current = Array.from({ length: particleCount }, () => ({
      x: ox, y: oy,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -14 - 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 10 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      opacity: 1,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    const gravity = 0.5;
    let frame = 0;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;
      for (const p of particles.current) {
        if (p.opacity <= 0) continue;
        alive = true;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (frame > 40) p.opacity -= 0.02;
        ctx!.save();
        ctx!.globalAlpha = Math.max(0, p.opacity);
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
        ctx!.restore();
      }
      frame++;
      if (alive) rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, particleCount, originX, originY]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
    />
  );
}
