## Context

Today, `ScalePage` (src/components/ScalePage.tsx) renders: a `<header>`
holding only `ThemeToggle`; a `SettingsPanel` (a `@base-ui/react`
`Drawer`, edge-anchored) wrapping the entire `KeyModeBar` — root, family,
mode, variant, position, note/degree switch, and triad-highlight switch;
a `<main>` stacking `Fretboard` and `PracticeHistory`; and a sticky
`<footer>` with `PracticeControls`. `Fretboard` already owns a
`zoomFretWidth`/`scrollLeft`-based fit-to-position effect, gated by an
`autoFitMobile` prop, that only runs on mobile viewports (see
proposal.md and `specs/scale-positions/spec.md`'s removed "Mobile fit"
requirement). `theory.ts#buildFretboard` generates frets `0..maxFret`
(`maxFret = 24`) and `positions.ts#POSITION_SPANS` expresses each
CAGED position as an absolute `{lo, hi}` fret range starting at 0.

This design covers restructuring that surface into Navigation / Header /
Fretboard-body, per proposal.md, and generalizing the existing
zoom/scroll mechanism into the fretboard's own pill/minimap/zoom/touch
viewport.

## Goals / Non-Goals

**Goals:**
- Land `scale-navigation`, `scale-header`, and `fretboard-viewport` as
  described in their spec deltas, reusing existing primitives
  (`@base-ui/react` `Drawer`, the existing `zoomFretWidth`/`scrollLeft`
  mechanism) rather than adding new dependencies.
- Resolve the fret-0 drop without touching scale/interval math.
- Leave a clear seam (right side of nav/header) for the future
  chord-at-degree / W–H info panel, without building it now.

**Non-Goals:**
- Building the chord-at-degree / W–H info panel itself (Open Questions
  in proposal.md).
- Determining final CAGED position-to-fret-range values per family
  beyond Major (Open Questions in proposal.md).
- Any backend/data-model change (none needed — this is presentation-only
  on top of the existing M4 schema).

## Decisions

### 1. Fret 0 is dropped at the render/viewport layer, not the math layer
`buildFretboard` keeps generating frets `0..24` internally (MIDI =
`openMidi + fret`, `tagPositions`/`POSITION_SPANS` keep 0-based `lo`
values) — reworking that math to be 1-based touches every semitone
calculation and the hand-verified `POSITION_SHAPES` data for no
behavioral gain. Instead, the fretboard-viewport render layer (grid,
minimap, position pills, default `1–12` range) filters out fret index 0
before rendering and before computing visible-range math. Position 1's
effective span becomes `1–3` (its fret-0 note simply never renders, same
as it wouldn't for any other position's boundary note). Alternative
considered: renumber all internal fret indices to start at 1 — rejected,
larger blast radius for a purely cosmetic requirement (spec explicitly
frames it as "fret 0 is dropped," not "renumber the guitar").

### 2. Position-pill viewport control extends the existing fit mechanism
`Fretboard`'s current `zoomFretWidth`/`scrollLeft` state and its
`useEffect` keyed on `[selectedPosition, autoFitMobile]` already does
"fit the visible range to a position's span." `fretboard-viewport`'s
position-pill requirement generalizes this by dropping the
`autoFitMobile` gate (it now runs on every viewport) and moving position
selection itself from `KeyModeBar`/`SettingsPanel` into pills rendered
directly by `Fretboard`. The minimap and corner zoom buttons become
additional writers of the same `zoomFretWidth`/`scrollLeft` state,
guarded by the existing "don't fight manual adjustment" rule (already
implemented as a dependency-array-gated effect) extended to cover
minimap/zoom-button interaction, not just position selection.

### 3. Touch pan/zoom via native Pointer Events, no new dependency
No gesture library is in `package.json` (Tone.js is the only non-UI
runtime dependency, added specifically for `Transport`/`Loop` timing).
Pinch-to-zoom and drag-to-pan are implemented with the native Pointer
Events API (`pointerdown`/`pointermove`/`pointerup`, tracking two active
pointers for pinch distance) directly on the fretboard's scroll
container, consistent with the "add a dependency only when necessary"
posture elsewhere in this codebase.

