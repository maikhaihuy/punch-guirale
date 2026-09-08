# note-interaction-states Specification

## Purpose
TBD - created by syncing change note-interaction-states. Update Purpose
after archive.

## Requirements

### Requirement: Note active-press visual state
The system SHALL visually distinguish a fretboard note that is currently
pressed (mouse down or touch active) from one at rest, independent of
that note's root/regular identity and independent of whether it is
currently dimmed by the position selector.

#### Scenario: Pressing a note shows the active state
- **WHEN** the user presses (mouse down or touch down) a rendered
  fretboard note
- **THEN** that note's visible dot immediately shows the active-state
  styling (enlarged, glowing)

#### Scenario: Releasing a note clears the active state
- **WHEN** the user releases or drags off a pressed note
- **THEN** that note's visible dot returns to its resting styling

#### Scenario: Active state combines with root identity
- **WHEN** the user presses a note that is the mode's root
- **THEN** the note shows both its root styling and the active-state
  styling at the same time, without either replacing the other

#### Scenario: Active state combines with position dimming
- **WHEN** the user presses a note that is currently dimmed because a
  position other than "All" is selected
- **THEN** the note shows the active-state styling at the same reduced
  opacity as its dimmed state, rather than becoming fully opaque or
  losing the active styling

### Requirement: Active state driven by pointer events, not CSS hover
The system SHALL derive the active-press state from pointer event
handlers (press/release/leave) rather than the CSS `:hover` pseudo-class,
so behavior is consistent between mouse and touch input.

#### Scenario: Touch input does not stick in a hover-like state
- **WHEN** the user taps a note on a touch device and then taps elsewhere
  on the screen
- **THEN** the first note's active-state styling is cleared and does not
  remain visually "stuck" active

### Requirement: Active state coincides with playback trigger
The system SHALL trigger the active-press visual state on the same
pointer-down interaction that triggers the note's audio playback, so the
visual and audible response occur together.

#### Scenario: Visual and audio feedback land together
- **WHEN** the user presses a playable note
- **THEN** the active-state styling appears and the note's audio begins
  as part of the same interaction, not on separate or delayed triggers
