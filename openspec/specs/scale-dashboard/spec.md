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
pills, the system SHALL render a whole/half-step indicator reflecting
the interval from the earlier degree to the later one, for every family
regardless of degree count: `H` for a 1-semitone gap, `W` for a
2-semitone gap, and the semitone count itself for any larger gap (e.g.
`3` for a minor third). No indicator SHALL render after the last pill.

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

#### Scenario: W/H indicator for a 7-degree family
- **WHEN** the Degrees row renders for a 7-degree family/mode
- **THEN** a `W` or `H` indicator appears between each pair of
  adjacent degree pills, matching the whole/half-step gap from the
  earlier degree to the later one

#### Scenario: Gap indicator for a non-7-degree family
- **WHEN** the Degrees row renders for a non-7-degree family/mode (e.g.
  Minor Pentatonic rooted at A: `A C D E G`)
- **THEN** the indicators between adjacent pills read `3`, `W`, `W`,
  `3`, matching the semitone gaps `3, 2, 2, 3`, with none after the
  last pill

### Requirement: Note/Degree toggle
The system SHALL render a switch that toggles every fretboard label
between note name and scale degree. Activating it SHALL update the
fretboard display without changing the route.

The switch SHALL share a single row with the Degrees row at a viewport
width of 768px or more, the Degrees row taking the larger share of the
row's width (8 parts of 10) and the switch the small remainder (2
parts of 10), right of the Degrees row. The degree pills SHALL grow to
fill the Degrees row's whole share, so no unused space is left between
the last pill and the switch's column; where the pills wrap onto more
than one line, each line SHALL fill the share. The switch and its "Note" and
"Degree" labels SHALL always render in full, never truncated or clipped,
however narrow that remainder is. Below 768px the switch SHALL instead
sit on its own line beneath the Degrees row.

#### Scenario: Toggling note/degree from the dashboard
- **WHEN** the user activates the Note/Degree switch
- **THEN** every fretboard label switches between note name and scale
  degree, without a route change

#### Scenario: Degrees row gets most of the width on a wide viewport
- **WHEN** the dashboard renders at a viewport width of 768px or more
- **THEN** the Degrees row and the Note/Degree switch appear on one row,
  split 8:2 with the Degrees row taking the larger share, the degree
  pills spread across that whole share, and the switch's labels fully
  visible

#### Scenario: Switch drops below the Degrees row on a narrow viewport
- **WHEN** the dashboard renders at a viewport width below 768px
- **THEN** the Note/Degree switch appears on its own line beneath the
  Degrees row, and the Degrees row uses the full width

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
  randomize hub

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
center randomize hub.

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
  scale-membership dimming, and center randomize hub, with no degree
  label shown

### Requirement: Wheel joins in-scale notes into a closed polygon
The system SHALL draw, on the scale wheel, a closed polygon with one
vertex per in-scale pitch class, taken in ascending scale order, with a
straight edge from each vertex to the next and from the last back to the
first, so that every vertex is joined directly to the next by an edge.
Each vertex SHALL lie on its note's circle at the point facing the
wheel's center, so the polygon touches each in-scale note and lies inside
the ring of notes. The polygon SHALL have only straight edges, SHALL have
a vertex only at in-scale pitch classes (a dimmed, out-of-scale pitch
class SHALL have no vertex or edge to or from it), SHALL carry no label,
and SHALL NOT cover a note's name or degree label or intercept clicks or
taps meant for a note or the center hub. This SHALL apply to every family
regardless of degree count, and SHALL remain when the wheel is below the
size at which degree labels are hidden.

#### Scenario: A pentatonic scale draws a closed five-sided polygon
- **WHEN** the scale wheel is rendered for Minor Pentatonic rooted at A
  (`A C D E G`)
- **THEN** the polygon has 5 vertices, one on each of A, C, D, E, and G,
  joined by straight edges A–C, C–D, D–E, E–G, and G–A, with no vertex or
  edge on any other pitch class

#### Scenario: Vertices are joined to each other
- **WHEN** the polygon is drawn for any scale
- **THEN** every vertex is the end of exactly two edges, each running
  straight to the neighboring vertex, so the shape is closed with no
  loose end at any note

#### Scenario: The polygon follows the active root and mode
- **WHEN** the root or mode changes
- **THEN** the polygon is redrawn with vertices only on the new in-scale
  pitch classes

#### Scenario: The polygon does not obscure or block a note
- **WHEN** the user taps a pitch class or the center hub, or reads a
  note's name or degree label
- **THEN** the label is fully visible and the tap acts on the pitch class
  or hub, not on the polygon

#### Scenario: The polygon remains at small sizes
- **WHEN** the wheel's width is below the minimum at which degree labels
  are shown
- **THEN** the polygon is still drawn
