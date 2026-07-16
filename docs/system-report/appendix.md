# 24. Appendix

## 24.1 Glossary

| Term | Meaning |
|------|---------|
| **Noorani Qaida** | Foundational primer teaching Arabic letters and reading rules as preparation for Quran reading |
| **Harakaat** | Short vowel marks (Fatha, Kasra, Damma) |
| **Tanween** | Double-vowel marks (Fathatain, Kasratain, Dammatain) |
| **Sukoon** | Absence-of-vowel mark |
| **Shaddah** | Letter-doubling mark |
| **Madd** | Elongation of a vowel sound |
| **Makharij** | Articulation points of Arabic letters |
| **Tajweed** | Rules of correct Quran recitation |
| **RLS** | Row-Level Security (Postgres/Supabase authorization) |
| **SSG / SSR** | Static / Server-Side rendering |
| **HUD** | Heads-up display (the persistent Qaida stats bar) |
| **Motion budget** | System that scales animation intensity to device/preferences |

## 24.2 Conventions used in this report

- **Status icons:** 🟢 shipped · 🟡 partial/placeholder · 🔴 not built.
- **Severity:** 🔴 High · 🟠 Medium · 🟡 Low · 🟢 Cosmetic.
- **Priority:** P0–P3.
- File paths are relative to the repo root unless prefixed with an absolute path.

## 24.3 Environment & commands

| Command | Effect |
|---------|--------|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Serve production on 3001 |
| `npm run lint` | Flat-config ESLint |
| `npm run test:qaida` | Qaida contract tests |

**Node engine:** `>=18.17.0`. **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (client), `SUPABASE_SERVICE_ROLE_KEY` (admin API only).

## 24.4 Consolidated known-gaps register

| # | Gap | Chapter | Severity |
|---|-----|---------|:--------:|
| 1 | Qaida progress device-local only (no server sync) | database, roadmap | 🔴 |
| 2 | SQL schema drift across root SQL files | database | 🔴 |
| 3 | `chat_messages` missing CREATE TABLE/RLS in repo | database, security | 🟠 |
| 4 | Tutor/parent portals client-gated only | security | 🟠 |
| 5 | Admin API routes trust middleware (no in-handler check) | security | 🟠 |
| 6 | Non-HttpOnly session cookies | security | 🟠 |
| 7 | `calculateGameReward` unused (duplicate star logic) | games, code-quality | 🟡 |
| 8 | `rate_screen` never dispatched | feature-inventory, code-quality | 🟡 |
| 9 | `perfect-game` badge has no condition | noorani-qaida, code-quality | 🟡 |
| 10 | Sidebar "Certificates" routes to ProgressScreen | noorani-qaida | 🟡 |
| 11 | Dual screen-ID namespaces | noorani-qaida, code-quality | 🟡 |
| 12 | Stale-closure star calc in FindLetter/BubblePop | games | 🟡 |
| 13 | `xpMax` static (no within-level progress) | noorani-qaida | 🟡 |
| 14 | Recorded Qari audio absent (TTS fallback) | noorani-qaida | 🟡 |
| 15 | Login ignores `?next=` param | authentication | 🟢 |
| 16 | `ui/ComingSoon` unused; boilerplate SVGs; verify `gsap` | code-quality | 🟢 |
| 17 | No portal/E2E/RLS tests | code-quality | 🟠 |

## 24.5 Correction to original brief

The audit brief referenced a `qaida-visual-check` route. **This route does not exist** in the
repository. The equivalent surfaces are:

- `/qaida-preview` — public, login-free, lesson-only preview.
- `/admin/noorani-qaida` — full authenticated LMS (fullscreen).
- `/parent/qaida`, `/tutor/qaida` — role Qaida dashboards.

## 24.6 Document index

See [README.md](./README.md) for the full table of contents. Core chapters:
[overview](./overview.md) · [architecture](./architecture.md) · [admin-panel](./admin-panel.md) ·
[authentication](./authentication.md) · [noorani-qaida](./noorani-qaida.md) ·
[games](./games.md) · [animations](./animations.md) · [teacher](./teacher.md) · [parent](./parent.md) ·
[student](./student.md) · [seo](./seo.md) · [performance](./performance.md) ·
[accessibility](./accessibility.md) · [responsive](./responsive.md) · [security](./security.md) ·
[database](./database.md) · [flowcharts](./flowcharts.md) · [roadmap](./roadmap.md) ·
[code-quality](./code-quality.md) · [feature-inventory](./feature-inventory.md) ·
[component-reference](./component-reference.md) · [file-inventory](./file-inventory.md) ·
[scorecard](./scorecard.md).

## 24.7 Methodology & traceability

This report was produced by **reading the source directly** (routes, features, components, hooks,
state, data, audio, animations, games, SQL and config) across five structured passes. No application
code was modified. Claims about mechanisms reference the responsible files so future engineers can
verify quickly. Where the brief and the code diverged (e.g. `qaida-visual-check`), the code is treated
as ground truth and the divergence is noted.
