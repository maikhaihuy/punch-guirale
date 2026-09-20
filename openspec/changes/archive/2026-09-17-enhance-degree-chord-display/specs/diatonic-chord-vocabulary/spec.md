## ADDED Requirements

### Requirement: Static chord vocabulary keyed by triad quality
The system SHALL expose a fixed lookup table mapping each of the four
diatonic triad qualities (major, minor, diminished, augmented) to an
ordered list of common chord symbol strings built on that quality
(e.g. major → `maj`, `maj7`; minor → `m`, `m7`), as static data rather
than a value derived from a specific mode's own interval pattern.

#### Scenario: Looking up chords for a major-quality degree
- **WHEN** a caller requests the chord vocabulary for triad quality
  `major`
- **THEN** it receives the fixed ordered list of chord symbols
  associated with `major` in the table, unaffected by which family,
  mode, or degree the quality came from

#### Scenario: Looking up chords for a diminished-quality degree
- **WHEN** a caller requests the chord vocabulary for triad quality
  `diminished`
- **THEN** it receives the fixed ordered list of chord symbols
  associated with `diminished` in the table

#### Scenario: Every triad quality has an entry
- **WHEN** the lookup is called with any of the four `TriadQuality`
  values (major, minor, diminished, augmented)
- **THEN** it returns a non-empty list of chord symbols for every one
  of them, with no quality falling through to an empty or missing
  result
