# diatonic-triad-highlighting Specification

## Purpose
Lets a learner highlight any of the 7 diatonic triads for the active
key and mode, so they can practice targeting chord tones for whichever
chord is currently sounding while soloing — not just the tonic triad.

## Requirements

### Requirement: Diatonic triad quality derivation
The system SHALL derive, for every scale degree of the current mode,
the quality (major, minor, diminished, or augmented) of the diatonic
triad built on that degree, computed from the semitone intervals
between the degree, the degree two scale-steps ahead, and the degree
four scale-steps ahead (wrapping around the 7-note scale), without a
hardcoded per-mode quality table.

#### Scenario: Root triad quality matches existing per-mode expectations
- **WHEN** the selected degree is the root (scale degree 1) of Ionian,
  Lydian, or Mixolydian
- **THEN** its triad quality is derived as major; for Dorian, Phrygian,
  or Aeolian it is derived as minor; for Locrian it is derived as
  diminished

#### Scenario: Non-root degree quality is derived, not assumed
- **WHEN** a scale degree other than the root is selected
- **THEN** its triad quality is computed from that degree's own
  interval gaps rather than assumed to match the root triad's quality

### Requirement: Degree selector
The system SHALL provide a selector covering all 7 scale degrees plus a
"None" option (the default), showing each degree as a roman numeral
whose case and suffix reflect that degree's derived triad quality
(upper-case for major, lower-case for minor, lower-case with `°` for
diminished, upper-case with `+` for augmented).

#### Scenario: Default state shows no highlighting
- **WHEN** the app loads with no prior selection
- **THEN** "None" is selected and no note shows the triad ring

#### Scenario: Selecting a degree
- **WHEN** the user selects a degree other than "None"
- **THEN** exactly that degree's 3 diatonic-triad notes show the triad
  ring, and no others

#### Scenario: Switching between degrees
- **WHEN** the user selects a different degree while one is already
  active
- **THEN** the ring moves to the newly selected degree's 3 notes and no
  longer shows on the previous selection's notes

#### Scenario: Roman numeral casing reflects quality
- **WHEN** a degree's derived quality is minor or diminished
- **THEN** its roman numeral renders lower-case (with a `°` suffix if
  diminished); **WHEN** its quality is major or augmented, it renders
  upper-case (with a `+` suffix if augmented)

### Requirement: Triad membership and visual treatment
The system SHALL determine, for the currently selected degree, the 3
degree-labels that make up its diatonic triad, and SHALL render every
in-scale note whose own degree label is in that set with a triad
outline ring — except the scale's root note, which keeps only its
existing root styling — composing with the existing dimmed and
active-press states.

#### Scenario: Triad spans all three notes uniformly
- **WHEN** a degree is selected
- **THEN** all 3 of its triad members (including that degree's own
  note, when it is not the scale root) render with the same ring
  treatment, without distinguishing which is the triad's own root,
  3rd, or 5th

#### Scenario: Scale root is never double-decorated
- **WHEN** the selected degree's triad includes the scale's root note
  (e.g. selecting the root degree itself)
- **THEN** the scale root shows only its existing root styling, not
  the triad ring

#### Scenario: Composes with dimming and mode changes
- **WHEN** a triad tone is currently dimmed by the position selector,
  or the mode changes while a degree is selected
- **THEN** the triad ring is shown at the same reduced opacity as the
  rest of that dimmed note, and updates to match the new mode's actual
  triad members and quality
