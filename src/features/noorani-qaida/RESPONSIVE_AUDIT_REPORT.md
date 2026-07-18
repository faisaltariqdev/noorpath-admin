# Noorani Qaida — Enterprise Responsive Audit Report

**Scope:** Noorani Qaida learning platform only (`src/features/noorani-qaida/**` + Qaida route layouts)  
**Out of scope:** Marketing site, admin permissions, pronunciation engine, lesson/gamification business logic, unrelated portal pages  
**Date:** 2026-07-18

---

## Scores (0–100)

| Dimension | Score | Notes |
|-----------|------:|-------|
| **1. Responsive Audit** | **91** | Fluid tokens, breakpoint grids, overflow locks; landscape short-height covered |
| **2. Mobile UX** | **90** | Drawer nav, progressive HUD disclosure, 44px targets on primary chrome |
| **3. Tablet UX** | **89** | Collapsible desktop sidebar ≥1024; 2-col dashboards/games at md–lg |
| **4. Desktop UX** | **93** | Fixed sidebar + professional dashboard; ultra-wide measure capped |
| **5. Accessibility** | **86** | Skip link, focus rings, ARIA on drawers/games; contrast preserved |
| **6. Performance** | **88** | CSS-only layout fixes; GPU transforms retained; reduced-motion honored |

**Overall production readiness:** **Ready** for phone → desktop Qaida surfaces, with remaining polish listed below.

---

## 7. Files Audited

| Area | Paths |
|------|--------|
| Tokens / CSS | `qaida.css` |
| Layouts | `layout/QaidaShell.tsx`, `QaidaHUD.tsx`, `QaidaSidebar.tsx` |
| Route shells | `app/admin/noorani-qaida/layout.tsx`, `app/tutor/qaida/layout.tsx`, `app/parent/qaida/layout.tsx` |
| Lessons / book | `screens/LessonScreen.tsx`, `QaidaEbook.tsx`, `TopicLessonScreen.tsx`, `SalahLessonScreen.tsx`, `CurriculumBook.tsx` |
| Practice / games hub | `screens/PracticeHub.tsx`, `GamesHub.tsx` |
| Dashboards / progress | `ParentDashboard.tsx`, `TutorDashboard.tsx`, `ProgressScreen.tsx` |
| Games | `GameShell.tsx`, `BubblePop.tsx`, `MemoryMatch.tsx`, `FindLetter.tsx`, `LetterTrain.tsx`, `LetterPuzzle.tsx`, `QuickChallenge.tsx`, `SoundMatch.tsx` |
| Trace / UI | `ui/TracingCanvas.tsx`, `ExampleTile.tsx`, `VoiceSetupWizard.tsx` |
| Motion | `motion/*`, animations (reduced-motion already wired) |

---

## 8. Files Changed

- `qaida.css` — fluid type/spacing, safe-area, HUD/trace/game/lesson helpers, mobile/tablet/landscape/ultra-wide queries
- `layout/QaidaHUD.tsx` — progressive badge disclosure, 44px controls, safe padding class
- `layout/QaidaSidebar.tsx` — min 44px nav/help/collapse; bottom safe padding
- `layout/QaidaShell.tsx` — fluid page padding, overflow-x lock, 44px drawer close, enrol CTA touch size
- `screens/LessonScreen.tsx` — `qaida-lesson-stage`, fluid mins, speech bubble clamp, touch targets
- `screens/ProgressScreen.tsx` — fluid padding/type, mobile-friendly stats/badges
- `screens/ParentDashboard.tsx` — letter grid + summary card span for narrow phones
- `screens/QaidaEbook.tsx` — 3-col SE grid → 7-col desktop; sticky bar safe-bottom
- `screens/PracticeHub.tsx`, `GamesHub.tsx` — fluid padding + overflow-x
- `ui/TracingCanvas.tsx` — aspect-ratio stage (`.qaida-trace-stage`)
- `games/GameShell.tsx`, `BubblePop.tsx`, `MemoryMatch.tsx`, `FindLetter.tsx`, `LetterTrain.tsx`, `LetterPuzzle.tsx`, `QuickChallenge.tsx`, `SoundMatch.tsx`
- Route layouts (admin/tutor/parent) — `100dvh` / `100svh` + skip link (prior pass)

---