### 4. Nav tree and mobile sheet reuse `@base-ui/react`
The desktop sidebar is a plain persistent `<aside>` (no library needed —
it's always mounted, not a popover). The mobile nav sheet reuses
`@base-ui/react`'s `Drawer` (already a dependency, already used for
`SettingsPanel`) with `swipeDirection="down"`, giving swipe-to-dismiss
and Escape/backdrop handling for free, consistent with
`layout-and-settings-panel`'s existing pattern. `role="tree"`/
`role="treeitem"` semantics and arrow-key roving `tabIndex` are
hand-rolled (small surface: family list + nested mode list), since
`@base-ui/react` has no tree primitive.

### 5. This change removes `SettingsPanel` and its drawer entirely
After root/family/mode/variant/position move to `scale-navigation` /
`fretboard-viewport`, and note/degree + triad-highlight move to
`scale-header`, nothing remains that needs a floating drawer —
`SettingsPanel.tsx` and its toggle affordance are deleted. This
resolves proposal.md's Impact note in favor of "merge" per the
milestone doc's own recommendation: rather than merging the settings
drawer's content into the new sidebar, the drawer's content is fully
absorbed by Navigation + Header + Fretboard body, so no drawer survives
at all.

### 6. Sequencing with `layout-and-settings-panel`
That change's code (Header/Body/Footer shell, `SettingsPanel` drawer
wrapping `KeyModeBar`) is already merged to `main`, but its own spec
delta (adding `settings-panel`, modifying `layout-controls`) is not yet
archived into `openspec/specs/`. This change's `layout-controls` delta
was written against the *current* main spec (pre-archive state) so it
validates today; it also fully supersedes `layout-and-settings-panel`'s
direction for family/mode/position. **Recommended sequencing**: archive
this change without first archiving `layout-and-settings-panel` (skip
or close that change instead, since none of its `settings-panel`
capability survives this one) — archiving both independently would
leave `openspec/specs/layout-controls/spec.md` with a
"Single centered column layout" requirement removed twice, or a
`settings-panel` capability added by one and never removed by the
other. This is a housekeeping decision for whoever runs `/opsx:archive`
on each change, not an implementation task.

## Risks / Trade-offs

- [Dropping `autoFitMobile`'s mobile-only gate changes desktop behavior
  too — selecting a position pill now moves the desktop viewport, which
  it didn't before] → Intentional per spec; call out in tasks.md
  verification so it's manually checked on desktop, not just assumed.
- [Hand-rolled pointer-event pinch/pan is more code than a gesture
  library] → Bounded surface (one component, one container element);
  revisit with a library only if bugs accumulate.
- [`POSITION_SPANS`/`POSITION_SHAPES` were hand-verified against a real
  fretboard for the 0-based frets; filtering fret 0 at render time
  changes what's visually reachable at position 1's low boundary] →
  Re-spot-check position 1 on a real fretboard after the fret-0 filter
  lands (tasks.md verification step).
- [Deleting `SettingsPanel` removes the only current example of the
  `Drawer` pattern except the new mobile nav sheet] → Acceptable; the
  nav sheet becomes the new reference implementation.

## Migration Plan

1. Land `fretboard-viewport` changes inside `Fretboard.tsx` first
   (position pills, minimap, zoom buttons, touch gestures, fret-0
   filter) — independently testable against the existing
   `selectedPosition`/`positionRanges` props, before touching navigation
   or header.
2. Extract `scale-header` (primary/secondary rows) from `KeyModeBar`
   into a new header component; wire it into `ScalePage`'s `<header>`.
3. Build `scale-navigation` (sidebar + mobile sheet) and wire family/
   mode selection to it, removing those controls from `KeyModeBar`.
4. Delete `SettingsPanel.tsx` and the now-empty `KeyModeBar.tsx` once
   nothing references them.
5. Decide and execute the `layout-and-settings-panel` housekeeping call
   from Decision 6 before running `/opsx:archive` on this change.

No data migration — all state is client-local (`localStorage` practice
sessions are untouched by this change) and no persisted state shape
changes.

## Open Questions

- Exact CAGED position-to-fret-range mapping per scale family beyond
  Major (proposal.md Open Questions) — doesn't block implementing the
  viewport mechanism itself, which is family-agnostic.
- Final visual form of the W–H interval pattern (image vs. text) —
  affects `scale-header`'s secondary-row sizing but not its structure;
  can be settled when that row is actually built.
