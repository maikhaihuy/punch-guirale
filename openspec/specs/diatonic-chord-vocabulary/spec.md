# diatonic-chord-vocabulary Specification

## Purpose
Provides a static, quality-keyed lookup of common chord symbols so
that any diatonic triad quality (major, minor, diminished, augmented)
derived elsewhere — e.g. by `scale-info-table`'s Chords column — can
be displayed with real-world chord symbol suggestions, without
coupling the lookup to any specific family's or mode's interval
pattern.

## Requirements

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
