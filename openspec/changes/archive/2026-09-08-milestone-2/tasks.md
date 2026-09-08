## 1. Position shape data

- [x] 1.1 Create `src/lib/positions.ts` with the 5 degree-keyed shape
  templates (fret-offset per string, tagged by scale degree 1–7), sourced
  from a reliable fretboard-position reference, not derived at runtime.
- [x] 1.2 Manually verify each of the 5 templates against a real/reference
  fretboard diagram (correct strings/frets per degree) before wiring them
  into rendering.
- [x] 1.3 Extend `FretNote` in `src/lib/theory.ts` with optional
  `positions?: PositionId[]` (multi-position field, since adjacent CAGED
  shapes overlap by 2-3 frets and a note can legitimately belong to more
  than one position — a single `patternId` produced unusably thin boxes).
- [x] 1.4 In `buildFretboard`, tag each computed in-scale note with its
  position(s) using the degree-keyed templates, reusing the same templates
  across all 7 modes without duplicating shape data per mode.

## 2. Position selector UI

- [x] 2.1 Add a segmented `All | 1 | 2 | 3 | 4 | 5` control to
  `src/components/KeyModeBar.tsx` (or a new sibling component), styled
  consistent with the existing mode tabs.
- [x] 2.2 Wire selected-position state in `src/app/page.tsx`, defaulting to
  `All` on desktop/tablet viewports.
- [x] 2.3 Default to `Position 1` instead of `All` on mobile-width
  viewports on initial load.

## 3. Position visual treatment

- [x] 3.1 In `src/components/Fretboard.tsx`, apply a `fret-note--dimmed`
  class (opacity ~0.28) to notes outside the selected position, leaving
  them rendered (not removed) when a position other than `All` is active.
- [x] 3.2 Ensure the root note keeps its distinct root styling even when
  dimmed / outside the selected position.
- [x] 3.3 Render a semi-transparent background band over the fret range
  the selected position occupies.
- [x] 3.4 Verify selecting `All` clears all dimming and removes the
  position band.

## 4. Mobile fit for position view

- [x] 4.1 On mobile-width viewports, auto-scroll/zoom the fretboard to the
  selected position's fret range when a position is selected, so it fits
  without horizontal scrolling.
- [x] 4.2 Trigger the auto-fit only on mount and on explicit position
  changes (not on every resize/scroll event), so it doesn't override a
  user's manual scroll/zoom mid-session.

## 5. Note-playback audio

- [x] 5.1 Add a lazily-initialized shared `Tone.Synth` (e.g. in a new
  `src/hooks/useNotePlayer.ts`, reusing the same dynamically-imported
  `Tone` module as `useMetronome`).
- [x] 5.2 Implement `playNote(midi)` (or `freq`) that calls `Tone.start()`
  only when invoked, then triggers the synth at the note's pitch.
- [x] 5.3 In `src/components/Fretboard.tsx`, wire each note's click/tap to
  `playNote`, using the note's existing `freq`/`midi` value — no new pitch
  calculation.

## 6. Touch targets

- [x] 6.1 Restructure each note in `src/components/Fretboard.tsx` into a
  `<g>` with a transparent ~44px hit-area circle plus the existing smaller
  visible dot, so the click handler binds to the larger area.
- [x] 6.2 Verify on a touch device (or browser touch emulation) that taps
  near, not just exactly on, the visible dot trigger playback.

## 7. Verification

- [x] 7.1 Manually test: selecting each of the 5 positions across at least
  two different modes shows the correct dimming/band and the same shape
  data (no per-mode duplication).
- [x] 7.2 Manually test: tapping notes plays correct pitches, first tap of
  a session starts audio without a console/autoplay error.
- [x] 7.3 Manually test on a mobile-width viewport: default position is
  `Position 1` (not `All`), selecting a position fits without horizontal
  scroll, and touch targets are reliably tappable.
- [x] 7.4 Run `pnpm lint` and fix any issues introduced by this change.
  (`pnpm lint` fails on this repo's `eslint.config.mjs` itself with a
  pre-existing ESLint 10.10.0 / eslint-plugin-react 7.37.5 incompatibility,
  confirmed present before this change via `git stash` + re-run; `tsc
  --noEmit` passes cleanly on all new/changed files.)
