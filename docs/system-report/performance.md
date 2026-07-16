# 14. Performance Report

## 14.1 Rendering strategy

| Route class | Strategy | Rationale |
|-------------|----------|-----------|
| Operations pages | `dynamic = "force-dynamic"`, client-rendered | Per-user live data |
| Qaida entry shells | Server component + `metadata` | Lightweight, SEO-safe (`noindex`) |
| `/qaida-preview` | `dynamic = "force-static"` | Public, cacheable |
| Qaida engine | Client + `ssr: false` dynamic imports | Browser-only APIs (canvas, audio, fullscreen) |

## 14.2 Code splitting & lazy loading

- `QaidaShell` lazy-loads **every screen and all 7 games** via `next/dynamic({ ssr: false })` with a
  `QaidaLoader` fallback — the LMS ships a small initial bundle and pulls in game/screen code on demand.
- `TracingCanvas` and `ConfettiExplosion` are dynamically imported inside lessons (heavy + browser-only).
- Operations pages import Recharts only on `/admin/analytics`.

## 14.3 Bundle considerations

| Dependency | Weight impact | Mitigation |
|------------|---------------|------------|
| `framer-motion` (^12) | Medium-large | Confined to Qaida; portals mostly static |
| `gsap` (^3.15) | Medium | Present for advanced animation |
| `recharts` (2.12) | Large | Only on analytics page |
| `howler` (^2.2) | Small | Audio playback |
| `lucide-react` | Tree-shakeable | Import icons individually |

**Recommendation:** verify `gsap` is actually used; if not, remove. Confirm Recharts is not pulled into
shared chunks. Run `next build` + bundle analyzer for exact numbers (not available in this static audit).

## 14.4 Hydration

- No SSR of the Qaida engine (`ssr: false`) avoids hydration mismatches from `localStorage`/`window`.
- `useMotionBudget` defaults to a 1024px desktop tier pre-resize (SSR-safe) — a brief first-paint
  particle count difference on small screens, corrected on first resize (negligible CLS risk).

## 14.5 Image optimization

The admin app uses **very few raster images** (SVG icons only in `public/`); most visuals are
SVG/canvas/CSS. This is inherently performant. Marketing imagery/video lives in the public site, not
this repo.

## 14.6 Animation performance

The tiered **motion budget** is the single biggest perf lever (see [animations.md](./animations.md)):
particle counts scale to viewport, infinite loops pause on hidden tabs, and confetti uses a
self-terminating canvas RAF instead of dozens of DOM nodes. Reduced-motion collapses all of it.

## 14.7 Data fetching

- No client cache (SWR/React Query). Each page fetches on mount — simple and always-fresh, but can
  cause redundant fetches on navigation.
- **Opportunity:** introduce a lightweight cache/query layer for hot tables (students, sessions) to
  cut repeat reads and improve perceived speed.

## 14.8 Potential bottlenecks

| Bottleneck | Impact | Fix |
|------------|--------|-----|
| `FloatingParticles` = N infinite Framer loops | CPU on low-end | Already capped by budget; consider CSS-only for lowest tier |
| Whole `QaidaProgress` serialized on every dispatch | Minor localStorage churn | Debounce persistence |
| No data caching | Repeat Supabase reads | Add query cache |
| Recharts on analytics | Heavy chunk | Lazy-load charts per tab |
| Realtime channels (messages) | Open sockets | Ensure unsubscribe on unmount |

## 14.9 Future optimization

1. Persist Qaida progress with debounce; consider IndexedDB for larger histories.
2. Add a query cache (SWR/React Query) for operations data.
3. Bundle analysis in CI; drop unused deps (verify `gsap`).
4. Route-level `loading.tsx` skeletons for portal pages.
5. Consider partial prerendering for static portions once stable.

> Related: [architecture.md](./architecture.md) · [animations.md](./animations.md)
