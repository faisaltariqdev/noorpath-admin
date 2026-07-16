# 10. Parent Dashboard

The parent portal (`src/app/parent/*`) gives families transparency into each child's learning. All
pages are client components (`force-dynamic`) with client-side auth + RLS scoping (`.eq('parent_id',
user.id)`). Parents with multiple children use **`ParentStudentSwitcher`** to switch context.

## 10.1 Parent route map

| Route | Purpose | Data |
|-------|---------|------|
| `/parent` | Home: switcher, homework, fees, sessions, reports | `students`, `homework_logs`, `fees`, `class_sessions`, `progress_reports`, `attendance` |
| `/parent/progress` | Reports list + detail with audio | `students`, `progress_reports` |
| `/parent/sessions` | Upcoming/past classes + meeting links | `students`, `class_sessions` |
| `/parent/attendance` | Monthly calendar grid + rate | `students`, `attendance` |
| `/parent/homework` | Pending/done tabs, mark complete | `students`, `homework_logs` |
| `/parent/journey` | Gamified XP levels, milestones, streaks | `students`, `progress_reports`, `attendance` |
| `/parent/roadmap` | Read-only course roadmap timeline | `students`, `course_roadmaps` |
| `/parent/mushaf` | 114-surah grid tracker | `students`, `progress_reports`, static `SURAHS` |
| `/parent/timeline` | Unified activity feed | `students`, `progress_reports`, `attendance`, `homework_logs` |
| `/parent/fees` | Fee history + status badges | `students`, `fees` |
| `/parent/messages` | Group chat | `chat_messages` |
| `/parent/profile` | Profile + password | `profiles`, `auth.updateUser` |
| `/parent/qaida` | Qaida progress (device-local) | `ParentDashboard` (localStorage) |

## 10.2 Widgets & reports

- **Home** aggregates the most actionable items across children: pending homework, due fees, upcoming
  sessions, and the latest reports.
- **Progress** shows tutor-authored `progress_reports` with the recorded **audio note** playback.
- **Journey** reframes progress as a gamified path (XP levels, milestones, streaks) to motivate families.

## 10.3 Progress, attendance, homework

- **Attendance** renders a monthly calendar and an attendance rate.
- **Homework** separates pending vs. done and lets parents mark items complete (`homework_logs`).
- **Timeline** merges reports, attendance and homework into one chronological feed.

## 10.4 Notifications

Parents receive academy broadcasts via the `notifications` table (authored in `/admin/notifications`)
and can converse in `/parent/messages` (realtime `chat_messages`).

## 10.5 Qaida parent view

`/parent/qaida` (and the embedded `parents` view in `QaidaShell`) render **`ParentDashboard`**, which
reads the learner's **device-local** Qaida progress (`localStorage` key `noorpath-qaida-v5`):

- 5 stat cards (curriculum %, modules, XP, streak, practice time), current module, a 28-letter
  completion grid, and earned badges.
- Re-reads on the `storage` event for **cross-tab sync**.
- Carries an explicit disclaimer: *"this browser only — not synced to academy records."*

> ⚠️ Because Qaida progress is device-local, the parent Qaida view only reflects activity on the
> **same browser/device**. Server persistence (see [roadmap.md](./roadmap.md)) would make this a true
> cross-device parent analytics surface.

## 10.6 Future analytics

- Server-backed Qaida progress → real per-child mastery, practice trends, game accuracy.
- Weekly digest emails/WhatsApp summaries.
- Goal-setting and celebration nudges tied to streaks/badges.
- Comparison against curriculum pace and tutor roadmap.

> Related: [teacher.md](./teacher.md) · [student.md](./student.md) · [noorani-qaida.md](./noorani-qaida.md)
