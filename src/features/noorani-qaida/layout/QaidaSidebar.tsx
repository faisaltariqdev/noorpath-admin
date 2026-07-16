"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type ActiveView = "dashboard" | "journey" | "qaida" | "lessons" | "games" | "practice" | "rewards" | "certificates" | "parents" | "teachers" | "settings";

interface QaidaSidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  userName?: string;
  xp?: number;
  level?: number;
  xpMax?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  expandedWidth?: number;
  instanceId?: string;
  /** When set, only these views are interactive; all others render as locked. */
  unlockedViews?: ActiveView[];
  /** Called when a locked item is activated (e.g. to surface an enrol prompt). */
  onLockedSelect?: (view: ActiveView) => void;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: string;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",     label: "Dashboard",      icon: "🏠", color: "text-emerald-400" },
  { id: "qaida",         label: "Noorani Qaida",  icon: "📖", color: "text-yellow-400" },
  { id: "lessons",       label: "Lesson",         icon: "🎓", color: "text-purple-400" },
  { id: "practice",      label: "Practice",       icon: "✏️",  color: "text-orange-400" },
  { id: "journey",       label: "My Progress",    icon: "📊", color: "text-blue-400" },
  { id: "games",         label: "Games",          icon: "🎮", color: "text-pink-400" },
  { id: "rewards",       label: "Rewards",        icon: "🏆", color: "text-yellow-300" },
  { id: "certificates",  label: "Certificates",   icon: "📜", color: "text-green-300" },
  { id: "parents",       label: "Parents",        icon: "👨‍👩‍👧", color: "text-cyan-400" },
  { id: "teachers",      label: "Teachers",       icon: "👩‍🏫", color: "text-rose-400" },
  { id: "settings",      label: "Settings",       icon: "⚙️",  color: "text-gray-400" },
];

export default function QaidaSidebar({
  activeView,
  onNavigate,
  userName = "Ali Raza",
  xp = 150,
  level = 1,
  xpMax = 300,
  collapsed = false,
  onToggleCollapse,
  expandedWidth = 220,
  instanceId = "desktop",
  unlockedViews,
  onLockedSelect,
}: QaidaSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<ActiveView | null>(null);
  const pct = Math.min(100, Math.round((xp / xpMax) * 100));
  const isLocked = (view: ActiveView) => Boolean(unlockedViews) && !unlockedViews!.includes(view);

  return (
    <motion.aside
      className="flex h-full flex-shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#061f27] via-[#07352f] to-[#0a442f] text-white shadow-[8px_0_30px_rgba(2,44,34,0.18)]"
      style={{ width: collapsed ? 64 : expandedWidth }}
      animate={{ width: collapsed ? 64 : expandedWidth }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <motion.div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-xl shadow-lg"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          📚
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-sm font-bold text-white">NoorPath</span>
              <span className="text-[10px] text-emerald-400">Noorani Qaida</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Qaida Navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const locked = isLocked(item.id);
          return (
            <motion.button
              key={item.id}
              type="button"
              className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                locked
                  ? "cursor-not-allowed text-white/35"
                  : isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => (locked ? onLockedSelect?.(item.id) : onNavigate(item.id))}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              whileTap={locked ? undefined : { scale: 0.97 }}
              aria-label={locked ? `${item.label} (locked — enrol to unlock)` : item.label}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={locked || undefined}
              title={locked ? "Enrol for full access" : undefined}
            >
              {/* Active indicator */}
              {isActive && !locked && (
                <motion.div
                  layoutId={`qaida-nav-active-${instanceId}`}
                  className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-yellow-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.span
                className={`flex-shrink-0 text-lg ${locked ? "grayscale" : isActive ? item.color : ""}`}
                animate={{ scale: hoveredItem === item.id && !locked ? 1.2 : isActive ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {item.icon}
              </motion.span>

              {/* Label */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="text-sm font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Lock icon for locked items */}
              {locked && !collapsed && (
                <span className="ml-auto flex-shrink-0 text-xs text-white/40" aria-hidden="true">🔒</span>
              )}

              {/* Active badge */}
              {isActive && !locked && !collapsed && (
                <motion.span
                  className="ml-auto h-2 w-2 flex-shrink-0 rounded-full bg-yellow-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 text-base font-bold text-white shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            {userName[0]}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[9px] font-bold text-yellow-900">
              {level}
            </span>
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div className="min-w-0 flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="truncate text-sm font-semibold text-white">{userName}</div>
                <div className="text-[10px] text-emerald-400">Level {level}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="mt-0.5 text-[9px] text-white/40">{xp} / {xpMax} XP</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        {onToggleCollapse && (
          <motion.button
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-white/10 px-2 py-1.5 text-xs text-white/60 hover:bg-white/20 hover:text-white"
            onClick={onToggleCollapse}
            whileTap={{ scale: 0.97 }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "← Collapse"}
          </motion.button>
        )}
      </div>

      {/* Help */}
      <div className="px-4 pb-4">
        <motion.button
          className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/20 hover:text-white"
          whileTap={{ scale: 0.97 }}
          aria-label="Get help"
        >
          <span className="text-base">❓</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Help
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
