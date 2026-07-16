# 15. Accessibility Report

Accessibility is strongest in the **Noorani Qaida** engine, which is built for young learners and
includes deliberate a11y affordances. The operations portals are standard form/table UIs with room for
audit. Target: **WCAG 2.1 AA**.

## 15.1 Strengths

| Area | Implementation |
|------|----------------|
| **Skip links** | `.qaida-skip` skip-to-content in Qaida layouts |
| **Live regions** | `QaidaLoader` (`role="status"`, `aria-live="polite"`); `.qaida-live-region` for game/lesson updates |
| **Keyboard book** | `PageTurnViewer`: Arrow (RTL-aware), Home/End, focus moved to page heading |
| **Tracing bypass** | `TracingCanvas` offers a keyboard alternative ("shape reviewed") for pointer-only tracing |
| **Reduced motion** | Triple-layered: motion budget, `MotionConfig`, CSS `prefers-reduced-motion` |
| **Decorative hidden** | All particle/confetti/mascot effects `aria-hidden` + `pointer-events-none` |
| **Focus visible** | `qaida.css` 3px focus ring (`--qaida-focus`); tap-highlight removed intentionally |
| **ARIA states** | `aria-expanded` (menus), `aria-disabled` (locked nav), `aria-label` on icon buttons/tables |
| **Semantic Arabic** | `[lang="ar"]`/`[dir="rtl"]` with dedicated Arabic font |

## 15.2 Keyboard navigation

- Qaida: book pager and games are largely operable; `GameShell` supports `Escape`/`P`.
- Portals: native links/buttons/inputs are keyboard-operable; `Sidebar`/`TopBar` use real interactive
  elements.
- **Gap:** several games are pointer-first (tap targets, drag-like flows). Add explicit keyboard play
  paths for full parity.

## 15.3 Screen readers

- Loader and live regions announce state changes.
- **Gap:** verify each game announces round/score/result via live regions consistently; ensure canvas
  tracing communicates purpose and completion to SR users (the keyboard bypass helps).

## 15.4 Touch targets & contrast

- `.qaida-premium-button` enforces **44px min-height** (meets AA target size).
- Design tokens use high-contrast greens/ink; verify all muted text (`--qaida-muted`, `--muted`) meets
  4.5:1 against its background, especially small labels.

## 15.5 Semantic HTML

- Portal pages use tables, forms, headings; verify table headers (`<th scope>`), form `<label>`
  associations, and heading hierarchy per page.
- Qaida uses headings + landmarks within the shell.

## 15.6 WCAG checklist (indicative)

| Guideline | Status | Notes |
|-----------|:------:|-------|
| 1.1.1 Non-text content | 🟢/🟡 | Decorative hidden; verify meaningful images/icons have labels |
| 1.4.3 Contrast | 🟡 | Audit muted text |
| 2.1.1 Keyboard | 🟡 | Add keyboard play for games |
| 2.4.1 Bypass blocks | 🟢 | Skip links present (Qaida) |
| 2.4.7 Focus visible | 🟢 | Ring defined |
| 2.3.3 Animation from interactions | 🟢 | Reduced-motion honored |
| 4.1.2 Name/role/value | 🟡 | Broaden ARIA on custom controls |
| 2.5.5 Target size | 🟢 | 44px buttons |

## 15.7 Recommendations

1. Full keyboard operability for all 7 games + SR announcements of round/score/result.
2. Automated a11y checks (axe) in CI for portals + Qaida.
3. Contrast audit of muted text tokens.
4. Add skip links + landmark roles to operations portals (currently Qaida-focused).
5. Verify form label/`aria-describedby` coverage on multi-step tutor report form.

> Related: [animations.md](./animations.md) · [responsive.md](./responsive.md)
