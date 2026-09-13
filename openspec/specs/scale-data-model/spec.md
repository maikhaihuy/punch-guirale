# scale-data-model Specification

## Purpose
TBD - created by archiving change restructure-scale-family-schema. Update Purpose after archive.

## Requirements
### Requirement: Scale data SHALL be defined as reusable Family/Mode/Variant records
The system SHALL represent every scale as a `ScaleFamily` record containing
an interval pattern, a list of modes (rotations), and an optional list of
variants (inserted notes), rather than as family-specific hardcoded logic.

#### Scenario: Adding a new diatonic family requires no code change
- **WHEN** a developer adds a new 7-note `ScaleFamily` data record (e.g.
  Harmonic Minor) with its interval pattern and 7 modes
- **THEN** the family is selectable and renders correctly on the fretboard
  without modifying `getScaleNotes`, the mode selector, or the page component

#### Scenario: Adding a non-7-mode family requires no code change
- **WHEN** a developer adds a `ScaleFamily` record with `degreeCount: 5` and
  5 modes (e.g. Major Pentatonic)
- **THEN** the family renders with a 5-option mode selector automatically,
  without any conditional logic keyed on the family id

### Requirement: A single pure function SHALL compute scale notes for any family
The system SHALL expose `getScaleNotes(rootMidi, family, modeId, variantId?)`
as the sole function that converts a family/mode/variant selection into a
MIDI note list. No other module SHALL perform interval arithmetic.

#### Scenario: Computing notes for a diatonic mode
- **WHEN** `getScaleNotes` is called with the Major family, root C4, and
  mode `dorian`
- **THEN** it returns the MIDI notes for D Dorian-equivalent scale degrees
  built from C4 (i.e. the major intervals rotated to start at the 2nd degree)

#### Scenario: Computing notes with a variant applied
- **WHEN** `getScaleNotes` is called with the Minor Pentatonic family, a
  root note, mode `minor-pentatonic`, and variant `blue`
- **THEN** the returned note list includes the standard 5 pentatonic notes
  plus one inserted note at the interval defined by the `blue` variant
  (b5 relative to root)

#### Scenario: Computing notes without a variant
- **WHEN** `getScaleNotes` is called for the same family/mode with no
  `variantId` argument
- **THEN** the returned note list contains exactly the base scale notes with
  no inserted note

### Requirement: Existing Major scale data SHALL be migrated without behavior change
The system SHALL express the Major family and its 7 modes using the new
schema, and existing Milestone 1/2 features (fretboard render, Note/Degree
toggle, triad highlight, pitch-echo) SHALL continue to function identically
against the migrated data.

#### Scenario: Major scale renders identically after migration
- **WHEN** a user selects the Major family and any of its 7 modes after the
  schema migration
- **THEN** the displayed fretboard notes are identical to the notes shown
  before the migration for the same keynote/mode selection
