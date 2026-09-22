## RENAMED Requirements

- FROM: `### Requirement: Reference data exists for seven interval patterns, matched by interval pattern`
- TO: `### Requirement: Reference data exists for nine interval patterns, matched by interval pattern`

## MODIFIED Requirements

### Requirement: Reference data exists for nine interval patterns, matched by interval pattern
The system SHALL provide reference data for exactly nine interval
patterns, expressed as semitone offsets from the root: Major Pentatonic
(`0, 2, 4, 7, 9`), Minor Pentatonic (`0, 3, 5, 7, 10`), Egyptian, also
called Suspended (`0, 2, 5, 7, 10`), Man Gong (`0, 3, 5, 8, 10`),
Ritusen (`0, 2, 5, 7, 9`), Major Blues (`0, 2, 3, 4, 7, 9`), Minor
Blues (`0, 3, 5, 6, 7, 10`), Harmonic Major (`0, 2, 4, 5, 7, 8, 11`),
and Melodic Major (`0, 2, 4, 5, 7, 8, 10`). A family/mode SHALL be
matched to reference data by its resolved interval pattern, not by its
family or mode id, so every mode that resolves to one of these nine
patterns receives the same reference data regardless of which family
lists it (for example the Major Pentatonic family's fifth rotation and
the Minor Pentatonic family's own base mode are both Minor Pentatonic,
and both the Melodic Major family's first mode and the Melodic Minor
family's Mixolydian ♭6 mode are Melodic Major). Because the Major
Pentatonic and Minor Pentatonic families are rotations of one another,
all ten of their modes SHALL have reference data. A family/mode whose
resolved pattern is none of these nine SHALL have no reference data.

#### Scenario: A mode resolving to a reference pattern gets its data
- **WHEN** reference data is requested for a family/mode whose resolved
  interval pattern is `0, 3, 5, 7, 10`, whether it is the Minor
  Pentatonic family's own base mode or the Major Pentatonic family's
  fifth rotation
- **THEN** both receive the Minor Pentatonic reference data

#### Scenario: Every pentatonic mode in both families has reference data
- **WHEN** reference data is requested for each of the 5 modes of the
  Major Pentatonic family and each of the 5 modes of the Minor
  Pentatonic family
- **THEN** every one receives reference data, and the two families'
  Egyptian/Suspended, Man Gong, and Ritusen modes receive the same data
  as each other

#### Scenario: The Blue family's two modes each match a reference
- **WHEN** reference data is requested for the `blue` family's
  `blues-minor` mode and for its `blues-major` mode
- **THEN** they receive the Minor Blues and Major Blues reference data
  respectively

#### Scenario: Harmonic Major and Melodic Major each match a reference
- **WHEN** reference data is requested for the `harmonic-major` family's
  first mode and for the `melodic-major` family's first mode
- **THEN** they receive the Harmonic Major and Melodic Major reference
  data respectively

#### Scenario: Melodic Minor's Mixolydian ♭6 shares the Melodic Major reference
- **WHEN** reference data is requested for the `melodic-minor` family's
  `mixolydian-b6` mode
- **THEN** it receives the same reference data as Melodic Major's first
  mode

#### Scenario: A pattern with no reference gets none
- **WHEN** reference data is requested for a family/mode whose resolved
  interval pattern is not one of the nine (for example Harmonic Minor's
  own mode, any other mode of a 7-degree family, or a 5-note pattern
  such as `0, 1, 5, 7, 8`)
- **THEN** no reference data is returned

## ADDED Requirements

### Requirement: Harmonic Major and Melodic Major reference rows and chords
The Harmonic Major and Melodic Major references SHALL each list exactly 7
rows, one per scale degree, in ascending semitone order, none of them
skipped (every slot is in the scale). Each row SHALL carry the semitone
offset, roman numeral, degree name, and chord suggestions below, with
chords stored relative to the key root and transposed like every other
reference. Neither reference SHALL flag a blue note or carry a hint.

The rows SHALL be, by slot (offset: roman numeral, degree name: chords
for root C, using the app's sharp-based note spelling):

- Harmonic Major: `0`: `I` Tonic: C, Cmaj7; `2`: `ii°` Supertonic:
  Dm7b5; `4`: `iii` Mediant: Em, Em7; `5`: `iv` Subdominant: Fm, Fm6,
  Fm(maj7); `7`: `V` Dominant: G, G7, G7b9; `8`: `bVI+` Submediant:
  G#aug, G#maj7#5; `11`: `vii°` Leading Tone: Bdim, Bdim7.
- Melodic Major: `0`: `I` Tonic: C, C7; `2`: `ii°` Supertonic: Dm7b5;
  `4`: `iii°` Mediant: Edim; `5`: `iv` Subdominant: Fm, Fm7; `7`: `v`
  Dominant: Gm, Gm7; `8`: `bVI+` Submediant: G#aug; `10`: `bVII`
  Subtonic: A#, A#maj7.

#### Scenario: Both references list seven in-scale rows
- **WHEN** the reference rows for Harmonic Major and Melodic Major are
  read
- **THEN** each has exactly 7 rows, none skipped, none flagged as a blue
  note, and none carrying a hint

#### Scenario: Harmonic Major chords for root C
- **WHEN** the Harmonic Major reference is rendered for root C
- **THEN** the row at offset `5` lists `Fm`, `Fm6`, and `Fm(maj7)`, the
  row at offset `8` (note `G#`) lists `G#aug` and `G#maj7#5`, and the
  row at offset `11` lists `Bdim` and `Bdim7`

#### Scenario: Melodic Major chords for root C
- **WHEN** the Melodic Major reference is rendered for root C
- **THEN** the row at offset `0` lists `C` and `C7`, the row at offset
  `4` lists `Edim`, and the row at offset `10` (note `A#`) lists `A#` and
  `A#maj7`

#### Scenario: Chords transpose with the root
- **WHEN** the Harmonic Major reference is rendered for root D
- **THEN** the row at offset `0` lists `D` and `Dmaj7`, and the row at
  offset `2` lists `Em7b5`
