"use client";
import { motion, AnimatePresence } from "framer-motion";

type Mood = "happy" | "celebrate";

interface MascotProps {
  mood?: Mood;
  message?: string;
  size?: number;
  /** Corner placement when fixed. */
  position?: "bottom-left" | "bottom-right" | "inline";
  bubbleSide?: "right" | "left" | "top";
}

const SRC: Record<Mood, string> = {
  happy: "/kids/noori-happy.png",
  celebrate: "/kids/noori-celebrate.png",
};

export default function Mascot({
  mood = "happy",
  message,
  size = 120,
  position = "bottom-left",
  bubbleSide = "top",
}: MascotProps) {
  const fixedStyle: React.CSSProperties =
    position === "inline"
      ? { position: "relative" }
      : {
          position: "fixed",
          bottom: 14,
          [position === "bottom-left" ? "left" : "right"]: 14,
          zIndex: 60,
        };

  return (
    <div style={{ ...fixedStyle, pointerEvents: "none" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Speech bubble */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              style={{
                position: "absolute",
                ...(bubbleSide === "top"
                  ? { bottom: size - 12, left: "50%", transform: "translateX(-30%)" }
                  : bubbleSide === "right"
                  ? { left: size - 10, bottom: size * 0.35 }
                  : { right: size - 10, bottom: size * 0.35 }),
                background: "#fff",
                color: "#2d1b69",
                fontWeight: 800,
                fontSize: "0.82rem",
                padding: "9px 14px",
                borderRadius: 16,
                border: "3px solid #fbbf24",
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                whiteSpace: "nowrap",
                maxWidth: 220,
              }}
            >
              {message}
              {/* little tail */}
              <span
                style={{
                  position: "absolute",
                  ...(bubbleSide === "top"
                    ? { bottom: -9, left: "30%" }
                    : bubbleSide === "right"
                    ? { left: -9, bottom: 14 }
                    : { right: -9, bottom: 14 }),
                  width: 14,
                  height: 14,
                  background: "#fff",
                  borderRight: "3px solid #fbbf24",
                  borderBottom: "3px solid #fbbf24",
                  transform: "rotate(45deg)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={SRC[mood]}
          alt="Noori the moon"
          width={size}
          height={size}
          animate={
            mood === "celebrate"
              ? { y: [0, -16, 0], rotate: [-6, 6, -6], scale: [1, 1.08, 1] }
              : { y: [0, -8, 0], rotate: [-3, 3, -3] }
          }
          transition={{ duration: mood === "celebrate" ? 1.1 : 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: size,
            height: size,
            objectFit: "contain",
            filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.35))",
          }}
        />
      </div>
    </div>
  );
}
