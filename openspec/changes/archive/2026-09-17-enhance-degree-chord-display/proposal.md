## Why

The dashboard's Degrees row currently labels each pill with the degree
number and its absolute note name (e.g. `1 C`), which tells a learner
*what note* a degree is but not its harmonic function — the standard
degree formula (`1`, `♭2`, `2`, `♭3`...), the interval it sits at from
the previous degree (whole vs. half step), or which chords are
typically built on it. `theory.ts` already computes `degreeLabel` and
`romanNumeral` per degree (`getDiatonicDegrees`) and a whole/half-step
pattern (`getWholeHalfPattern`), but the dashboard doesn't render them.
Surfacing this turns the Degrees row from a note picker into a compact
harmony reference the learner can read at a glance while practicing.

## What Changes

- Degree pills show the scale-degree formula label (`1`, `♭2`, `2`...)
  as the primary label instead of the note name, with the degree's
  roman numeral (already computed, quality-cased) directly beneath it.
- A whole/half-step (`W`/`H`) indicator renders between each pair of
  adjacent degree pills, reflecting the interval to the next degree.
- Each degree pill additionally shows the common chord symbols built
  on that degree's triad quality (e.g. major → `maj`, `maj7`; minor →
  `m`, `m7`), directly beneath the roman numeral.
- Chord symbols come from a new static lookup table keyed by triad
  quality (major/minor/diminished/augmented) — not computed from
  per-mode 7th-interval arithmetic — so the displayed set is fixed,
  predictable reference data.
- Degrees row still renders for every family (it also drives
  single-note highlighting on non-7-degree families, e.g. Pentatonic)
  and still defaults to "None"; the richer label/roman-numeral/chord/
  W-H content is scoped to `degreeCount === 7` families, which keep
  doubling as the triad-highlight control. Non-7-degree families keep
  today's plain `1 C`-style pills, unchanged.

## Capabilities

### New Capabilities
- `diatonic-chord-vocabulary`: a static, quality-keyed table of common
  chord symbols (triad + common extensions) for major/minor/
  diminished/augmented triad qualities, plus a lookup helper, used to
  annotate scale degrees with playable chord options.

### Modified Capabilities
- `scale-dashboard`: the "Degrees row shows scale degrees with their
  notes" requirement changes — pill label becomes the degree formula
  label + roman numeral (not note name), adjacent pills gain a W/H
  step indicator between them, and each pill gains a chord-symbol list
  sourced from the new `diatonic-chord-vocabulary` capability.

## Impact

- `src/components/ScaleDashboard.tsx`: Degrees row rendering (pill
  label, inter-pill W/H markers, chord symbol sub-row).
- `src/lib/theory.ts`: no new computation needed — `getDiatonicDegrees`
  and `getWholeHalfPattern` already expose everything except chord
  symbols.
- New `src/lib/chords.ts` (or similar): static chord vocabulary table
  + lookup function, following the same "fixed data table" pattern as
  `DEGREE_LABELS_BY_SEMITONE`.
- No route, persistence, or audio changes.
