## MODIFIED Requirements

### Requirement: Scale info table renders beside the scale wheel
The system SHALL render a reference table beside `ScaleWheel` in the
dashboard's key row, for every family regardless of degree count. The
table SHALL always show columns Formula, Notes, and Intervals. The table
SHALL additionally show Roman, Degree, and Chords columns, in that order
after Intervals, for families whose scale has 7 degrees and for any
family/mode that has `scale-degree-reference` data (Major Pentatonic,
Minor Pentatonic, Egyptian, Man Gong, Ritusen, Major Blues, Minor Blues
— matched by interval pattern). For every other case, the Roman, Degree, and Chords columns
SHALL NOT render.

For a 7-degree family the table SHALL have one row per scale degree. For
a family/mode with reference data it SHALL have one row per reference
slot — including slots the scale skips, per "Skipped reference slots
render struck through, not hidden" — in ascending semitone order. For every
other case it SHALL have one row per scale degree.

#### Scenario: Table renders with all columns for a 7-degree family
- **WHEN** the active family's scale has 7 degrees (e.g. Major,
  Harmonic Minor)
- **THEN** the info table renders beside the scale wheel with exactly
  7 data rows and 6 columns (Formula, Notes, Intervals, Roman, Degree,
  Chords)

#### Scenario: Reference scales render with a Roman column and skipped slots
- **WHEN** the active family/mode has `scale-degree-reference` data
  (e.g. Minor Pentatonic, or the Blue family's `blues-major` mode)
- **THEN** the info table renders 6 columns (Formula, Notes, Intervals,
  Roman, Degree, Chords) with one row per reference slot: 7 rows for any
  pentatonic scale and 8 for a blues scale, including the rows for slots
  the scale skips

#### Scenario: Every pentatonic mode of both families gets the reference table
- **WHEN** the active family is Major Pentatonic or Minor Pentatonic, in
  any of its 5 modes
- **THEN** the info table renders the 6-column reference layout

#### Scenario: Both Blue modes get the reference table
- **WHEN** the active family is Blue, in either its `blues-minor` mode
  or its `blues-major` mode
- **THEN** the info table renders the 6-column reference layout with 8
  rows, as for any family/mode with reference data

#### Scenario: Other non-7-degree modes keep the reduced column set
- **WHEN** the active family's scale does not have 7 degrees and its
  interval pattern has no reference data (no shipped family currently;
  e.g. a 5-note pattern `0, 1, 5, 7, 8`)
- **THEN** the info table renders one row per scale degree showing only
  Formula, Notes, and Intervals (no Roman, Degree, or Chords columns)

### Requirement: Each row shows formula, note, interval name, degree function, and chords
Every row of the scale info table, for any family, SHALL show: the
degree's scale-formula label (Formula, e.g. `1`, `♭3`); the degree's
note name for the current root (Notes); and the interval quality name
for the degree's semitone offset from root (Intervals, e.g. `Major
third`, `Perfect fifth`). For families whose scale has 7 degrees, each
row SHALL additionally show the scale-degree function name for the
degree (Degree, e.g. `Tonic`, `Mediant`), the degree's quality-cased
roman numeral, identical to the one the Degrees row shows (Roman, e.g.
`ii`, `vii°`), and the concrete chord names built from that degree's
own note plus each chord suffix for its derived triad quality (Chords,
e.g. `Cm`, `Cm6`, `Cm7`, `Cm9`). For a
family/mode with `scale-degree-reference` data, each row SHALL instead
show that slot's reference roman numeral (Roman), degree name (Degree),
and chord suggestions transposed to the current root (Chords), followed
by the slot's hint when it has one.

For 7-degree families, degrees 1 through 6's function name SHALL depend
only on the degree's position (`Tonic`, `Supertonic`, `Mediant`,
`Subdominant`, `Dominant`, `Submediant`, in that order). Degree 7's
function name SHALL instead depend on its interval from the root:
`Leading Tone` when that interval is a major seventh (11 semitones from
root), or `Subtonic` for any other interval (e.g. a minor seventh, 10
semitones from root).

#### Scenario: Row content for the tonic degree
- **WHEN** the info table renders for a Major family rooted at C
  (Ionian)
- **THEN** its first row shows Formula `1`, Notes `C`, Intervals
  `Unison`, Roman `I`, Degree `Tonic`, and Chords listing concrete
  major-quality chord names rooted on `C` (e.g. `C`, `C6`, `Cmaj7`,
  `Cadd9`)

#### Scenario: Roman column matches the Degrees row for a 7-degree family
- **WHEN** the info table renders for a Major family rooted at C
  (Ionian)
- **THEN** its Roman column reads `I`, `ii`, `iii`, `IV`, `V`, `vi`,
  `vii°` top to bottom, the same numerals shown on the Degrees row's
  pills

#### Scenario: Row content reflects an altered degree
- **WHEN** the info table renders for a mode whose 2nd degree is a
  semitone above the root (e.g. Phrygian)
- **THEN** that row's Formula shows `♭2`, Intervals shows `Minor
  second`, and Chords lists concrete chord names built from that
  degree's own note and its derived triad quality's suffixes

#### Scenario: Degree 7 reads Leading Tone for a major seventh
- **WHEN** the info table renders for a mode whose 7th degree is a
  major seventh above the root (e.g. Ionian, or Harmonic Minor's own
  mode)
- **THEN** that row's Degree column shows `Leading Tone`

#### Scenario: Degree 7 reads Subtonic for a minor seventh
- **WHEN** the info table renders for a mode whose 7th degree is a
  minor seventh above the root (e.g. Dorian, Mixolydian, Aeolian)
- **THEN** that row's Degree column shows `Subtonic`

#### Scenario: Row content for a non-7-degree mode without reference data
- **WHEN** the info table renders for a mode with no reference data
  (e.g. a 5-note pattern `0, 1, 5, 7, 8`)
- **THEN** its rows show only Formula/Notes/Intervals values, with no
  Roman, Degree, or Chords values shown

#### Scenario: Row content for Minor Pentatonic rooted at A
- **WHEN** the info table renders for Minor Pentatonic rooted at A
- **THEN** its in-scale rows show Formula/Notes/Roman/Degree/Chords:
  `1`/`A`/`i`/`Tonic`/`Am, Am7, Am11`; `♭3`/`C`/`bIII`/`Minor
  Mediant`/`C, Cmaj7, C6`; `4`/`D`/`iv`/`Subdominant`/`Dm, Dm7,
  Dsus4`; `5`/`E`/`v / V`/`Dominant`/`Em, Em7, E7`; `♭7`/`G`/`bVII`/
  `Subtonic`/`G, G7`

#### Scenario: Row content for Major Pentatonic rooted at C
- **WHEN** the info table renders for Major Pentatonic rooted at C
- **THEN** its in-scale rows show Formula/Notes/Roman/Degree/Chords:
  `1`/`C`/`I`/`Tonic`/`C, Cmaj7, C6, Cadd9`; `2`/`D`/`ii`/`Supertonic`/
  `Dm, Dm7, D7sus4`; `3`/`E`/`iii`/`Mediant`/`Em, Em7, C/E`; `5`/`G`/
  `V`/`Dominant`/`G, G7, Gsus4`; `6`/`A`/`vi`/`Submediant`/`Am, Am7`

#### Scenario: Row content for Egyptian rooted at D
- **WHEN** the info table renders for the Egyptian (Suspended) mode
  rooted at D
- **THEN** it shows 7 rows. Its in-scale rows show Formula/Notes/Roman/
  Degree/Chords: `1`/`D`/`i`/`Tonic`/`Dsus4, Dm7(no3), D7sus4`;
  `2`/`E`/`ii`/`Supertonic`/`Em, Em7`; `4`/`G`/`IV`/`Subdominant`/`G, G7,
  Gsus4`; `5`/`A`/`v`/`Dominant`/`Am, Am7, A7`; `b7`/`C`/`bVII`/
  `Subtonic`/`C, Cmaj7`. Its 2 skipped rows are `3`/`F#`/`Mediant` and
  `6`/`B`/`Submediant`, each with Roman `N/A` and Chords `N/A`

#### Scenario: Row content for Man Gong rooted at E
- **WHEN** the info table renders for the Man Gong mode rooted at E
- **THEN** it shows 7 rows. Its in-scale rows are: `1`/`E`/`i`/`Tonic`/
  `Em7(no5), Esus4(b9)`; `b3`/`G`/`bIII`/`Minor Mediant`/`G, G7`; `4`/
  `A`/`iv`/`Subdominant`/`Am, Am7`; `b6`/`C`/`bVI`/`Submediant`/`C,
  Cmaj7`; `b7`/`D`/`bVII`/`Subtonic`/`Dm, Dm7`. Its 2 skipped rows are
  `2`/`F#`/`Supertonic` and `5`/`B`/`Dominant`, each with Roman `N/A` and
  Chords `N/A`

#### Scenario: Row content for Ritusen rooted at G
- **WHEN** the info table renders for the Ritusen mode rooted at G
- **THEN** it shows 7 rows. Its in-scale rows are: `1`/`G`/`I`/`Tonic`/
  `G, Gsus4, G6`; `2`/`A`/`ii`/`Supertonic`/`Am, Am7`; `4`/`C`/`IV`/
  `Subdominant`/`C, Cmaj7, C6`; `5`/`D`/`V`/`Dominant`/`Dm, Dm7,
  D7sus4`; `6`/`E`/`vi`/`Submediant`/`Em, Em7`. Its 2 skipped rows are
  `3`/`B`/`Mediant` and `7`/`F#`/`Leading Tone`, each with Roman `N/A`
  and Chords `N/A`

#### Scenario: Row content for Major Blues rooted at C
- **WHEN** the info table renders for Major Blues rooted at C
- **THEN** its 6 in-scale rows are `1`/`C`, `2`/`D`, `♭3`/`D#`, `3`/`E`,
  `5`/`G`, `6`/`A`, with Roman `I7`, `ii`, `bIII`, `iii`, `V7`, `vi`
  respectively

### Requirement: Chords column reuses the shared chord vocabulary
For 7-degree families, the Chords column's concrete chord names SHALL
be derived from the `diatonic-chord-vocabulary` capability's
chord-suffix table (the same table the Degrees row's abstract
chord-quality labels use), not from a separate or duplicated chord
list. For a family/mode with `scale-degree-reference` data, the Chords
column SHALL instead use that capability's chord suggestions.

#### Scenario: Concrete chords match the Degrees row's quality
- **WHEN** a 7-degree scale degree's derived triad quality is minor
- **THEN** the info table's Chords column for that degree lists the
  same suffixes as the Degrees row's abstract label for that quality
  (e.g. `m`, `m6`, `m7`, `m9`), each concatenated onto that degree's
  own note name

#### Scenario: Reference scales use the reference chords
- **WHEN** the info table renders for a family/mode with reference data
- **THEN** its Chords column shows that reference's chord suggestions,
  not chords derived from triad quality

## ADDED Requirements

### Requirement: Skipped reference slots render struck through, not hidden
For a family/mode with `scale-degree-reference` data, every slot the
scale does not contain (a skipped slot) SHALL still render as a table
row, distinguishable from in-scale rows by more than color or opacity
alone. A skipped row SHALL show: its slot's Formula label, its
would-be note, its interval name, its roman numeral (or `N/A` when the
reference has none), and its degree name, each struck through; a text
badge reading `Skip` after the note, not struck through; and its chord
suggestions with any hint, also not struck through. A skipped row's cells
SHALL render at reduced opacity relative to in-scale rows. A skipped row
SHALL NOT be selectable or highlighted as an in-scale degree anywhere
else in the UI.

A slot with the *rarely used* hint and no chords SHALL show the text
`Rarely used` in its Chords cell; a slot with the *not applicable* hint
SHALL show `N/A`; a slot with the *avoid the note when soloing* hint
SHALL show its chords followed by `Avoid <note> when soloing`, naming
the slot's would-be note; a slot with the *turnaround* hint SHALL show
its chords followed by `Turnaround`.

#### Scenario: A skipped slot is visible and marked
- **WHEN** the info table renders for Major Pentatonic rooted at C
- **THEN** the row for slot `4` is present and dimmed, with Formula
  `4`, note `F`, Intervals `Perfect fourth`, Roman `IV`, and Degree
  `Subdominant` each struck through, a `Skip` badge, and Chords `F,
  Fmaj7` followed by `Avoid F when soloing`, none of it struck through

#### Scenario: A skipped slot with no chords says so
- **WHEN** the info table renders for Minor Pentatonic rooted at A
- **THEN** the row for slot `2` is present, dimmed, with `2`, `B`,
  `Major second`, `ii°`, and `Supertonic` struck through, a `Skip`
  badge, and Chords `Rarely used` not struck through

#### Scenario: A skipped slot with no roman numeral shows N/A
- **WHEN** the info table renders for Egyptian rooted at D
- **THEN** the row for the skipped Mediant slot shows Formula `3`, note
  `F#`, Roman `N/A`, Degree `Mediant`, all struck through, and Chords
  `N/A` not struck through

#### Scenario: The Chords column is never struck through
- **WHEN** the info table renders any reference scale
- **THEN** no Chords cell, in a skipped row or an in-scale row, has
  struck-through text

#### Scenario: In-scale rows are not dimmed, struck through, or badged
- **WHEN** the info table renders for any reference scale
- **THEN** every row for a slot the scale contains renders at full
  opacity with no `Skip` badge and no struck-through text

### Requirement: Blue-note slots are badged
For a family/mode with `scale-degree-reference` data, a slot flagged as
a blue note SHALL show a text badge reading `Blue note` beside its
degree name.

#### Scenario: Major Blues flat third is badged
- **WHEN** the info table renders for Major Blues
- **THEN** the row for slot `♭3` shows `Minor Mediant` with a `Blue
  note` badge, and no other row in the table has one

#### Scenario: Minor Blues flat fifth is badged
- **WHEN** the info table renders for Minor Blues
- **THEN** the row for slot `♭5` shows `Dim. Dominant` with a `Blue
  note` badge, and no other row in the table has one
