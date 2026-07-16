# Admin Restructure — New Navigation Structure

**Date**: July 2026

---

## Admin Sidebar

```
NoorPath Admin
│
├── Dashboard              /admin
│
├── People
│   ├── Students           /admin/students
│   ├── Teachers           /admin/teachers      (new)
│   └── Parents            /admin/parents       (new)
│
├── Learning
│   ├── Courses            /admin/courses
│   ├── Noorani Qaida      /admin/noorani-qaida  ← DO NOT TOUCH
│   ├── Live Classes       /admin/live-classes   (new canonical)
│   └── Assignments        /admin/assignments   (new)
│
├── Operations
│   ├── Attendance         /admin/attendance    (new)
│   ├── Payments           /admin/payments      (new)
│   └── Reports            /admin/reports
│
├── Communication
│   └── Messages           /admin/messages
│
└── System
    ├── Settings           /admin/settings
    └── Profile            /admin/profile
```

**Removed from sidebar**:
- Analytics (still accessible at `/admin/analytics` — not linked in nav; power-user route)
- Notifications (still at `/admin/notifications` — not linked in nav)
- Earnings / Fees — merged into Payments hub
- Sessions — aliased to Live Classes

---

## Teacher (Tutor) Sidebar

```
NoorPath
│
├── Dashboard              /tutor
│
├── Teaching
│   ├── My Students        /tutor/students
│   ├── Classes            /tutor/classes
│   ├── Homework           /tutor/homework
│   ├── Attendance         /tutor/attendance
│   └── Reports            /tutor/reports
│
├── My Account
│   ├── Earnings           /tutor/earnings
│   ├── Roadmap            /tutor/roadmap
│   ├── Messages           /tutor/messages
│   └── Profile            /tutor/profile
│
└── Noorani Qaida          /tutor/qaida         ← DO NOT TOUCH
```

---

## Parent Sidebar

```
NoorPath
│
├── Dashboard              /parent
│
├── My Children
│   ├── Progress           /parent/progress
│   ├── Journey            /parent/journey
│   ├── Attendance         /parent/attendance
│   ├── Homework           /parent/homework
│   ├── Mushaf             /parent/mushaf
│   └── Noorani Qaida      /parent/qaida        ← DO NOT TOUCH
│
├── Schedule & Finance
│   ├── Sessions           /parent/sessions
│   ├── Roadmap            /parent/roadmap
│   ├── Fees               /parent/fees
│   └── Timeline           /parent/timeline
│
└── Account
    ├── Messages           /parent/messages
    └── Profile            /parent/profile
```

---

## Route Inventory by Status

### New Routes (added this restructure)

| Route | Purpose |
|-------|---------|
| `/admin/teachers` | Teacher directory via `PeopleDirectory` |
| `/admin/parents` | Parent directory via `PeopleDirectory` |
| `/admin/live-classes` | Canonical alias for sessions |
| `/admin/assignments` | Aggregate homework management |
| `/admin/attendance` | Monthly attendance overview |
| `/admin/payments` | Unified financial hub |

### Modified Routes

| Route | What Changed |
|-------|-------------|
| `/admin` | Full redesign with real-time metrics |
| `/admin/analytics` | Removed fake revenue-by-country column |
| `/admin/settings` | Added link to shared profile settings |
| `/admin/messages` | Now a thin wrapper around `MessageCenter` |
| `/admin/profile` | Now a thin wrapper around `ProfileSettings` |
| `/tutor/messages` | Thin wrapper around `MessageCenter` |
| `/tutor/profile` | Thin wrapper around `ProfileSettings` |
| `/tutor/page` | Fixed CSS class names, responsive grid |
| `/tutor/reports` | Fixed schema alignment (tajweed_stars, homework, tutor_notes) |
| `/parent/messages` | Thin wrapper around `MessageCenter` |
| `/parent/profile` | Thin wrapper around `ProfileSettings` |
| `/parent/page` | Responsive grid class applied |

### Preserved Routes (no changes)

All routes under `src/app/*/noorani-qaida`, `src/features/noorani-qaida`, and the public `/qaida-preview` route were not modified.

---

## Authorization Matrix

| Route Prefix | Middleware Guard | Layout Guard | Role Required |
|-------------|-----------------|--------------|---------------|
| `/admin/*` | ✅ server-side | ✅ server-side | `admin` |
| `/api/admin/*` | ✅ server-side | n/a | `admin` |
| `/tutor/*` | ✅ server-side (new) | ✅ server-side (new) | `tutor` |
| `/parent/*` | ✅ server-side (new) | ✅ server-side (new) | `parent` |

**Cross-role redirect**: If a user is authenticated but hits the wrong role prefix, middleware reads `auth.role` and redirects them to their correct portal root (`/admin`, `/tutor`, or `/parent`).
