## 1. Triad derivation

- [x] 1.1 In `src/lib/theory.ts`, add `getTriadQuality(mode, degreeIndex)`
  computing `"major" | "minor" | "diminished" | "augmented"` from the
  semitone gaps between `MODES[mode][degreeIndex]`,
  `MODES[mode][(degreeIndex + 2) % 7]`, and
  `MODES[mode][(degreeIndex + 4) % 7]` (wrapping by 12 across the
  octave boundary).
- [x] 1.2 Add `getRomanNumeral(mode, degreeIndex)` combining the fixed
  numeral (I..VII for that position) with case + suffix from 1.1's
  quality (upper-case, no suffix for major; lower-case, no suffix for
  minor; lower-case with `°` for diminished; upper-case with `+` for
  augmented).
- [x] 1.3 Add `getDiatonicDegrees(root, mode)` returning all 7
  `{ index, noteName, degreeLabel, romanNumeral, quality }` entries,
  reusing `getScaleMap`/`getDegreeLabels` for `noteName`/`degreeLabel`.
- [x] 1.4 Add `getTriadDegreeLabels(mode, degreeIndex): Set<string>`
  returning the 3 degree-label strings for the triad rooted at
  `degreeIndex` (via `getDegreeLabels(mode)` indexed at `degreeIndex`,
  `(degreeIndex + 2) % 7`, `(degreeIndex + 4) % 7`).
- [x] 1.5 Remove `isTriadTone` from `FretNote` and its computation in
  `buildFretboard`; remove the now-unused `degreeBaseNumber` /
  `isTriadDegree` / `TRIAD_DEGREES`.
- [x] 1.6 Manually verify `getDiatonicDegrees`/`getTriadDegreeLabels`
  across all 7 modes: spot-check that degree index 0 (root triad)
  reproduces the same quality the old hardcoded per-mode table gave
  (Ionian/Lydian/Mixolydian → major, Dorian/Phrygian/Aeolian → minor,
  Locrian → diminished), and hand-verify at least one non-root degree
  in a non-Ionian mode.

## 2. Degree-selector UI

- [x] 2.1 In `src/components/KeyModeBar.tsx`, replace the "Highlight
  triad" `Switch` with a "Triad" section: a `None` pill plus 7 degree
  pills (label = `romanNumeral` from `getDiatonicDegrees(root, mode)`),
  styled with the same `TAB_BUTTON_CLASS` pattern as the Position row.
- [x] 2.2 Update `KeyModeBar`'s props: replace `highlightTriad` /
  `onHighlightTriadChange` with `selectedTriadDegree: number | null` /
  `onSelectedTriadDegreeChange`.
- [x] 2.3 In `src/app/page.tsx`, replace the `highlightTriad` boolean
  state with `selectedTriadDegree: number | null` (default `null`),
  and derive `triadDegreeLabels` via
  `useMemo(() => selectedTriadDegree === null ? null : getTriadDegreeLabels(mode, selectedTriadDegree), [mode, selectedTriadDegree])`.

## 3. Fretboard wiring

- [x] 3.1 In `src/components/Fretboard.tsx`, replace the
  `highlightTriad: boolean` prop with `triadDegreeLabels: Set<string> |
  null`; update `showTriadRing` to `!!triadDegreeLabels &&
  note.degree !== undefined && triadDegreeLabels.has(note.degree) &&
  !note.isRoot`. No change to the ring's own rendering
  (`fret-note--triad`, `TRIAD_RING_RADIUS`) or its position in the
  dim/identity/triad/active-press layering.

## 4. Verification

- [x] 4.1 Manually test: selecting each of the 7 degree pills in C
  Ionian highlights the expected 3 notes (I→C-E-G, ii→D-F-A, iii→E-G-B,
  IV→F-A-C, V→G-B-D, vi→A-C-E, vii°→B-D-F), and selecting `None` clears
  all rings.
- [x] 4.2 Manually test: switching mode (e.g. to Locrian) while a
  non-`None` degree is selected updates both the highlighted notes and
  the roman-numeral casing to match the new mode's qualities, without
  needing to reselect.
- [x] 4.3 Manually test: selecting `I` still excludes the scale root
  from the ring (existing behavior preserved); selecting any other
  degree rings all 3 of its members, including that degree's own note.
- [x] 4.4 Manually test: the triad ring still dims correctly under the
  position selector and still coexists with active-press/echo
  highlighting, matching the precedence already verified for the old
  toggle.
- [x] 4.5 Run `pnpm lint` / `tsc --noEmit` (per the prior change's
  note, confirm no *new* type errors if lint itself can't run due to
  the pre-existing config mismatch).
