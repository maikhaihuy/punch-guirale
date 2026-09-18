## Why

The "Degrees" row's triad-selection feature (pick a degree, highlight
its 3-note diatonic triad on the fretboard) only ever worked for
7-degree families, so Pentatonic and Blue got a visibly different,
degraded control — plain "1 C"/"2 D" pills instead of the same `1`,
`♭3`, `4`... formula labels every other part of the app (Fretboard
degree mode, ScaleInfoTable's Formula column) already uses for them.
The same 7-degree-only gap exists on the scale wheel's inner ring.
Rather than extend triad math to families it doesn't apply to (5- or
6-note scales can't stack tertian thirds), this change removes the
triad-selection behavior itself and replaces it with the simpler,
already-family-agnostic single-note highlight the app already has
wired up — then makes the degree *label* shown everywhere consistent
across every family.

## What Changes

- **BREAKING**: Remove the "select a degree → highlight its 3-note
  diatonic triad" interaction entirely. Selecting a degree now
  highlights only that single note (its own degree, wherever it
  recurs on the fretboard), for every family — the same behavior
  Pentatonic/Blue already had, now the only behavior.
- Unify the Degrees row's pill content across every family: every pill
  shows the scale-formula degree label (`1`, `♭2`, `2`, `♭3`, `3`,
  `4`, `♭5`, `5`, `♭6`, `6`, `♭7`, `7`) plus its note name, dropping
  the old "index + note name" fallback (`1 C`, `2 D`) Pentatonic and
  Blue showed instead of a formula label. 7-degree families keep
  showing the roman numeral beneath, unchanged — only the
  per-degree chord-symbol summary is dropped from the pill (it
  described the triad being selected, which no longer applies).
- Unify the scale wheel's inner ring the same way: every in-scale
  pitch class shows its degree-formula label, for every family, not
  only 7-degree ones. 7-degree families keep showing the roman
  numeral there too, unchanged.
- The whole/half-step (`W`/`H`) indicator between Degrees-row pills
  stays 7-degree-only (unchanged) — pentatonic/blue gaps aren't binary
  W/H and modeling that is out of scope here.

## Capabilities

### New Capabilities
- `degree-highlighting`: single-note fretboard highlighting driven by
  the Degrees row's selection, for any family/degree count — replaces
  `diatonic-triad-highlighting`.

### Modified Capabilities
- `scale-dashboard`: the "Degrees row shows scale degrees with their
  notes" requirement drops its 7-degree/non-7-degree branching for the
  base pill content (formula label + note name, now identical for
  every family) while keeping the roman numeral 7-degree-only, and now
  points at `degree-highlighting` instead of the removed triad
  capability. The "Wheel shows degree and triad info for 7-degree
  families" requirement is replaced by a family-agnostic requirement
  that extends the degree label to every family while keeping the
  roman numeral 7-degree-only (see Impact).

### Removed Capabilities
- `diatonic-triad-highlighting`: the triad-selection/triad-ring
  feature is removed outright, not deprecated in place — see What
  Changes.

## Impact

- `src/components/ScaleDashboard.tsx`: Degrees row pill content
  unified to formula label + note name for every family, plus roman
  numeral for 7-degree families only; chord-symbol sub-line removed.
- `src/components/ScaleWheel.tsx`: inner-ring degree label rendered
  for every family (drops the `showInnerRing`/7-degree gate); roman
  numeral kept, still 7-degree-only.
- `src/components/ScalePage.tsx`: drops the `triadDegreeLabels`
  computation and the `family.degreeCount !== 7` gate around it;
  `selectedTriadDegree`/`onSelectedTriadDegreeChange` are renamed to
  reflect that they no longer select a triad (e.g.
  `selectedDegreeIndex`).
- `src/components/Fretboard.tsx`: drops the `triadDegreeLabels` prop
  and the triad-ring rendering branch; the single "selected degree"
  ring becomes the only highlight ring.
- `src/lib/theory.ts`: removes only `getTriadDegreeLabels` (dead code
  once its only caller, `ScalePage`'s triad-ring computation, is
  removed). `getRomanNumeral`, `ROMAN_NUMERALS`, the
  `romanNumeral`/`quality` fields on `DiatonicDegree`, and
  `getTriadQuality` all stay — still used by the Degrees row/scale
  wheel (roman numeral) and `ScaleInfoTable`'s Chords column
  (quality).
- `src/app/globals.css`: removes the now-unused `.fret-note--triad`
  rule.
- `openspec/specs/diatonic-triad-highlighting/spec.md`,
  `scale-dashboard/spec.md`: updated via delta specs in this change.
  `openspec/specs/degree-highlighting/spec.md`: created via this
  change.