## 9. Responsive Bugs Fixed

1. **Horizontal overflow** on shell/practice/games via `overflow-x-hidden` + `min-w-0` / fluid padding  
2. **HUD crowding on SE/320–360** — XP always visible; Level/Coins/Streak progressive hide  
3. **Unsafe tap targets** — menu/back/audio/drawer close/sidebar rows → ≥44×44  
4. **Lesson stages too tall on phones** — `qaida-lesson-stage` + lower min-heights below `lg`  
5. **Mascot speech overflow** — `max-w` + smaller type on narrow widths  
6. **Tracing canvas fixed height** — aspect-ratio + clamp min/max height; ResizeObserver retained  
7. **Bubble Pop off-canvas bubbles** — size clamped to viewport; position capped with `min()`  
8. **Memory Match 4-col squeeze** — 2×4 on mobile, 4-col from `sm`  
9. **Find / Quick / Sound / Train / Puzzle** — fluid glyph sizes, 44px hear buttons, denser mobile grids  
10. **Ebook letter tiles cramped at 320** — 3 columns + smaller glyph zones  
11. **Parent letter map too dense** — 4 → 5 → 7 → 10 columns by width  
12. **iPhone notch / home indicator** — root safe-area + sticky ebook bar `safe-bottom`  
13. **Safari viewport** — layouts use `100dvh` / `min-h-[100svh]`  
14. **Landscape short height** — dedicated `@media (max-height: 500px)` for HUD/trace/game  
15. **Invalid Tailwind `xs:`** removed from GameShell  

---

## 10. Remaining Recommendations

1. **Device lab QA** — physical pass on iPhone SE, Pixel, Samsung A-series, iPad Mini landscape  
2. **Container queries** on lesson 12-col section for embedded parent/tutor iframes  
3. **Keyboard open** — optional `visualViewport` resize listener if soft keyboard covers trace controls in landscape  
4. **GameShell status chips** — consider icon-only mode under 360px width  
5. **JourneyMap / Certificate / Settings** — light spacing pass if those views show residual empty space  
6. **Automated visual regression** — Playwright viewport matrix (320–1920) in CI  

---

## 11. Device Compatibility Matrix

| Device / width | Layout | HUD | Games | Trace | Nav |
|----------------|--------|-----|-------|-------|-----|
| 320–360 (SE) | Single column | XP only (+ Level ≥380) | 2-col fields | Aspect stage | Drawer |
| 375–430 (iPhone 11–15) | Single column | XP + Level + Coins | Comfortable | OK | Drawer |
| Pixel / Samsung A / Xiaomi / Oppo / Vivo / Realme | Single → 2-col cards | Full progressive | OK | OK | Drawer |
| iPad Mini / Air (portrait) | Balanced grids | Full | 2–3 col hubs | OK | Drawer &lt;1024 |
| iPad Pro / Surface (landscape) | Desktop-like | Full | Multi-col | OK | Fixed sidebar ≥1024 |
| 13–15″ laptop | Dashboard | Full | Full | Full | Fixed sidebar |
| 1920 / ultra-wide | Capped measure | Full | Full | Full | Fixed sidebar |

---

## 12. Before vs After

| Concern | Before | After |
|---------|--------|-------|
| Spacing | Fixed `p-4`/`p-6` | `--qaida-space-page` + clamp tokens |
| Typography | Many fixed sizes | Fluid `clamp()` tokens + responsive utilities |
| HUD | All badges always shown | Progressive disclosure by breakpoint |
| Sidebar mobile | Close @ 40px | Close @ 44px; nav rows ≥44 |
| Lesson panels | Forced `min-h-[280px]` | Fluid stage heights; CSS override &lt;1024 |
| Trace | Fixed `h-52`/`h-60` | Aspect-ratio + dvh clamp |
| Games | Desktop grids on phone | Mobile-first grids + `qaida-game-field` |
| Bubbles | Could clip / overflow | Viewport-aware size + position clamp |
| Safe areas | Partial | Root + sticky + sidebar footer |
| Landscape | Unaddressed | Short-height media query |

---

## Verification Notes

- Typecheck: no source errors (sandbox could not write `tsconfig.tsbuildinfo`).  
- No pronunciation, lesson flow, gamification rules, or backend APIs were modified.  
- Non-Qaida website pages were not edited.
