## MODIFIED Requirements

### Requirement: Key row hosts root note selection
The system SHALL render a circular scale wheel for root/key selection,
with 12 slices arranged around the circle — one per chromatic pitch
class — all 12 always rendered. The wheel's center SHALL act as the
play/stop control for scale playback (per the `scale-playback`
capability), visually distinct from the individual pitch-class wedges; it
SHALL NOT change the root. Selecting a pitch class on the wheel SHALL
update the fretboard without navigating to a new route. Randomizing the
root is provided by the bottom bar (per the `root-randomizer` capability),
not by the wheel.

#### Scenario: Selecting a root note
- **WHEN** the user selects a pitch class on the dashboard's scale wheel
- **THEN** the fretboard recomputes for the new root, without a route
  change

#### Scenario: The wheel's center does not randomize the root
- **WHEN** the user activates the scale wheel's center control
- **THEN** the root is unchanged and scale playback toggles

### Requirement: Wheel shows chromatic degree labels
The system SHALL render, next to every one of the wheel's 12 pitch
classes, that pitch class's chromatic degree label relative to the root
(e.g. `1`, `4`, `5`), regardless of family or scale membership, rather
than a scale-relative ordinal (`1`, `2`, `3`...) that renumbers
differently per family. For the 5 pitch classes reached from the root by
a minor 2nd, minor 3rd, tritone, minor 6th, or minor 7th, the label SHALL
show both enharmonic degree names (`b2`/`#1`, `b3`/`#2`, `b5`/`#4`,
`b6`/`#5`, `b7`/`#6`); the other 7 pitch classes SHALL show a single
name. The wheel SHALL NOT render roman numerals, chord symbols, or
whole/half-step labels; that information is provided by the Degrees row
and the scale info table.

#### Scenario: Every pitch class shows a chromatic degree label
- **WHEN** the scale wheel is rendered for any root, family, and mode
- **THEN** all 12 pitch classes are labeled with their chromatic degree
  relative to the root, whether or not they are members of the current
  scale, using the same degree label regardless of which family or mode
  is active

#### Scenario: Accidental pitch classes show both enharmonic names
- **WHEN** the scale wheel is rendered for any root
- **THEN** the 5 pitch classes at a minor 2nd, minor 3rd, tritone, minor
  6th, or minor 7th from the root each show both their flat-side and
  sharp-side degree names

#### Scenario: The wheel has no inner ring
- **WHEN** the scale wheel is rendered for any family, including a
  7-degree family (e.g. Major) and a non-7-degree family (e.g.
  Pentatonic)
- **THEN** it shows no roman numeral, no chord symbol, no arc, and no
  whole/half-step label anywhere on the wheel — only the note ring
  (each note with its chromatic degree label), the polygon joining
  in-scale notes, scale-membership dimming, and the center
  play/stop control

### Requirement: Wheel scales fluidly with available width
The system SHALL size the scale wheel continuously to the width available
to its container, the way the fretboard already scales its own rendered
width, instead of snapping between a fixed set of breakpoint widths.
Above a minimum rendered size, the wheel's note and chromatic degree
label SHALL stay legible across that range, growing as large as needed
to keep them legible. Below that minimum rendered size, rather than
shrinking that content past legibility, the system SHALL hide the
chromatic degree labels and render only each note's name, the
polygon joining in-scale notes, scale-membership dimming, and the
center play/stop control.

#### Scenario: Wheel resizes continuously with its container
- **WHEN** the dashboard's available width changes (e.g. window resize,
  orientation change)
- **THEN** the scale wheel's rendered diameter scales continuously to
  match, with no fixed-width snap points

#### Scenario: Wheel grows to keep its labels legible
- **WHEN** the wheel's rendered size is at or above its minimum
- **THEN** the wheel's rendered size is large enough for every note name
  and chromatic degree label to stay legible, rather than clipping or
  overlapping content to stay within a fixed compact size

#### Scenario: Wheel drops its degree labels below the minimum size
- **WHEN** the wheel's available width falls below the minimum size
  needed for its degree labels to stay legible
- **THEN** the wheel renders only its note names, joining polygon,
  scale-membership dimming, and center play/stop control, with no degree
  label shown
