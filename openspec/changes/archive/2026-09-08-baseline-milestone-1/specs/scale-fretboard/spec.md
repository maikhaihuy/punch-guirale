## ADDED Requirements

### Requirement: Root note and mode selection
The system SHALL let the user select a root note from the 12 chromatic
pitch classes and a mode from the 7 diatonic modes (Ionian, Dorian,
Phrygian, Lydian, Mixolydian, Aeolian, Locrian), defaulting to C Ionian.
The system SHALL also let the user randomize the root note to one of the
12 chromatic pitch classes.

#### Scenario: Default selection on load
- **WHEN** the app loads with no prior selection
- **THEN** the root note is C and the mode is Ionian

#### Scenario: Selecting a root note
- **WHEN** the user picks a different root note
- **THEN** the fretboard recomputes to show the scale for the new root
  and the same mode

#### Scenario: Selecting a mode
- **WHEN** the user picks a different mode tab
- **THEN** the fretboard recomputes to show the scale for the same root
  and the new mode

#### Scenario: Randomizing the root note
- **WHEN** the user activates the randomize control
- **THEN** the root note is set to one of the 12 chromatic pitch classes
  and the fretboard recomputes accordingly

### Requirement: Fretboard rendering
The system SHALL render a 6-string, 25-fret (0–24) fretboard as SVG, with
one note dot per string/fret position that is in the current scale.
Positions not in the current scale SHALL NOT be rendered. The root note
SHALL be visually distinguished (filled) from other in-scale notes
(outlined).

#### Scenario: Only in-scale notes shown
- **WHEN** the fretboard is rendered for a given root and mode
- **THEN** only positions whose note is a member of that scale show a dot

#### Scenario: Root note is visually distinct
- **WHEN** the fretboard is rendered
- **THEN** every dot whose note equals the selected root is rendered
  filled, and every other in-scale dot is rendered outlined

### Requirement: Note/degree label toggle
The system SHALL let the user toggle every fretboard dot's label between
the note name (e.g. "C") and the scale degree relative to the root
(e.g. "b3"), without altering which positions are shown.

#### Scenario: Toggling to degree view
- **WHEN** the user switches the display mode from notes to degrees
- **THEN** every visible dot's label changes from its note name to its
  scale degree, and no dots appear or disappear
