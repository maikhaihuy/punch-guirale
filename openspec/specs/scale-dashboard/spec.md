# scale-dashboard Specification

## Purpose

Surfaces root/key selection, the current scale's degrees paired with
their notes (doubling as the degree-highlight control), and the
note/degree display toggle as a compact, page-local dashboard whose
state changes without navigating, separate from the route-driving
family/mode navigation.
## Requirements
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

### Requirement: Degrees row shows scale degrees with their notes
The system SHALL render a "Degrees" row with one pill per scale degree
plus a "None" option, defaulting to "None", for every family
regardless of degree count. Every degree pill, for every family, SHALL
be labeled with that degree's scale-formula degree label (e.g. `1`,
`♭3`, `5`) and that degree's note name — the same base labeling
convention regardless of degree count. For families whose scale has 7
degrees, each pill SHALL additionally show that degree's roman numeral
(case and suffix reflecting its derived triad quality); this roman
numeral SHALL NOT render for other degree counts, since tertian triads
need 7 degrees to stack thirds. Between each pair of adjacent degree
pills, the system SHALL render a whole/half-step (`W`/`H`) indicator
reflecting the interval from the earlier degree to the later one, for
families whose scale has 7 degrees only (undefined for other degree
counts — see `degree-highlighting`'s scoping).

Selecting a degree pill SHALL highlight that degree's note on the
fretboard, per the `degree-highlighting` capability, identically for
every family.

#### Scenario: Default state shows no highlighting
- **WHEN** the app loads with no prior selection
- **THEN** "None" is selected and no note shows the degree-highlight
  ring

#### Scenario: Selecting a degree pill
- **WHEN** the user selects a degree pill other than "None"
- **THEN** every note on the fretboard sharing that degree's formula
  label shows the degree-highlight ring, and no others

#### Scenario: Degree pill shows formula and note for every family
- **WHEN** the Degrees row renders for a 7-degree family (e.g. Major)
  versus a non-7-degree family (e.g. Pentatonic, Blue)
- **THEN** every pill in both cases is labeled with its degree's
  scale-formula label and note name (e.g. `1`/`C`, `♭3`/`D♯`, `4`/`F`,
  `♭5`/`F♯`, `5`/`G`, `♭7`/`A♯` for a Blues Minor pill set)

#### Scenario: 7-degree families additionally show a roman numeral
- **WHEN** the Degrees row renders for a 7-degree family/mode
- **THEN** each pill additionally shows that degree's quality-cased
  roman numeral beneath its formula label and note name; no other
  degree count shows a roman numeral

#### Scenario: W/H indicator only for 7-degree families
- **WHEN** the Degrees row renders for a 7-degree family/mode
- **THEN** a `W` or `H` indicator appears between each pair of
  adjacent degree pills, matching the whole/half-step gap from the
  earlier degree to the later one; this indicator does not render for
  non-7-degree families

### Requirement: Note/Degree toggle
The system SHALL render a switch that toggles every fretboard label
between note name and scale degree. Activating it SHALL update the
fretboard display without changing the route.

#### Scenario: Toggling note/degree from the dashboard
- **WHEN** the user activates the Note/Degree switch
- **THEN** every fretboard label switches between note name and scale
  degree, without a route change

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

### Requirement: Wheel shows degree info for every family
The system SHALL render, next to each in-scale pitch class on the
scale wheel, that degree's scale-formula degree label, for every
family regardless of degree count. For families whose scale has 7
degrees, the system SHALL additionally render that degree's diatonic
triad roman numeral next to the degree label; this roman numeral SHALL
NOT render for other degree counts.

#### Scenario: Degree label renders for any family
- **WHEN** the active family's scale has 7 degrees (e.g. Major) or
  does not (e.g. Pentatonic, Blue)
- **THEN** each in-scale pitch class on the wheel is labeled with its
  scale-degree label in both cases, with no family rendering a blank
  or reduced label

#### Scenario: Roman numeral renders only for 7-degree families
- **WHEN** the active family's scale has 7 degrees (e.g. Major,
  Harmonic Minor, Melodic Minor)
- **THEN** each in-scale pitch class is additionally labeled with its
  diatonic triad roman numeral; for a non-7-degree family (e.g.
  Pentatonic, Blue) no roman numeral renders for any pitch class

