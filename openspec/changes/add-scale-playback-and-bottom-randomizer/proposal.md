## Why

The scale wheel's center hub is currently a 🎲 randomize button, which is the
prime real estate on the most-looked-at control but does something the user
rarely needs mid-practice. Meanwhile the app has no way to *hear* the scale
as a whole: notes only sound one at a time when tapped on the fretboard. Moving
randomize to the bottom bar (next to the other practice controls, with the
current key and scale/mode shown beside it) frees the hub for a
play/stop control that plays the scale up and back down, lighting each note
on the wheel and animating the polygon edge between consecutive notes.

## What Changes

- Move the randomize-root control out of the scale wheel's center hub into the
  fixed bottom bar, as a cluster that also displays the current key and
  scale/mode (e.g. `C · Ionian`). Randomize still only changes the root, not
  the family/mode.
- Replace the wheel hub's function with a play/stop toggle. Play sounds the
  in-scale notes from the root up to the octave root, then back down to the
  root, one note per beat at the metronome's current BPM; stop halts it
  immediately. Playback ends by itself after one up-and-down pass.
- While playing, the note currently sounding is highlighted on the wheel, and
  its pitch class is echoed on the fretboard (reusing the existing same-pitch
  echo styling).
- While playing, the polygon edge between the sounding note and the next one
  is animated as a line sweeping from the first note to the second, timed to
  arrive as the next note sounds. The sweep is suppressed under
  `prefers-reduced-motion` (highlight only).
- Changing the root or navigating to another family/mode while playing stops
  playback.
- The bottom bar grows a second row on narrow viewports and the page's bottom
  padding grows to match, so no content is hidden under the fixed bar.

No **BREAKING** changes to routes, URL params, persisted data
(`localStorage` sessions), or the `theory.ts` / `scales.ts` public APIs. The
one behavior removal is the hub's randomize function, relocated rather than
dropped.

## Capabilities

### New Capabilities

- `scale-playback`: play/stop of the scale up and down, the active-note
  highlight on the wheel and fretboard, and the animated edge between
  consecutive notes.
- `root-randomizer`: the bottom-bar cluster that randomizes the root and
  shows the current key and scale/mode.

### Modified Capabilities

- `scale-dashboard`: the wheel's center is no longer the randomize control; it
  hosts the play/stop control instead. Requirements and scenarios that name the
  "center randomize hub" (root selection, chromatic degree labels, fluid
  sizing) change accordingly.

## Impact

- `src/components/ScaleWheel.tsx`: hub becomes play/stop; gains active-note
  highlight and animated edge overlay; drops the `randomRoot` import.
- `src/components/ScaleDashboard.tsx`, `src/components/ScalePage.tsx`: thread
  playback state/handlers down; footer gains the randomizer cluster; body
  bottom padding increases.
- `src/components/Fretboard.tsx`: accepts an externally driven echo pitch class.
- New: `src/hooks/useScalePlayer.ts` (scheduling + active step state),
  `src/components/RootRandomizer.tsx` (bottom-bar cluster), plus a pure
  playback-sequence helper with unit tests.
- `src/components/PracticeControls.tsx`: layout only (bar wraps on narrow
  widths).
- `src/components/ScaleDashboard.test.tsx` gets updated if it asserts hub
  content; new tests for the sequence helper and the wheel's markup.
- No new dependencies; reuses Tone.js. Scale playback uses its own synth and
  audio-clock scheduling, independent of `Tone.Transport`, so it does not
  interact with the metronome's start/stop.
- Existing specs `layout-controls` (Footer area) and `pitch-echo-highlighting`
  are extended by the new capabilities but not contradicted, so are not
  modified.
