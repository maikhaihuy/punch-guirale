## Why

Milestone 2 added click/tap-to-play audio, but a note gives no visual
confirmation that a press registered — the dot looks identical whether
it's idle or mid-ring. Since the touch target, root styling, and dimming
already exist, adding a pressed/active visual state is a small, direct
companion to that audio feature rather than a new milestone of its own.

## What Changes

- Add a resting-vs-active interaction overlay on top of a note's existing
  identity (root vs. regular tone): while a note is pressed, it scales up
  slightly and gets a glow, styled to read as "the string ringing out."
- Drive the active state from pointer events (`onPointerDown/Up/Leave`)
  captured on the same enlarged touch-target element already used for
  audio playback, not CSS `:hover` — `:hover` sticks inconsistently on
  touch devices between taps.
- The active overlay and the existing position-selector dimming continue
  to combine multiplicatively (dimmed notes can still flash active when
  pressed, just at reduced opacity) — no change to dimming's own rules.
- The active glow appears on the same press that triggers playback, so
  the visual and the audible tone land together.

## Capabilities

### New Capabilities
- `note-interaction-states`: the resting/active visual overlay for
  fretboard notes, its precedence relative to root identity and
  position-selector dimming, and driving it from pointer events instead
  of CSS `:hover` for touch reliability.

### Modified Capabilities
(none — `note-playback`'s requirements already describe playback as
triggered by "clicks or taps" without mandating a specific DOM event;
switching the trigger to pointer-down and adding a visual response is
additive polish, not a change to when/whether a note plays or how its
touch target is sized)

## Impact

- `src/components/Fretboard.tsx`: note rendering switches from a single
  `onClick` handler to `onPointerDown`/`onPointerUp`/`onPointerLeave`,
  adds local `isActive` state per note, and applies the new active/root/
  dimmed class combination to the visible dot.
- New CSS classes for `fret-note`, `fret-note--root`, `fret-note--active`,
  `fret-note--dimmed` (dimmed already exists from Milestone 2; root and
  active are new or reworked).
- No changes to `src/hooks/useNotePlayer.ts`, `src/lib/theory.ts`, or the
  `scale-positions`/`note-playback` capabilities' own requirements.
