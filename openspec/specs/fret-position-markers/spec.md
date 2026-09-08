# fret-position-markers Specification

## Purpose

Gives the fretboard the same at-a-glance wayfinding dots a real guitar
neck has, independent of the current scale/root selection, so players
can orient themselves on the neck the same way they would on their
instrument.

## Requirements

### Requirement: Standard single fret-position markers
The system SHALL render a single inlay marker at frets 3, 5, 7, 9, 15,
17, 19, and 21, positioned on the fretboard independent of the current
root note, mode, or selected position.

#### Scenario: Single markers render regardless of scale selection
- **WHEN** the fretboard is rendered for any root note and mode
- **THEN** a single inlay marker appears at frets 3, 5, 7, 9, 15, 17, 19,
  and 21, and at no other fret except 12 and 24

### Requirement: Double fret-position markers at the octave frets
The system SHALL render two inlay markers (a double marker) at frets 12
and 24, distinguishing them from the single markers at the other marked
frets.

#### Scenario: Double markers render at the octave positions
- **WHEN** the fretboard is rendered
- **THEN** frets 12 and 24 each show two inlay markers rather than one,
  visually distinct from the single-marker frets

### Requirement: Fret markers do not obscure or alter note rendering
The system SHALL render fret-position markers as a visual layer
independent of scale-note dots, and SHALL NOT change which notes are
shown, their positions, or their labels.

#### Scenario: Markers coexist with note dots at the same fret
- **WHEN** an in-scale note dot is rendered at a fret that also has an
  inlay marker
- **THEN** both the marker and the note dot are visible, and the note
  dot's position, label, and styling are unaffected by the marker
