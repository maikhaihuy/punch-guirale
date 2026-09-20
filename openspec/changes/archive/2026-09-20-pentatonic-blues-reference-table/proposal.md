## Why

The Scale Info Table only shows a Degree column and a real Chords column
for 7-degree families; Pentatonic and Blue get at most a bare Formula/
Notes/Intervals table (plus a 5-entry chord list for the two Pentatonic
base modes). Meanwhile the Scale Wheel's inner ring (W/H arcs plus a
roman-numeral/chord-symbol ring) duplicates information the Degrees row
already carries and crowds the wheel. The user supplied a reference
sheet for the scales guitarists actually play (Major Pentatonic, Minor
Pentatonic, Major Blues, Minor Blues, plus the other three pentatonic
rotations: Egyptian, Man Gong, Ritusen) giving each degree's
roman numeral, degree name, and usable chords — including the slots the
scale skips — so the table can teach how the scale relates to the
underlying 7-degree scale instead of just listing its notes.

## What Changes

- **Remove the Scale Wheel's inner ring**: the W/H arcs + labels and the
  roman-numeral/chord-symbol circles are deleted. The wheel keeps its
  outer note ring (note + chromatic degree label), scale-membership
  dimming, and the center randomize hub. W/H information stays in the
  Degrees row (see next bullet).
- **Use the freed space on the wheel**: the note dots are enlarged, and
  a closed polygon joins the in-scale notes: one vertex on each
  note's circle edge facing the wheel's center, straight edges between
  consecutive vertices (last back to first), so the vertices are joined to
  each other and the scale's shape reads at a glance. It carries no
  labels, never covers a note's text, and never intercepts clicks.
- **Reconcile the Degrees row spec with the already-made code edit**:
  the W/H indicator between degree pills now renders for every family
  (it was 7-degree only); gaps other than 1 or 2 semitones show the
  semitone count (e.g. `3`).
- **Scale Info Table gets reference-driven rows for seven scales**: for
  Major/Minor Pentatonic, Egyptian (Suspended), Man Gong, Ritusen, and
  Major/Minor Blues (matched by interval pattern, so any mode that
  resolves to one of these patterns qualifies — which covers all 10
  modes of the Major and Minor Pentatonic families, since they are
  rotations of the same 5 patterns), the table adds a **Roman** column and
  fills the Degree and Chords columns from the reference sheet,
  transposed to the active root (chords are root-relative, including
  slash chords such as `C/E`).
- **Roman column for 7-degree families too**: the table now has the same
  6 columns (Formula, Notes, Intervals, Roman, Degree, Chords) for every
  family that shows a Degree column; the 7-degree Roman value is the
  quality-cased numeral already shown in the Degrees row (`ii`, `vii°`).
- **Skipped slots are shown, not hidden**: every pentatonic table lists
  7 diatonic slots and the Major/Minor Blues tables 8. The skipped
  slots of Egyptian, Man Gong, and Ritusen sit at the major scale's own
  degree for their position and show `N/A` for roman numeral and chords
  (the sheet gives only a degree name). Slots the active scale does
  not contain render as dimmed rows with a text "Skip" badge and the
  Formula, note, interval, roman numeral, and degree name struck through
  (Chords are not), keeping their chord hints (e.g. `F, Fmaj7` with "avoid F when soloing").
  Blue-note slots carry a "Blue note" badge.
- **BREAKING (data)**: the Blue family's `blues-major` mode changes from
  `1 ♭3 4 5 ♭7` (`0,3,5,7,10` — really Minor Pentatonic) to the true
  Major Blues `1 2 ♭3 3 5 6` (`0,2,3,4,7,9`), matching the reference
  sheet. `/blue/blues-major` now has 6 notes and the fretboard, wheel,
  and degree highlighting change accordingly.
- **Rename to avoid confusion with the real Blue family**: the Major
  Pentatonic family's rotations displayed as "Blues Minor"
  (`0,3,5,8,10`) and "Blues Major" (`0,2,5,7,9`) are not blues scales;
  they are the same patterns the Minor Pentatonic family already shows
  as "Man Gong" and "Ritusen". Their display names change to match; mode
  ids (and so URLs) are unchanged.
- **Superseded data removed**: `MINOR_PENTATONIC_CHORD_SUFFIXES` /
  `MAJOR_PENTATONIC_CHORD_SUFFIXES` (5-entry positional lists) are
  replaced by the reference sheet; `getChordSymbol` and
  `getIllustrativeRomanNumeral` lose their only caller (the wheel's
  inner ring) and are deleted.
- **Sequencing**: this change is stacked on `enrich-scale-wheel`, which
  introduced the inner ring being removed. It is now archived; see
  design.md.

## Capabilities

### New Capabilities
- `scale-degree-reference`: static, root-relative reference data for
  seven scales (Major/Minor Pentatonic, Egyptian, Man Gong, Ritusen,
  Major/Minor Blues) — per-slot roman
  numeral, degree name, blue-note flag, chord specs (incl. slash
  chords), optional hint — keyed by interval pattern, with transposition
  to a root and derived skipped/in-scale status.

### Modified Capabilities
- `scale-info-table`: adds a Roman column for every family with a Degree
  column, reference-driven Degree/Chords for the seven reference scales,
  skipped-slot and blue-note rendering, and replaces the two Pentatonic
  base-mode chord tables' use.
- `scale-dashboard`: removes the wheel's inner ring (W/H arcs and
  roman-numeral/chord-symbol circles) and the stale wheel roman-numeral
  requirements; adds straight connecting lines between in-scale notes;
  the fluid-sizing threshold now governs only the degree label; the
  Degrees row's W/H indicator applies to every family.
- `scale-data-model`: Blue family's Blues Major becomes `0,2,3,4,7,9`.
- `diatonic-chord-vocabulary`: removes the two fixed Pentatonic
  base-mode chord-suffix tables (superseded by `scale-degree-reference`).

## Impact

- Affected code: `src/components/ScaleWheel.tsx` (delete inner ring,
  `INNER_RADIUS`, related imports; degree-label gate renamed; larger
  dots; scale connecting lines),
  `src/components/ScaleInfoTable.tsx` (reference-driven rows/columns,
  skipped/blue-note rendering), `src/components/ScaleDashboard.tsx`
  (refresh the stale gating comment), `src/lib/scales.ts`
  (`BLUE_MAJOR_INTERVALS`, two mode display names), `src/lib/chords.ts` (drop the two
  pentatonic tables), `src/lib/theory.ts` (drop `getChordSymbol`,
  `getIllustrativeRomanNumeral`), new `src/lib/scaleReference.ts`,
  `src/lib/scales.test.ts` (+ new reference tests), `CLAUDE.md`
  (Blue family / test-suite notes are stale).
- Users' bookmarks to `/blue/blues-major` keep working but show a
  different scale.
- No routing, metronome, storage, or fretboard-viewport changes.
