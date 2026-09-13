## Purpose

Surfaces root/key selection, the current scale's degree/note detail, and
the page-local display toggles (triad highlight, note/degree, W–H
pattern) as a dedicated header area whose state changes without
navigating, separate from the route-driving family/mode navigation.

## ADDED Requirements

### Requirement: Key row hosts root note selection
The system SHALL render a header row for root/key selection, offering
all 12 chromatic pitch classes plus a control to randomize the root,
visually distinct from the individual pitch-class controls. Selecting a
root note or activating randomize SHALL update the fretboard without
navigating to a new route.

#### Scenario: Selecting a root note
- **WHEN** the user selects a pitch class in the header's key row
- **THEN** the fretboard recomputes for the new root, without a route
  change

#### Scenario: Randomizing the root
- **WHEN** the user activates the randomize control in the key row
- **THEN** the root is set to one of the 12 chromatic pitch classes and
  the fretboard recomputes accordingly

### Requirement: Primary row shows current degree, note, and scale notes
The system SHALL render a primary header row, always visible, showing
the currently selected degree and its note (e.g. "Degree 1 — C") and the
full ordered note list of the active scale (e.g. "C · D · E · F · G · A
· B"). This row SHALL update when the user clicks a note on the
fretboard.

#### Scenario: Default primary row on load
- **WHEN** the page loads for a given family/mode/root
- **THEN** the primary row shows degree 1 and its note, and the full
  ordered note list for that scale

#### Scenario: Clicking a fretboard note updates the primary row
- **WHEN** the user clicks a note on the fretboard
- **THEN** the primary row's degree/note display updates to reflect the
  clicked note, without navigating to a new route

### Requirement: Secondary row hosts display toggles
The system SHALL render a secondary header row containing the
highlight-triad toggle, the note/degree toggle, and the W–H interval
pattern display. Activating either toggle SHALL update the fretboard
display without changing the route.

#### Scenario: Toggling triad highlight from the header
- **WHEN** the user activates the highlight-triad toggle in the header's
  secondary row
- **THEN** the fretboard shows the triad ring for the selected degree,
  without a route change

#### Scenario: Toggling note/degree from the header
- **WHEN** the user activates the note/degree toggle in the header's
  secondary row
- **THEN** every fretboard label switches between note name and scale
  degree, without a route change

### Requirement: Mobile secondary row is collapsible
The system SHALL, on viewports narrower than 768px, default to hiding
the secondary row behind a `⋯` (more) toggle button in the header, while
always keeping the primary row visible; activating the `⋯` button SHALL
reveal the secondary row's controls.

#### Scenario: Secondary row hidden by default on mobile
- **WHEN** the page loads on a viewport narrower than 768px
- **THEN** the primary row is visible and the secondary row's controls
  are hidden behind a `⋯` toggle

#### Scenario: Revealing the secondary row on mobile
- **WHEN** the user activates the `⋯` toggle on a mobile viewport
- **THEN** the secondary row's controls (triad toggle, note/degree
  toggle, W–H pattern) become visible
