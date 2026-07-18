# NoorPath Noorani Qaida — Phase 2 Platform Audit & Improvements

**Date:** 2026-07-18  
**Constraint honored:** Pronunciation engine (`audio/engine/*`) was **not** modified.  
**Principle:** Only changes with measurable educational or UX value.

---

## Executive scores (brutally honest)

Scale: 1–10 vs Duolingo Kids / Khan Academy Kids / Lingokids calibre.

| Dimension | Score | Why |
|---|---:|---|
| **Educational Score** | **6.5** | Solid letter → listen → trace → game loop exists; curriculum modules exist. Still thin on spaced repetition, mastery gates, and verified tajweed feedback. |
| **UI Score** | **6.0** | Premium islands exist (lesson hero, practice banner). Inconsistent radii/shadows/gradients remain across hubs; GamesHub was especially “templatey” before this pass. |
| **UX Score** | **6.5** | Lesson flow works; Practice drills were dead clicks (fixed). Games Hub falsely marked working games as Coming Soon (fixed). Cognitive load of long lesson pages is still higher than best-in-class “tiny win” apps. |
| **Accessibility Score** | **6.5** | Skip links, focus rings, live regions, reduced motion budget exist. Touch targets generally OK. Screen-reader journey across shell views still uneven; emoji-heavy labels hurt some AT. |
| **Performance Score** | **7.0** | Dynamic imports, motion budgets, particle caps help. Scenic backgrounds + multiple particle systems can still tax low-end Android. |
| **Gamification Score** | **6.0** | Real XP/coins/badges/streaks in `progress.ts`. Some surfaces previously showed **fake** best-star counts (GamesHub). No server sync → rewards feel device-local. |
| **Learning Psychology Score** | **6.0** | Micro-rewards, mascot praise, tracing = kinesthetic channel. Missing: adaptive difficulty, error-specific remediation, short session goals that end in ≤90s loops like Lingokids. |
| **Teacher Experience Score** | **4.5** | Practice “Teacher settings” is useful. Tutor dashboard correctly refuses fake analytics, but still cannot assign/unlock per student in the academy DB. |
| **Parent Experience Score** | **5.5** | Honest device-local report + letter grid. Now clearer “Today’s plan”. Still no cross-device sync or “what to practise tonight” push. |
| **Technical Debt Score** | **5.0** *(lower is more debt)* | Debt remains: localStorage-only progress, tutor insights stub, unused ebook paths, dual mascots with uneven wiring. Debt **reduced** by deleting dead speech names + fixing fake GamesHub. |

**Overall platform maturity vs world-class kids edtech: ~6.0 / 10.**  
Pronunciation orchestration (Phase 1) is ahead of pedagogy/product sync. The ceiling is recorded Qari audio + cloud progress + shorter lesson chunks.

---

## Educational audit (principles → evidence)

| Principle | Assessment | Why it matters |
|---|---|---|
| **Recognition** | Strong | LetterCard + Find/Bubble games force visual ID of the target glyph. |
| **Association** | Moderate | Example word + meaning shown; Memory Match links glyph↔name. |
| **Visual memory** | Moderate | Memory Match / Puzzle help; no spaced review schedule. |
| **Audio memory** | Improving | Phase 1 Arabic TTS + Sound Match; still not certified Qari. |
| **Kinesthetic** | Present | TracingCanvas is the highest-value motor channel. Write tab is still “honour system” (no stroke validation). |
| **Pattern repetition** | Moderate | Lesson activities + games; Practice Hub now prioritises focus games. |
| **Micro rewards** | Present | Stars, coins, confetti, mascot clap — good dopamine if not overused. |
| **Confidence building** | Moderate | Encouraging copy; mistake paths in games exist but mascot rarely “comforts” after errors outside lessons. |
| **Attention span** | Risk | Full lesson page is dense (mascot + letter + info + activities + games + badges). Entrance overlay shortens “wow” without adding another long page. |
| **Cognitive load** | Risk | 7 games visible at once can overwhelm 3–5y; ordering focus games first reduces choice paralysis slightly. |
| **Learning progression** | Moderate | 28-letter unlock path + modules; weak mastery gate (Next can be pressed without finishing all 5). |

