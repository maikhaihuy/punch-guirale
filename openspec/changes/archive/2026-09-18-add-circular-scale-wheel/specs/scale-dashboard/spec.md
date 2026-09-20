## MODIFIED Requirements

### Requirement: Key row hosts root note selection
The system SHALL render a circular scale wheel for root/key selection,
with 12 slices arranged around the circle — one per chromatic pitch
class — all 12 always rendered, plus a control to randomize the root,
visually distinct from the individual pitch-class controls. Selecting a
pitch class on the wheel or activating randomize SHALL update the
fretboard without navigating to a new route.

#### Scenario: Selecting a root note
- **WHEN** the user selects a pitch class on the dashboard's scale wheel
- **THEN** the fretboard recomputes for the new root, without a route
  change

#### Scenario: Randomizing the root
- **WHEN** the user activates the randomize control next to the scale
  wheel
- **THEN** the root is set to one of the 12 chromatic pitch classes and
  the fretboard recomputes accordingly

## ADDED Requirements

### Requirement: Wheel indicates scale membership by dimming
The system SHALL visually distinguish, on the scale wheel, which of the
12 pitch classes are members of the current scale/mode from those that
are not, using reduced opacity for non-member pitch classes rather than
hiding them. Non-member pitch classes SHALL remain clickable and SHALL
set the root the same as member pitch classes. The root pitch class
SHALL be visually distinguished from other scale-member pitch classes.

#### Scenario: In-scale notes render fully visible
- **WHEN** the scale wheel is rendered for a given root, family, and mode
- **THEN** every pitch class that is a member of the resulting scale
  renders at full visibility

#### Scenario: Out-of-scale notes are dimmed but not hidden
- **WHEN** the scale wheel is rendered for a given root, family, and mode
- **THEN** every pitch class that is not a member of the resulting scale
  renders at reduced opacity and remains present on the wheel

#### Scenario: Selecting a dimmed, out-of-scale note
- **WHEN** the user selects a pitch class that is currently dimmed
  (not a member of the current scale)
- **THEN** that pitch class becomes the new root and the wheel
  recomputes scale membership around it, without a route change

#### Scenario: Root note is visually distinct
- **WHEN** the scale wheel is rendered
- **THEN** the pitch class equal to the current root renders with a
  distinct visual treatment from every other in-scale pitch class

### Requirement: Wheel shows degree and triad info for 7-degree families
For families whose scale has 7 degrees, the system SHALL render, next to
each in-scale pitch class on the scale wheel, that degree's scale-degree
label and diatonic triad roman numeral. This degree/triad info SHALL NOT
render for families whose scale does not have 7 degrees.

#### Scenario: 7-degree family shows degree and roman numeral
- **WHEN** the active family's scale has 7 degrees (e.g. Major, Harmonic
  Minor, Melodic Minor)
- **THEN** each in-scale pitch class on the wheel is labeled with its
  scale-degree label and diatonic triad roman numeral

#### Scenario: Non-7-degree family hides degree/triad info
- **WHEN** the active family's scale does not have 7 degrees (e.g.
  Pentatonic)
- **THEN** the scale wheel renders no degree label or roman numeral for
  any pitch class
