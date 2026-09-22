# scale-data-model Specification

## Purpose
TBD - created by archiving change restructure-scale-family-schema. Update Purpose after archive.

## Requirements
### Requirement: Scale data SHALL be defined as reusable Family/Mode/Variant records
The system SHALL represent every scale as a `ScaleFamily` record containing
an interval pattern, a list of modes, and an optional list of variants
(inserted notes), rather than as family-specific hardcoded logic. A mode
SHALL by default be a rotation of its family's interval pattern, but MAY
instead own a complete interval pattern of its own — see "A mode MAY own a
complete interval pattern instead of rotating its family's pattern" — for
the rare case where a family groups modes that are not equal-length
rotations of one another.

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

#### Scenario: Adding a family with a mode that owns its own interval pattern requires no code change
- **WHEN** a developer adds the `blue` `ScaleFamily` record, whose
  `blues-minor` mode (6 notes: `1 ♭3 4 ♭5 5 ♭7`) rotates the family's
  interval pattern and whose `blues-major` mode (6 notes: `1 2 ♭3 3 5 6`)
  instead owns its own complete interval pattern
- **THEN** both modes are selectable and render correctly on the fretboard,
  each with its own notes, without modifying `getScaleNotes`, the mode
  selector, or the page component

### Requirement: A single pure function SHALL compute scale notes for any family
The system SHALL expose `getScaleNotes(rootMidi, family, modeId, variantId?)`
as the sole function that converts a family/mode/variant selection into a
MIDI note list. No other module SHALL perform interval arithmetic. When the
selected mode owns a complete interval pattern, `getScaleNotes` SHALL use
that pattern directly instead of rotating `family.intervalPattern`.

#### Scenario: Computing notes for a diatonic mode
- **WHEN** `getScaleNotes` is called with the Major family, root C4, and
  mode `dorian`
- **THEN** it returns the MIDI notes for D Dorian-equivalent scale degrees
  built from C4 (i.e. the major intervals rotated to start at the 2nd degree)

#### Scenario: Computing notes for a mode with its own interval pattern
- **WHEN** `getScaleNotes` is called with the `blue` family, a root note,
  and mode `blues-major`
- **THEN** it returns the 6 MIDI notes built from that mode's own interval
  pattern (`1 2 ♭3 3 5 6`), not a rotation of the family's `blues-minor`
  interval pattern

#### Scenario: Computing notes with a variant applied
- **WHEN** `getScaleNotes` is called for a family/mode combination that
  defines a variant (none ship in this change, but the mechanism remains
  generic and family-agnostic)
- **THEN** the returned note list includes the base scale's notes plus one
  inserted note at the interval defined by that variant

#### Scenario: Computing notes without a variant
- **WHEN** `getScaleNotes` is called for the same family/mode with no
  `variantId` argument
- **THEN** the returned note list contains exactly the base scale notes with
  no inserted note

### Requirement: A mode MAY own a complete interval pattern instead of rotating its family's pattern
The `ScaleMode` type SHALL support an optional interval pattern field. When
present, this pattern SHALL define that mode's scale degrees directly, and
the mode's `rotationIndex` SHALL be ignored. When absent, the mode SHALL
behave exactly as before — a rotation of `family.intervalPattern` by
`rotationIndex`. This lets one family group modes of different degree
counts, which a shared, rotated `intervalPattern` cannot express.

#### Scenario: A mode without its own interval pattern still rotates the family pattern
- **WHEN** a `ScaleMode` record has no interval-pattern override (every
  mode shipped before this change, and the `blue` family's `blues-minor`
  mode)
- **THEN** its notes are computed by rotating `family.intervalPattern` at
  `rotationIndex`, unchanged from prior behavior

#### Scenario: A mode with its own interval pattern ignores rotation
- **WHEN** a `ScaleMode` record (e.g. the `blue` family's `blues-major`
  mode) has an interval-pattern override
- **THEN** its notes are computed directly from that override pattern, and
  its `rotationIndex` value has no effect on the result