---

## Root problems found (pre-change)

1. **GamesHub lied** — `stars === 0` marked Letter Train / Puzzle / Sound Match as Coming Soon even though they are implemented and launched from the shell. Fake “Best: ⭐⭐⭐” unrelated to progress.
2. **Practice drills were dead clicks** — Trace/Write/Listen/Pronounce all called `onOpenLesson` only; Listen did not speak.
3. **Games not framed as letter-scoped** — Hub was a generic arcade; shell already passed `letterWindow(currentLetter)` but UI did not teach that.
4. **Parent view lacked a single “do this next” headline.**
5. **Teacher view** showed only “awaiting data” cards with no classroom procedure.
6. **Dead code** — `spokenNames.ts` unused after Arabic-only engine.

---

## Changes made (measurable value)

| Change | Educational / UX value |
|---|---|
| Rebuild **GamesHub** around `GAME_CATALOG` + current letter | Removes fake Coming Soon; every card is “Pop Alif / Find Alif…” |
| **resolveEnabledGames** prioritises `singleLetter` | Focus games first → lower cognitive load, better transfer |
| **PracticeHub drills** speak or open lesson + tap SFX | No dead clicks; audio memory loop on Listen/Pronounce |
| **LessonScreen** letter entrance (~1.6s) | Magical but fast; reduced-motion skips |
| Lesson game rail uses **letterLabel** + tap SFX | Games feel tied to current letter; mascot points to play |
| **ParentDashboard** “Today’s plan” | Parents see next letter + recommended action immediately |
| **TutorDashboard** 3-step classroom playbook | Teachers can act without inventing fake student stats |
| Delete **spokenNames.ts** | Removes debt / policy confusion |

**Not changed (on purpose):** pronunciation engine; ebook page content; gamification formulas; admin permissions; full visual redesign; inventing tutor analytics.

---

## Files audited (primary)

`layout/QaidaShell.tsx`, `QaidaSidebar.tsx`, `QaidaHUD.tsx`  
`screens/*` (Lesson, Practice, Games, Progress, Parent, Tutor, Journey, Book, Topic, Salah, Review, Certificate, Settings)  
`games/*`, `characters/*`, `animations/*`, `lesson/flow.ts`, `state/*`, `rewards/rewardEngine.ts`, `data/*`, `ui/TracingCanvas.tsx`, parent/tutor `/qaida` routes

## Files changed

- `screens/GamesHub.tsx` (rewrite)
- `screens/PracticeHub.tsx`
- `screens/LessonScreen.tsx`
- `screens/ParentDashboard.tsx`
- `screens/TutorDashboard.tsx`
- `state/practiceConfig.ts`
- `layout/QaidaShell.tsx` (pass `letter` into GamesHub)

## Files removed

- `audio/spokenNames.ts`

## Architecture improvements

- Single game catalog (`data/games.ts`) now drives Lesson + Practice + Games Hub labels.
- Letter-scoped recommendation is a **product rule**, not a random hub.
- Teacher/parent surfaces stay **honest** about localStorage limits (enterprise trust).

---

## Future roadmap (ordered by ROI)

1. **Recorded Qari packs** per letter (Phase 1 upgrade path) — biggest learning quality jump.  
2. **Cloud progress sync** (parent/teacher dashboards become real).  
3. **Mastery gate** — “Next” disabled until listen + trace + 1 game complete.  
4. **Split lesson into 60–90s micro-scenes** (introduce → trace → play) with shared-element transitions.  
5. **Stroke validation** for Write (kinesthetic integrity).  
6. **Mascot error empathy** wired from game mistake events into shell.  
7. **Spaced review queue** (weak letters resurfacing).  

---

## Remaining limitations (honest)

- Without cloud sync, parent/teacher “enterprise” oversight is theatre on a second device.  
- Browser TTS ≠ tajweed instruction.  
- Lesson page density still exceeds Lingokids-style micro-sessions.  
- Write activity trusts the child; tracing is the only validated motor task.  
- Owl + Zayd dual mascots dilute companion identity — consider one primary companion later.
