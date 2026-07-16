# 7. Component Reference

This chapter documents the reusable components: shared app chrome (`src/components`) and the Noorani
Qaida feature components (`src/features/noorani-qaida`). For each: purpose, key props, reusability,
performance, accessibility, and where it is used.

---

## 7.1 Shared components (`src/components`)

### `AdminChrome`
- **Purpose:** Admin layout wrapper — renders `Sidebar` + page content; bypasses the sidebar for
  fullscreen routes (`FULLSCREEN_ADMIN_ROUTES` → `/admin/noorani-qaida`).
- **Props:** `children`, `userName` (from server `authorizeAdmin`).
- **Used by:** `admin/layout.tsx` (all admin pages).
- **Reusable:** Admin-specific. **A11y:** structural. **Perf:** trivial.

### `Sidebar`
- **Purpose:** Role-based navigation drawer (admin/tutor/parent) + user avatar + logout.
- **Props:** `role: Role`, `userName: string`.
- **Used by:** admin (via `AdminChrome`), tutor & parent layouts.
- **Logic:** static nav config per role; refreshes display name from `profiles`; logout via
  `supabase.auth.signOut()`; exposes `useSidebarToggle()` (custom event).
- **A11y:** keyboard-navigable links; mobile transform + overlay.

### `TopBar`
- **Purpose:** Sticky page header (hamburger toggle, title/subtitle, placeholder search/notifications).
- **Props:** `title`, `subtitle?`.
- **Used by:** 30+ dashboard pages.
- **Note:** toggles `.sidebar`/`.sidebar-overlay` via direct DOM class manipulation.

### `StudentProgressHub`
- **Purpose:** Unified student detail view: profile, period-filtered to-do/completed (daily work +
  roadmap), recent reports; add/toggle daily work notes.
- **Props:** `studentId`, `role: "admin"|"tutor"`, `backHref`.
- **Used by:** `/admin/students/[id]`, `/tutor/students/[id]`.
- **Data:** `students` (+ `profiles` joins), `daily_work_notes`, `course_roadmaps`, `progress_reports`.
- **Reusable:** ✅ high (shared across two portals).

### `ParentStudentSwitcher`
- **Purpose:** Horizontal pill switcher for parents with multiple children.
- **Props:** `students[]`, `selectedId`, `onChange`.
- **Used by:** all child-scoped parent pages.

### `NoorPathLogo`
- **Purpose:** Branded text logo.
- **Props:** `size?`, `showTagline?`, `dark?`.
- **Used by:** `QaidaLoader`.

### `ui/ComingSoon`
- **Purpose:** Placeholder screen. **Status:** defined but **not imported anywhere** (dead code —
  see [code-quality.md](./code-quality.md)).

---

## 7.2 Qaida layout components

### `QaidaShell`
- **Purpose:** Orchestrator for the entire LMS — owns `activeView`/`activeScreenId`, wires HUD +
  sidebar, lazy-loads screens/games, dispatches rewards, drives celebrations, applies `MotionConfig`.
- **Key props:** `preview?: boolean`, `enrolUrl?: string`.
- **Perf:** dynamic-imports every screen and game (`ssr: false` + `QaidaLoader`).
- **Used by:** `/admin/noorani-qaida`, `/qaida-preview` (via client wrapper).

### `QaidaHUD`
- **Purpose:** Persistent top stats bar (level/XP/coins/streak), back button, breadcrumb/title, audio
  toggle, mobile menu.
- **Props:** `progress`, `onBack?`, `breadcrumb?`, `title?`, `onAudioToggle?`, `audioEnabled?`,
  `onMenuToggle?`, `menuOpen?`.
- **A11y:** `aria-expanded` on menu; animated badge values; breakpoint-gated badges.

### `QaidaSidebar`
- **Purpose:** LMS navigation rail (11 items), XP bar, collapse, and **enrolment-based locking**.
- **Props:** `activeView`, `onNavigate`, `userName?`, `xp?`, `level?`, `xpMax?`, `collapsed?`,
  `onToggleCollapse?`, `expandedWidth?`, `instanceId?`, `unlockedViews?`, `onLockedSelect?`.
- **Preview logic:** `isLocked(view)` when `unlockedViews` set and view excluded → grayscale + 🔒,
  `aria-disabled`, `onLockedSelect`.

---

