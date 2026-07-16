# 21. Code Quality Audit

## 21.1 Overall assessment

The codebase is **well-structured and readable**, with a clean feature-based separation and strong
typing (`strict: true`). The Noorani Qaida feature in particular is a model vertical slice with pure,
testable logic (reducers, `tracingValidation`, `rewardEngine`, motion budget) backed by a custom
contract-test runner. The main debt clusters around **duplication**, **dead/unused code**, and
**schema drift**.

## 21.2 Naming

- **Good:** descriptive, consistent file/component names; typed unions for domain states.
- **Issue:** dual screen-ID namespaces (book TOC vs modules) share the `ScreenId` type but mean
  different things; the sidebar "Certificates" label routes to `ProgressScreen` (misleading).

## 21.3 Architecture

- **Good:** feature isolation (`noorani-qaida`), single orchestrator (`QaidaShell`), small prop surface
  for reuse across three entry points, server/client boundaries respected.
- **Issue:** authorization is asymmetric (admin server-gated; tutor/parent client-only) — architectural
  inconsistency (see [security.md](./security.md)).

## 21.4 Folder structure

Clear and conventional (`app/`, `features/`, `components/`, `lib/`, `types/`). No route groups keeps
routing obvious. Feature sub-folders (`state/`, `data/`, `screens/`, `games/`, `animations/`, `ui/`) are
intuitive.

## 21.5 Complexity

- `QaidaShell` is large (orchestrates views, screens, games, rewards, celebrations, preview logic).
  Consider extracting: reward dispatch, celebration effects, and preview gating into hooks.
- Multi-step tutor report form is inherently complex; would benefit from decomposition.

## 21.6 Reusability

- Strong reuse: `StudentProgressHub`, `Sidebar`/`TopBar`, `GameShell`, `PageTurnViewer`, mascots,
  animations, motion budget.
- Under-used: `rewardEngine` (bypassed by inline shell logic).

## 21.7 Technical debt register

| # | Item | Severity | Recommendation |
|---|------|:--------:|----------------|
| 1 | Qaida progress not persisted server-side | 🔴 | Add Supabase sync (see roadmap) |
| 2 | SQL schema drift (`notifications`/`messages`/`tutor_earnings`/`homework_*`) | 🔴 | Reconcile to one canonical migration set |
| 3 | `chat_messages` has no `CREATE TABLE`/RLS in repo | 🟠 | Add migration + RLS |
| 4 | Tutor/parent lack server auth | 🟠 | Add server gates |
| 5 | `calculateGameReward`/`summarizeReward` unused (duplicate star logic) | 🟡 | Route games through engine |
| 6 | `rate_screen` action never dispatched | 🟡 | Wire up or remove |
| 7 | `perfect-game` badge has no award condition | 🟡 | Add condition |
| 8 | Sidebar "Certificates" → `ProgressScreen` | 🟡 | Fix routing/label |
| 9 | Dual screen-ID namespaces | 🟡 | Document/normalize for analytics |
| 10 | Stale-closure star calc in `FindLetter`/`BubblePop` | 🟡 | Use refs/functional updates |
| 11 | `xpMax` static (bar doesn't show within-level progress) | 🟡 | Compute per-level remainder |
| 12 | `ui/ComingSoon` unused | 🟢 | Remove or wire up |
| 13 | `gsap` dependency — verify usage | 🟢 | Remove if unused |
| 14 | Boilerplate `public/*.svg` (globe/window/vercel/next/file) | 🟢 | Delete unused assets |
| 15 | Login ignores `?next=` param | 🟢 | Consume for post-login redirect |

## 21.8 Dead / unused code & assets

- `ui/ComingSoon` component (no importers).
- `childStaggerVariants`, `cardVariants`, `tapScale` variants (defined, unused).
- `SparkleBurst` `x`/`y` props (declared, unconsumed).
- Boilerplate SVGs in `public/`.
- Legacy `localStorage` keys are read but never cleaned up post-migration.

## 21.9 Duplicate code

- Star/reward calculation duplicated between each game and `rewardEngine`.
- Two curriculum representations with overlapping concepts.
- Duplicate schema between `supabase-schema.sql` and `supabase/migrations/20260702000000_*.sql`.

## 21.10 Testing

- **Present:** `qaida-contract-tests.cjs` covers progress invariants, lesson flow, reward math, tracing
  validation, motion budget, module count/uniqueness, unlock rules, audio manifest.
- **Gap:** no tests for operations portals, no RLS policy tests, no E2E, no component tests. Recommend
  Playwright E2E + RLS assertions in CI.

## 21.11 Maintainability score

**7.5 / 10** — clean structure and typing, good feature isolation and pure logic; held back by schema
drift, duplication, and asymmetric auth. Addressing the 🔴/🟠 debt items would move this to ~9.

> Related: [database.md](./database.md) · [security.md](./security.md) · [scorecard.md](./scorecard.md)
