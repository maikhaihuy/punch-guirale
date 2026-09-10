## Why

`triad-tone-highlighting` only ever highlights the root triad (scale
degree 1) and explicitly scoped out every other degree's triad as a
Non-Goal. But every scale degree has its own diatonic triad (ii, iii,
IV, V, vi, vii°), and picking one out is exactly the practice technique
of targeting chord tones for whichever chord is currently sounding
while soloing, rather
than only ever resolving to the tonic triad. The data needed already
exists (`FretNote.degree`) and the visual already exists
(`.fret-note--triad`); this proposal generalizes which 3 degrees form
the highlighted triad instead of introducing new mechanics.

## What Changes

- Replace the boolean "Highlight triad" switch with a degree selector:
  a `None` pill (default) plus one pill per scale degree, each labeled
  with a roman numeral whose case and suffix reflect that degree's own
  triad quality — major, minor, diminished, or augmented — derived from
  the mode's own intervals, not a hardcoded per-mode table.
- Selecting a degree highlights that degree's diatonic triad (the
  degree itself plus the ones two and four scale-steps ahead, wrapping
  around the 7-note scale) using the existing ring visual already
  defined by `triad-tone-highlighting`.
- Triad membership is computed on demand for whichever single degree is
  selected (a small pure function), not precomputed per-note for all 7
  possible triads — there is no new field on `FretNote`.
- The scale's own root note keeps its existing dedicated styling and is
  still never additionally ring-decorated — this falls out for free
  since the scale root is simply one of the three notes making up the
  "I" triad.
- Out of scope: 7th-chord tones (still triads only), multi-selecting
  more than one degree at once, and visually distinguishing which of
  the 3 highlighted notes is that triad's own root/3rd/5th from one
  another — all 3 members render with the same ring for this pass.

## Capabilities

### New Capabilities
- `diatonic-triad-highlighting`: the degree-selector control (replacing
  the old boolean toggle), the per-selection triad-membership
  derivation covering all 7 scale degrees, and reuse of the existing
  ring visual and its precedence rules.

### Modified Capabilities
- `triad-tone-highlighting`: superseded by this change. The fixed
  root-only (`isTriadTone`) derivation and the boolean "Highlight
  triad" toggle are removed; the ring visual, its precedence relative
  to the root/dimmed/active-press states, and Locrian's diminished
  triad being intentional (not a bug) all carry forward unchanged, now
  driven by whichever degree is selected instead of being hardcoded to
  degree 1.

## Impact

- `src/lib/theory.ts`: remove `isTriadTone` from `FretNote` and its
  computation in `buildFretboard`; remove the now-unused
  `degreeBaseNumber`/`isTriadDegree`/`TRIAD_DEGREES` (see design.md).
  Add `getDiatonicDegrees(root, mode)` returning all 7 scale degrees
  (note name, degree label, roman numeral, triad quality) and
  `getTriadDegreeLabels(mode, degreeIndex)` returning the 3
  degree-label strings for the triad rooted at a given scale-degree
  index.
- `src/components/KeyModeBar.tsx`: remove the "Highlight triad"
  `Switch`; add a "Triad" section (a `None` pill plus 7 degree pills,
  mirroring the existing Position section's pill-row pattern) built
  from `getDiatonicDegrees`.
- `src/components/Fretboard.tsx`: replace the `highlightTriad: boolean`
  prop with `triadDegreeLabels: Set<string> | null`; `showTriadRing`
  becomes a membership check against that set instead of reading
  `note.isTriadTone`.
- `src/app/page.tsx`: replace `highlightTriad` state with
  `selectedTriadDegree: number | null` (default `null`); derive
  `triadDegreeLabels` via `useMemo` from `mode` + `selectedTriadDegree`
  and pass down to `Fretboard` and `KeyModeBar`.
