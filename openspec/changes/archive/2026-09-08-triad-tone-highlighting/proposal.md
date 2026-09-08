## Why

Learners often need to see where the root triad (1–3–5) sits inside the
full 7-note scale shown on the fretboard, e.g. to connect scale practice
back to the chords built from it. The data needed already exists (the
`degree` field from Milestone 1); this proposal adds a way to surface it
visually, on its own rather than folded into the Milestone 2 polish pass,
since it introduces a new derived field and a new toggle with its own
precedence rules against the existing root/dimmed/active states.

## What Changes

- Add a derived `isTriadTone` field: true when a note's scale degree,
  with any accidental stripped, has base number 1, 3, or 5 (the root
  triad of the current mode) — Ionian/Lydian/Mixolydian → major (1–3–5),
  Dorian/Phrygian/Aeolian → minor (1–b3–5), Locrian → diminished
  (1–b3–b5, correctly unstable, not a bug).
- Add a "Highlight triad" toggle, off by default, independent of the
  existing Note/Degree display toggle (both can be on at once).
- When enabled, triad tones other than the root (which already stands out
  via its own styling) get a thin outline ring at reduced opacity —
  visually distinct from a plain scale tone without competing with the
  root or the note-interaction-states active/dimmed layers.
- Out of scope: diatonic triads built on every scale degree, and 7th-chord
  tones — this stays root-triad-only, a focused practice aid rather than
  a full harmony analyzer.

## Capabilities

### New Capabilities
- `triad-tone-highlighting`: the `isTriadTone` derivation, the
  "Highlight triad" toggle, and the triad-ring visual treatment and its
  precedence relative to root/dimmed/active note states.

### Modified Capabilities
(none — this adds a new derived field and a new opt-in toggle; it does
not change any existing `scale-fretboard`, `scale-positions`,
`note-playback`, or `note-interaction-states` requirement, only composes
alongside them)

## Impact

- `src/lib/theory.ts`: `FretNote` gains an optional `isTriadTone?:
  boolean`, computed in `buildFretboard` from each note's degree (base
  number 1/3/5 after stripping accidentals).
- `src/components/KeyModeBar.tsx` (or a new sibling control): a
  "Highlight triad" toggle alongside the existing Note/Degree toggle.
- `src/components/Fretboard.tsx`: a new `fret-note--triad` style applied
  when the toggle is on and the note qualifies, layered with the existing
  root/active/dimmed classes.
- `src/app/page.tsx`: new toggle state, passed down to `Fretboard`.
