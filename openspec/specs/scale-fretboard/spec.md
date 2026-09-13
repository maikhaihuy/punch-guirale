# scale-fretboard Specification

## Purpose
TBD - created by archiving change baseline-milestone-1. Update Purpose after archive.
## Requirements
### Requirement: The fretboard page SHALL render any scale family from data alone
The `ScalePage` component SHALL accept a `family`, `modeId`, and optional
`variantId`, and render the fretboard using `getScaleNotes()` output. The
component SHALL NOT contain conditional logic branching on a specific family
id (e.g. no `if (family.id === 'major')`).

The system SHALL let the user select a root note from the 12 chromatic
pitch classes, defaulting to C. The system SHALL also let the user randomize
the root note to one of the 12 chromatic pitch classes.

#### Scenario: Rendering a family with multiple modes
- **WHEN** `ScalePage` is given a family with `modes.length > 1`
- **THEN** it displays a mode selector populated from `family.modes` and
  renders the fretboard for the selected mode

#### Scenario: Rendering a family with a single mode
- **WHEN** `ScalePage` is given a family with `modes.length === 1`
- **THEN** it renders the fretboard for that mode and does not display a
  mode selector

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

### Requirement: The fretboard page SHALL render variant toggles from data
The `ScalePage` component SHALL display a toggle control for each entry in
`family.variants`, and SHALL display no variant controls when `variants` is
absent or empty. `variantId` is sourced from the `variant` URL query
parameter (see `scale-family-routing`), not local component state — toggling
the control updates the URL, and the component re-renders from the new
`variantId` prop rather than owning its own on/off state.

#### Scenario: Family with a variant (Minor Pentatonic + Blues)
- **WHEN** `ScalePage` is given the Minor Pentatonic family with its `blue`
  variant and the user enables the toggle
- **THEN** the fretboard adds the highlighted note returned by
  `getScaleNotes(..., variantId: 'blue')` without altering the base 5-note
  display when the toggle is off

#### Scenario: Family without any variant (Major)
- **WHEN** `ScalePage` is given the Major family
- **THEN** no variant toggle is rendered

### Requirement: Fretboard rendering
The system SHALL render a 6-string, 24-fret (1–24) fretboard as SVG,
with one note dot per string/fret position that is in the current
scale. Fret 0 (the open string) SHALL NOT be rendered as a numbered
fret dot. Positions not in the current scale SHALL NOT be rendered. The
root note SHALL be visually distinguished (filled) from other in-scale
notes (outlined).

#### Scenario: Only in-scale notes shown
- **WHEN** the fretboard is rendered for a given root and mode
- **THEN** only positions whose note is a member of that scale show a
  dot, within frets 1 through 24

#### Scenario: Root note is visually distinct
- **WHEN** the fretboard is rendered
- **THEN** every dot whose note equals the selected root is rendered
  filled, and every other in-scale dot is rendered outlined

#### Scenario: Fret 0 is never rendered as a fret dot
- **WHEN** the fretboard is rendered for any root note and mode
- **THEN** no note dot appears at fret 0, and the fretboard grid begins
  at fret 1

### Requirement: Open string remains playable via the string label
The system SHALL let the user play a string's open (fret 0) note by
activating that string's name label at the fretboard's left edge, when
the open string's note is a member of the current scale. Activating the
label for a string whose open note is not in the current scale SHALL
NOT play a sound.

#### Scenario: Playing an in-scale open string
- **WHEN** the user activates a string's name label and that string's
  open note is in the current scale
- **THEN** the open string's note is played, the same as clicking any
  other in-scale note dot

#### Scenario: Open string not in scale
- **WHEN** the user activates a string's name label and that string's
  open note is not in the current scale
- **THEN** no sound plays

### Requirement: Note/degree label toggle
The system SHALL let the user toggle every fretboard dot's label between
the note name (e.g. "C") and the scale degree relative to the root
(e.g. "b3"), without altering which positions are shown.

#### Scenario: Toggling to degree view
- **WHEN** the user switches the display mode from notes to degrees
- **THEN** every visible dot's label changes from its note name to its
  scale degree, and no dots appear or disappear

