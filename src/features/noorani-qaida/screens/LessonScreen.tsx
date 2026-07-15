"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Letter, QaidaProgress } from "../types";
import { speakArabic } from "../audio/speech";
import LetterCard from "../characters/LetterCard";
import ZaydMascot from "../characters/ZaydMascot";
import OwlMascot from "../characters/OwlMascot";
import FloatingParticles from "../animations/FloatingParticles";
import StarBurst from "../animations/StarBurst";
import SparkleBurst from "../animations/SparkleBurst";

const ConfettiExplosion = dynamic(() => import("../animations/ConfettiExplosion"), { ssr: false });
const TracingCanvas = dynamic(() => import("../ui/TracingCanvas"), { ssr: false });

const GAMES = [
  { id: "bubble-pop", label: "Bubble Pop", icon: "🫧", color: "from-purple-400 to-purple-600" },
  { id: "find-letter", label: "Find Letter", icon: "🔍", color: "from-blue-400 to-blue-600" },
  { id: "letter-train", label: "Letter Train", icon: "🚂", color: "from-orange-400 to-orange-600" },
  { id: "memory-match", label: "Match it", icon: "🃏", color: "from-green-400 to-green-600" },
  { id: "quick-challenge", label: "Memory Game", icon: "❓", color: "from-pink-400 to-pink-600" },
  { id: "puzzle", label: "Puzzle", icon: "🧩", color: "from-indigo-400 to-indigo-600" },
];

type ActionTab = "trace" | "write" | "listen" | "repeat";

interface LessonScreenProps {
  letter: Letter;
  progress: QaidaProgress;
  onComplete: () => void;
  onGameSelect: (gameId: string) => void;
  audioEnabled?: boolean;
}

function MosqueBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-300 to-green-200" />
      {/* Sun */}
      <motion.div
        className="absolute right-8 top-4 h-16 w-16 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 shadow-2xl"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Clouds */}
      {[{ x: "10%", y: "15%", w: 80 }, { x: "60%", y: "10%", w: 60 }, { x: "40%", y: "25%", w: 50 }].map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white opacity-90 shadow-sm"
          style={{ left: c.x, top: c.y, width: c.w, height: c.w * 0.4 }}
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-600 to-green-400" />
      {/* Trees */}
      {[15, 75].map((x, i) => (
        <div key={i} className="absolute bottom-12" style={{ left: `${x}%` }}>
          <div className="mx-auto h-16 w-3 bg-amber-800" />
          <div className="-mt-10 h-16 w-14 rounded-full bg-green-700" style={{ marginLeft: -22 }} />
        </div>
      ))}
      {/* Mosque silhouette */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2">
        <div className="relative flex items-end justify-center gap-1">
          {/* Minarets */}
          <div className="flex flex-col items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            <div className="h-8 w-2 bg-amber-200/60" />
            <div className="h-3 w-4 rounded-t-full bg-amber-200/60" />
          </div>
          {/* Main dome */}
          <div className="flex flex-col items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            <div className="h-2 w-1 bg-amber-200/70" />
            <div className="h-10 w-20 rounded-t-full bg-white/40" />
            <div className="h-8 w-24 bg-white/30" />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            <div className="h-8 w-2 bg-amber-200/60" />
            <div className="h-3 w-4 rounded-t-full bg-amber-200/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonScreen({ letter, progress, onComplete, onGameSelect, audioEnabled = true }: LessonScreenProps) {
  const [activeTab, setActiveTab] = useState<ActionTab>("listen");
  const [showConfetti, setShowConfetti] = useState(false);
  const [starBurst, setStarBurst] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "excited" | "celebrating">("happy");
  const [mascotSpeech, setMascotSpeech] = useState(`Assalamu Alaikum! I am Zayd 👋\nToday we will learn ${letter.name}`);
  const [completedActivities, setCompletedActivities] = useState<Set<ActionTab>>(new Set());
  const [tracingCompleted, setTracingCompleted] = useState(false);
  const gameScrollRef = useRef<HTMLDivElement>(null);
  const isCompleted = progress.completed.includes(`letter-${letter.id}`);
  const totalActivities = 5;
  const doneActivities = completedActivities.size + (tracingCompleted ? 1 : 0);

  const speak = useCallback(() => {
    if (!audioEnabled) return;
    speakArabic(letter.letter);
    setMascotMood("excited");
    setMascotSpeech(`This is ${letter.name}! ${letter.example} means "${letter.meaning}"`);
    setSparkle(true);
    setTimeout(() => {
      setMascotMood("happy");
      setSparkle(false);
    }, 2000);
  }, [audioEnabled, letter]);

  // Auto-speak on mount
  useEffect(() => {
    const t = setTimeout(() => speak(), 800);
    return () => clearTimeout(t);
  }, [speak]);

  const handleActivityComplete = useCallback((tab: ActionTab) => {
    setCompletedActivities((prev) => new Set([...prev, tab]));
    setMascotMood("happy");
    setMascotSpeech("Excellent! Keep going! 🌟");
  }, []);

  const handleComplete = useCallback(() => {
    setShowConfetti(true);
    setStarBurst(true);
    setMascotMood("celebrating");
    setMascotSpeech("MashaAllah! You did it! 🎉");
    setTimeout(() => {
      setShowConfetti(false);
      setStarBurst(false);
      onComplete();
    }, 3000);
  }, [onComplete]);

  const TABS: { id: ActionTab; icon: string; label: string; color: string }[] = [
    { id: "trace", icon: "✏️", label: "Trace", color: "from-orange-400 to-orange-500" },
    { id: "write", icon: "📝", label: "Write", color: "from-blue-400 to-blue-500" },
    { id: "listen", icon: "🔊", label: "Listen", color: "from-green-400 to-green-500" },
    { id: "repeat", icon: "🎤", label: "Repeat", color: "from-purple-400 to-purple-500" },
  ];

  return (
    <>
      <ConfettiExplosion active={showConfetti} />

      <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto p-4 lg:flex-row">
        {/* LEFT: Character + Letter Card */}
        <div className="flex flex-col items-center gap-4 lg:w-80">
          {/* Zayd Character Panel */}
          <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-b from-sky-200 to-green-200 p-4 shadow-xl">
            <MosqueBackground />
            <div className="relative z-10 flex flex-col items-center">
              <ZaydMascot mood={mascotMood} speechBubble={mascotSpeech} size={130} />
            </div>
          </div>

          {/* Letter Card */}
          <motion.div
            className="relative flex w-full flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 to-white p-6 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <SparkleBurst active={sparkle} />
            <LetterCard letter={letter} size="lg" showForms onTap={speak} completed={isCompleted} />

            {/* Tap to hear button */}
            <motion.button
              className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-bold text-white shadow-lg"
              onClick={speak}
              whileHover={{ scale: 1.04, boxShadow: "0 10px 30px rgba(16,185,129,0.4)" }}
              whileTap={{ scale: 0.96 }}
              aria-label={`Hear pronunciation of ${letter.name}`}
            >
              🔊 Tap to hear
              <motion.span
                className="ml-1 h-2 w-2 rounded-full bg-white"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.button>
          </motion.div>
        </div>

        {/* RIGHT: Content Area */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Letter Details Card */}
          <motion.div
            className="rounded-3xl bg-white p-5 shadow-lg"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {letter.name} – <span className="text-green-700" dir="rtl">{letter.letter}</span>
                </h2>
                <p className="text-sm text-gray-500">Pronunciation: {letter.sound} (as in {letter.example})</p>
                <p className="text-sm text-gray-500">Makharij: {letter.makharij}</p>
              </div>
              <div className="text-3xl">📖</div>
            </div>

            {/* Context box */}
            <motion.div
              className="mt-3 flex items-start gap-3 rounded-2xl bg-amber-50 p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-xl">⭐</span>
              <div>
                <p className="text-sm font-medium text-amber-900">
                  <span dir="rtl" className="font-bold">{letter.example}</span> means &quot;{letter.meaning}&quot; in Arabic.
                  Every word in the Quran starts with a letter like this.
                </p>
              </div>
            </motion.div>

            {/* Action Tabs */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {TABS.map((tab) => {
                const done = completedActivities.has(tab.id) || (tab.id === "trace" && tracingCompleted);
                return (
                  <motion.button
                    key={tab.id}
                    className={`relative flex flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-b ${tab.color} p-3 text-white shadow-md ${activeTab === tab.id ? "ring-2 ring-white ring-offset-2" : ""}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === "listen") speak();
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    aria-label={tab.label}
                    aria-pressed={activeTab === tab.id}
                  >
                    {done && (
                      <motion.div
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[9px] text-yellow-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        ✓
                      </motion.div>
                    )}
                    <span className="text-xl">{tab.icon}</span>
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Tracing Canvas (when active) */}
          <AnimatePresence>
            {activeTab === "trace" && (
              <motion.div
                className="rounded-3xl bg-white p-4 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">✏️</span>
                  <h3 className="font-bold text-gray-800">Trace {letter.name}</h3>
                </div>
                <TracingCanvas
                  letter={letter.letter}
                  onComplete={() => {
                    setTracingCompleted(true);
                    handleActivityComplete("trace");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Games Carousel */}
          <motion.div
            className="rounded-3xl bg-gray-900 p-4 shadow-xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <h3 className="font-bold text-white">Let&apos;s Practice with Fun!</h3>
            </div>
            <div
              ref={gameScrollRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            >
              {GAMES.map((game) => (
                <motion.button
                  key={game.id}
                  className={`flex flex-shrink-0 flex-col items-center gap-2 rounded-2xl bg-gradient-to-b ${game.color} p-3 shadow-lg`}
                  style={{ width: 88 }}
                  onClick={() => {
                    onGameSelect(game.id);
                    handleActivityComplete("repeat");
                  }}
                  whileHover={{ scale: 1.06, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Play ${game.label} game`}
                >
                  <span className="text-3xl">{game.icon}</span>
                  <span className="text-center text-[11px] font-bold leading-tight text-white">{game.label}</span>
                </motion.button>
              ))}
              <motion.div
                className="flex flex-shrink-0 items-center justify-center"
                style={{ width: 32 }}
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-white/50 text-lg">→</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom Row: Goal + Owl + Badges + Next */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Today's Goal */}
            <motion.div
              className="rounded-2xl bg-white p-4 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <span>🎯</span>
                Today&apos;s Goal
              </div>
              <p className="mt-1 text-xs text-gray-500">Complete {totalActivities} activities</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                  animate={{ width: `${(doneActivities / totalActivities) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-400">{doneActivities} / {totalActivities}</div>
            </motion.div>

            {/* Owl Mascot */}
            <div className="flex items-center justify-center">
              <OwlMascot
                size={72}
                message={doneActivities >= 3 ? "Great job! Keep learning!" : "You're doing great!"}
                mood={doneActivities >= 3 ? "excited" : "happy"}
              />
            </div>

            {/* Badges */}
            <motion.div
              className="rounded-2xl bg-white p-4 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="mb-2 text-sm font-bold text-gray-700">Your Badges</div>
              <div className="flex flex-wrap gap-2">
                {progress.badges.slice(0, 5).map((badge) => (
                  <motion.div
                    key={badge.id}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-sm ${
                      badge.earned ? "bg-gradient-to-br from-yellow-200 to-amber-300" : "bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    title={`${badge.label}: ${badge.description}`}
                    animate={badge.earned ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {badge.earned ? badge.icon : "🔒"}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Reward panel + Next Letter */}
          <div className="flex gap-4">
            {/* Reward */}
            <motion.div
              className="relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 p-4 shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <StarBurst active={starBurst} count={6} size="sm" />
              <div className="flex items-start gap-3">
                <motion.div
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🪙
                </motion.div>
                <div>
                  <div className="font-bold text-white">Reward</div>
                  <div className="text-xs text-purple-200">
                    {isCompleted ? "Lesson complete! +25 XP" : "Complete the lesson to get your reward!"}
                  </div>
                  {!isCompleted && (
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-purple-900/50">
                      <motion.div
                        className="h-full rounded-full bg-yellow-400"
                        animate={{ width: `${(doneActivities / totalActivities) * 100}%` }}
                      />
                    </div>
                  )}
                  {!isCompleted && (
                    <div className="mt-0.5 text-[10px] text-purple-200">{doneActivities} / {totalActivities} Activities</div>
                  )}
                </div>
              </div>
              {isCompleted && (
                <motion.div
                  className="absolute right-2 top-2 text-2xl"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✅
                </motion.div>
              )}
            </motion.div>

            {/* Next button */}
            <motion.button
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-5 py-3 font-bold text-white shadow-xl ${
                isCompleted ? "bg-gradient-to-br from-yellow-400 to-amber-500" : "bg-gradient-to-br from-green-500 to-emerald-600"
              }`}
              onClick={handleComplete}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              aria-label={isCompleted ? "Already completed" : "Complete lesson and continue"}
            >
              <span className="text-lg">{isCompleted ? "✅" : "▶"}</span>
              <span className="text-sm">{isCompleted ? "Done" : "Next Letter"}</span>
              <span className="text-xl">→</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        className="border-t border-gray-100 bg-white/80 py-2 text-center text-xs text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        ❤️ Learn with Love • 🎮 Practice with Fun • 📈 Progress with Imaan 🌙
      </motion.div>
    </>
  );
}