## 7.3 Qaida screens (`screens/*`)

| Component | Purpose | Key props | Dynamic import |
|-----------|---------|-----------|:--------------:|
| `NooraniBook` | Book hub (eBook / cards), progress ring, fullscreen | `progress`, `currentScreenId`, `onSelectScreen`, `reducedMotion`, `particleCount`, `audioEnabled` | (loads `CurriculumBook`) |
| `CurriculumBook` | Chapter navigator over 11 modules via `PageTurnViewer` | `progress`, `currentScreenId`, `onOpenScreen`, `reducedMotion`, `audioEnabled` | — |
| `QaidaEbook` | Traditional RTL 28-letter page + reading bar | `progress`, `currentLetterId`, `onSelectLetter`, `reducedMotion`, `audioEnabled` | — |
| `JourneyMap` | Alphabet progress map (4 families) | `progress`, `onSelectLetter` | — |
| `LessonScreen` | Letter lesson (Meet/Hear/Trace/Play/Reward) | `letter`, `progress`, `onComplete`, `onGameSelect`, `audioEnabled`, `gameCompletionCount` | loads Confetti + Tracing |
| `TopicLessonScreen` | Marks/Madd/joining/reading/quranic lesson | `lesson`, `reducedMotion`, `audioEnabled`, `onComplete` | loads Tracing |
| `ReviewAssessmentScreen` | Revision (8Q) / assessment (12Q) | `mode`, `reducedMotion`, `audioEnabled`, `onComplete` | via shell (`ssr:false`) |
| `CertificateScreen` | Completion certificate (gated) | `progress` | via shell (`ssr:false`) |
| `ProgressScreen` | Learner progress dashboard | `progress` | — |
| `GamesHub` | Global games catalog | `onGameSelect`, `progress` | — |
| `PracticeHub` | Letter practice + configurable games | `letter`, `progress`, `onGameSelect`, `onOpenLesson`, `reducedMotion`, `particleCount`, `audioEnabled` | — |
| `SettingsScreen` | Audio + reduced-motion + reset | `settings`, `onUpdate`, `onReset` | via shell (`ssr:false`) |
| `ParentDashboard` | Device-local parent progress | `embedded?` | via shell (`ssr:false`) |
| `TutorDashboard` | Teacher insights placeholder | `embedded?` | via shell |

## 7.4 Qaida UI components (`ui/*`)

| Component | Purpose | Notes |
|-----------|---------|-------|
| `QaidaLoader` | Branded lazy-load fallback | `role="status"`, `aria-live="polite"` |
| `PageTurnViewer` | Accessible digital book pager | RTL keys, swipe ≥48px, spread mode, `aria-roledescription` |
| `TracingCanvas` | Pointer tracing + pixel validation | dynamic (`ssr:false`); keyboard bypass; `COMPLETION_SCORE=68` |
| `tracingValidation` | Pure trace scoring | `score = accuracy×76 + length×24`, pass ≥68 & ≥2 strokes |
| `FullscreenButton` | Fullscreen API toggle | hides on unsupported devices |

## 7.5 Characters (`characters/*`)

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `ZaydMascot` | Primary companion (moods/actions) | `mood`, `speechBubble?`, `size?`, `action?`, `lookAt?` |
| `OwlMascot` | Encouragement mascot | `size?`, `message?`, `mood?` |
| `LetterCard` | Tappable hero letter card | `letter`, `size?`, `showForms?`, `onTap?`, `interactive?`, `completed?`, `pronouncing?`, `reducedMotion?` |

## 7.6 Reusability & performance summary

- **Most reusable:** `StudentProgressHub`, `Sidebar`, `TopBar`, `PageTurnViewer`, `GameShell`,
  `ZaydMascot`, `LetterCard`, animation components.
- **Single-use orchestrators:** `QaidaShell`, `AdminChrome`.
- **Performance-sensitive (lazy-loaded):** `QaidaShell` screens, `TracingCanvas`, `ConfettiExplosion`.
- **Accessibility highlights:** `PageTurnViewer` (keyboard/RTL), `TracingCanvas` (keyboard bypass),
  `QaidaLoader` (live region), decorative animations `aria-hidden`.

> Related: [noorani-qaida.md](./noorani-qaida.md) · [animations.md](./animations.md) ·
> [accessibility.md](./accessibility.md)
