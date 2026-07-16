# 11. Teacher (Tutor) Dashboard

The tutor portal (`src/app/tutor/*`) is where teachers run their day: classes, attendance, reports,
homework, roadmaps, earnings and messaging — plus an experimental AI voice tracker. All pages are
client components (`force-dynamic`). Auth is **client-side** (`supabase.auth.getUser()`) reinforced by
RLS scoping (`.eq('tutor_id', user.id)`). See [authentication.md](./authentication.md).

## 11.1 Tutor route map

| Route | Purpose | Data |
|-------|---------|------|
| `/tutor` | Dashboard: today's classes, stats, quick links | `class_sessions`, `students`, `progress_reports` |
| `/tutor/classes` | Day/week schedule, status + meeting links | `class_sessions`, `students`, `profiles` |
| `/tutor/attendance` | Per-student present/absent/late per date | `students`, `attendance` |
| `/tutor/students` | Student cards/table + session counts | `students`, `class_sessions` |
| `/tutor/students/[id]` | Student detail hub | `StudentProgressHub` |
| `/tutor/reports` | Reports list + new-report link | `progress_reports` |
| `/tutor/reports/new` | Multi-step report form | `students`, `class_sessions`, `progress_reports`, `homework_logs` |
| `/tutor/homework` | Template CRUD + assign | `homework_templates`, `homework_logs`, `students` |
| `/tutor/roadmap` | Per-student lesson roadmap CRUD | `students`, `course_roadmaps`, static `SURAHS` |
| `/tutor/voice-tracker` | AI voice mushaf (mic + keyword matching) | static `SURAHS` + Web Speech API |
| `/tutor/earnings` | Earnings history + session stats | `tutor_earnings`, `class_sessions` |
| `/tutor/messages` | Group chat (realtime) | `chat_messages` |
| `/tutor/profile` | Profile + password | `profiles`, `auth.updateUser` |
| `/tutor/qaida` | Qaida teacher insights (placeholder) | `TutorDashboard` (static) |

## 11.2 Lessons & roadmap

`/tutor/roadmap` lets a tutor build a per-student lesson plan (`course_roadmaps`): ordered items with
`lesson_type` (`lesson/revision/test/milestone/holiday`), surah reference, planned dates and status.
This roadmap surfaces in `StudentProgressHub` (admin/tutor) and read-only in `/parent/roadmap`.

## 11.3 Students & progress

`/tutor/students` lists the tutor's students with session counts; `/tutor/students/[id]` opens the
shared `StudentProgressHub` — profile summary, period-filtered to-do/completed (daily work + roadmap),
recent progress reports, and add/toggle daily work notes.

## 11.4 Assignments & homework

`/tutor/homework` manages reusable `homework_templates` and assigns `homework_logs` to students. Homework
is also captured inside the progress-report flow and appears in parent portals for completion.

## 11.5 Attendance

`/tutor/attendance` — pick a date, mark each student present/absent/late (with optional late minutes),
and save to `attendance`. Feeds parent attendance views and admin analytics.

## 11.6 Reports (the core teaching artifact)

`/tutor/reports/new` is a multi-step form capturing: lesson coverage, a **tajweed matrix**, star
rating, **audio note** (recorded to the `audio-notes` Supabase Storage bucket), overall rating and
homework. Saved to `progress_reports` (+ `homework_logs`), reviewed by admin and shared with parents.

## 11.7 AI voice tracker

`/tutor/voice-tracker` is an AI-assisted mushaf: it uses the browser Speech API to listen and match
recited words against `SURAHS` keywords — a forward-looking recitation-tracking prototype (no Supabase
reads).

## 11.8 Analytics & earnings

`/tutor/earnings` shows earnings history and session stats from `tutor_earnings` + `class_sessions`.
Deeper teaching analytics (across students) are an admin/analytics concern today.

## 11.9 Qaida teacher view

`/tutor/qaida` (and the embedded `teachers` view in `QaidaShell`) render **`TutorDashboard`**, currently
an **integration-ready placeholder**: it calls `createTutorProgressSnapshot()` which returns
`unavailable`, showing an amber banner and three "Awaiting verified data" insight cards. This is the
hook point for real Qaida teacher analytics once progress persists to the backend
(see [roadmap.md](./roadmap.md)).

## 11.10 Permissions

- Scoped to the tutor's own students/sessions via RLS.
- Cannot access `/admin/*` (middleware redirects to `/tutor`).
- No server-side gate on the portal shell itself — a hardening item in [security.md](./security.md).

## 11.11 Future improvements

- Server-authenticated tutor layout.
- Real Qaida analytics (per-student letter/module mastery, practice time, game accuracy).
- Auto-calculated earnings from completed sessions.
- Calendar scheduling, recurring sessions, timezone-aware rendering.
- AI report drafting from audio notes + roadmap context.

> Related: [student.md](./student.md) · [parent.md](./parent.md) · [flowcharts.md](./flowcharts.md)
