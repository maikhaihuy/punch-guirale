## ADDED Requirements

### Requirement: Click-to-play note audio
The system SHALL play a note's pitch when the user clicks or taps a
rendered fretboard note, using the note's existing `freq` (or `midi`)
value from the Milestone 1 data model, via the existing Tone.js instance
already initialized for the metronome. No new audio library or
per-note pitch calculation SHALL be introduced.

#### Scenario: Clicking a note plays its pitch
- **WHEN** the user clicks or taps an in-scale note on the fretboard
- **THEN** an audible tone sounds at the frequency corresponding to that
  note's `freq`/`midi` value

#### Scenario: Reuses existing Tone.js setup
- **WHEN** a note is played
- **THEN** playback uses the same Tone.js audio context already used by
  the metronome rather than initializing a separate audio library or
  context

### Requirement: Playback start requires user gesture
The system SHALL only call `Tone.start()` from within the user-initiated
click/tap handler that triggers note playback, never automatically on
page load or on any non-gesture-triggered code path, to comply with
browser autoplay policy.

#### Scenario: First note tap starts audio context
- **WHEN** the user taps a note for the first time in a session and the
  Tone.js audio context is not yet running
- **THEN** the audio context is started as part of that same click
  handler and the note's tone is audible

### Requirement: Reliable touch target for note playback
The system SHALL render each playable note with a touch target
separate from and larger than its visible dot (approximately 44px),
so that taps on mobile devices reliably trigger playback even though
the visible dot remains small.

#### Scenario: Tapping near a small visible dot still plays it
- **WHEN** the user taps within the enlarged touch target area
  surrounding a note's visible dot, even if not precisely on the dot
  itself
- **THEN** that note's pitch plays
