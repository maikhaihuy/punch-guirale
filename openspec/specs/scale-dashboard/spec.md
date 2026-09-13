# scale-dashboard Specification

## Purpose

Surfaces root/key selection, the current scale's degrees paired with
their notes (doubling as the triad-highlight control), and the
note/degree display toggle as a compact, page-local dashboard whose
state changes without navigating, separate from the route-driving
family/mode navigation.

## Requirements

### Requirement: Key row hosts root note selection
The system SHALL render a dashboard row for root/key selection, offering
all 12 chromatic pitch classes plus a control to randomize the root,
visually distinct from the individual pitch-class controls. Selecting a
root note or activating randomize SHALL update the fretboard without
navigating to a new route.

#### Scenario: Selecting a root note
- **WHEN** the user selects a pitch class in the dashboard's key row
- **THEN** the fretboard recomputes for the new root, without a route
  change

#### Scenario: Randomizing the root
- **WHEN** the user activates the randomize control in the key row
- **THEN** the root is set to one of the 12 chromatic pitch classes and
  the fretboard recomputes accordingly

### Requirement: Degrees row shows scale degrees with their notes
For families whose scale has 7 degrees, the system SHALL render a
"Degrees" row with one pill per scale degree labeled with both the
degree number and its note (e.g. `1 C`, `2 D`) plus a "None" option,
defaulting to "None". Selecting a degree pill SHALL highlight that
degree's diatonic triad on the fretboard; the row SHALL NOT render for
families whose scale does not have 7 degrees.

#### Scenario: Default state shows no highlighting
- **WHEN** the app loads with no prior selection
- **THEN** "None" is selected and no note shows the triad ring

#### Scenario: Selecting a degree pill
- **WHEN** the user selects a degree pill other than "None"
- **THEN** that degree's 3 diatonic-triad notes show the triad ring on
  the fretboard, and no others

#### Scenario: Degrees row hidden for non-7-degree families
- **WHEN** the active family's scale does not have 7 degrees (e.g.
  Pentatonic)
- **THEN** the Degrees row does not render

### Requirement: Note/Degree toggle
The system SHALL render a switch that toggles every fretboard label
between note name and scale degree. Activating it SHALL update the
fretboard display without changing the route.

#### Scenario: Toggling note/degree from the dashboard
- **WHEN** the user activates the Note/Degree switch
- **THEN** every fretboard label switches between note name and scale
  degree, without a route change
