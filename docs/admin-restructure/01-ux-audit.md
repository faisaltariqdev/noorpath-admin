# NoorPath Enterprise Admin Restructure — UX Audit

**Scope:** Every non-Qaida admin, tutor, parent, shared-shell, authentication, API, and database-facing workflow.

**Protected boundary:** `src/features/noorani-qaida/**` and its lessons, ebook, games, audio, tracing, animations, rewards, mascots, state, and learning flow are excluded from modification.

## Executive finding

The platform already contains the required operational capabilities, but they are distributed across too many role-specific pages and implemented with repeated page-level UI. The safest enterprise restructure is therefore a **consolidation, not a rewrite**:

1. Keep real Supabase workflows and Row-Level Security.
2. Replace fragmented navigation with role-appropriate task hubs.
3. Share repeated messaging/profile/UI primitives.
4. Remove only verified dead or misleading UI.
5. Add server-side role protection before exposing consolidated portals.

## Highest-priority findings

| Priority | Finding | Evidence | Required action |
|---|---|---|---|
| P0 | Tutor and parent routes have no server-side role gate | `src/middleware.ts`, `src/app/tutor/layout.tsx`, `src/app/parent/layout.tsx` | Generalize server authorization and protect all portal routes |
| P0 | Tutor report list reads legacy columns not written by the report form | `src/app/tutor/reports/page.tsx`, `src/app/tutor/reports/new/page.tsx`, `src/types/database.ts` | Reconcile report fields before merging reports |
| P1 | Three messages pages are byte-identical | `admin/messages`, `tutor/messages`, `parent/messages` | Replace with one shared message center |
| P1 | Three profile pages are byte-identical | `admin/profile`, `tutor/profile`, `parent/profile` | Replace with one shared account settings component |
| P1 | Sidebar has two conflicting toggle systems | `Sidebar.tsx`, `TopBar.tsx` | Use one React-controlled event path |
| P1 | Dashboard trend values are hardcoded | `src/app/admin/page.tsx` | Remove or calculate real comparisons |
| P1 | Analytics presents an always-zero revenue-by-country value | `src/app/admin/analytics/page.tsx` | Remove misleading column or calculate valid attribution |
| P1 | Fixed dashboard grids do not collapse consistently | admin, tutor, parent dashboards | Add a responsive 12-column system |

## Navigation and workflow audit

### Current fragmentation

- Admin has separate Users, Students, Courses, Sessions, Fees, Earnings, Reports, Analytics, Messages, Notifications, Profile, and Settings pages.
- Tutor separates reports, report creation, homework, roadmap, voice tracking, earnings, messages, and profile.
- Parent separates progress, journey, roadmap, mushaf, timeline, attendance, homework, sessions, fees, messages, and profile.
- Several of these are different views of the same user task rather than independent modules.

### Target admin navigation

1. Dashboard
2. Students
3. Teachers
4. Parents
5. Courses
6. Noorani Qaida — unchanged
7. Live Classes
8. Assignments
9. Attendance
10. Payments
11. Reports
12. Messages
13. Settings

### Role-specific navigation

The target list applies to the administrator. Teachers and parents should see only relevant subsets:

- **Teacher:** Dashboard, Students, Live Classes, Assignments, Attendance, Reports, Messages, Payments, Settings.
- **Parent:** Dashboard, Children, Live Classes, Assignments, Attendance, Progress, Payments, Messages, Settings.
- **Student:** no new portal is fabricated; learner access remains through existing learning delivery.

## Consolidation decisions

| Existing capability | Target module | Decision |
|---|---|---|
| `/admin/users` | Teachers + Parents | Split by role while reusing the same real provisioning APIs |
| `/admin/sessions` | Live Classes | Preserve CRUD; rename user-facing terminology |
| Tutor homework + parent homework | Assignments | Share terminology and components; preserve role-specific actions |
| Tutor/parent attendance + admin analytics | Attendance | Add admin aggregate without changing existing records |
| Fees + tutor earnings + reminder actions | Payments | One hub with Invoices and Teacher Payroll views |
| Reports + Analytics | Reports | One hub with operational and analytical views |
| Messages + Notifications | Messages | One hub with Inbox and Announcements/Broadcast views |
| Profile + reminder configuration | Settings | Account settings plus organization/reminder sections |
| Parent progress/journey/roadmap/mushaf/timeline | Progress | One parent progress hub with concise sections |

