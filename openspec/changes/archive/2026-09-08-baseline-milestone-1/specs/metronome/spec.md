## ADDED Requirements

### Requirement: BPM-configurable metronome
The system SHALL provide a metronome with a user-adjustable BPM value
(default 100), driven by `Tone.Transport`/`Tone.Loop` rather than
`setInterval`, so the tempo does not drift and continues in
backgrounded tabs.

#### Scenario: Changing BPM while stopped
- **WHEN** the user changes the BPM value while the metronome is not
  playing
- **THEN** the stored BPM updates and the next start uses the new value

#### Scenario: Changing BPM while playing
- **WHEN** the user changes the BPM value while the metronome is playing
- **THEN** the running transport's tempo updates to the new BPM without
  stopping playback

### Requirement: Metronome start requires user gesture
The system SHALL only call `Tone.start()` from within a user-initiated
event handler (e.g. a button click), never automatically on page load,
to comply with browser autoplay policy.

#### Scenario: Starting the metronome
- **WHEN** the user clicks the metronome toggle control
- **THEN** the audio context is started (or resumed) as part of that
  click handler and an audible click begins on each beat

#### Scenario: Stopping the metronome
- **WHEN** the user clicks the metronome toggle control while it is
  playing
- **THEN** the transport stops and the beat loop is disposed
