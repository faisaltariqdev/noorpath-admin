"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import NoorPathLogo from "@/components/NoorPathLogo";

export default function QaidaLoader() {
  return (
    <div
      className="flex h-full min-h-48 items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50"
      role="status"
      aria-live="polite"
      aria-label="Loading Noorani Qaida"
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="relative flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-emerald-700 to-teal-800 shadow-[0_18px_38px_-16px_rgba(6,78,59,0.7)]"
          animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/favicon.svg" alt="" width={52} height={52} priority />
          <motion.span
            className="absolute -right-1 -top-1 text-lg"
            animate={{ rotate: [0, 16, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            aria-hidden="true"
          >
            ✦
          </motion.span>
        </motion.div>

        <div className="mt-4">
          <NoorPathLogo size="lg" showTagline />
        </div>
        <p className="mt-3 text-sm font-bold text-emerald-800">Preparing your Noorani Qaida…</p>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-2 w-2 rounded-full bg-emerald-500"
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
