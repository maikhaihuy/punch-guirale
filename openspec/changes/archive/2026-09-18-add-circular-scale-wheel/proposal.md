## Why

The dashboard's key row currently shows the 12 chromatic pitch classes as a
flat pill row, with no indication of which of those 12 notes belong to the
scale/mode currently selected — that information only exists separately, in
the Degrees row below, keyed by scale degree rather than by pitch class. A
circular layout can merge both facts into one view: which note is root, and
which of the 12 pitch classes are actually in the current scale, seen at a
glance and updated live as the user picks a new root.

## What Changes

- Replace the key row's flat 12-note pill list with a circular "scale wheel":
  12 slices arranged around a circle, one per chromatic pitch class, always
  showing all 12 (never conditionally hidden).
- Selecting a pitch class on the wheel sets it as the root, same behavior as
  today's key row (including keeping the existing randomize control working
  alongside it) — this is a presentation change, not a behavior change, for
  root selection itself.
- Add a new visual behavior: notes that are members of the current
  scale/mode render at full visibility; notes that are not render dimmed
  (reduced opacity), but stay visible and remain clickable — clicking a
  dimmed note still re-roots the scale on it. The root note itself is
  visually distinguished from other in-scale notes.
- Add a second, inner ring, display-only (not interactive in this change),
  showing each in-scale note's scale degree label (e.g. `b3`) and, for
  7-degree families only, its diatonic triad roman numeral (e.g. `ii`,
  `vii°`) — surfacing what the Degrees row's pill labels already contain,
  spatially aligned to the corresponding outer-ring note.
- **BREAKING (UI only)**: the key row's pill-list markup/structure is
  removed in favor of the wheel; no props or external behavior change.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `scale-dashboard`: the "Key row hosts root note selection" requirement
  changes from a flat pill list to a circular wheel, and gains new
  scale-membership dimming behavior and a display-only inner ring showing
  degree/roman-numeral info. The "Degrees row" requirement is unchanged —
  triad-degree selection stays exactly as-is (a separate control below the
  wheel); moving that interaction onto the fretboard itself is a distinct,
  future change and out of scope here.

## Impact

- Affected code: `src/components/ScaleDashboard.tsx` (replaces the root
  PillGroup with the new wheel component; keeps the Degrees PillGroup and
  randomize button as-is), a new presentational component for the wheel
  (likely SVG-based), `src/components/ui/pill-group.tsx` (styling reference
  only, not modified).
- No changes to `src/lib/theory.ts` or `src/lib/scales.ts` — `CHROMATIC`,
  `getScaleNoteNames`, `getDiatonicDegrees`, and `randomRoot` already
  provide everything the wheel needs.
- No changes to `Fretboard.tsx`, `ScalePage.tsx`'s triad-degree wiring, or
  the `diatonic-triad-highlighting` capability.
