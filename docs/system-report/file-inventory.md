# 22. File Inventory

Index of important files. **Importance:** ⭐⭐⭐ critical · ⭐⭐ significant · ⭐ supporting.

## 22.1 App shell & routing

| File | Purpose | Used by | Importance |
|------|---------|---------|:----------:|
| `src/app/layout.tsx` | Root shell, fonts, global + Qaida CSS | all routes | ⭐⭐⭐ |
| `src/app/page.tsx` | `/` client role redirect | entry | ⭐⭐ |
| `src/app/login/page.tsx` | Login (role picker + Supabase) | public | ⭐⭐⭐ |
| `src/middleware.ts` | Admin route protection | `/admin/*`, `/api/admin/*` | ⭐⭐⭐ |
| `src/app/admin/layout.tsx` | Server auth + AdminChrome | admin pages | ⭐⭐⭐ |
| `src/app/tutor/layout.tsx` / `parent/layout.tsx` | Sidebar chrome | portals | ⭐⭐ |

## 22.2 Auth & lib

| File | Purpose | Importance |
|------|---------|:----------:|
| `src/lib/supabase.ts` | Browser client + cookie-mirroring auth storage | ⭐⭐⭐ |
| `src/lib/server-auth.ts` | `authorizeAdmin()` (middleware + admin layout) | ⭐⭐⭐ |
| `src/lib/supabase-auth-storage.ts` | Storage adapter (chunked cookies, legacy migration) | ⭐⭐ |
| `src/lib/portal.ts` | Formatting/date helpers (not auth) | ⭐ |
| `src/lib/timezones.ts` | Timezone utilities | ⭐ |
| `src/app/api/admin/create-user/route.ts` | Provision users (service role) | ⭐⭐⭐ |
| `src/app/api/admin/update-user/route.ts` | Update users (service role) | ⭐⭐ |

## 22.3 Shared components & types

| File | Purpose | Importance |
|------|---------|:----------:|
| `src/components/AdminChrome.tsx` | Admin layout wrapper | ⭐⭐ |
| `src/components/Sidebar.tsx` | Role navigation + logout | ⭐⭐⭐ |
| `src/components/TopBar.tsx` | Page header | ⭐⭐ |
| `src/components/StudentProgressHub.tsx` | Shared student detail | ⭐⭐⭐ |
| `src/components/ParentStudentSwitcher.tsx` | Multi-child switcher | ⭐⭐ |
| `src/components/NoorPathLogo.tsx` | Brand mark | ⭐ |
| `src/components/ui/ComingSoon.tsx` | Placeholder (unused) | ⭐ |
| `src/types/database.ts` | Domain types + Supabase Database | ⭐⭐⭐ |

## 22.4 Noorani Qaida feature

| File | Purpose | Importance |
|------|---------|:----------:|
| `features/noorani-qaida/layout/QaidaShell.tsx` | LMS orchestrator | ⭐⭐⭐ |
| `.../layout/QaidaHUD.tsx` / `QaidaSidebar.tsx` | Chrome | ⭐⭐ |
| `.../data/modules.ts` | 11-module curriculum (authoritative) | ⭐⭐⭐ |
| `.../data/curriculum.ts` | Book TOC + 28 letters | ⭐⭐⭐ |
| `.../data/games.ts` | Game catalog + `letterWindow` | ⭐⭐ |
| `.../types/index.ts` | Qaida domain types | ⭐⭐⭐ |
| `.../state/progress.ts` | Progress reducer + persistence keys | ⭐⭐⭐ |
| `.../state/useQaidaState.ts` | Hydrate/persist hook | ⭐⭐⭐ |
| `.../state/curriculumProgress.ts` | Unlock + % calculations | ⭐⭐ |
| `.../state/practiceConfig.ts` | Practice game config | ⭐ |
| `.../rewards/rewardEngine.ts` | Pure reward calc (test-only) | ⭐ |
| `.../lesson/flow.ts` | Lesson step machine | ⭐⭐ |
| `.../audio/QaidaAudioService.ts` | Audio orchestration | ⭐⭐ |
| `.../audio/manifest.ts` / `speech.ts` | Keys + TTS | ⭐⭐ |
| `.../screens/*` (16) | Lesson/book/games/dashboards | ⭐⭐⭐ |
| `.../games/*` (7 + GameShell) | Mini-games | ⭐⭐ |
| `.../animations/*` (6) | Particle/celebration effects | ⭐⭐ |
| `.../motion/config.ts` / `useMotionBudget.ts` | Motion budget | ⭐⭐ |
| `.../ui/TracingCanvas.tsx` / `tracingValidation.ts` | Tracing + scoring | ⭐⭐ |
| `.../ui/PageTurnViewer.tsx` | Digital book pager | ⭐⭐ |
| `.../ui/QaidaLoader.tsx` / `FullscreenButton.tsx` | UI helpers | ⭐ |
| `.../characters/*` | Mascots + LetterCard | ⭐⭐ |
| `.../fonts.ts` / `qaida.css` | Type + scoped styles | ⭐⭐ |

## 22.5 Entry points for the LMS

| File | Purpose | Importance |
|------|---------|:----------:|
| `src/app/admin/noorani-qaida/page.tsx` + `layout.tsx` | Full LMS (fullscreen, admin) | ⭐⭐⭐ |
| `src/app/qaida-preview/page.tsx` + `layout.tsx` + `QaidaPreviewClient.tsx` | Public lesson-only preview | ⭐⭐⭐ |
| `src/app/parent/qaida/page.tsx` | Parent Qaida view | ⭐⭐ |
| `src/app/tutor/qaida/page.tsx` | Teacher Qaida view | ⭐⭐ |

## 22.6 Config, tests, DB

| File | Purpose | Importance |
|------|---------|:----------:|
| `package.json` | Deps + scripts (dev port 3001) | ⭐⭐⭐ |
| `next.config.mjs` | Env exposure, config | ⭐⭐ |
| `tailwind.config.ts` | Theme + content paths | ⭐⭐ |
| `tsconfig.json` | Strict TS + `@/*` alias | ⭐⭐ |
| `eslint.config.mjs` / `postcss.config.mjs` / `.npmrc` | Tooling | ⭐ |
| `scripts/qaida-contract-tests.cjs` | Qaida invariants test runner | ⭐⭐⭐ |
| `supabase/config.toml` | Local Supabase config | ⭐⭐ |
| `supabase/migrations/*.sql` | Schema + retire legacy | ⭐⭐⭐ |
| root `*.sql` (schema, RLS, seed) | DB definition + demo data | ⭐⭐⭐ |
| `src/app/globals.css` | App design system (~1090 lines) | ⭐⭐⭐ |
| `public/*.svg` | Icons (favicon + boilerplate) | ⭐ |

> Related: [architecture.md](./architecture.md) · [code-quality.md](./code-quality.md)
