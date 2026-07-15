"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import QaidaSidebar from "./QaidaSidebar";
import QaidaHUD from "./QaidaHUD";
import FloatingParticles from "../animations/FloatingParticles";
import ConfettiExplosion from "../animations/ConfettiExplosion";
import CoinRain from "../animations/CoinRain";
import { useQaidaState } from "../state/useQaidaState";
import { LETTERS } from "../data/curriculum";

const LessonScreen = dynamic(() => import("../screens/LessonScreen"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const JourneyMap = dynamic(() => import("../screens/JourneyMap"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const GamesHub = dynamic(() => import("../screens/GamesHub"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const ProgressScreen = dynamic(() => import("../screens/ProgressScreen"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const BubblePop = dynamic(() => import("../games/BubblePop"), { ssr: false });
const FindLetter = dynamic(() => import("../games/FindLetter"), { ssr: false });
const MemoryMatch = dynamic(() => import("../games/MemoryMatch"), { ssr: false });
const QuickChallenge = dynamic(() => import("../games/QuickChallenge"), { ssr: false });

type ActiveView = "dashboard" | "journey" | "qaida" | "lessons" | "games" | "practice" | "rewards" | "certificates" | "parents" | "teachers" | "settings";
type ActiveGame = "bubble-pop" | "find-letter" | "memory-match" | "quick-challenge" | "letter-train" | "puzzle" | "sound-match" | null;

function QaidaLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        className="text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="text-6xl" style={{ fontFamily: "serif" }}>ن</div>
        <div className="mt-2 text-sm text-gray-500">Loading…</div>
      </motion.div>
    </div>
  );
}

function WelcomeDashboard({ onStart, progress }: { onStart: () => void; progress: ReturnType<typeof useQaidaState>["progress"] }) {
  const completedCount = LETTERS.filter((l) => progress.completed.includes(`letter-${l.id}`)).length;
  const pct = Math.round((completedCount / 28) * 100);
  const earnedBadges = progress.badges.filter((b) => b.earned).length;

  return (
    <div className="relative flex h-full flex-col gap-6 overflow-y-auto p-6">
      <FloatingParticles count={15} />

      {/* Hero */}
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 p-8 text-white shadow-2xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <FloatingParticles count={8} />
        <div className="relative z-10">
          <h1 className="text-3xl font-black">Noorani Qaida 📖</h1>
          <p className="mt-1 text-emerald-200">Interactive Arabic learning for children</p>
          <motion.button
            className="mt-4 rounded-2xl bg-white px-6 py-3 font-bold text-green-700 shadow-lg"
            onClick={onStart}
            whileHover={{ scale: 1.04, boxShadow: "0 10px 30px rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.97 }}
          >
            {completedCount === 0 ? "🚀 Start Learning!" : "📖 Continue Learning"}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: "📖", label: "Letters Learned", value: `${completedCount}/28`, color: "from-green-400 to-emerald-500" },
          { icon: "⚡", label: "Total XP", value: progress.xp, color: "from-yellow-400 to-amber-500" },
          { icon: "🪙", label: "Coins", value: progress.coins, color: "from-orange-400 to-orange-600" },
          { icon: "🏆", label: "Badges", value: `${earnedBadges}/${progress.badges.length}`, color: "from-purple-400 to-purple-600" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-4 text-white shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className="text-2xl">{stat.icon}</div>
            <div className="mt-1 text-2xl font-black">{stat.value}</div>
            <div className="text-xs opacity-80">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Progress */}
      <motion.div
        className="rounded-3xl bg-white p-6 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Overall Progress</h2>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">{pct}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-gray-100 shadow-inner">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-md"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-500">{completedCount} of 28 Arabic letters completed</div>
      </motion.div>

      {/* Badges showcase */}
      <motion.div
        className="rounded-3xl bg-white p-6 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="mb-4 text-lg font-bold text-gray-900">Your Badges</h2>
        <div className="flex flex-wrap gap-3">
          {progress.badges.map((badge) => (
            <motion.div
              key={badge.id}
              className={`relative flex flex-col items-center gap-1 rounded-2xl p-3 ${
                badge.earned ? "bg-gradient-to-br from-yellow-50 to-amber-100 shadow-md" : "bg-gray-50 opacity-50"
              }`}
              whileHover={badge.earned ? { scale: 1.05 } : {}}
              title={badge.description}
            >
              <span className="text-2xl">{badge.earned ? badge.icon : "🔒"}</span>
              <span className="text-center text-[10px] font-semibold text-gray-600 max-w-[56px] leading-tight">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function QaidaShell() {
  const state = useQaidaState();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCoinRain, setShowCoinRain] = useState(false);

  const currentLetter = activeLetterId
    ? LETTERS.find((l) => `letter-${l.id}` === activeLetterId) ?? LETTERS[0]
    : LETTERS.find((l) => `letter-${l.id}` === state.currentLesson) ?? LETTERS[0];

  const handleNavigate = useCallback((view: ActiveView) => {
    setActiveView(view);
    setActiveGame(null);
    if (view === "lessons" || view === "qaida") {
      setActiveLetterId(state.currentLesson);
    }
  }, [state.currentLesson]);

  const handleLetterSelect = useCallback((id: string) => {
    setActiveLetterId(id);
    setActiveView("qaida");
    setActiveGame(null);
  }, []);

  const handleGameSelect = useCallback((gameId: string) => {
    setActiveGame(gameId as ActiveGame);
  }, []);

  const handleLessonComplete = useCallback(() => {
    if (activeLetterId) {
      state.completeScreen(activeLetterId);
      state.dispatch({ type: "earn_coins", amount: 15 });
    }
    setShowConfetti(true);
    setShowCoinRain(true);
    setTimeout(() => {
      setShowConfetti(false);
      setShowCoinRain(false);
      // Auto-advance to next letter
      const currentId = activeLetterId ?? state.currentLesson;
      const num = parseInt(currentId.replace("letter-", ""), 10);
      if (num < 28) {
        setActiveLetterId(`letter-${num + 1}`);
      } else {
        setActiveView("journey");
      }
    }, 3500);
  }, [activeLetterId, state]);

  const handleGameComplete = useCallback((stars: 1 | 2 | 3) => {
    state.dispatch({ type: "game_completed" });
    state.dispatch({ type: "earn_xp", amount: stars * 15 });
    state.dispatch({ type: "earn_coins", amount: stars * 5 });
    if (stars === 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setTimeout(() => setActiveGame(null), 1500);
  }, [state]);

  const getBreadcrumb = () => {
    if (activeGame) return "Mini Game";
    if (activeView === "qaida" || activeView === "lessons") return "Unit 1 · Alphabet";
    if (activeView === "journey") return "Learning Path";
    if (activeView === "games") return "Games Hub";
    return "Dashboard";
  };

  const getTitle = () => {
    if (activeGame === "bubble-pop") return "Bubble Pop 🫧";
    if (activeGame === "find-letter") return "Find the Letter 🔍";
    if (activeGame === "memory-match") return "Memory Match 🃏";
    if (activeGame === "quick-challenge") return "Quick Challenge ⚡";
    if (activeView === "qaida" || activeView === "lessons") {
      return `${currentLetter.id}. ${currentLetter.name}`;
    }
    if (activeView === "journey") return "Letter Journey";
    if (activeView === "games") return "Games";
    return "Noorani Qaida";
  };

  return (
    <div className="flex h-full overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      {/* Confetti / Coin effects */}
      <ConfettiExplosion active={showConfetti} />
      <CoinRain active={showCoinRain} count={10} />

      {/* Sidebar */}
      <QaidaSidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        userName="Ali Raza"
        xp={state.progress.xp}
        level={state.progress.level}
        xpMax={state.progress.xpMax}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* HUD */}
        <QaidaHUD
          progress={state.progress}
          breadcrumb={getBreadcrumb()}
          title={getTitle()}
          onBack={activeGame ? () => setActiveGame(null) : activeView !== "dashboard" ? () => setActiveView("dashboard") : undefined}
          audioEnabled={state.audioEnabled}
          onAudioToggle={() => state.setAudioEnabled(!state.audioEnabled)}
        />

        {/* Content area */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Active game overlay */}
            {activeGame ? (
              <motion.div
                key={`game-${activeGame}`}
                className="absolute inset-0 bg-white"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {activeGame === "bubble-pop" && (
                  <BubblePop
                    letters={LETTERS}
                    targetLetter={currentLetter}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame === "find-letter" && (
                  <FindLetter
                    letters={LETTERS}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame === "memory-match" && (
                  <MemoryMatch
                    letters={LETTERS.slice(0, 8)}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame === "quick-challenge" && (
                  <QuickChallenge
                    letters={LETTERS}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame !== "bubble-pop" && activeGame !== "find-letter" && activeGame !== "memory-match" && activeGame !== "quick-challenge" && (
                  <QuickChallenge
                    letters={LETTERS}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
              </motion.div>
            ) : activeView === "dashboard" ? (
              <motion.div
                key="dashboard"
                className="absolute inset-0 overflow-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WelcomeDashboard
                  onStart={() => handleNavigate("lessons")}
                  progress={state.progress}
                />
              </motion.div>
            ) : activeView === "journey" ? (
              <motion.div
                key="journey"
                className="absolute inset-0 overflow-y-auto"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <JourneyMap
                  progress={state.progress}
                  onSelectLetter={handleLetterSelect}
                />
              </motion.div>
            ) : activeView === "games" ? (
              <motion.div
                key="games"
                className="absolute inset-0 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GamesHub
                  onGameSelect={handleGameSelect}
                  progress={state.progress}
                />
              </motion.div>
            ) : (activeView === "rewards" || activeView === "certificates") ? (
              <motion.div
                key="progress"
                className="absolute inset-0 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ProgressScreen progress={state.progress} />
              </motion.div>
            ) : (
              /* Default: lesson screen (qaida, lessons, practice) */
              <motion.div
                key={`lesson-${activeLetterId ?? state.currentLesson}`}
                className="absolute inset-0 overflow-auto"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <LessonScreen
                  letter={currentLetter}
                  progress={state.progress}
                  onComplete={handleLessonComplete}
                  onGameSelect={handleGameSelect}
                  audioEnabled={state.audioEnabled}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
