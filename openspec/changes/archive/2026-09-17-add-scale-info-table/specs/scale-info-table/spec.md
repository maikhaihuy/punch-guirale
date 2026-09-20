## ADDED Requirements

### Requirement: Scale info table renders beside the scale wheel
The system SHALL render a reference table beside `ScaleWheel` in the
dashboard's key row, with one row per scale degree, for every family
regardless of degree count. The table SHALL always show columns
Formula, Notes, and Intervals. The table SHALL additionally show a
Degree column for families whose scale has 7 degrees. The table SHALL
additionally show a Chords column for families whose scale has 7
degrees, or for the Minor Pentatonic or Major Pentatonic family's own
base mode specifically (per the `diatonic-chord-vocabulary`
capability's respective chord tables). For every other case (any other
pentatonic mode rotation), the Chords column SHALL NOT render.

#### Scenario: Table renders with all columns for a 7-degree family
- **WHEN** the active family's scale has 7 degrees (e.g. Major,
  Harmonic Minor)
- **THEN** the info table renders beside the scale wheel with exactly
  7 data rows and all 5 columns (Formula, Notes, Intervals, Degree,
  Chords)

#### Scenario: Table renders with a reduced column set for most non-7-degree families
- **WHEN** the active family's scale does not have 7 degrees and is
  not Minor or Major Pentatonic's own base mode (e.g. Egyptian, Blues
  Minor/Major, Suspended, Man Gong, Ritusen, or either family's other
  mode rotation)
- **THEN** the info table still renders beside the scale wheel, with
  one row per scale degree, showing only Formula, Notes, and Intervals
  (no Degree or Chords columns)

#### Scenario: Minor or Major Pentatonic's base mode also shows a Chords column
- **WHEN** the active family is Minor Pentatonic or Major Pentatonic
  and the active mode is that family's own base mode (not one of its
  other rotations)
- **THEN** the info table renders Formula, Notes, Intervals, and
  Chords (still no Degree column)

### Requirement: Each row shows formula, note, interval name, degree function, and chords
Every row of the scale info table, for any family, SHALL show: the
degree's scale-formula label (Formula, e.g. `1`, `♭3`); the degree's
note name for the current root (Notes); and the interval quality name
for the degree's semitone offset from root (Intervals, e.g. `Major
third`, `Perfect fifth`). For families whose scale has 7 degrees, each
row SHALL additionally show the scale-degree function name for the
degree (Degree, e.g. `Tonic`, `Mediant`) and the concrete chord names
built from that degree's own note plus each chord suffix for its
derived triad quality (Chords, e.g. `Cm`, `Cm6`, `Cm7`, `Cm9`).

Degrees 1 through 6's function name SHALL depend only on the degree's
position (`Tonic`, `Supertonic`, `Mediant`, `Subdominant`, `Dominant`,
`Submediant`, in that order). Degree 7's function name SHALL instead
depend on its interval from the root: `Leading Tone` when that
interval is a major seventh (11 semitones from root), or `Subtonic`
for any other interval (e.g. a minor seventh, 10 semitones from root).

#### Scenario: Row content for the tonic degree
- **WHEN** the info table renders for a Major family rooted at C
  (Ionian)
- **THEN** its first row shows Formula `1`, Notes `C`, Intervals
  `Unison`, Degree `Tonic`, and Chords listing concrete major-quality
  chord names rooted on `C` (e.g. `C`, `C6`, `Cmaj7`, `Cadd9`)

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

#### Scenario: Row content for a non-7-degree, non-chord-table family
- **WHEN** the info table renders for a pentatonic mode rotation other
  than Minor or Major Pentatonic's own base mode (e.g. Egyptian, Blues
  Minor, Blues Major)
- **THEN** its rows show only Formula/Notes/Intervals values, with no
  Degree or Chords values shown

#### Scenario: Row content for Minor Pentatonic's base mode
- **WHEN** the info table renders for the Minor Pentatonic family's
  own base mode, rooted at C
- **THEN** its rows show Formula/Notes/Intervals `1`/`C`/`Unison`,
  `♭3`/`E♭`/`Minor third`, `4`/`F`/`Perfect fourth`,
  `5`/`G`/`Perfect fifth`, `♭7`/`B♭`/`Minor seventh`, each paired with
  a Chords value (`Cm`, `Eb`, `Fm7`, `Gm7`, `Bb5` respectively), and no
  Degree value shown

#### Scenario: Row content for Major Pentatonic's base mode
- **WHEN** the info table renders for the Major Pentatonic family's
  own base mode, rooted at D
- **THEN** its rows show Formula/Notes/Intervals `1`/`D`/`Unison`,
  `2`/`E`/`Major second`, `3`/`F♯`/`Major third`, `5`/`A`/`Perfect
  fifth`, `6`/`B`/`Major sixth`, each paired with a Chords value (`D`,
  `Em7`, `F♯m7`, `Asus4`, `Bm` respectively), and no Degree value shown

### Requirement: Chords column reuses the shared chord vocabulary
The Chords column's concrete chord names SHALL be derived from the
`diatonic-chord-vocabulary` capability's chord-suffix table (the same
table the Degrees row's abstract chord-quality labels use), not from a
separate or duplicated chord list.

#### Scenario: Concrete chords match the Degrees row's quality
- **WHEN** a scale degree's derived triad quality is minor
- **THEN** the info table's Chords column for that degree lists the
  same suffixes as the Degrees row's abstract label for that quality
  (e.g. `m`, `m6`, `m7`, `m9`), each concatenated onto that degree's
  own note name
