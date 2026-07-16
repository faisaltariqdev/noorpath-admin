# Admin Restructure — Merged Modules Report

**Date**: July 2026  
**Scope**: Shared UI, shared features, and route consolidation

---

## 1. Shared UI Primitives — `PortalUI.tsx`

**Before**: Every admin/tutor/parent page used its own inline styles, ad-hoc `div` structures, and duplicated loading/empty states.

**After**: A single shared component file `src/components/ui/PortalUI.tsx` provides:

| Component | Purpose |
|-----------|---------|
| `PageHeader` | Consistent page title + subtitle + optional action button |
| `PortalGrid` | Responsive 12-col metric grid (auto-fit cards) |
| `MetricCard` | Glanceable stat card with icon, value, label, and optional trend |
| `SectionCard` | Container card with title, optional action link, and body slot |
| `LoadingState` | Centered spinner with accessible label |
| `EmptyState` | Centered empty illustration with message and optional CTA |
| `StatusBadge` | Semantic pill badge for statuses (active, pending, paid, absent…) |

All components consume CSS classes defined in `src/app/globals.css` under the `ENTERPRISE PORTAL SYSTEM` section — no inline styles.

---

## 2. Messaging — Triplicate → Single Component

**Before**: Three byte-identical message pages existed with ~300 lines of copy-pasted code:
- `src/app/admin/messages/page.tsx`
- `src/app/tutor/messages/page.tsx`
- `src/app/parent/messages/page.tsx`

**After**:
- `src/features/messaging/MessageCenter.tsx` — single real-time group-chat component (role-aware)
- All three route files are now thin wrappers (`<MessageCenter />`) with zero logic

**Savings**: ~600 lines of duplicated code → 3 × 3-line wrappers + 1 shared implementation.

---

## 3. Profile/Account Settings — Triplicate → Single Component

**Before**: Three byte-identical profile pages existed:
- `src/app/admin/profile/page.tsx`
- `src/app/tutor/profile/page.tsx`
- `src/app/parent/profile/page.tsx`

**After**:
- `src/features/account/ProfileSettings.tsx` — single profile + password-change component
- All three route files are thin wrappers

**Savings**: ~400 lines of duplicated code → 3 × 3-line wrappers + 1 shared implementation.

---

## 4. People Directory — Two Admin Pages, One Component

**Before**: Separate teacher/parent list pages were planned but missing; admin used the complex `/admin/users` page for everything.

**After**:
- `src/features/people/PeopleDirectory.tsx` — single role-parameterized directory component
- `/admin/teachers` passes `role="tutor"` → shows teachers
- `/admin/parents` passes `role="parent"` → shows parents

Both pages share search, status badge, contact info, and assignment-count columns — no duplication.

---

## 5. Sessions → Live Classes (Route Alias)

**Before**: `/admin/sessions` was the only admin route for class scheduling — a non-obvious name.

**After**:
- `/admin/live-classes` is the canonical new route (matches the sidebar label)
- `/admin/sessions` is kept as a zero-logic re-export for bookmark compatibility

---

## 6. Fees + Earnings → Payments Hub

**Before**: Financial data was split across two separate admin routes (`/admin/fees` and `/admin/earnings`) with separate code, separate Supabase queries, and no unified view.

**After**:
- `/admin/payments` is the new canonical route that surfaces aggregate metrics (total revenue, pending invoices, paid this month, refunds) plus a unified recent-records table
- Old routes remain intact for direct links

---

## 7. Authorization — Triplicate Guards → Single `authorizeRole`

**Before**:
- `/admin/*` routes: server-side guard via `authorizeAdmin` in middleware and layout
- `/tutor/*` routes: client-side guard only (cookie read in component mount)
- `/parent/*` routes: client-side guard only (cookie read in component mount)

**After**:
- `src/lib/server-auth.ts` exposes `authorizeRole(cookies, expectedRole)` — one function for all roles
- `src/middleware.ts` enforces server-side authorization for all three portals
- `src/app/tutor/layout.tsx` and `src/app/parent/layout.tsx` perform an additional server-side `authorizeRole` check before rendering any portal chrome

---

## 8. Design Token Layer

**Before**: CSS variables existed in `globals.css` but new pages applied them inconsistently — many pages used hardcoded `#hex` colors and raw pixel measurements inline.

**After**: All new admin pages use semantic CSS class names (`.portal-page`, `.portal-grid`, `.portal-metric-card`, `.portal-section-card`, `.portal-status--*`) that reference the existing token layer. No new hardcoded colors or pixel values were added to page code.
