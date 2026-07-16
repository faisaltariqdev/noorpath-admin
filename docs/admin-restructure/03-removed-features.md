# Admin Restructure — Removed & Deprecated Features Report

**Date**: July 2026  
**Scope**: Non-Qaida admin, tutor, and parent portals  
**Constraint**: Noorani Qaida module was NOT touched

---

## 1. Dead Components Removed

| Component | File | Reason |
|-----------|------|--------|
| `ComingSoon` | `src/components/ui/ComingSoon.tsx` | Never rendered in any route; placeholder with no planned use |

---

## 2. Boilerplate Assets Removed

| File | Reason |
|------|--------|
| `public/file.svg` | Next.js scaffold — never used in any page or component |
| `public/globe.svg` | Next.js scaffold — never used |
| `public/next.svg` | Next.js scaffold — never used |
| `public/vercel.svg` | Next.js scaffold — never used |
| `public/window.svg` | Next.js scaffold — never used |

---

## 3. Unused npm Dependency Removed

| Package | Reason |
|---------|--------|
| `date-fns` | Imported nowhere in non-Qaida code; native `Intl.DateTimeFormat` and `Date` methods used instead |

---

## 4. Hardcoded / Fake Data Removed

| Location | Issue | Resolution |
|----------|-------|------------|
| `admin/page.tsx` (old dashboard) | Hardcoded stat values: "247 students", "18 teachers" with static +% badges | Replaced with real-time Supabase queries |
| `admin/analytics/page.tsx` | "Revenue by Country" chart showed fake revenue column with invented values | Column replaced with student distribution only — no fabricated financial data |
| `admin/page.tsx` recent activity | Static hardcoded "just now / 2h ago" activity timestamps | Real data from `homework_logs` and `class_sessions` tables |

---

## 5. Deprecated Internal Exports

| Export | File | Reason |
|--------|------|--------|
| `useSidebarToggle` | `src/components/Sidebar.tsx` | Removed — `TopBar` now dispatches `noorpath:sidebar-toggle` event directly, eliminating the shared-state coupling |

---

## 6. Routes Effectively Retired (kept as redirects/aliases)

The following old routes remain in the file system (to avoid breaking direct bookmarks) but their content has been superseded by new canonical routes:

| Old Route | New Canonical Route | Status |
|-----------|---------------------|--------|
| `/admin/sessions` | `/admin/live-classes` | Old kept as thin re-export |
| `/admin/fees` | `/admin/payments` | Old kept; new page aggregates fees + earnings |
| `/admin/earnings` | `/admin/payments` | Old kept; new payments hub covers both |

---

## 7. What Was Intentionally NOT Removed

- Any file under `src/features/noorani-qaida/` — Qaida module is protected  
- Any file under `src/app/*/qaida` routes  
- Existing tutor/parent operational pages (`/parent/sessions`, `/parent/fees`, etc.) — kept for users who have bookmarks

---

## 8. Impact Assessment

| Metric | Before | After |
|--------|--------|-------|
| Dead components | 1 (`ComingSoon`) | 0 |
| Unused public assets | 5 | 0 |
| Unused npm packages | 1 (`date-fns`) | 0 |
| Hardcoded dashboard values | 4 widgets | 0 |
| Misleading chart columns | 1 | 0 |
| Stale internal exports | 1 (`useSidebarToggle`) | 0 |
