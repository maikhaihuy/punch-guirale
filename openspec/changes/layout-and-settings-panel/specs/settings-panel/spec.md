## ADDED Requirements

### Requirement: Floating panel toggle affordance
The system SHALL render an always-visible toggle control, anchored to a
viewport edge, that opens the settings panel when activated by click or
tap.

#### Scenario: Opening the panel
- **WHEN** the user clicks or taps the settings toggle while the panel
  is closed
- **THEN** the settings panel expands into view, anchored to the
  viewport edge

#### Scenario: Toggle remains reachable
- **WHEN** the user is on any viewport size (mobile or desktop)
- **THEN** the settings toggle is visible and reachable without first
  opening any other menu

### Requirement: Panel dismiss behavior
The system SHALL close the settings panel when the user re-activates
the toggle, clicks or taps outside the panel, or presses Escape while
the panel has focus.

#### Scenario: Closing via toggle
- **WHEN** the user clicks or taps the settings toggle while the panel
  is open
- **THEN** the settings panel closes

#### Scenario: Closing via outside click
- **WHEN** the panel is open and the user clicks or taps outside the
  panel's bounds
- **THEN** the settings panel closes

#### Scenario: Closing via Escape key
- **WHEN** the panel is open and focus is within the panel
- **THEN** pressing Escape closes the panel and returns focus to the
  settings toggle

### Requirement: Controls grouped into labeled rows
The system SHALL group the key, mode, and position selectors into
separate rows within the settings panel, each with a visible plain-text
label identifying the group.

#### Scenario: Locating a control group
- **WHEN** the user opens the settings panel
- **THEN** the key selector, mode selector, and position selector each
  appear in their own row with a distinct visible label ("Key", "Mode",
  "Position")

### Requirement: Random key control is visually distinct
The system SHALL render the control that randomizes the selected key,
within the settings panel, with a visual treatment distinct from the
individual key selection controls, and SHALL position it separately
from them.

#### Scenario: Distinguishing random from key selection
- **WHEN** the user views the key row inside the settings panel
- **THEN** the randomize control is visually distinguishable (shape
  and/or color) from the 12 individual key controls and is spaced apart
  from them

### Requirement: Display toggles rendered as switches
The system SHALL render the note⇄degree display toggle and the
highlight-triad toggle as switch controls within the settings panel,
grouped together in the same row.

#### Scenario: Toggling note/degree display
- **WHEN** the user activates the note⇄degree switch inside the
  settings panel
- **THEN** the switch's on/off state reflects the current display mode
  and the fretboard updates accordingly

#### Scenario: Toggling triad highlighting
- **WHEN** the user activates the highlight-triad switch inside the
  settings panel
- **THEN** the switch's on/off state reflects whether triad
  highlighting is active, and it is presented in the same row as the
  note⇄degree switch
