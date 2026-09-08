## Why

Milestone 1 shows every in-scale note across the full 0–24 fret range with
no audio feedback, which is too much information at once for practicing a
specific fingering and gives no way to hear a note's pitch. Milestone 2
adds the two features guitarists need next: a way to narrow the fretboard
to one of the 5 standard positions, and the ability to hear any note by
tapping it.

## What Changes

- Add a 5-position selector (`All | 1 | 2 | 3 | 4 | 5`) that tags fretboard
  notes with the position(s) they belong to, using a fixed, hardcoded set
  of degree-keyed shape templates (not derived at runtime), shared across
  all 7 modes since they share one physical note pool per parent key.
- When a position is selected, dim out-of-position notes (do not hide
  them), keep the root always visually prominent, and draw a background
  band over the selected position's fret range.
- On mobile, default to a single position view instead of `All`, and
  auto-scroll/zoom the fretboard to the selected position's fret range so
  it fits without horizontal scrolling.
- Add click/tap-to-play audio on any rendered note, using the existing
  Tone.js instance (`Tone.Synth`) and the note's already-computed `freq`/
  `midi`, started only inside the click handler per autoplay policy.
- Separate each note's touch target from its visible dot (~44px hit area)
  so mobile taps land reliably.

Out of scope for this change: authentication, backend/database, cross-
device sync, realistic sampled/soundfont audio, and any theory beyond the
existing 7 modes. A possible localStorage → IndexedDB storage migration is
deferred and only revisited later if the two features above make
localStorage limiting — it is not part of this change's requirements.

## Capabilities

### New Capabilities
- `scale-positions`: selecting one of 5 fixed fretboard positions (or
  `All`), tagging notes by position via hardcoded degree-keyed shape data,
  dimming out-of-position notes while keeping the root prominent, marking
  the position's fret range, and defaulting to a single position on mobile
  with auto-scroll/zoom to fit.
- `note-playback`: playing a note's pitch on click/tap using the existing
  Tone.js setup and the note's `freq`/`midi`, gated on the user gesture,
  with a touch target separate from the visible dot.

### Modified Capabilities
(none — existing `scale-fretboard` rendering requirements are unchanged;
position tagging and dimming are additive to the existing note data and
rendering, not a change to which notes are shown or how the root/degree
toggle behaves)

## Impact

- `src/lib/theory.ts`: extend `FretNote` with optional `patternId`; add a
  new degree-keyed position/shape config module (5 templates, fret-offset
  per string, tagged by scale degree 1–7) consumed by `buildFretboard`.
- Fretboard SVG component: add the segmented position selector control,
  dimmed/root CSS treatment, the position background band, and the
  separated touch-target/visible-dot markup per note.
- `src/app/page.tsx`: wire selected-position state (including the mobile
  default and viewport-based auto-scroll/zoom), and the click-to-play
  handler.
- Audio: reuse the Tone.js instance already initialized for
  `useMetronome`; add a `playNote(midi)` path using `Tone.Synth`.
- No new dependencies, no backend, no changes to `metronome` or
  `practice-tracking` capabilities.
