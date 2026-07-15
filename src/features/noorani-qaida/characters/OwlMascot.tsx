"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface OwlMascotProps {
  size?: number;
  message?: string;
  mood?: "neutral" | "happy" | "excited";
  className?: string;
}

export default function OwlMascot({ size = 80, message, mood = "neutral", className = "" }: OwlMascotProps) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 100);
    }, 3000 + Math.random() * 1500);
    return () => clearInterval(t);
  }, []);

  const eyeY = blink ? 0.1 : 1;

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {message && (
        <motion.div
          className="relative mb-1 max-w-[160px] rounded-xl bg-white px-3 py-1.5 text-center text-xs font-semibold text-gray-700 shadow-lg"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          key={message}
        >
          {message}
          <div className="absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
        </motion.div>
      )}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Body */}
        <ellipse cx="40" cy="52" rx="22" ry="25" fill="#854d0e" />
        {/* Belly */}
        <ellipse cx="40" cy="56" rx="14" ry="17" fill="#fef3c7" />
        {/* Wings */}
        <motion.path
          d="M18 45 Q8 52 12 65 Q22 58 25 50 Z"
          fill="#78350f"
          style={{ transformOrigin: "20px 50px" }}
          animate={{ rotate: mood === "excited" ? [0, -10, 0] : [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M62 45 Q72 52 68 65 Q58 58 55 50 Z"
          fill="#78350f"
          style={{ transformOrigin: "60px 50px" }}
          animate={{ rotate: mood === "excited" ? [0, 10, 0] : [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
        />
        {/* Tail */}
        <path d="M30 74 Q40 82 50 74 Q45 70 40 68 Q35 70 30 74 Z" fill="#92400e" />
        {/* Head */}
        <circle cx="40" cy="28" r="22" fill="#92400e" />
        {/* Ear tufts */}
        <path d="M26 12 L22 2 L30 10 Z" fill="#78350f" />
        <path d="M54 12 L58 2 L50 10 Z" fill="#78350f" />
        {/* Graduation hat */}
        <rect x="24" y="10" width="32" height="6" rx="2" fill="#14532d" />
        <rect x="30" y="6" width="20" height="6" rx="2" fill="#166534" />
        <line x1="44" y1="10" x2="52" y2="14" stroke="#f5c518" strokeWidth="1.5" />
        <circle cx="54" cy="15" r="2.5" fill="#f5c518" />
        {/* Eyes */}
        <circle cx="32" cy="28" r="10" fill="#fef3c7" />
        <circle cx="48" cy="28" r="10" fill="#fef3c7" />
        <circle cx="33" cy="26" r="7" fill="#166534" />
        <circle cx="49" cy="26" r="7" fill="#166534" />
        <motion.g animate={{ scaleY: eyeY }} style={{ transformOrigin: "33px 26px" }}>
          <circle cx="33" cy="26" r="5" fill="#111827" />
          <circle cx="35" cy="24" r="2" fill="white" />
        </motion.g>
        <motion.g animate={{ scaleY: eyeY }} style={{ transformOrigin: "49px 26px" }}>
          <circle cx="49" cy="26" r="5" fill="#111827" />
          <circle cx="51" cy="24" r="2" fill="white" />
        </motion.g>
        {/* Beak */}
        <path d="M37 34 L40 40 L43 34 Z" fill="#f59e0b" />
        {/* Feet */}
        <path d="M32 76 L28 80 M32 76 L32 80 M32 76 L36 80" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <path d="M48 76 L44 80 M48 76 L48 80 M48 76 L52 80" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </motion.svg>
    </div>
  );
}
