## Why

Right now the fretboard only shows where the current scale/position lives —
it gives no way to see where else on the neck the *same pitch* recurs.
Hovering or touching a note to reveal every other occurrence of that
letter name is the standard "show me this note everywhere on the neck"
pattern used in most fretboard visualizers, and helps players connect a
note they're focused on to its other positions across strings/octaves.

## What Changes

- Add hover (mouse) and tap (touch) driven cross-note highlighting: when
  the user hovers or touches an in-scale note, every other note sharing
  the same pitch class (same letter name, any octave/fret) gets a distinct
  "echo" visual treatment — a glowing outline, not the existing scale-up
  active-press style.
- Lift a single `hoveredNoteName` piece of state to the `Fretboard`
  component so every rendered note can check against it.
- Branch interaction handling on `pointerType`: mouse hover (no click) sets
  the shared state without triggering playback; touch has no separate
  hover phase, so a tap sets both the active-press state (this note) and
  the echo state (other same-name notes) together, clearing both on
  release, so there is no stuck-highlight state on touch devices.
- Root notes need no special-casing — every root instance already shares
  the same name, so hovering/touching any root note echoes every other
  root instance automatically, layered on top of existing root styling.
- Echo styling composes with, rather than replaces, existing per-note
  states: it renders (at reduced opacity, matching the note's own dimmed
  state) on notes currently dimmed by the position filter, and coexists
  with the active-press and root styling already defined by
  `note-interaction-states`.
- Memoize the per-note component (`React.memo`) so a hover event doesn't
  re-render notes whose own props are unchanged, given up to ~150 note
  elements can be on screen at once.

**Assumptions carried over from the source spec** (flagged there as
worth confirming, defaulting to the documented behavior to keep moving):
- "Same pitch" means same letter name/pitch class across any octave
  (compares `note.name`), not the same exact octave (`midi`). If the
  intent was octave-exact matching, this is a one-line change to compare
  `midi` instead.
- The echo ring renders on dimmed notes too (at that note's existing
  reduced opacity), rather than being suppressed for anything outside the
  currently selected position. If dimmed notes should be excluded from
  echo highlighting entirely, that's a one-line change to skip rendering
  the echo class when `dimmed` is true.

## Capabilities

### New Capabilities
- `pitch-echo-highlighting`: hover/touch-driven highlighting of every
  other fretboard note sharing the interacted note's pitch class, as a
  visual state distinct from (and composable with) the existing
  active-press, root, and position-dimming states.

### Modified Capabilities
(none — `note-interaction-states` defines the active-press state only and
is unchanged; the new echo state is an additive, independently-driven
visual layer, the same relationship `triad-tone-highlighting` already has
to `note-interaction-states`)

## Impact

- **Code**: `src/components/Fretboard.tsx` (new `hoveredNoteName` state,
  pointer handlers, `React.memo` on the per-note component),
  `src/app/globals.css` (new `.fret-note--echo` style, using the existing
  `--accent` token added by the `layout-controls` change).
- **No changes** to `src/lib/theory.ts`, `src/lib/storage.ts`,
  `src/hooks/*`, or the audio-playback path (`note-playback` capability)
  — echo highlighting never triggers sound, only a visual state.
