## Why

Milestone 1 (the MVP) was built directly from `MVP_SPECS.md` before OpenSpec
was adopted in this project, so there are no capability specs under
`openspec/specs/` describing what actually exists. Future changes (starting
with Milestone 2) need a spec baseline to propose deltas against — this
change documents the already-implemented behavior as specs, with no code
changes.

## What Changes

- Document the existing key/mode selection, fretboard rendering, and
  note/degree toggle as the `scale-fretboard` capability.
- Document the existing Tone.js-based metronome as the `metronome`
  capability.
- Document the existing practice stopwatch, `localStorage`-backed session
  history, and Screen Wake Lock behavior as the `practice-tracking`
  capability.
- No implementation changes — this is a documentation-only baseline.

## Capabilities

### New Capabilities
- `scale-fretboard`: root note + mode selection, 24-fret SVG fretboard
  showing only in-scale notes, root note highlighted, note-name/degree
  label toggle.
- `metronome`: BPM-configurable metronome driven by `Tone.Transport`, started
  only from a user gesture.
- `practice-tracking`: start/pause/resume/stop stopwatch, saving a session
  record to `localStorage` on stop, listing past sessions most-recent-first,
  and holding a Screen Wake Lock while a metronome or stopwatch session is
  active.

### Modified Capabilities
(none — this is the first baseline)

## Impact

Affected code (already implemented, no changes made by this proposal):
`src/lib/theory.ts`, `src/lib/storage.ts`, `src/hooks/useMetronome.ts`,
`src/hooks/useStopwatch.ts`, `src/hooks/useWakeLock.ts`,
`src/components/Fretboard.tsx`, `src/components/KeyModeBar.tsx`,
`src/components/PracticeControls.tsx`, `src/components/PracticeHistory.tsx`,
`src/app/page.tsx`.