### Requirement: The Blue family's Blues Minor and Blues Major formulas
The system SHALL represent the Blue family's two modes as: Blues Minor —
degree formula `1 ♭3 4 ♭5 5 ♭7` (semitone offsets `0, 3, 5, 6, 7, 10`); and
Blues Major — degree formula `1 2 ♭3 3 5 6` (semitone offsets
`0, 2, 3, 4, 7, 9`).

#### Scenario: Blues Minor note content
- **WHEN** `getScaleNotes` is called for the `blue` family's `blues-minor`
  mode with a given root
- **THEN** the returned notes are that root plus semitone offsets
  `0, 3, 5, 6, 7, 10`

#### Scenario: Blues Major note content
- **WHEN** `getScaleNotes` is called for the `blue` family's `blues-major`
  mode with a given root
- **THEN** the returned notes are that root plus semitone offsets
  `0, 2, 3, 4, 7, 9`

#### Scenario: Blues Major is the relative major of Blues Minor
- **WHEN** Blues Major is rooted at C and Blues Minor is rooted at A
- **THEN** both contain the same six pitch classes (`C D D# E G A`)

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

### Requirement: Harmonic Major and Melodic Major families
The system SHALL ship a `harmonic-major` family and a `melodic-major`
family, each with 7 modes, selectable and routable like any other
7-note family (`/harmonic-major/<mode>` and `/melodic-major/<mode>`). Each
family's first mode SHALL be the family's own scale and each later mode
SHALL be the next rotation of its interval pattern, so each family lists
7 modes in ascending rotation order.

Harmonic Major's interval pattern from the root SHALL be `0, 2, 4, 5, 7,
8, 11` (`1 2 3 4 5 ♭6 7`, also known as Ionian ♭6). Its modes SHALL be
Harmonic Major, Dorian ♭5, Phrygian ♭4, Lydian ♭3, Mixolydian ♭2, Lydian
Augmented ♯2, and Locrian ♭♭7.

Melodic Major's interval pattern from the root SHALL be `0, 2, 4, 5, 7,
8, 10` (`1 2 3 4 5 ♭6 ♭7`, also known as Mixolydian ♭6 or Aeolian
Dominant). Its modes SHALL be Melodic Major, Locrian ♮2, Super Locrian,
Melodic Minor, Dorian ♭2, Lydian Augmented, and Lydian Dominant.

Adding these families SHALL NOT change any existing family's modes, ids,
or URLs. In particular the Melodic Minor family's own `mixolydian-b6`
mode SHALL remain, and SHALL resolve to the same interval pattern as
Melodic Major.

#### Scenario: Harmonic Major computes its notes
- **WHEN** the scale notes are computed for root C in the Harmonic Major
  family's first mode
- **THEN** they are `C D E F G G# B`, in that order

#### Scenario: Melodic Major computes its notes
- **WHEN** the scale notes are computed for root C in the Melodic Major
  family's first mode
- **THEN** they are `C D E F G G# A#`, in that order

#### Scenario: Both families list seven modes
- **WHEN** the mode list is read for `harmonic-major` and for
  `melodic-major`
- **THEN** each has exactly 7 modes, each mode resolves to a distinct
  interval pattern, and each family's first mode has the interval
  pattern stated above

#### Scenario: Rotations are the expected named modes
- **WHEN** the interval pattern is read for Harmonic Major's Dorian ♭5
  mode and Melodic Major's Melodic Minor mode
- **THEN** they are `0, 2, 3, 5, 6, 9, 10` and `0, 2, 3, 5, 7, 9, 11`
  respectively

#### Scenario: New families are selectable without other code changes
- **WHEN** the two family records are present
- **THEN** both appear in the family/mode navigation and resolve at
  their routes, with no per-family conditional logic added to the mode
  selector, routing, or page component

#### Scenario: Existing Melodic Minor mode is unchanged
- **WHEN** the Melodic Minor family's `mixolydian-b6` mode is read
- **THEN** it still exists and its interval pattern equals Melodic
  Major's first mode