## Verified dead or misleading items

### Safe removal candidates

- `src/components/ui/ComingSoon.tsx` — no imports.
- `date-fns` dependency — no source imports.
- Empty retired route folders: `admin/roadmap`, `admin/kids-studio`, `parent/kids-studio`, `qaida-visual-check`.
- Unreferenced Next starter assets (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`).
- Unreferenced legacy image assets, after a final reference check.

### Preserve despite limited visibility

- `/qaida-preview` is used by the external marketing website.
- `/admin/noorani-qaida`, `/tutor/qaida`, `/parent/qaida` remain valid mount points.
- Admin user APIs are the only account-provisioning mechanism.
- `StudentProgressHub`, parent child-switching, sessions, attendance, fees, earnings, reports, homework, roadmaps, messaging, and notifications are real workflows.

### Misleading UI to remove or correct

- Hardcoded dashboard trend badges.
- Non-functional TopBar search and notification buttons.
- Hardcoded TopBar avatar.
- Revenue-by-country values that cannot be derived from the current relationship model.
- Drag/reorder affordances that do not perform a real action.
- Experimental tools must not appear as enterprise core navigation unless their data is persisted.

## Design-system audit

The CSS token layer is usable, but the React component layer is missing. Hundreds of inline styles produce inconsistent spacing and brittle responsive behavior.

### Required shared primitives

- `PortalShell` / `PageHeader`
- `ResponsiveGrid` using 12 columns
- `Card`, `StatCard`, `MetricCard`
- `Button`, `IconButton`
- `Badge`, `StatusBadge`
- `DataTable`
- `Dialog`
- `FormField`
- `SearchField`, `FilterBar`
- `Spinner`, `LoadingState`, `EmptyState`
- `Tabs`
- `MessagesCenter`
- `ProfileSettings`

### Visual rules

- 8px base spacing with 4/8/12/16/24/32 steps.
- `rounded-xl` cards with soft shadows and restrained borders.
- Glass only for overlays or high-level emphasis.
- No decorative animation in operations workflows; micro-interactions only.
- Professional Plus Jakarta Sans interface typography; ornamental display type used sparingly.

## Accessibility audit

| Gap | Required correction |
|---|---|
| Hand-built modals lack dialog semantics, focus trap, Escape, and focus return | Shared accessible `Dialog` |
| Clickable `div` rows | Use buttons/links |
| Labels are not consistently associated with fields | `htmlFor`/`id` through `FormField` |
| Icon-only buttons lack names | Mandatory accessible labels |
| Sidebar remains tabbable off-canvas | Correct hidden/inert state |
| No global focus-visible system | Add tokenized focus ring |
| Low-contrast sidebar metadata | Raise contrast to WCAG AA |
| Fixed grids overflow on mobile | Responsive spans and stacking |

## Performance audit

- Portal pages are all client components and fetch after hydration.
- Recharts is statically imported only by Analytics and should be lazy-loaded when retained.
- The sidebar repeats a profile request already resolved by the admin server layout.
- Approximately 29 local spinner implementations duplicate a global animation.
- Qaida dependencies are correctly isolated and must remain installed.

## Risks and controls

| Risk | Control |
|---|---|
| Losing a workflow during route deletion | Merge UI first; retain compatibility routes until all links migrate |
| Breaking RLS assumptions | Keep RLS and add route authorization as defense in depth |
| Breaking existing sessions | Preserve `noorpath-admin-auth-v1` cookie/storage behavior |
| Accidental Qaida modification | Snapshot and compare `src/features/noorani-qaida/**` before/after |
| Schema drift | Fix report fields and document canonical tables before consolidation |
| Large visual regression | Introduce primitives incrementally and retain current CSS contracts first |

## Implementation gate

No operational page should be removed until:

1. Its capability exists in the target hub.
2. All internal links point to the target.
3. Role access is tested.
4. Real data and actions remain available.
5. A compatibility redirect is supplied when external bookmarks may exist.

This audit is the basis for `02-consolidation-plan.md`.
