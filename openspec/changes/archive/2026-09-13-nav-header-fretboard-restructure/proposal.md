## Why

M4 shipped the generic Family/Mode/Variant scale schema, but the UI hasn't
caught up: family/mode/position selection, page-local display state, and
fretboard viewport (fret range) are all mixed together in `KeyModeBar`,
currently surfaced through a single floating settings drawer (from the
in-flight `layout-and-settings-panel` change). As more per-page state
lands (chord-at-degree, W–H pattern) and the fretboard needs its own
pan/zoom controls, this flat structure won't scale — especially on
mobile, where a single drawer has to hold navigation, display toggles,
and viewport controls at once. This change splits the UI into three
concerns with distinct state ownership: **Navigation** (route params:
family + mode), **Header** (page-local display state), and **Fretboard
body** (viewport position/zoom, owned by the fretboard component itself).

## What Changes

- Replace the family/mode portion of the settings drawer with a
  persistent nav tree: a left sidebar on desktop (level 1 = families,
  level 2 = nested modes/variants for the active family) and a
  bottom sheet on mobile, opened from a compact top-left label button.
  Selecting a family resets mode to that family's first mode; selecting
  a mode within the current family updates the route without touching
  family. Tree/menu items get keyboard navigation (arrow keys, Enter,
  Escape).
- Introduce a page header with a key row (root note selection, moved
  as-is from `KeyModeBar`'s existing "Key" section) plus two more rows:
  a primary row (always visible)
  showing current degree + note and the full scale note list, updating
  live on fretboard note-click; and a secondary row (triad-highlight
  toggle, note/degree toggle, W–H interval pattern) that's inline on
  desktop and collapsible behind a `⋯` toggle on mobile.
- Move fret position/zoom out of the header/settings entirely and into
  the fretboard component itself: position pills (`Pos 1`–`Pos 5`)
  anchored to the fretboard's top edge, a draggable range minimap below
  the main fretboard for free scrolling across all frets, and `−`/`+`
  zoom controls anchored to the fretboard's bottom-right corner.
  Pinch-to-zoom and horizontal drag/swipe on the fretboard become the
  primary mobile pan/zoom gestures; the minimap and corner buttons
  remain as the desktop/precise fallback.
- **BREAKING**: fret numbering starts at 1 instead of 0 — fret 0 (open
  string) is dropped from the fretboard grid, minimap, and position/fret
  mapping, changing the grid from 25 frets (0–24) to 24 frets (1–24).
  Default visible range on load remains frets 1–12.
- Reserve the header's/sidebar's opposite side (right on desktop,
  top-right on mobile) for a future chord-at-degree / W–H info panel;
  not built in this change, just laid out for.

## Capabilities

### New Capabilities
- `scale-navigation`: the family/mode nav tree (desktop sidebar, mobile
  bottom sheet), its route-changing selection behavior, and its
  keyboard/accessibility semantics.
- `scale-header`: the page-local (non-route-changing) header showing
  current degree/note, the scale's note list, and the triad/note-degree/
  W–H display toggles, including the mobile collapsed/expanded secondary
  row behavior.
- `fretboard-viewport`: the fretboard's own position pills, range
  minimap, and zoom controls, plus pinch/pan touch gestures, that
  together determine the visible fret window independent of page-level
  state.

### Modified Capabilities
- `layout-controls`: the Header/Body/Footer areas are redefined — Header
  now hosts the two-row `scale-header` content instead of only
  `ThemeToggle`, and family/mode/position selection moves out of any
  settings drawer/panel into `scale-navigation` and `fretboard-viewport`.
  This supersedes the settings-drawer direction from the (still
  unarchived) `layout-and-settings-panel` change for family/mode/position
  specifically; the note/degree and triad-highlight switches keep their
  existing switch-based rendering, just relocated into `scale-header`.
- `scale-fretboard`: the "Fretboard rendering" requirement's fret range
  changes from 6-string/25-fret (0–24) to 6-string/24-fret (1–24); fret 0
  is no longer rendered.
- `scale-positions`: removes the mobile-only "auto-fit on position
  select" requirement, superseded by `fretboard-viewport`'s
  position-pill viewport jump, which now applies on any viewport size,
  not just mobile. Selection behavior itself (dimming, root prominence,
  background band) is unchanged.

## Impact

- `src/components/KeyModeBar.tsx`: family/mode/position controls are
  extracted out; only the display-mode/triad-highlight switches and W–H
  pattern remain, relocating into a new header component.
- `src/app/page.tsx` (or wherever the current Header/Body/Footer shell
  lives after `layout-and-settings-panel` lands): Header area gets real
  content; sidebar/bottom-sheet nav becomes a new persistent layout
  region alongside Body.
- `src/lib/theory.ts` (`buildFretboard`) and `src/lib/positions.ts`
  (`POSITION_SPANS`): fret range and position-to-fret mapping shift from
  0-indexed to 1-indexed, dropping fret 0.
- New components: a nav tree/bottom-sheet component, a header component,
  and fretboard-anchored position-pill/minimap/zoom controls.
- Depends on the in-flight `layout-and-settings-panel` change for the
  Header/Body/Footer shell and `SettingsPanel` drawer this change
  reworks; recommend archiving that change first (or reconciling in
  `design.md`) before implementing this one.
