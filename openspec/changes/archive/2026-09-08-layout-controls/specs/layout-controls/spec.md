## Purpose

Defines how the app's controls (key/mode/position selection, display
toggles, and playback controls) are grouped, labeled, and visually
distinguished on the page, independent of the music-theory or audio
behavior those controls trigger.

## ADDED Requirements

### Requirement: Single centered column layout
The system SHALL present the page as a single centered column on every
viewport size, with the controls container narrower than the fretboard
section.

#### Scenario: Viewing on any screen size
- **WHEN** the page is loaded on a desktop or mobile viewport
- **THEN** the controls, fretboard, and bottom bar are all centered in a
  single column, and the fretboard section renders wider than the controls
  container above it

### Requirement: Controls grouped into labeled rows
The system SHALL group the key, mode, and position selectors into
separate rows, each with a visible plain-text label identifying the group.

#### Scenario: Locating a control group
- **WHEN** the user looks at the controls container
- **THEN** the key selector, mode selector, and position selector each
  appear in their own row with a distinct visible label ("Key", "Mode",
  "Position")

### Requirement: Random key control is visually distinct
The system SHALL render the control that randomizes the selected key with
a visual treatment distinct from the individual key selection controls, and
SHALL position it separately from them.

#### Scenario: Distinguishing random from key selection
- **WHEN** the user views the key row
- **THEN** the randomize control is visually distinguishable (shape and/or
  color) from the 12 individual key controls and is spaced apart from them

### Requirement: Display toggles rendered as switches
The system SHALL render the note⇄degree display toggle and the
highlight-triad toggle as switch controls, grouped together in the same
row.

#### Scenario: Toggling note/degree display
- **WHEN** the user activates the note⇄degree switch
- **THEN** the switch's on/off state reflects the current display mode and
  the fretboard updates accordingly

#### Scenario: Toggling triad highlighting
- **WHEN** the user activates the highlight-triad switch
- **THEN** the switch's on/off state reflects whether triad highlighting is
  active, and it is presented in the same row as the note⇄degree switch

### Requirement: Playback controls are icon-only with accessible labels
The system SHALL render the metronome and stopwatch controls as icon-only
buttons, each with a non-visible accessible label describing its action.

#### Scenario: Identifying a playback control via assistive technology
- **WHEN** a screen reader focuses a metronome or stopwatch button
- **THEN** it announces a label describing the button's action (e.g. "Start
  metronome", "Reset stopwatch") even though no visible text is rendered
  on the button
