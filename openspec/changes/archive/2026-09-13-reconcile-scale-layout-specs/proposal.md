## Why

`nav-header-fretboard-restructure` was implemented and its specs
archived, but the layout kept evolving conversationally right after
that archive: CAGED position selection was dropped entirely, the
sidebar/bottom-sheet navigation was unified into a single hover/click
dropdown trigger in a new 3-column header, `ScaleHeader` was trimmed
and renamed `ScaleDashboard`, and the footer became a fixed, full-width
bar. `openspec/specs/` still describes the pre-this-round shape
(position pills, sidebar/bottom sheet, the old header's primary/
secondary rows). This change reconciles specs with what's actually
running.

## What Changes

- **BREAKING**: Remove CAGED position selection entirely — no more
  position pills, position-based dimming, background bands, or the
  mobile-defaults-to-Position-1 behavior. `fretboard-viewport` loses its
  position-pill requirement; `scale-positions` loses both of its
  remaining requirements (nothing is left in this capability).
- Replace the sidebar (desktop) / bottom-sheet (mobile) navigation with
  a single always-visible trigger (`Family / Mode`) that opens the same
  two-level tree in a dropdown panel on hover (desktop) or tap (mobile),
  closing on outside click, Escape, or selection.
- Rename the `ScaleHeader` capability to `ScaleDashboard`, trimmed to:
  the key row (root selection, unchanged), a "Degrees" row (was
  "Triad" — same triad-highlighting behavior, pills now read `1 C`,
  `2 D`, ... instead of roman numerals), and the Note/Degree toggle.
  Removed: the "Degree X — Note" + note-list row, the W–H interval
  pattern, and the mobile `⋯` secondary-row collapse (nothing left big
  enough to need collapsing).
- Restructure the page shell: a 3-column Header (theme toggle left, a
  temporary placeholder center, the nav dropdown trigger right) is now
  identical in structure on desktop and mobile; Body stacks 3 sections
  (dashboard, fretboard, practice history); Footer is fixed to the
  viewport bottom at full width (previously width-capped and only
  sticky on mobile).

## Capabilities

### New Capabilities
- `scale-dashboard`: the key row, the degree+note "Degrees" pills
  (triad highlighting, relabeled), and the Note/Degree toggle — replaces
  `scale-header`.

### Modified Capabilities
- `fretboard-viewport`: removes the "Position pills control the visible
  fret range" requirement. Minimap, corner zoom, touch gestures, and
  default range are unchanged.
- `scale-positions`: removes both remaining requirements ("Position
  selection", "Position visual treatment") — the capability has nothing
  left once CAGED positions are gone.
- `scale-header`: removes all requirements — fully superseded by
  `scale-dashboard`.
- `layout-controls`: replaces the four-area (Navigation/Header/Body/
  Footer) requirement with a three-area one matching the actual
  3-column header + 3-section body + fixed full-width footer, unified
  across desktop and mobile.
- `scale-navigation`: removes the desktop-sidebar and mobile-bottom-
  sheet requirements, adds a "unified dropdown navigation trigger"
  requirement, and updates the keyboard requirement's Escape scenario
  from "closes the mobile bottom sheet" to "closes the dropdown panel"
  (no longer mobile-specific).

## Impact

- `src/components/ScaleNav.tsx`: rewritten from aside+Drawer to a single
  hover/click dropdown (own component state, outside-click/Escape
  handling), reusing the same tree-rendering logic.
- `src/components/ScaleHeader.tsx` → `src/components/ScaleDashboard.tsx`:
  renamed and trimmed.
- `src/components/Fretboard.tsx`: `root`/`showPositions` props and all
  position-pill/dimming/band logic removed; minimap, zoom, and pinch/pan
  kept.
- `src/components/ScalePage.tsx`: new 3-column header, 3-section body,
  fixed full-width footer.
- `src/lib/positions.ts` and `theory.ts`'s `getPositionRanges`/
  `tagPositions` are now unreferenced by any component — left in place
  (harmless unused exports) rather than deleted, pending a decision on
  whether to remove them outright.
- `openspec/specs/scale-positions/` and `openspec/specs/scale-header/`
  are expected to end up with zero requirements after this change's
  deltas apply — flagged in tasks.md for manual removal of those spec
  folders (and their stale `## Purpose` text) since delta ops work at
  the requirement level, not the capability level.
