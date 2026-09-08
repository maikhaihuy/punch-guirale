## 1. Triad derivation

- [ ] 1.1 In `src/lib/theory.ts`, add a helper that strips a leading
  `b`/`#` (or multiple, e.g. `bb`) from a `degree` string and returns the
  base number.
- [ ] 1.2 Extend `FretNote` with optional `isTriadTone?: boolean`; in
  `buildFretboard`, set it true when the note's degree base number is 1,
  3, or 5 (using the helper from 1.1).
- [ ] 1.3 Manually verify triad membership across all 7 modes (spot-check
  Ionian → major, Dorian → minor, Locrian → diminished) against the
  `degree` labels already rendered on the fretboard.

## 2. Toggle UI

- [ ] 2.1 Add a "Highlight triad" toggle control (e.g. in
  `src/components/KeyModeBar.tsx`, alongside the existing Note/Degree
  toggle), defaulting to off.
- [ ] 2.2 Wire the toggle's state in `src/app/page.tsx` and pass it down
  to `Fretboard`.

## 3. Visual treatment

- [ ] 3.1 In `src/components/Fretboard.tsx`, add a `fret-note--triad`
  style (thin outline ring, reduced opacity) applied only when the
  toggle is on, the note is a triad tone, and the note is not the root.
- [ ] 3.2 Confirm the triad ring composes correctly with the existing
  dimmed state (reduced opacity applies to the whole note including the
  ring) and, once `note-interaction-states` lands, with the active-press
  state per the precedence order in design.md.

## 4. Verification

- [ ] 4.1 Manually test: toggling "Highlight triad" on/off shows/hides
  the ring on exactly the expected notes for at least two modes of
  different triad quality (e.g. Ionian major, Locrian diminished).
- [ ] 4.2 Manually test: switching Note/Degree display while the toggle
  is on does not affect which notes are highlighted.
- [ ] 4.3 Manually test: selecting a fretboard position dims a
  highlighted triad tone's ring along with the rest of that note.
- [ ] 4.4 Run `pnpm lint` (note: this repo's lint is currently broken by a
  pre-existing ESLint/eslint-plugin-react version mismatch unrelated to
  this change - confirm no *new* issues via `tsc --noEmit` if lint itself
  cannot run).
