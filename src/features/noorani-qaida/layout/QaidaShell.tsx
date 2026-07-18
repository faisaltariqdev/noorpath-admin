"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, MotionConfig, type Variants } from "framer-motion";
import dynamic from "next/dynamic";
import QaidaSidebar from "./QaidaSidebar";
import QaidaHUD from "./QaidaHUD";
import FloatingParticles from "../animations/FloatingParticles";
import ConfettiExplosion from "../animations/ConfettiExplosion";
import CoinRain from "../animations/CoinRain";
import { useQaidaState } from "../state/useQaidaState";
import { LETTERS } from "../data/curriculum";
import { letterWindow } from "../data/games";
import { ALL_CURRICULUM_SCREEN_IDS, TOPIC_LESSON_BY_ID } from "../data/modules";
import { useMotionBudget } from "../motion/useMotionBudget";
import { pageVariants } from "../motion/config";
import QaidaLoader from "../ui/QaidaLoader";
import { getOverallCurriculumProgress } from "../state/curriculumProgress";
import { qaidaAudio } from "../audio/QaidaAudioService";
import VoiceSetupWizard, {
  hasCompletedVoiceSetup,
  markVoiceSetupCompleted,
  markVoiceSetupSeen,
} from "../ui/VoiceSetupWizard";
import { supabase } from "@/lib/supabase";

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
const NooraniBook = dynamic(() => import("../screens/NooraniBook"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const PracticeHub = dynamic(() => import("../screens/PracticeHub"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const TopicLessonScreen = dynamic(() => import("../screens/TopicLessonScreen"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const SalahLessonScreen = dynamic(() => import("../screens/SalahLessonScreen"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const ReviewAssessmentScreen = dynamic(() => import("../screens/ReviewAssessmentScreen"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const CertificateScreen = dynamic(() => import("../screens/CertificateScreen"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const ParentDashboard = dynamic(() => import("../screens/ParentDashboard"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const TutorDashboard = dynamic(() => import("../screens/TutorDashboard"), {
  loading: () => <QaidaLoader />,
});
const SettingsScreen = dynamic(() => import("../screens/SettingsScreen"), {
  ssr: false,
  loading: () => <QaidaLoader />,
});
const BubblePop = dynamic(() => import("../games/BubblePop"), { ssr: false });
const FindLetter = dynamic(() => import("../games/FindLetter"), { ssr: false });
const MemoryMatch = dynamic(() => import("../games/MemoryMatch"), { ssr: false });
const QuickChallenge = dynamic(() => import("../games/QuickChallenge"), { ssr: false });
const LetterTrain = dynamic(() => import("../games/LetterTrain"), { ssr: false });
const LetterPuzzle = dynamic(() => import("../games/LetterPuzzle"), { ssr: false });
const SoundMatch = dynamic(() => import("../games/SoundMatch"), { ssr: false });

type ActiveView = "dashboard" | "journey" | "qaida" | "lessons" | "games" | "practice" | "rewards" | "certificates" | "parents" | "teachers" | "settings";
type ActiveGame = "bubble-pop" | "find-letter" | "memory-match" | "quick-challenge" | "letter-train" | "puzzle" | "sound-match" | null;

/** Views a public website visitor can access in preview mode. */
const PREVIEW_UNLOCKED_VIEWS: ActiveView[] = ["lessons"];
/** The single lesson (Alif) unlocked for the public preview. */
const PREVIEW_LESSON_ID = "letter-1";
const DEFAULT_ENROL_URL = "https://www.noorpath.online/courses/noorani-qaida-online";

const DASHBOARD_CONTAINER_VARIANTS: Variants = {
  initial: {},
  enter: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const DASHBOARD_ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
};

function ProgressRing({ pct, reduced }: { pct: number; reduced: boolean }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex h-24 w-24 flex-none items-center justify-center" aria-hidden="true">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(16,84,48,0.12)" strokeWidth="8" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="url(#qaida-ring)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduced ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduced ? 0 : 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="qaida-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <span className="qaida-progress-value absolute text-lg font-black text-emerald-800">{pct}%</span>
    </div>
  );
}

function WelcomeDashboard({
  onStart,
  onNavigate,
  progress,
  particleCount,
  reducedMotion,
}: {
  onStart: () => void;
  onNavigate: (view: ActiveView) => void;
  progress: ReturnType<typeof useQaidaState>["progress"];
  particleCount: number;
  reducedMotion: boolean;
}) {
  const completedCount = LETTERS.filter((l) => progress.completed.includes(`letter-${l.id}`)).length;
  const curriculumProgress = getOverallCurriculumProgress(progress);
  const pct = curriculumProgress.percent;
  const earnedBadges = progress.badges.filter((b) => b.earned).length;
  const nextLetter = LETTERS.find((l) => !progress.completed.includes(`letter-${l.id}`)) ?? null;
  const isNew = completedCount === 0;

  const stats = [
    { icon: "📖", label: "Letters Learned", value: `${completedCount}/28`, tint: "text-emerald-700", chip: "bg-emerald-100" },
    { icon: "⚡", label: "Total XP", value: progress.xp, tint: "text-amber-700", chip: "bg-amber-100" },
    { icon: "🪙", label: "Coins", value: progress.coins, tint: "text-orange-700", chip: "bg-orange-100" },
    { icon: "🏆", label: "Badges", value: `${earnedBadges}/${progress.badges.length}`, tint: "text-violet-700", chip: "bg-violet-100" },
  ];

  const quickActions: { view: ActiveView; icon: string; title: string; caption: string; ring: string }[] = [
    { view: "qaida", icon: "📖", title: "Qaida Book", caption: "Explore all 28 letters", ring: "hover:border-emerald-300" },
    { view: "practice", icon: "🎮", title: "Practice", caption: "Games for this letter", ring: "hover:border-sky-300" },
    { view: "journey", icon: "🗺️", title: "My Progress", caption: "Follow your learning path", ring: "hover:border-violet-300" },
  ];

  return (
    <motion.div
      className="qaida-scroll relative mx-auto flex h-full w-full max-w-6xl flex-col gap-4 overflow-y-auto p-4 sm:gap-5 sm:p-6"
      variants={DASHBOARD_CONTAINER_VARIANTS}
      initial="initial"
      animate="enter"
    >
      <FloatingParticles count={particleCount} />

      {/* Hero */}
      <motion.section
        variants={DASHBOARD_ITEM_VARIANTS}
        className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/15 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-6 text-white shadow-[0_24px_60px_-20px_rgba(6,78,59,0.6)] sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" aria-hidden="true" />
        <FloatingParticles count={Math.min(5, particleCount)} />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-50 backdrop-blur-sm">
              <span aria-hidden="true">📖</span> Noorani Qaida
            </span>
            <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl xl:text-4xl">
              {isNew ? "Bismillah! Let’s begin learning." : "Welcome back — keep going!"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50/90 sm:text-base">
              Interactive Arabic letter learning for young readers, guided step by step with sound, tracing and play.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                className="qaida-premium-button inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-black text-emerald-800 shadow-lg shadow-emerald-950/20"
                onClick={onStart}
                whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span aria-hidden="true">{isNew ? "🚀" : "▶️"}</span>
                {isNew ? "Start Learning" : "Continue Learning"}
              </motion.button>
              {nextLetter && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                  Next: {nextLetter.name}
                  <span className="qaida-arabic text-lg leading-none" lang="ar" dir="rtl">{nextLetter.letter}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl bg-white/10 p-4 backdrop-blur-md">
            <ProgressRing pct={pct} reduced={reducedMotion} />
            <div className="pr-1">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-100/80">Progress</p>
              <p className="text-2xl font-black leading-tight">{completedCount}<span className="text-emerald-100/70">/28</span></p>
              <p className="text-xs text-emerald-100/80">alphabet letters</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={DASHBOARD_ITEM_VARIANTS}
            whileHover={reducedMotion ? undefined : { y: -4 }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-[0_10px_30px_-18px_rgba(6,78,59,0.5)] transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(6,78,59,0.45)]"
          >
            <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl text-xl ${stat.chip}`} aria-hidden="true">
              {stat.icon}
            </span>
            <div className="min-w-0">
              <div className={`qaida-progress-value text-xl font-black leading-tight ${stat.tint}`}>{stat.value}</div>
              <div className="truncate text-xs font-semibold text-slate-500">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress + quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.section
          variants={DASHBOARD_ITEM_VARIANTS}
          className="rounded-[1.5rem] border border-emerald-900/10 bg-white p-5 shadow-[0_14px_38px_-22px_rgba(6,78,59,0.5)] lg:col-span-2"
          aria-labelledby="qaida-overall-progress"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="qaida-overall-progress" className="text-base font-black text-slate-900">Overall Progress</h2>
            <span className="qaida-progress-value rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">{pct}%</span>
          </div>
          <div
            className="h-3.5 overflow-hidden rounded-full bg-emerald-950/[0.06]"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Arabic letters completed"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500"
              initial={reducedMotion ? false : { width: 0 }}
              animate={{ width: `${Math.max(pct, 2)}%` }}
              transition={{ duration: reducedMotion ? 0 : 1.1, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {isNew ? "Start your first letter to begin the journey." : `${curriculumProgress.completed} of ${curriculumProgress.total} curriculum lessons completed.`}
          </p>
        </motion.section>

        <motion.aside variants={DASHBOARD_ITEM_VARIANTS} className="grid gap-3" aria-label="Quick actions">
          {quickActions.map((action) => (
            <motion.button
              key={action.view}
              type="button"
              onClick={() => onNavigate(action.view)}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`group flex w-full items-center gap-3 rounded-2xl border border-emerald-900/10 bg-white p-3.5 text-left shadow-[0_10px_28px_-20px_rgba(6,78,59,0.5)] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${action.ring}`}
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-emerald-50 text-xl" aria-hidden="true">
                {action.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-slate-900">{action.title}</span>
                <span className="block truncate text-xs text-slate-500">{action.caption}</span>
              </span>
              <span className="translate-x-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" aria-hidden="true">→</span>
            </motion.button>
          ))}
        </motion.aside>
      </div>

      {/* Badges showcase */}
      <motion.section
        variants={DASHBOARD_ITEM_VARIANTS}
        className="rounded-[1.5rem] border border-emerald-900/10 bg-white p-5 shadow-[0_14px_38px_-22px_rgba(6,78,59,0.5)]"
        aria-labelledby="qaida-badges"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="qaida-badges" className="text-base font-black text-slate-900">Your Badges</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">{earnedBadges}/{progress.badges.length} earned</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
          {progress.badges.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={reducedMotion || !badge.earned ? undefined : { y: -3, scale: 1.03 }}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center ${
                badge.earned
                  ? "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 shadow-sm"
                  : "border-slate-200 bg-slate-50"
              }`}
              title={badge.description}
            >
              <span className={`text-2xl ${badge.earned ? "" : "opacity-45 grayscale"}`} aria-hidden="true">
                {badge.earned ? badge.icon : "🔒"}
              </span>
              <span className="max-w-[76px] text-center text-[11px] font-bold leading-tight text-slate-700">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

interface QaidaShellProps {
  /** Public website preview: only the Alif lesson is unlocked, everything else is locked. */
  preview?: boolean;
  /** Where the "Enrol" CTA should send locked-feature clicks. */
  enrolUrl?: string;
}

export default function QaidaShell({ preview = false, enrolUrl = DEFAULT_ENROL_URL }: QaidaShellProps = {}) {
  const state = useQaidaState();
  const motionBudget = useMotionBudget(state.progress.settings.reducedMotion);
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileDialogRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<ActiveView>(preview ? "lessons" : "dashboard");
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const [activeScreenId, setActiveScreenId] = useState<string | null>(preview ? PREVIEW_LESSON_ID : null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCoinRain, setShowCoinRain] = useState(false);
  const [gameCompletionCount, setGameCompletionCount] = useState(0);
  const [showEnrolPrompt, setShowEnrolPrompt] = useState(false);
  const [showVoiceSetup, setShowVoiceSetup] = useState(false);
  const [userName, setUserName] = useState(preview ? "Guest" : "Learner");

  const currentLetter = activeScreenId?.startsWith("letter-")
    ? LETTERS.find((l) => `letter-${l.id}` === activeScreenId) ?? LETTERS[0]
    : LETTERS.find((l) => `letter-${l.id}` === state.currentLesson) ?? LETTERS[0];
  const currentScreenId = activeScreenId ?? state.currentCurriculumScreen;
  const focusWindow = letterWindow(currentLetter.id);

  useEffect(() => {
    if (preview) {
      setUserName("Guest");
      return;
    }
    let cancelled = false;
    async function loadProfileName() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled && data?.full_name) setUserName(data.full_name);
    }
    void loadProfileName();
    return () => { cancelled = true; };
  }, [preview]);

  useEffect(() => {
    const unlock = () => qaidaAudio.unlock();
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, []);

  useEffect(() => {
    if (preview) return;
    const timer = window.setTimeout(() => {
      if (!hasCompletedVoiceSetup()) setShowVoiceSetup(true);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [preview]);

  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true });
  }, [activeGame, activeView]);

  useEffect(() => {
    if (activeView !== "lessons" && activeView !== "practice" && !activeGame) return;
    const startedAt = Date.now();
    return () => {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      if (seconds > 0) state.dispatch({ type: "add_practice_time", seconds });
    };
  }, [activeGame, activeView, currentScreenId, state.dispatch]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = mobileDialogRef.current;
    const frame = window.requestAnimationFrame(() => {
      dialog?.querySelector<HTMLElement>("button, a, [tabindex]:not([tabindex='-1'])")?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])"),
      ).filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [mobileMenuOpen]);

  const handleLockedSelect = useCallback(() => {
    setShowEnrolPrompt(true);
    setMobileMenuOpen(false);
  }, []);

  const handleNavigate = useCallback((view: ActiveView) => {
    // In preview mode only the Alif lesson is reachable.
    if (preview && !PREVIEW_UNLOCKED_VIEWS.includes(view)) {
      handleLockedSelect();
      return;
    }
    setActiveView(view);
    setActiveGame(null);
    setMobileMenuOpen(false);
    if (preview) {
      setActiveScreenId(PREVIEW_LESSON_ID);
      return;
    }
    if (view === "lessons" && !activeScreenId) {
      setActiveScreenId(state.currentCurriculumScreen);
    } else if (view === "practice" && !activeScreenId?.startsWith("letter-")) {
      setActiveScreenId(state.currentLesson);
    }
  }, [preview, handleLockedSelect, activeScreenId, state.currentCurriculumScreen, state.currentLesson]);

  const handleScreenSelect = useCallback((id: string) => {
    if (preview && id !== PREVIEW_LESSON_ID) {
      handleLockedSelect();
      return;
    }
    if (!state.navigate(id)) return;
    setActiveScreenId(id);
    setActiveView("lessons");
    setActiveGame(null);
  }, [preview, handleLockedSelect, state]);

  const handleGameSelect = useCallback((gameId: string) => {
    setActiveGame(gameId as ActiveGame);
  }, []);

  const handleLessonComplete = useCallback(() => {
    if (activeScreenId?.startsWith("letter-")) {
      state.completeScreen(activeScreenId);
      state.dispatch({ type: "earn_coins", amount: 15 });
    }
    setShowConfetti(true);
    setShowCoinRain(true);
    setTimeout(() => {
      setShowConfetti(false);
      setShowCoinRain(false);
      // Preview visitors cannot advance beyond Alif — invite them to enrol instead.
      if (preview) {
        setShowEnrolPrompt(true);
        return;
      }
      // Auto-advance to next letter
      const currentId = activeScreenId ?? state.currentLesson;
      const num = parseInt(currentId.replace("letter-", ""), 10);
      if (num < 28) {
        setActiveScreenId(`letter-${num + 1}`);
      } else {
        setActiveView("journey");
      }
    }, 3500);
  }, [preview, activeScreenId, state]);

  const handleTopicComplete = useCallback((id: string) => {
    state.completeScreen(id);
    setShowConfetti(true);
    setShowCoinRain(true);
    window.setTimeout(() => {
      setShowConfetti(false);
      setShowCoinRain(false);
      const index = ALL_CURRICULUM_SCREEN_IDS.indexOf(id);
      const next = ALL_CURRICULUM_SCREEN_IDS[index + 1];
      if (next) {
        setActiveScreenId(next);
        state.dispatch({ type: "set_current_screen", id: next });
      } else {
        setActiveView("qaida");
      }
    }, motionBudget.reduced ? 500 : 1800);
  }, [motionBudget.reduced, state]);

  const handleGameComplete = useCallback((stars: 1 | 2 | 3) => {
    state.dispatch({ type: "game_completed" });
    state.dispatch({ type: "earn_xp", amount: stars * 15 });
    state.dispatch({ type: "earn_coins", amount: stars * 5 });
    setGameCompletionCount((count) => count + 1);
    if (stars === 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setTimeout(() => setActiveGame(null), motionBudget.reduced ? 250 : 1500);
  }, [motionBudget.reduced, state]);

  const getBreadcrumb = () => {
    if (activeGame) return `Practice · ${currentLetter.name}`;
    if (activeView === "qaida") return "Interactive Book";
    if (activeView === "lessons") return "Lesson";
    if (activeView === "practice") return `Practice · ${currentLetter.name}`;
    if (activeView === "journey") return "Learning Path";
    if (activeView === "games") return "Games Hub";
    if (activeView === "parents") return "Family Progress";
    if (activeView === "teachers") return "Teacher Insights";
    if (activeView === "settings") return "Preferences";
    return "Dashboard";
  };

  const getTitle = () => {
    if (activeGame === "bubble-pop") return "Bubble Pop 🫧";
    if (activeGame === "find-letter") return "Find the Letter 🔍";
    if (activeGame === "memory-match") return "Memory Match 🃏";
    if (activeGame === "quick-challenge") return "Quick Challenge ⚡";
    if (activeGame === "letter-train") return "Letter Train 🚂";
    if (activeGame === "puzzle") return "Letter Puzzle 🧩";
    if (activeGame === "sound-match") return "Sound Match 🎵";
    if (activeView === "qaida") return "Noorani Qaida Book";
    if (activeView === "lessons") {
      if (currentScreenId === "certificate") return "Certificate";
      return TOPIC_LESSON_BY_ID[currentScreenId]?.title ?? `${currentLetter.id}. ${currentLetter.name}`;
    }
    if (activeView === "practice") return `Practice ${currentLetter.name}`;
    if (activeView === "journey") return "Letter Journey";
    if (activeView === "games") return "Games";
    if (activeView === "parents") return "Parent Dashboard";
    if (activeView === "teachers") return "Teacher Dashboard";
    if (activeView === "settings") return "Settings";
    if (activeView === "certificates") return "Certificates";
    if (activeView === "rewards") return "Rewards";
    return "Noorani Qaida";
  };

  return (
    <MotionConfig reducedMotion={state.progress.settings.reducedMotion ? "always" : "user"}>
    <div className="flex h-full flex-col overflow-hidden">
      {preview && (
        <div className="flex flex-none flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true">🎬</span>
            Preview mode — the Alif lesson is unlocked. Enrol for all 28 letters, games and progress.
          </span>
          <a
            href={enrolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Enrol now →
          </a>
        </div>
      )}
    <div className="flex min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      {/* Confetti / Coin effects */}
      <ConfettiExplosion active={showConfetti} particleCount={motionBudget.celebrationParticles} />
      <CoinRain active={showCoinRain} count={motionBudget.reduced ? 0 : 10} />

      {/* Desktop sidebar */}
      <div className="hidden h-full lg:block">
        <QaidaSidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          userName={userName}
          xp={state.progress.xp}
          level={state.progress.level}
          xpMax={state.progress.xpMax}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
          instanceId="desktop"
          unlockedViews={preview ? PREVIEW_UNLOCKED_VIEWS : undefined}
          onLockedSelect={preview ? handleLockedSelect : undefined}
        />
      </div>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="qaida-mobile-navigation"
            className="fixed inset-0 z-[100] flex lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Qaida navigation"
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
            />
            <motion.div
              ref={mobileDialogRef}
              className="relative h-full"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <QaidaSidebar
                activeView={activeView}
                onNavigate={handleNavigate}
                userName={userName}
                xp={state.progress.xp}
                level={state.progress.level}
                xpMax={state.progress.xpMax}
                expandedWidth={280}
                instanceId="mobile"
                unlockedViews={preview ? PREVIEW_UNLOCKED_VIEWS : undefined}
                onLockedSelect={preview ? handleLockedSelect : undefined}
              />
              <button
                type="button"
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* HUD */}
        <QaidaHUD
          progress={state.progress}
          breadcrumb={getBreadcrumb()}
          title={getTitle()}
          onBack={
            activeGame
              ? () => setActiveGame(null)
              : preview
                ? undefined
                : activeView === "lessons" || activeView === "practice"
                  ? () => setActiveView("qaida")
                  : activeView !== "dashboard"
                    ? () => setActiveView("dashboard")
                    : undefined
          }
          audioEnabled={state.audioEnabled}
          onAudioToggle={() => state.setAudioEnabled(!state.audioEnabled)}
          onMenuToggle={() => setMobileMenuOpen(true)}
          menuOpen={mobileMenuOpen}
        />

        {/* Content area */}
        <div
          id="qaida-main"
          ref={contentRef}
          className="relative min-h-0 flex-1 overflow-hidden focus:outline-none"
          tabIndex={-1}
        >
          <AnimatePresence mode="wait" initial={false}>
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
                    letters={focusWindow}
                    targetLetter={currentLetter}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame === "find-letter" && (
                  <FindLetter
                    letters={focusWindow}
                    focusLetter={currentLetter}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame === "memory-match" && (
                  <MemoryMatch
                    letters={focusWindow}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame === "quick-challenge" && (
                  <QuickChallenge
                    letters={focusWindow}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame === "letter-train" && (
                  <LetterTrain
                    letters={focusWindow}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame === "puzzle" && (
                  <LetterPuzzle
                    letters={focusWindow}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
                {activeGame === "sound-match" && (
                  <SoundMatch
                    letters={focusWindow}
                    focusLetter={currentLetter}
                    onComplete={handleGameComplete}
                    onClose={() => setActiveGame(null)}
                  />
                )}
              </motion.div>
            ) : activeView === "dashboard" ? (
              <motion.div
                key="dashboard"
                className="qaida-scroll absolute inset-0 overflow-auto"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <WelcomeDashboard
                  onStart={() => handleNavigate("lessons")}
                  onNavigate={handleNavigate}
                  progress={state.progress}
                  particleCount={motionBudget.pageVisible ? motionBudget.ambientParticles : 0}
                  reducedMotion={motionBudget.reduced}
                />
              </motion.div>
            ) : activeView === "journey" ? (
              <motion.div
                key="journey"
                className="qaida-scroll absolute inset-0 overflow-y-auto"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <JourneyMap
                  progress={state.progress}
                  onSelectLetter={handleScreenSelect}
                />
              </motion.div>
            ) : activeView === "qaida" ? (
              <motion.div
                key="qaida-book"
                className="qaida-scroll absolute inset-0 overflow-y-auto"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <NooraniBook
                  progress={state.progress}
                  currentScreenId={currentScreenId}
                  onSelectScreen={handleScreenSelect}
                  reducedMotion={motionBudget.reduced}
                  particleCount={motionBudget.pageVisible ? motionBudget.ambientParticles : 0}
                  audioEnabled={state.audioEnabled}
                />
              </motion.div>
            ) : activeView === "practice" ? (
              <motion.div
                key="practice-hub"
                className="qaida-scroll absolute inset-0 overflow-y-auto"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <PracticeHub
                  letter={currentLetter}
                  progress={state.progress}
                  onGameSelect={handleGameSelect}
                  onOpenLesson={() => handleNavigate("lessons")}
                  reducedMotion={motionBudget.reduced}
                  particleCount={motionBudget.pageVisible ? motionBudget.ambientParticles : 0}
                  audioEnabled={state.audioEnabled}
                />
              </motion.div>
            ) : activeView === "games" ? (
              <motion.div
                key="games"
                className="qaida-scroll absolute inset-0 overflow-y-auto"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <GamesHub
                  onGameSelect={handleGameSelect}
                  progress={state.progress}
                />
              </motion.div>
            ) : (activeView === "rewards" || activeView === "certificates") ? (
              <motion.div
                key={activeView}
                className="qaida-scroll absolute inset-0 overflow-y-auto"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <ProgressScreen progress={state.progress} />
              </motion.div>
            ) : activeView === "parents" ? (
              <motion.div
                key="parents"
                className="qaida-scroll absolute inset-0 overflow-y-auto"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <ParentDashboard embedded />
              </motion.div>
            ) : activeView === "teachers" ? (
              <motion.div
                key="teachers"
                className="qaida-scroll absolute inset-0 overflow-y-auto"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <TutorDashboard embedded />
              </motion.div>
            ) : activeView === "settings" ? (
              <motion.div
                key="settings"
                className="absolute inset-0"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <SettingsScreen
                  settings={state.progress.settings}
                  onUpdate={(settings) => {
                    if (typeof settings.audioEnabled === "boolean") {
                      state.setAudioEnabled(settings.audioEnabled);
                    } else {
                      state.dispatch({ type: "update_settings", settings });
                    }
                  }}
                  onReset={() => state.dispatch({ type: "reset" })}
                  onOpenVoiceSetup={() => setShowVoiceSetup(true)}
                />
              </motion.div>
            ) : (
              /* Lesson view: alphabet, topic, revision, assessment, or certificate */
              <motion.div
                key={`lesson-${currentScreenId}`}
                className="absolute inset-0 overflow-auto"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {currentScreenId === "certificate" ? (
                  <CertificateScreen progress={state.progress} />
                ) : currentScreenId === "mixed-revision" || currentScreenId === "final-assessment" ? (
                  <ReviewAssessmentScreen
                    mode={currentScreenId === "final-assessment" ? "assessment" : "revision"}
                    reducedMotion={motionBudget.reduced}
                    audioEnabled={state.audioEnabled}
                    onComplete={(score, total) => {
                      if (currentScreenId === "final-assessment") {
                        const passed = score / total >= 0.8;
                        state.dispatch({
                          type: "record_assessment",
                          attempt: { screenId: currentScreenId, score, total, passed, completedAt: new Date().toISOString() },
                        });
                        if (passed) handleTopicComplete(currentScreenId);
                      } else {
                        state.dispatch({
                          type: "record_review",
                          summary: { screenId: currentScreenId, correct: score, total, completedAt: new Date().toISOString() },
                        });
                        handleTopicComplete(currentScreenId);
                      }
                    }}
                  />
                ) : TOPIC_LESSON_BY_ID[currentScreenId]?.kind === "salah" ? (
                  <SalahLessonScreen
                    lesson={TOPIC_LESSON_BY_ID[currentScreenId]}
                    reducedMotion={motionBudget.reduced}
                    audioEnabled={state.audioEnabled}
                    onComplete={() => handleTopicComplete(currentScreenId)}
                  />
                ) : TOPIC_LESSON_BY_ID[currentScreenId] ? (
                  <TopicLessonScreen
                    lesson={TOPIC_LESSON_BY_ID[currentScreenId]}
                    reducedMotion={motionBudget.reduced}
                    audioEnabled={state.audioEnabled}
                    onComplete={() => handleTopicComplete(currentScreenId)}
                  />
                ) : (
                  <LessonScreen
                    letter={currentLetter}
                    progress={state.progress}
                    onComplete={handleLessonComplete}
                    onGameSelect={handleGameSelect}
                    audioEnabled={state.audioEnabled}
                    gameCompletionCount={gameCompletionCount}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    {/* end inner row */}

      {/* Enrol prompt — shown when a preview visitor taps a locked feature */}
      <AnimatePresence>
        {preview && showEnrolPrompt && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qaida-enrol-title"
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl" aria-hidden="true">🔒</div>
              <h2 id="qaida-enrol-title" className="text-lg font-black text-slate-900">This is a free preview</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                You’re exploring the Alif lesson. Enrol to unlock all 28 letters, Harakaat, joining,
                games, rewards, and progress tracking with a qualified tutor.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={enrolUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-950/20 transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
                >
                  Enrol / Book a Free Trial
                </a>
                <button
                  type="button"
                  onClick={() => setShowEnrolPrompt(false)}
                  className="rounded-full px-5 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  Keep exploring Alif
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceSetupWizard
        open={showVoiceSetup}
        audioEnabled={state.audioEnabled}
        onEnableAudio={() => state.setAudioEnabled(true)}
        onClose={() => {
          markVoiceSetupSeen();
          setShowVoiceSetup(false);
        }}
        onCompleted={() => markVoiceSetupCompleted()}
      />
    </div>
    </MotionConfig>
  );
}
