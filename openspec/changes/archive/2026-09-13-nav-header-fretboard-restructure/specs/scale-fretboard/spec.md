## MODIFIED Requirements

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
