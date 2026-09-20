## MODIFIED Requirements

### Requirement: Key row hosts root note selection
The system SHALL render a circular scale wheel for root/key selection,
with 12 slices arranged around the circle — one per chromatic pitch
class — all 12 always rendered. The wheel's center SHALL act as the
randomize control, visually distinct from the individual pitch-class
wedges. Selecting a pitch class on the wheel or activating the center
randomize control SHALL update the fretboard without navigating to a new
route.

#### Scenario: Selecting a root note
- **WHEN** the user selects a pitch class on the dashboard's scale wheel
- **THEN** the fretboard recomputes for the new root, without a route
  change

#### Scenario: Randomizing the root from the wheel's center
- **WHEN** the user activates the scale wheel's center hub
- **THEN** the root is set to one of the 12 chromatic pitch classes and
  the fretboard recomputes accordingly

## ADDED Requirements

### Requirement: Wheel shows chromatic degree labels and chord symbols
The system SHALL render, next to every one of the wheel's 12 pitch
classes, that pitch class's chromatic degree label relative to the root
(e.g. `1`, `4`, `5`), regardless of family or scale membership, rather
than a scale-relative ordinal (`1`, `2`, `3`...) that renumbers
differently per family. For the 5 pitch classes reached from the root by
a minor 2nd, minor 3rd, tritone, minor 6th, or minor 7th, the label SHALL
show both enharmonic degree names (`b2`/`#1`, `b3`/`#2`, `b5`/`#4`,
`b6`/`#5`, `b7`/`#6`); the other 7 pitch classes SHALL show a single
name. For each in-scale pitch class, the system SHALL additionally render
a roman-numeral label: for families whose scale has 7 degrees, this SHALL
be the diatonic triad's roman numeral together with its chord symbol
(e.g. `ii` / `Dm`); for families whose scale does not have 7 degrees,
this SHALL instead be an illustrative roman numeral reflecting only the
degree's scale position (e.g. `bIII`), with no chord symbol and no
upper/lower-case quality distinction, since real triad quality does not
generalize to a non-7-degree stack.

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

#### Scenario: 7-degree family shows diatonic roman numeral and chord symbol
- **WHEN** the active family's scale has 7 degrees (e.g. Major, Harmonic
  Minor)
- **THEN** each in-scale pitch class on the wheel is labeled with both
  its diatonic triad roman numeral and its chord symbol

#### Scenario: Non-7-degree family shows an illustrative roman numeral without a chord symbol
- **WHEN** the active family's scale does not have 7 degrees (e.g.
  Pentatonic)
- **THEN** each in-scale pitch class on the wheel is labeled with an
  illustrative roman numeral matching its scale position, and no chord
  symbol is shown for any pitch class

### Requirement: Wheel shows whole/half-step relationships between in-scale notes
The system SHALL render, between each pair of consecutive in-scale pitch
classes on the wheel, a label indicating the interval between them: `H`
for a 1-semitone gap, `W` for a 2-semitone gap, and the semitone count for
any larger gap. This SHALL render for any family, including those whose
scale does not have 7 degrees.

#### Scenario: Diatonic family shows whole/half-step labels
- **WHEN** the scale wheel is rendered for a 7-degree family (e.g. Major)
- **THEN** each pair of consecutive in-scale pitch classes is connected by
  an arc labeled `H` or `W` matching the interval between them

#### Scenario: Pentatonic family shows a semitone-count label for larger gaps
- **WHEN** the scale wheel is rendered for a 5-degree family (e.g. Minor
  Pentatonic)
- **THEN** each pair of consecutive in-scale pitch classes is connected by
  an arc labeled `H`, `W`, or the semitone count, matching the actual gap
  between them

### Requirement: Wheel scales fluidly with available width
The system SHALL size the scale wheel continuously to the width available
to its container, the way the fretboard already scales its own rendered
width, instead of snapping between a fixed set of breakpoint widths.
Above a minimum rendered size, the wheel's rings SHALL stay legible
across that range, growing as large as needed to keep its note, degree,
whole/half-step, and roman-numeral (real or illustrative, plus chord
symbol for 7-degree families) content legible, even beyond the compact
footprint `add-circular-scale-wheel` originally shipped. Below that
minimum rendered size, rather than shrinking that content past
legibility, the system SHALL hide the degree, whole/half-step, and
roman-numeral/chord-symbol rings and render only the outer note ring,
scale-membership dimming, and center randomize hub — the same detail
level `add-circular-scale-wheel` originally shipped.

#### Scenario: Wheel resizes continuously with its container
- **WHEN** the dashboard's available width changes (e.g. window resize,
  orientation change)
- **THEN** the scale wheel's rendered diameter scales continuously to
  match, with no fixed-width snap points

#### Scenario: Wheel grows to keep its rings legible
- **WHEN** the wheel's rendered size is at or above its minimum, showing
  its full set of rings for a 7-degree family (note, universal degree,
  whole/half-step arcs, and roman-numeral/chord-symbol)
- **THEN** the wheel's rendered size is large enough for every ring's
  labels to stay legible, rather than clipping or overlapping content to
  stay within a fixed compact size

#### Scenario: Wheel drops its enrichment rings below the minimum size
- **WHEN** the wheel's available width falls below the minimum size
  needed for its degree, whole/half-step, and roman-numeral/chord-symbol
  rings to stay legible
- **THEN** the wheel renders only its outer note ring, scale-membership
  dimming, and center randomize hub, with no degree label, whole/half-
  step arc, roman numeral, or chord symbol shown
