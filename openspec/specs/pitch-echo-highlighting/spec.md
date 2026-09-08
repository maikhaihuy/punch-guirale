# pitch-echo-highlighting Specification

## Purpose

Lets a player see every other place a note's pitch occurs on the neck by
hovering or touching any one occurrence of it, so they can connect a note
they're focused on to its other positions across strings and octaves.

## Requirements

### Requirement: Hovering or touching a note highlights same-pitch-class notes
The system SHALL, when the user hovers (mouse) or touches (touch) an
in-scale fretboard note, visually highlight every other in-scale note on
the fretboard that shares the same pitch class (same letter name, any
octave or fret), using a visual treatment distinct from the note actually
under the pointer.

#### Scenario: Hovering a note echoes its pitch class elsewhere
- **WHEN** the user hovers an in-scale note with a mouse
- **THEN** every other rendered in-scale note sharing that note's letter
  name shows the echo highlight, and the hovered note itself continues to
  show its own interacted-state styling rather than the echo styling

#### Scenario: Touching a note echoes its pitch class elsewhere
- **WHEN** the user touches an in-scale note on a touch device
- **THEN** every other rendered in-scale note sharing that note's letter
  name shows the echo highlight for the duration of the touch

#### Scenario: Root notes echo across all their instances
- **WHEN** the user hovers or touches a note that is the mode's root
- **THEN** every other root-note instance on the fretboard shows the echo
  highlight, layered on top of its existing root styling

### Requirement: Echo highlight is visually distinct from the active-press state
The system SHALL render the echo highlight on other same-pitch-class notes
using a different visual treatment than the active-press state applied to
the note directly under the pointer, so a player can distinguish "the note
I'm touching" from "notes that share its pitch."

#### Scenario: Interacted note and echoed notes look different
- **WHEN** the user hovers or touches a note that has other same-pitch-class
  matches elsewhere on the fretboard
- **THEN** the interacted note shows the existing active/hover styling
  while the other matching notes show the distinct echo styling, never the
  same styling as each other

### Requirement: Echo highlight composes with position dimming
The system SHALL render the echo highlight on a note that is currently
dimmed by the position selector at that note's existing reduced opacity,
rather than suppressing the echo or forcing the note to full opacity.

#### Scenario: An echoed note outside the selected position stays dimmed
- **WHEN** the user hovers or touches a note while a position other than
  "All" is selected, and a same-pitch-class match falls outside that
  position's dimmed range
- **THEN** the matching note shows the echo highlight at the same reduced
  opacity used for its dimmed state

### Requirement: Touch input does not leave a stuck echo highlight
The system SHALL clear the echo highlight when a touch interaction ends
(release, cancel, or leave), and SHALL NOT rely on a persistent hover
state for touch input, so no note remains visually echoed after the user
has stopped touching it.

#### Scenario: Releasing a touched note clears the echo
- **WHEN** the user lifts their finger off a touched note
- **THEN** the echo highlight on all other same-pitch-class notes clears
  immediately

#### Scenario: Mouse hover does not trigger playback
- **WHEN** the user hovers an in-scale note with a mouse without clicking
- **THEN** the echo highlight appears on matching notes but no audio
  plays, distinguishing hover from the click-to-play interaction
