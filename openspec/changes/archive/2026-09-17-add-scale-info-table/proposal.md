## Why

The dashboard's key row (`ScaleWheel` + randomize button) leaves a large
block of empty horizontal space beside the wheel on any viewport wider
than the wheel itself — the row's container is `max-w-5xl` but the
wheel is a fixed ~260px SVG. That space is a natural home for a
reference table of the active scale's degrees: formula, note, interval
name, scale-degree function name (Tonic, Supertonic...), and the
concrete chords built on each degree (e.g. `C`, `C6`, `Cmaj7`) — a
richer, more scannable companion to the wheel than empty space.

## What Changes

- Add a table-like info panel to the right of `ScaleWheel` in the
  dashboard's key row, with one row per scale degree and columns:
  Formula, Notes, Intervals, Degree (function name), Chords.
- **Formula**: existing `degreeLabel` (e.g. `1`, `♭3`).
- **Notes**: existing `noteName` for the current root.
- **Intervals**: interval quality name for the degree's semitone
  offset from root (e.g. `Major third`, `Perfect fifth`) — new static,
  semitone-indexed data, same pattern as `theory.ts`'s existing
  `DEGREE_LABELS_BY_SEMITONE`.
- **Degree**: the scale-degree function name for the degree's position
  (Tonic, Supertonic, Mediant, Subdominant, Dominant, Submediant,
  Leading Tone) — new static, position-indexed data.
- **Chords**: concrete chord names for the degree — the current root
  note concatenated with each chord suffix for that degree's triad
  quality (e.g. root `C`, minor quality → `Cm`, `Cm6`, `Cm7`, `Cm9`),
  not just the abstract quality symbols the Degrees row already shows.
- Panel only renders for `degreeCount === 7` families (function names
  and interval-quality-per-degree assume a diatonic 7-degree scale,
  same gating convention used throughout `theory.ts`'s callers) — no
  change for Pentatonic families.
- `diatonic-chord-vocabulary`'s existing quality→symbol table gets a
  concrete-name helper (root note + suffix) so this panel and the
  existing Degrees-row abstract labels share one source of chord data.

## Capabilities

### New Capabilities
- `scale-info-table`: a per-degree reference table (formula, note,
  interval name, degree function name, chords) rendered beside
  `ScaleWheel` for 7-degree families, plus the static interval-name
  and degree-function-name data it reads from.

### Modified Capabilities
- `diatonic-chord-vocabulary`: adds a concrete-chord-name helper
  (root note + chord suffix, e.g. `C` + `m7` → `Cm7`) alongside the
  existing quality→symbol lookup, so both the Degrees row's abstract
  labels and this new table's concrete chord names are derived from
  one table.

## Impact

- `src/components/ScaleDashboard.tsx`: render the new table next to
  `ScaleWheel` in the key row.
- New `src/components/ScaleInfoTable.tsx` (or similar) for the table
  itself.
- `src/lib/theory.ts` or a new small data module: static
  semitone-indexed interval-name table and position-indexed
  degree-function-name table.
- `src/lib/chords.ts`: add `getConcreteChordNames(noteName, quality)`
  (or equivalent) built on the existing `CHORD_VOCABULARY` table.
- No route, persistence, or audio changes.
