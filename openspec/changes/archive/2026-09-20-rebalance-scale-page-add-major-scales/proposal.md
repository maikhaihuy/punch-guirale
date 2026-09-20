## Why

The scale page's top dashboard is unbalanced: the scale wheel is `w-full`, so
the scale info table always wraps underneath it instead of sitting beside it,
and the Degrees row and the Note/Degree switch are sized by their content
rather than sharing the row sensibly. Separately, the two "major-with-a-flat-6"
scales guitarists reach for — Harmonic Major and Melodic Major — aren't
available (Harmonic Major) or have no teaching reference (Melodic Major exists
only as Melodic Minor's fifth rotation, with no roman numerals or chords
tailored to it).

## What Changes

- Lay the scale wheel and the scale info table out **side by side in one row**
  from the `md` breakpoint up; below `md` they stack (wheel, then table).
- Split the Degrees row and the Note/Degree switch into **one row with an
  8:2 width split**: the Degrees control (its pills spread to fill it) takes the large share and
  the switch takes the small remaining share (stacked below `md`).
- Add a **Harmonic Major** scale family (`1 2 3 4 5 ♭6 7`, interval pattern
  `0, 2, 4, 5, 7, 8, 11`) with its 7 modes.
- Add a **Melodic Major** scale family (`1 2 3 4 5 ♭6 ♭7`, interval pattern
  `0, 2, 4, 5, 7, 8, 10`) with its 7 modes.
- Add hand-authored `scale-degree-reference` rows (roman numeral, degree name,
  chords) for the **Harmonic Major** and **Melodic Major** base patterns, using
  the tables supplied with the request. As reference data is matched by
  interval pattern, Melodic Minor's existing *Mixolydian ♭6* mode (the same
  pattern) also receives the Melodic Major reference.
- Allow reference data to be authored for a 7-degree pattern (today only the
  pentatonic and blues patterns have it; 7-degree families are derived), with
  reference data taking precedence over derivation.

No **BREAKING** changes: existing routes, ids, and reference data are
untouched; Melodic Minor's Mixolydian ♭6 page gains richer table rows.

## Capabilities

### New Capabilities

None. Both scales and the layout changes extend existing capabilities.

### Modified Capabilities

- `scale-dashboard`: the Degrees row and the Note/Degree switch share one row at
  `md`+, 8:2 in favor of Degrees, pills filling their share (stacked below `md`).
- `scale-info-table`: the wheel and table sit side by side in one row at `md`+
  (stacked below); reference data can now apply to a 7-degree scale (Harmonic
  Major, Melodic Major) and takes precedence over derived rows; the list of
  reference scales is updated.
- `scale-degree-reference`: the set of reference patterns grows from seven to
  nine (adds Harmonic Major and Melodic Major), with their rows and chords.
- `scale-data-model`: adds the `harmonic-major` and `melodic-major` families
  (7 modes each) as new data records.

## Impact

- `src/components/ScaleDashboard.tsx` — layout classes for the two rows.
- `src/components/ScaleWheel.tsx` — wrapper width classes so it can share a row
  (currently `w-full max-w-96 shrink-0`).
- `src/components/ScaleInfoTable.tsx` — sits in a `min-w-0` flex/grid cell so
  its existing horizontal scroll still works inside the narrower column.
- `src/lib/scales.ts` — two new `ScaleFamily` records.
- `src/lib/scaleReference.ts` — two new row sets and two new
  `REFERENCE_BY_PATTERN` entries.
- `src/lib/scaleRows.ts` — no logic change expected (reference already wins
  over derivation); a leftover debug `console.log` in `getScaleRows` should be
  removed while touching adjacent code.
- Tests: `scales.test.ts`, `scaleReference.test.ts`, `scaleRows.test.ts`,
  `ScaleInfoTable.test.tsx` — cover the new families, patterns, and rows.
- `CLAUDE.md` architecture notes (families list, "seven interval patterns")
  need a refresh after implementation.
- No new dependencies.
