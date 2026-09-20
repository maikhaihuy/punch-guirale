# scale-degree-reference Specification

## Purpose

Provides static, root-relative reference data for the scales guitarists
most often play — Major Pentatonic, Minor Pentatonic, Major Blues, Minor
Blues, and the three other rotations of the pentatonic scale (Egyptian,
Man Gong, Ritusen) — describing each degree's roman numeral, degree
name, and usable chords, including the diatonic slots the scale itself
skips, so a table can teach how each scale relates to the underlying
7-degree scale.

## Requirements

### Requirement: Reference data exists for seven interval patterns, matched by interval pattern
The system SHALL provide reference data for exactly seven interval
patterns, expressed as semitone offsets from the root: Major Pentatonic
(`0, 2, 4, 7, 9`), Minor Pentatonic (`0, 3, 5, 7, 10`), Egyptian, also
called Suspended (`0, 2, 5, 7, 10`), Man Gong (`0, 3, 5, 8, 10`),
Ritusen (`0, 2, 5, 7, 9`), Major Blues (`0, 2, 3, 4, 7, 9`), and Minor
Blues (`0, 3, 5, 6, 7, 10`). A family/mode SHALL be matched to reference
data by its resolved interval pattern, not by its family or mode id, so
every mode that resolves to one of these seven patterns receives the same
reference data regardless of which family lists it (for example the Major
Pentatonic family's fifth rotation and the Minor Pentatonic family's own
base mode are both Minor Pentatonic). Because the Major Pentatonic and
Minor Pentatonic families are rotations of one another, all ten of their
modes SHALL have reference data. A family/mode whose resolved pattern is
none of these seven SHALL have no reference data.

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

#### Scenario: A pattern with no reference gets none
- **WHEN** reference data is requested for a family/mode whose resolved
  interval pattern is not one of the seven (for example any 7-degree
  family, or a 5-note pattern such as `0, 1, 5, 7, 8`)
- **THEN** no reference data is returned

### Requirement: Reference rows cover every diatonic slot, including skipped ones
For each reference scale the data SHALL list one row per diatonic slot,
in ascending semitone order from the root, including slots the scale
does not contain: 7 rows for each of the five pentatonic scales (Major
Pentatonic, Minor Pentatonic, Egyptian, Man Gong, Ritusen), and 8 rows
for Major Blues and Minor Blues. Each row SHALL carry: the slot's
semitone offset from the root; its roman numeral (which MAY show two
alternatives, e.g. `v / V`, and MAY be absent for a skipped slot that has
none); its degree name; whether it is a blue note; its chord suggestions;
and an optional hint. A row SHALL be considered skipped when its semitone
offset is not in the reference scale's own interval pattern; the skipped
status SHALL be derived from that membership, not stored separately.

The rows SHALL be, by slot (offset: roman numeral, degree name):

- Major Pentatonic: `0`: `I` Tonic; `2`: `ii` Supertonic; `4`: `iii`
  Mediant; `5`: `IV` Subdominant (skipped); `7`: `V` Dominant; `9`:
  `vi` Submediant; `11`: `vii°` Leading Tone (skipped).
- Minor Pentatonic: `0`: `i` Tonic; `2`: `ii°` Supertonic (skipped);
  `3`: `bIII` Minor Mediant; `5`: `iv` Subdominant; `7`: `v / V`
  Dominant; `8`: `bVI` Submediant (skipped); `10`: `bVII` Subtonic.
- Major Blues: `0`: `I7` Tonic; `2`: `ii` Supertonic; `3`: `bIII`
  Minor Mediant, blue note; `4`: `iii` Major Mediant; `5`: `IV7`
  Subdominant (skipped); `7`: `V7` Dominant; `9`: `vi` Submediant;
  `10`: `bVII` Subtonic (skipped).
- Minor Blues: `0`: `i7` Tonic; `2`: `ii°` Supertonic (skipped); `3`:
  `bIII` Minor Mediant; `5`: `iv7` Subdominant; `6`: `bV` Dim.
  Dominant, blue note; `7`: `v7 / V7` Dominant; `8`: `bVI7`
  Submediant (skipped); `10`: `bVII` Subtonic.
