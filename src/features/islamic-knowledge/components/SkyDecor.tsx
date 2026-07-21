"use client";

import { motion } from "framer-motion";

export default function SkyDecor() {
  return (
    <div className="ik-sky" aria-hidden>
      <motion.div
        className="ik-sky-moon"
        animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        🌙
      </motion.div>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.span
          key={i}
          className="ik-sky-star"
          style={{
            left: `${12 + i * 15}%`,
            top: `${8 + (i % 3) * 12}%`,
            fontSize: `${0.7 + (i % 3) * 0.25}rem`,
          }}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
        >
          ✦
        </motion.span>
      ))}
      <motion.div
        className="ik-sky-cloud ik-sky-cloud-a"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="ik-sky-cloud ik-sky-cloud-b"
        animate={{ x: [0, -40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
