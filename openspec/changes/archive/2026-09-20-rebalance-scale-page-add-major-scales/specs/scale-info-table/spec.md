## MODIFIED Requirements

### Requirement: Scale info table renders beside the scale wheel
The system SHALL render a reference table beside `ScaleWheel` in the
dashboard's key row, for every family regardless of degree count. At a
viewport width of 768px or more, the wheel and the table SHALL sit side
by side on one row, the wheel in the smaller share and the table in the
larger share of the row's width; the table SHALL NOT wrap beneath the
wheel. The table SHALL keep its own horizontal scroll when its content
is wider than its share. Below 768px the wheel and table SHALL stack,
wheel first, each using the full width. The table SHALL always show
columns Formula, Notes, and Intervals. The table SHALL additionally show
Roman, Degree, and Chords columns, in that order after Intervals, for
families whose scale has 7 degrees and for any family/mode that has
`scale-degree-reference` data (Major Pentatonic, Minor Pentatonic,
Egyptian, Man Gong, Ritusen, Major Blues, Minor Blues, Harmonic Major,
Melodic Major — matched by interval pattern). For every other case, the
Roman, Degree, and Chords columns SHALL NOT render.

For a family/mode with reference data it SHALL have one row per reference
slot — including slots the scale skips, per "Skipped reference slots
render struck through, not hidden" — in ascending semitone order; where a
7-degree scale also has reference data (Harmonic Major, Melodic Major),
the reference data SHALL be used rather than rows derived from triad
quality. For any other 7-degree family the table SHALL have one row per
scale degree. For every other case it SHALL have one row per scale
degree.

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

#### Scenario: Harmonic Major and Melodic Major use their reference rows
- **WHEN** the active mode is Harmonic Major's first mode or Melodic
  Major's first mode, rooted at C
- **THEN** the info table renders the 6-column layout with 7 rows whose
  Roman, Degree, and Chords cells are the reference values (e.g.
  `bVI+` / `Submediant` / `G#aug, G#maj7#5` on the offset-8 row), not
  values derived from triad quality

#### Scenario: A mode of Harmonic Major without its own reference is derived
- **WHEN** the active mode is Harmonic Major's Dorian ♭5 mode, whose
  interval pattern has no reference data
- **THEN** the info table renders 7 rows with Roman, Degree, and Chords
  derived per degree, as for any other 7-degree family

#### Scenario: Wheel and table share one row on a wide viewport
- **WHEN** the dashboard renders at a viewport width of 768px or more
- **THEN** the scale wheel and the info table appear side by side on the
  same row, with the table not wrapped beneath the wheel

#### Scenario: Wheel and table stack on a narrow viewport
- **WHEN** the dashboard renders at a viewport width below 768px
- **THEN** the scale wheel appears first and the info table beneath it,
  each using the full available width

#### Scenario: A wide table scrolls within its own column
- **WHEN** the table's content is wider than its share of the row
- **THEN** the table scrolls horizontally within its own column and does
  not push the page wider than the viewport

#### Scenario: Other non-7-degree modes keep the reduced column set
- **WHEN** the active family's scale does not have 7 degrees and its
  interval pattern has no reference data (no shipped family currently;
  e.g. a 5-note pattern `0, 1, 5, 7, 8`)
- **THEN** the info table renders one row per scale degree showing only
  Formula, Notes, and Intervals (no Roman, Degree, or Chords columns)