- Egyptian: `0`: `i` Tonic; `2`: `ii` Supertonic; `4`: no roman numeral,
  Mediant (skipped); `5`: `IV` Subdominant; `7`: `v` Dominant; `9`: no
  roman numeral, Submediant (skipped); `10`: `bVII` Subtonic.
- Man Gong: `0`: `i` Tonic; `2`: no roman numeral, Supertonic (skipped);
  `3`: `bIII` Minor Mediant; `5`: `iv` Subdominant; `7`: no roman
  numeral, Dominant (skipped); `8`: `bVI` Submediant; `10`: `bVII`
  Subtonic.
- Ritusen: `0`: `I` Tonic; `2`: `ii` Supertonic; `4`: no roman numeral,
  Mediant (skipped); `5`: `IV` Subdominant; `7`: `V` Dominant; `9`: `vi`
  Submediant; `11`: no roman numeral, Leading Tone (skipped).

The skipped slots of Egyptian, Man Gong, and Ritusen sit at the major
scale's own degree for that position (Mediant `4`, Submediant `9`,
Supertonic `2`, Dominant `7`, Leading Tone `11`), because the reference
gives those slots only a degree name.

#### Scenario: Pentatonic references list seven slots
- **WHEN** the reference rows for any of Major Pentatonic, Minor
  Pentatonic, Egyptian, Man Gong, or Ritusen are read
- **THEN** there are exactly 7 rows, of which 5 are in-scale and 2 are
  skipped

#### Scenario: Blues reference lists eight slots
- **WHEN** the reference rows for Major Blues or Minor Blues are read
- **THEN** there are exactly 8 rows, of which 6 are in-scale and 2 are
  skipped

#### Scenario: Skipped slots of the other three pentatonic modes
- **WHEN** the reference rows for Egyptian, Man Gong, and Ritusen are
  read
- **THEN** the skipped rows are at offsets `4` and `9` for Egyptian, `2`
  and `7` for Man Gong, and `4` and `11` for Ritusen, and each has no
  roman numeral and no chord suggestions

#### Scenario: Skipped status follows scale membership
- **WHEN** the Minor Pentatonic rows are read
- **THEN** exactly the rows at offsets `2` and `8` are skipped, and
  every other row is in-scale

#### Scenario: Blue notes are flagged
- **WHEN** the reference rows are read for Major Blues and Minor Blues
- **THEN** the Major Blues row at offset `3` and the Minor Blues row at
  offset `6` are flagged as blue notes, and no other row in any
  reference is

### Requirement: Chord suggestions are root-relative and transpose to any root
Each row's chord suggestions SHALL be stored relative to the key root:
each chord names its own root as a semitone offset from the key root
(which MAY differ from the row's own offset — e.g. the Major Blues
`bIII` row lists a dominant `7#9` chord built on the key root), a chord
suffix, and optionally a bass note as a semitone offset (a slash
chord). When rendered for a root, each chord SHALL be spelled using the
same note names the rest of the app uses for that root, with the suffix
appended and, for a slash chord, `/` plus the bass note's name.

The chord suggestions SHALL be, by scale and slot offset (chords shown
for the scale's own reference root: C for Major Pentatonic and Major
Blues, A for Minor Pentatonic and Minor Blues, D for Egyptian, E for
Man Gong, G for Ritusen):

- Major Pentatonic (C): `0`: C, Cmaj7, C6, Cadd9; `2`: Dm, Dm7,
  D7sus4; `4`: Em, Em7, C/E; `5`: F, Fmaj7; `7`: G, G7, Gsus4; `9`: Am,
  Am7, Am11; `11`: none.
- Minor Pentatonic (A): `0`: Am, Am7, Am11; `2`: none; `3`: C, Cmaj7,
  C6; `5`: Dm, Dm7, Dsus4; `7`: Em, Em7, E7; `8`: F, Fmaj7; `10`: G,
  G7, Gsus4.
