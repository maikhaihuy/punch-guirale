## ADDED Requirements

### Requirement: Practice stopwatch
The system SHALL provide a stopwatch with start, pause, resume, and stop
controls. Elapsed time SHALL be computed from timestamp differences
(`Date.now()`) rather than by counting ticks, so it stays correct even if
the tab is throttled in the background.

#### Scenario: Start, pause, resume
- **WHEN** the user starts the stopwatch, pauses it after some time, then
  resumes it
- **THEN** elapsed time accumulates only across the running intervals,
  excluding the paused interval

#### Scenario: Stopping returns duration
- **WHEN** the user stops a running or paused stopwatch
- **THEN** the stopwatch resets to idle at 0 and the total elapsed
  duration in whole seconds is returned to the caller

### Requirement: Practice session history
On stopping a stopwatch session with a nonzero duration, the system SHALL
save a record `{ date, rootNote, mode, bpm, durationSec }` to
`localStorage`, and SHALL display saved sessions most-recent-first. Saved
sessions SHALL persist and remain visible after a page reload.

#### Scenario: Session saved on stop
- **WHEN** the user stops a stopwatch session with elapsed time greater
  than zero
- **THEN** a session record with the current date, selected root note,
  selected mode, current BPM, and elapsed duration is appended to
  `localStorage` and appears at the top of the practice history list

#### Scenario: Zero-duration session is not saved
- **WHEN** the user stops the stopwatch immediately, with zero elapsed
  seconds
- **THEN** no session record is saved

#### Scenario: History persists across reloads
- **WHEN** the user reloads the page after saving one or more sessions
- **THEN** the practice history list still shows those sessions,
  most-recent-first

#### Scenario: Session history loads after hydration, not during it
- **WHEN** the app's initial render occurs (server-rendered and first
  client render)
- **THEN** the session list starts empty on both, and is populated from
  `localStorage` only after mount, so server and client markup match

### Requirement: Screen Wake Lock during practice
The system SHALL request a Screen Wake Lock while the metronome is
playing or the stopwatch is running, and release it once neither is
active. If the Wake Lock API is unavailable or the request fails, the
system SHALL fail silently and never block metronome or stopwatch
functionality.

#### Scenario: Wake lock acquired on practice start
- **WHEN** the user starts the metronome or the stopwatch
- **THEN** a Screen Wake Lock request is made

#### Scenario: Wake lock released when practice ends
- **WHEN** both the metronome is stopped and the stopwatch is not running
- **THEN** any held Screen Wake Lock is released

#### Scenario: Wake Lock API unsupported
- **WHEN** `navigator.wakeLock` is unavailable (e.g. older Safari)
- **THEN** the metronome and stopwatch continue to function normally
  with no error surfaced to the user
