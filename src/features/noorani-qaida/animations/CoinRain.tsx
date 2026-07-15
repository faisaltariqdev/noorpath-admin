"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface CoinRainProps {
  active: boolean;
  count?: number;
}

export default function CoinRain({ active, count = 12 }: CoinRainProps) {
  const coins = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${5 + (i * 8) % 90}%`,
      delay: i * 0.08,
      size: 20 + (i % 4) * 4,
    })),
  [count]);

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden" aria-hidden="true">
          {coins.map((coin) => (
            <motion.div
              key={coin.id}
              className="absolute top-0 flex items-center justify-center rounded-full border-2 border-yellow-400 bg-gradient-to-b from-yellow-300 to-yellow-500 font-bold text-yellow-900 shadow-lg"
              style={{ left: coin.left, width: coin.size, height: coin.size, fontSize: coin.size * 0.45 }}
              initial={{ y: -60, opacity: 0, rotateY: 0 }}
              animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotateY: 720 }}
              transition={{ duration: 1.8, delay: coin.delay, ease: "easeIn" }}
            >
              ₿
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
