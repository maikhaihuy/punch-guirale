## MODIFIED Requirements

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

#### Scenario: Adding a family whose modes are not equal-length rotations requires no code change
- **WHEN** a developer adds the `blue` `ScaleFamily` record, whose
  `blues-minor` mode (6 notes: `1 ♭3 4 ♭5 5 ♭7`) rotates the family's
  interval pattern and whose `blues-major` mode (5 notes: `1 ♭3 4 5 ♭7`)
  instead owns its own complete interval pattern
- **THEN** both modes are selectable and render correctly on the fretboard,
  each with its own note count, without modifying `getScaleNotes`, the mode
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
- **THEN** it returns the 5 MIDI notes built from that mode's own interval
  pattern (`1 ♭3 4 5 ♭7`), not a rotation of the family's `blues-minor`
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

## ADDED Requirements

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
Blues Major — degree formula `1 ♭3 4 5 ♭7` (semitone offsets
`0, 3, 5, 7, 10`).

#### Scenario: Blues Minor note content
- **WHEN** `getScaleNotes` is called for the `blue` family's `blues-minor`
  mode with a given root
- **THEN** the returned notes are that root plus semitone offsets
  `0, 3, 5, 6, 7, 10`

#### Scenario: Blues Major note content
- **WHEN** `getScaleNotes` is called for the `blue` family's `blues-major`
  mode with a given root
- **THEN** the returned notes are that root plus semitone offsets
  `0, 3, 5, 7, 10`
