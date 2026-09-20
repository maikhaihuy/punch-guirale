## MODIFIED Requirements

### Requirement: Scale info table renders beside the scale wheel
The system SHALL render a reference table beside `ScaleWheel` in the
dashboard's key row, with one row per scale degree, for every family
regardless of degree count. The table SHALL always show columns
Formula, Notes, and Intervals. The table SHALL additionally show a
Degree column for families whose scale has 7 degrees. The table SHALL
additionally show a Chords column for families whose scale has 7
degrees, or for the Minor Pentatonic or Major Pentatonic family's own
base mode specifically (per the `diatonic-chord-vocabulary`
capability's respective chord tables). For every other case — including
any other pentatonic mode rotation, and both of the Blue family's modes
(Blues Minor, Blues Major) — the Chords column SHALL NOT render.

#### Scenario: Table renders with all columns for a 7-degree family
- **WHEN** the active family's scale has 7 degrees (e.g. Major,
  Harmonic Minor)
- **THEN** the info table renders beside the scale wheel with exactly
  7 data rows and all 5 columns (Formula, Notes, Intervals, Degree,
  Chords)

#### Scenario: Table renders with a reduced column set for most non-7-degree families
- **WHEN** the active family's scale does not have 7 degrees and is
  not Minor or Major Pentatonic's own base mode (e.g. Egyptian, Blues
  Minor/Major of the Major Pentatonic family's own rotations, Suspended,
  Man Gong, Ritusen, either pentatonic family's other mode rotation, or
  either of the Blue family's modes)
- **THEN** the info table still renders beside the scale wheel, with
  one row per scale degree, showing only Formula, Notes, and Intervals
  (no Degree or Chords columns)

#### Scenario: Minor or Major Pentatonic's base mode also shows a Chords column
- **WHEN** the active family is Minor Pentatonic or Major Pentatonic
  and the active mode is that family's own base mode (not one of its
  other rotations)
- **THEN** the info table renders Formula, Notes, Intervals, and
  Chords (still no Degree column)

#### Scenario: The Blue family's modes never show a Chords column
- **WHEN** the active family is Blue, in either its `blues-minor` mode
  (6 degrees) or its `blues-major` mode (5 degrees)
- **THEN** the info table renders only Formula, Notes, and Intervals
  (no Degree or Chords columns), the same as any other non-7-degree,
  non-Pentatonic-base-mode family