- Major Blues (C): `0`: C7; `2`: D7, Dm7; `3`: the diminished 7th on the
  slot's own note (D#°7), and C7#9; `4`: C, C7; `5`: F7; `7`: G7; `9`:
  A7, Am7; `10`: the dominant 7th on the slot's own note (A#7).
- Minor Blues (A): `0`: Am7, A7; `2`: Bm7b5; `3`: C, Cmaj7; `5`: Dm7,
  D7; `6`: the dominant 7th and diminished 7th on the slot's own note
  (D#7, D#°7); `7`: Em7, E7, E7b9; `8`: F7, Fmaj7; `10`: G7.
- Egyptian (D): `0`: Dsus4, Dm7(no3), D7sus4; `2`: Em, Em7; `5`: G, G7,
  Gsus4; `7`: Am, Am7, A7; `10`: C, Cmaj7.
- Man Gong (E): `0`: Em7(no5), Esus4(b9); `3`: G, G7; `5`: Am, Am7; `8`:
  C, Cmaj7; `10`: Dm, Dm7.
- Ritusen (G): `0`: G, Gsus4, G6; `2`: Am, Am7; `5`: C, Cmaj7, C6; `7`:
  Dm, Dm7, D7sus4; `9`: Em, Em7.

The skipped slots of Egyptian, Man Gong, and Ritusen have no chord
suggestions.

Chord names in the examples above use the app's sharp-based note
spelling (a note the reference sheet writes as `Eb` renders as `D#`).

#### Scenario: Chords transpose with the root
- **WHEN** the Major Pentatonic reference is rendered for root D
- **THEN** the row at offset `4` lists `F#m`, `F#m7`, and `D/F#`, and
  the row at offset `2` lists `Em`, `Em7`, and `E7sus4`

#### Scenario: A chord may be rooted off the row's own note
- **WHEN** the Major Blues reference is rendered for root C
- **THEN** the row at offset `3` (note `D#`) lists `D#°7` and `C7#9`,
  the second built on the key root rather than on the row's own note

#### Scenario: A chord suffix may carry a parenthesized alteration
- **WHEN** the Man Gong reference is rendered for root E
- **THEN** the row at offset `0` lists `Em7(no5)` and `Esus4(b9)`, the
  suffixes' parentheses shown as written

#### Scenario: Slash chord names its bass note
- **WHEN** the Major Pentatonic reference is rendered for root C
- **THEN** the row at offset `4` includes the slash chord `C/E`

### Requirement: A row may carry a chord hint
A row MAY carry a hint, one of: *rarely used* (the slot has no useful
chords), *not applicable* (the slot has no chords and no roman numeral
because the reference gives it only a degree name), *avoid the note when
soloing* (the slot has chords, but its own note is best avoided in
solos), or *turnaround* (the slot's chords are typically used as a
turnaround). The hints SHALL be: *rarely used* on Major Pentatonic
offset `11` and Minor Pentatonic offset `2`; *not applicable* on every
skipped slot of Egyptian, Man Gong, and Ritusen; *avoid the note when
soloing* on Major Pentatonic offset `5`; and *turnaround* on Minor Blues
offset `8`. Every other row SHALL have no hint.

#### Scenario: Slots with no useful chords carry the rarely-used hint
- **WHEN** the Major Pentatonic row at offset `11` or the Minor
  Pentatonic row at offset `2` is read
- **THEN** it has no chord suggestions and carries the rarely-used hint

#### Scenario: The avoid-note hint keeps its chords
- **WHEN** the Major Pentatonic row at offset `5` is read
- **THEN** it has chord suggestions and carries the avoid-note hint

#### Scenario: Skipped slots with only a degree name carry the not-applicable hint
- **WHEN** a skipped row of Egyptian, Man Gong, or Ritusen is read
- **THEN** it has no roman numeral, no chord suggestions, and carries the
  not-applicable hint
