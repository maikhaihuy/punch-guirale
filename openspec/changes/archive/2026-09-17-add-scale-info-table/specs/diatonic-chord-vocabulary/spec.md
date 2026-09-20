## MODIFIED Requirements

### Requirement: Static chord vocabulary keyed by triad quality
The system SHALL expose a fixed lookup table mapping each of the four
diatonic triad qualities (major, minor, diminished, augmented) to an
ordered list of chord suffix strings built on that quality (e.g.
major → `""`, `6`, `maj7`, `add9`; minor → `m`, `m6`, `m7`, `m9`), as
static data rather than a value derived from a specific mode's own
interval pattern. The bare-major entry SHALL be the empty string,
matching standard chord-chart notation where a root note alone denotes
a major triad.

#### Scenario: Looking up chords for a major-quality degree
- **WHEN** a caller requests the chord suffix table for triad quality
  `major`
- **THEN** it receives the fixed ordered list of chord suffixes
  associated with `major` in the table (starting with the empty
  string for the bare triad), unaffected by which family, mode, or
  degree the quality came from

#### Scenario: Looking up chords for a diminished-quality degree
- **WHEN** a caller requests the chord suffix table for triad quality
  `diminished`
- **THEN** it receives the fixed ordered list of chord suffixes
  associated with `diminished` in the table

#### Scenario: Every triad quality has an entry
- **WHEN** the lookup is called with any of the four `TriadQuality`
  values (major, minor, diminished, augmented)
- **THEN** it returns a non-empty list of chord suffixes for every one
  of them, with no quality falling through to an empty or missing
  result

## ADDED Requirements

### Requirement: Rootless display label for a chord suffix
The system SHALL expose a function that converts a chord suffix into a
display label suitable for showing without an attached root note,
substituting the label `maj` for the empty-string bare-major suffix
and returning every other suffix unchanged.

#### Scenario: Bare major suffix gets a rootless label
- **WHEN** the rootless-label function is called with the empty-string
  suffix
- **THEN** it returns `maj`

#### Scenario: Non-empty suffixes pass through unchanged
- **WHEN** the rootless-label function is called with a non-empty
  suffix (e.g. `m7`, `maj7`, `dim`)
- **THEN** it returns that suffix unchanged

### Requirement: Concrete chord name from a note and a suffix
The system SHALL expose a function that concatenates a note name and a
chord suffix into a concrete chord name (e.g. note `C` and suffix `m7`
→ `Cm7`; note `C` and the empty-string suffix → `C`).

#### Scenario: Building a concrete name for a non-empty suffix
- **WHEN** the concrete-chord-name function is called with note `D`
  and suffix `m`
- **THEN** it returns `Dm`

#### Scenario: Building a concrete name for the bare major suffix
- **WHEN** the concrete-chord-name function is called with note `C`
  and the empty-string suffix
- **THEN** it returns `C`

### Requirement: Fixed chord-suffix table for Minor Pentatonic's base mode
The system SHALL expose a fixed, 5-entry, degree-position-indexed
table of chord suffixes for the Minor Pentatonic family's own base
mode (`m`, ``, `m7`, `m7`, `5` for positions 1 through 5 respectively —
a minor triad, a major triad, a minor 7th, a minor 7th, and a power
chord), as static reference data rather than a value derived from
triad-quality math (which requires a 7-degree scale to stack thirds
and so has no equivalent for a 5-degree scale).

#### Scenario: Table transposes correctly by root
- **WHEN** the table's suffixes are concatenated (via the
  concrete-chord-name function) onto a Minor Pentatonic scale's own 5
  note names for two different roots (e.g. C: `C, Eb, F, G, Bb`; D:
  `D, F, G, A, C`)
- **THEN** the resulting concrete chord names are, respectively, `Cm,
  Eb, Fm7, Gm7, Bb5` for the C-rooted scale and `Dm, F, Gm7, Am7, C5`
  for the D-rooted scale

#### Scenario: Table is scoped to the base mode only
- **WHEN** a caller looks up this table for a mode other than the
  Minor Pentatonic family's own base mode (e.g. Egyptian, Blues Minor,
  Blues Major, or the family's other rotations)
- **THEN** no equivalent table is available — this fixed table is not
  claimed to apply to those modes

### Requirement: Fixed chord-suffix table for Major Pentatonic's base mode
The system SHALL expose a fixed, 5-entry, degree-position-indexed
table of chord suffixes for the Major Pentatonic family's own base
mode (``, `m7`, `m7`, `sus4`, `m` for positions 1 through 5
respectively — a major triad, a minor 7th, a minor 7th, a sus4 chord,
and a minor triad), as static reference data rather than a value
derived from triad-quality math.

#### Scenario: Table produces the confirmed chord names for its root
- **WHEN** the table's suffixes are concatenated (via the
  concrete-chord-name function) onto a Major Pentatonic scale's own 5
  note names rooted at D (`D, E, F#, A, B`)
- **THEN** the resulting concrete chord names are `D, Em7, F#m7,
  Asus4, Bm`

#### Scenario: Table is scoped to the base mode only
- **WHEN** a caller looks up this table for a mode other than the
  Major Pentatonic family's own base mode
- **THEN** no equivalent table is available — this fixed table is not
  claimed to apply to those modes
