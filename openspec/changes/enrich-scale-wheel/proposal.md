## Why

`add-circular-scale-wheel` (implemented, not yet archived) replaced the flat
root pill row with a 12-wedge circular wheel, but it's still limited in ways
that leave information scattered outside the wheel: the inner degree/roman-
numeral ring only renders for `family.degreeCount === 7` and only for
in-scale wedges, so Pentatonic gets no degree context on the wheel at all;
whole/half-step info exists (`getWholeHalfPattern` in `theory.ts`) but isn't
shown anywhere near the wheel; there's no chord-symbol display, only roman
numerals; randomize is a sibling button next to the wheel rather than part
of it; and the wheel's rendered size is pinned to two fixed Tailwind
breakpoints (`w-[240px] sm:w-[260px]`) instead of scaling continuously like
`Fretboard.tsx` already does via its `ResizeObserver`-driven `fretWidth`.
`Fretboard.tsx`'s own scaling has a gap too, surfaced when reconciling this
with feedback on a prototype demo: `fretWidth` has no floor, so it shrinks
without limit on a narrow container showing many frets, well past a
tappable size.

## What Changes

- **Universal chromatic degree ring**: every one of the 12 wedges gets a
  degree label (e.g. `1`, `b3`, `5`), not just in-scale wedges in 7-degree
  families. This reuses the existing family-agnostic
  `DEGREE_LABELS_BY_SEMITONE` table in `theory.ts` (currently private,
  used internally by `getDiatonicDegrees`/`buildFretboard`) — exported as a
  new `getChromaticDegreeLabel(offset)` — rather than adding new theory.
- **Whole/half-step arcs** between consecutive in-scale wedges, labeled
  `H`/`W`, using `getWholeHalfPattern`. That function's gap check
  (`gap === 1 ? "H" : "W"`) mislabels a 3-semitone jump (e.g. Pentatonic's
  root→b3) as `"W"`; this change fixes the labeling for gaps ≥ 3 instead of
  relaxing the existing `degreeCount === 7` caller-side gate silently.
- **Chord-symbol ring**: add `getChordSymbol(noteName, quality)` to
  `theory.ts` and render it on the wheel alongside the existing roman
  numeral, for `degreeCount === 7` families only (same existing gate as
  today's inner ring — chord symbols for Pentatonic are explicitly out of
  scope here, see Open Questions in design.md).
- **Randomize moves into the wheel's center hub**: the existing sibling
  randomize button (wired to `randomRoot()`) is removed from
  `ScaleDashboard.tsx` and becomes a clickable hotspot at the wheel's
  center instead.
- **Fluid wheel sizing, with a floor**: replace the two fixed width
  breakpoints with a continuously fluid width (min/max clamp). No
  `ResizeObserver` needed — unlike `Fretboard.tsx`, the wheel is a
  self-contained `viewBox` SVG whose internal geometry already scales
  proportionally with rendered size; only the outer width constraint needs
  loosening. Below a minimum rendered size, the wheel hides its degree,
  whole/half-step, and roman-numeral/chord-symbol rings — reverting to
  `add-circular-scale-wheel`'s original note-ring-only display — instead
  of shrinking that content past legibility.
- **Fretboard minimum cell width**: `Fretboard.tsx`'s `fretWidth` (today
  unbounded — `(containerWidth - STRING_LABEL_WIDTH) / displayFretCount`)
  gets a floor of ~32–40px, matching the wheel's own floor behavior above.
  Once cells would shrink below that floor, the fretboard relies on its
  existing `fretboard-viewport` scroll/zoom/minimap controls to reach more
  frets, instead of shrinking cells past a tappable size.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `scale-dashboard`: extends the wheel requirements added by
  `add-circular-scale-wheel` — degree labels become universal (not gated
  to 7-degree families), adds whole/half-step and chord-symbol display,
  moves randomize onto the wheel itself, and adds a minimum-size floor
  below which the wheel's enrichment rings hide instead of shrinking. The
  wheel stays an always-inline dashboard control, per the reference demo
  (`scale_wheel_concentric_rings.html`) — an earlier draft of this
  proposal explored moving it behind a compact indicator + modal, reverted
  after review of that demo.
- `fretboard-viewport`: adds a minimum fret cell width, below which the
  fretboard relies on its existing zoom/pan/minimap controls instead of
  continuing to shrink cells.

## Impact

- Affected code: `src/components/ScaleWheel.tsx` (new rings, center hub,
  fluid sizing with a floor), `src/lib/theory.ts` (export
  `getChromaticDegreeLabel`, extend `getWholeHalfPattern`'s gap handling,
  add `getChordSymbol`), `src/components/ScaleDashboard.tsx` (remove the
  now-redundant standalone randomize button and its layout slot),
  `src/components/Fretboard.tsx` (add a minimum-width floor to the
  `fretWidth` calculation).
- No changes to `scales.ts`, routing, or the Degrees `PillGroup`/triad-ring
  selection on the fretboard (unchanged non-goal, carried over from
  `add-circular-scale-wheel`).
