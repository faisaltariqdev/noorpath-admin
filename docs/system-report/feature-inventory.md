# 6. Complete Feature Inventory

Legend — **Status:** 🟢 shipped · 🟡 partial/placeholder · 🔴 not built.
**Priority:** P0 (critical), P1 (high), P2 (medium), P3 (nice-to-have).

## 6.1 Platform & operations

| Feature | Purpose | User | Status | Dependencies | Priority | Future |
|---------|---------|------|:------:|--------------|:--------:|--------|
| Role-based login | Authenticate + route by role | All | 🟢 | Supabase Auth, middleware | P0 | Consume `next` param, MFA |
| Admin dashboard | Ops KPIs + recent activity | Admin | 🟢 | 5 tables | P1 | Realtime, date filters |
| User management + availability | Provision staff/families | Admin | 🟢 | `profiles`, admin API, service role | P0 | Bulk import, audit |
| Student records | Manage enrolment | Admin/Tutor | 🟢 | `students`, `courses` | P0 | CSV export, lifecycle |
| Student progress hub | Unified student detail | Admin/Tutor | 🟢 | daily notes, roadmap, reports | P1 | PDF export |
| Courses catalog | Maintain courses | Admin | 🟢 | `courses` | P2 | Curriculum linking |
| Class sessions | Schedule/track classes | Admin/Tutor | 🟢 | `class_sessions` | P0 | Calendar, recurring |
| Attendance | Mark/track attendance | Tutor/Parent | 🟢 | `attendance` | P1 | Bulk, automation |
| Progress reports | Teaching record + audio | Tutor→Parent | 🟢 | `progress_reports`, Storage | P0 | AI drafting |
| Homework | Templates + assignments | Tutor/Parent | 🟢 | `homework_*` | P1 | Reminders |
| Roadmap | Per-student lesson plan | Tutor/Parent | 🟢 | `course_roadmaps` | P1 | Templates |
| Fees / invoicing | Track billing | Admin/Parent | 🟢 | `fees` | P0 | Payment gateway |
| Tutor earnings | Payroll | Admin/Tutor | 🟢 | `tutor_earnings` | P1 | Auto-calc |
| Analytics | Business BI (charts) | Admin | 🟢 | Recharts | P1 | Cohorts, LTV |
| Messages | Group chat (realtime) | All | 🟢 | `chat_messages`, realtime | P1 | Threads, DMs, RLS verify |
| Notifications | Role broadcasts | Admin→All | 🟢 | `notifications` | P2 | Scheduled, multi-channel |
| Voice tracker | AI recitation matching | Tutor | 🟡 | Web Speech API | P2 | Accuracy scoring |
| Settings | Reminders + prefs | Admin | 🟢 | localStorage | P2 | Server-persisted |
| Profiles | Account + password | All | 🟢 | `profiles`, auth | P2 | Avatars |

## 6.2 Noorani Qaida LMS

| Feature | Purpose | User | Status | Dependencies | Priority | Future |
|---------|---------|------|:------:|--------------|:--------:|--------|
| 11-module curriculum | Structured learning path | Student | 🟢 | `modules.ts` | P0 | CMS-authored |
| 28-letter alphabet | Core letters | Student | 🟢 | `curriculum.ts` | P0 | Qari audio |
| Harakaat/Tanween/Sukoon/Shaddah/Madd | Vowel/rule lessons | Student | 🟢 | `TopicLesson` | P0 | More examples |
| Joining / word reading / Quranic | Reading progression | Student | 🟢 | `TopicLesson` | P0 | Real Quran text |
| Interactive ebook | Book navigation | Student | 🟢 | `PageTurnViewer` | P1 | Bookmarks |
| Lesson engine | Staged letter lesson | Student | 🟢 | `lesson/flow.ts` | P0 | Adaptive path |
| Tracing | Handwriting practice | Student | 🟢 | canvas + validation | P0 | Stroke-order guidance |
| Audio/pronunciation | Listen + repeat | Student | 🟡 (TTS) | `QaidaAudioService` | P0 | Recorded Qari audio |
| Games (7) | Reinforcement | Student | 🟢 | `games/*` | P0 | Adaptive difficulty |
| Revision + assessment | Check understanding | Student | 🟢 | `ReviewAssessmentScreen` | P0 | Item bank |
| XP/coins/levels | Motivation | Student | 🟢 | reducer | P1 | Leaderboards |
| Badges (16) | Achievements | Student | 🟢 | `awardBadgesForState` | P1 | Fix `perfect-game` |
| Streaks | Daily habit | Student | 🟢 | reducer | P1 | Reminders |
| Certificate | Completion artifact | Student | 🟢 | assessment pass | P1 | PDF/print |
| Progress persistence | Save learning | Student | 🟡 (local) | `localStorage` | P0 | **Supabase sync** |
| Preview mode | Public demo | Visitor | 🟢 | `preview` prop | P1 | Analytics |
| Parent Qaida view | Device-local progress | Parent | 🟡 | localStorage | P1 | Server data |
| Teacher Qaida view | Insights | Tutor | 🟡 (placeholder) | snapshot adapter | P1 | Real analytics |
| Motion budget | Perf-scaled animation | Student | 🟢 | `useMotionBudget` | P1 | — |
| Settings (audio/motion) | Preferences | Student | 🟢 | reducer | P2 | Expose theme/previewMode |

## 6.3 Reducer action inventory (`progressReducer`)

| Action | Effect | Side effects |
|--------|--------|--------------|
| `hydrate` | Merge saved state onto defaults; pin version 5 | Derive current screen; award badges |
| `complete_screen` | Idempotent complete; +25 XP, +10 coins | Recalc level; award badges |
| `earn_xp` / `earn_coins` | Add currency | level recalc / badges |
| `rate_screen` | Set 1–3★; recompute `stars` | badges · **⚠️ never dispatched** |
| `game_completed` | `gamesCompleted += 1` | badges |
| `set_current_screen` | Set resume point | — |
| `record_assessment` | Append attempt | badges (graduate on pass) |
| `record_review` | Append review summary | — |
| `add_practice_time` | Add seconds | — |
| `update_streak` | Daily streak logic | badges |
| `update_settings` | Merge settings | — |
| `reset` | Restore defaults | — |

## 6.4 Known feature gaps

| Gap | Impact | Ref |
|-----|--------|-----|
| Qaida progress not synced to backend | No cross-device/parent/teacher truth | P0 |
| `perfect-game` badge never awarded | Missing achievement | P2 |
| `rate_screen` unused | Ratings never captured in UI | P2 |
| `calculateGameReward` unused | Duplicate star logic | P2 |
| Sidebar "Certificates" → `ProgressScreen` | Naming confusion | P3 |
| Dual screen-ID namespaces | Analytics risk | P2 |
| Teacher Qaida analytics placeholder | No teacher value yet | P1 |

> Related: [noorani-qaida.md](./noorani-qaida.md) · [code-quality.md](./code-quality.md) ·
> [roadmap.md](./roadmap.md)
