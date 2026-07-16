# 16. Responsive Architecture

The platform targets **mobile, tablet and desktop** across two design systems: the operations portals
(`globals.css`) and the Noorani Qaida engine (`qaida.css` + Tailwind + motion budget).

## 16.1 Breakpoints

### Operations portals (`globals.css`)
Custom media queries at **1200 / 1024 / 900 / 768 / 480px**:

| Breakpoint | Behaviour |
|-----------|-----------|
| ≥1200px | Full sidebar (272px) + wide content grids |
| 1024px | Grid columns reduce |
| 900px | Further grid stacking |
| 768px | **Sidebar collapses** to overlay + hamburger; tables become scrollable/stacked |
| 480px | Single-column cards, compact spacing |

Layout tokens: `--sidebar-w: 272px`, `--topbar-h: 64px`.

### Qaida engine
Uses **Tailwind breakpoints** (`min-[480px]`, `sm`, `md`, `lg`, `xl`) plus a `max-width: 767px` block in
`qaida.css` (dashboard grid → 1 column, smaller panel radius). The **motion budget** also keys off
viewport width (see [animations.md](./animations.md)).

## 16.2 Layout strategy

| Technique | Where |
|-----------|-------|
| **CSS Grid** | Stat cards, dashboards, `.qaida-dashboard-grid` (12-col → 1-col) |
| **Flexbox** | Sidebar, TopBar, HUD, button rows, game HUDs |
| **Fixed + transform sidebar** | Portal sidebar slides in on mobile with overlay |
| **Container max-widths** | `.qaida-dashboard` capped at 1180px; content shells centered |
| **RTL** | Qaida book/letters use `dir="rtl"`; `PageTurnViewer` inverts arrow keys |

## 16.3 Sidebar / navigation responsiveness

- **Desktop:** persistent sidebar; content offset by `--sidebar-w`.
- **Mobile/tablet (≤768px):** sidebar becomes an overlay drawer toggled by the `TopBar` hamburger
  (`.sidebar` / `.sidebar-overlay` classes).
- **Qaida:** desktop uses `QaidaSidebar`; mobile uses a menu button in `QaidaHUD` opening a mobile
  sidebar; `QaidaSidebar` supports a collapsed (icon-only, 64px) mode.

## 16.4 Overflow & scrolling

- Data tables use scroll shells (`.table-shell` / `.data-table`) to avoid layout breakage on narrow
  screens.
- `.qaida-scroll` provides thin styled scrollbars in the LMS.
- Embedded dashboards use `h-full overflow-y-auto` inside the Qaida shell.

## 16.5 Touch & pointer

- Buttons/links set `-webkit-tap-highlight-color: transparent` and 44px min targets in Qaida.
- `PageTurnViewer` supports ≥48px swipe gestures.
- Games use `setPointerCapture` for reliable touch/mouse drawing (tracing) and tapping.

## 16.6 Fullscreen, landscape & portrait

- `FullscreenButton` (Fullscreen API) lets learners enter fullscreen on the book/lesson for immersive
  study; hidden on unsupported devices.
- Qaida layouts use `h-[100dvh]/min-h-[100svh]` for correct mobile viewport height (handles browser
  chrome in portrait/landscape).
- Motion budget scales celebration/ambient particles down on smaller/landscape phones.

## 16.7 Recommendations

1. Consolidate portal breakpoints toward Tailwind for consistency with the Qaida engine.
2. Add explicit landscape tuning for game stages on short-height phones.
3. Test 320px width (small Android) for table overflow + button wrapping.
4. Verify the multi-step tutor report form on mobile (dense matrix UI).

> Related: [accessibility.md](./accessibility.md) · [animations.md](./animations.md)
