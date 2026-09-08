## 1. Triad derivation

- [x] 1.1 In `src/lib/theory.ts`, add a helper that strips a leading
  `b`/`#` (or multiple, e.g. `bb`) from a `degree` string and returns the
  base number. (`degreeBaseNumber`, plus an `isTriadDegree` helper on top
  of it.)
- [x] 1.2 Extend `FretNote` with optional `isTriadTone?: boolean`; in
  `buildFretboard`, set it true when the note's degree base number is 1,
  3, or 5 (using the helper from 1.1).
- [x] 1.3 Manually verify triad membership across all 7 modes (spot-check
  Ionian → major, Dorian → minor, Locrian → diminished) against the
  `degree` labels already rendered on the fretboard. (Verified via
  Playwright + screenshots: Ionian rings exactly degrees 3 and 5, never
  1/root; Dorian rings b3 and 5; Locrian rings b3 and b5 — matching
  major/minor/diminished as specified.)

## 2. Toggle UI

- [x] 2.1 Add a "Highlight triad" toggle control (e.g. in
  `src/components/KeyModeBar.tsx`, alongside the existing Note/Degree
  toggle), defaulting to off.
- [x] 2.2 Wire the toggle's state in `src/app/page.tsx` and pass it down
  to `Fretboard`.

## 3. Visual treatment

- [x] 3.1 In `src/components/Fretboard.tsx`, add a `fret-note--triad`
  style (thin outline ring, reduced opacity) applied only when the
  toggle is on, the note is a triad tone, and the note is not the root.
  (Implemented as a separate stroke-only ring circle, not a modification
  to the dot's own stroke, so it doesn't interfere with root/active
  styling on the dot itself.)
- [x] 3.2 Confirm the triad ring composes correctly with the existing
  dimmed state (reduced opacity applies to the whole note including the
  ring) and, once `note-interaction-states` lands, with the active-press
  state per the precedence order in design.md. (The ring is a sibling of
  the dot inside the same outer `<g>` that carries the dimmed opacity, so
  dimming applies to both together; active-press only transforms the dot
  via `.fret-note`/`.fret-note--active`, leaving the ring's own styling
  untouched, matching the "ring is stroke-only, active is on the dot"
  precedence.)

## 4. Verification

- [x] 4.1 Manually test: toggling "Highlight triad" on/off shows/hides
  the ring on exactly the expected notes for at least two modes of
  different triad quality (e.g. Ionian major, Locrian diminished).
  (Confirmed via Playwright: 0 rings with toggle off; Ionian → {3,5}
  ringed; Locrian → {b3,b5} ringed; root never ringed.)
- [x] 4.2 Manually test: switching Note/Degree display while the toggle
  is on does not affect which notes are highlighted. (Confirmed the exact
  same set of ringed fret/string positions before and after toggling
  display mode, within the same mode.)
- [x] 4.3 Manually test: selecting a fretboard position dims a
  highlighted triad tone's ring along with the rest of that note.
  (Confirmed 24 dimmed note groups still contain a triad ring element,
  i.e. the ring inherits the parent `<g>`'s reduced opacity rather than
  staying fully opaque.)
- [x] 4.4 Run `pnpm lint` (note: this repo's lint is currently broken by a
  pre-existing ESLint/eslint-plugin-react version mismatch unrelated to
  this change - confirm no *new* issues via `tsc --noEmit` if lint itself
  cannot run). (Reconfirmed the same pre-existing `eslint.config.mjs`
  failure; `tsc --noEmit` passes with no errors.)
