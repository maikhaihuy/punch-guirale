## MODIFIED Requirements

### Requirement: Degrees row shows scale degrees with their notes
The system SHALL render a "Degrees" row with one pill per scale degree
plus a "None" option, defaulting to "None", for every family
regardless of degree count (this row is also the only control for
selecting a single-note highlight on non-7-degree families, e.g.
Pentatonic — see the fretboard's single-note highlight behavior).

For families whose scale has 7 degrees, each degree pill SHALL be
labeled with that degree's scale-formula degree label (e.g. `1`, `♭3`,
`5`), with the degree's roman numeral (case and suffix reflecting its
derived triad quality, per the existing diatonic-triad-highlighting
requirement) shown directly beneath the degree label, and with that
degree's common chord symbols (from the `diatonic-chord-vocabulary`
capability's lookup for the degree's derived triad quality) shown
directly beneath the roman numeral. Between each pair of adjacent
degree pills, the system SHALL render a whole/half-step (`W`/`H`)
indicator reflecting the interval from the earlier degree to the
later one.

For families whose scale does not have 7 degrees, each degree pill
SHALL be labeled with the degree number and its note name (e.g. `1
C`), as before, with no roman numeral, chord symbols, or W/H
indicators (those are undefined for a non-7-degree interval pattern —
see diatonic-triad-highlighting's existing 7-degree scoping).

Selecting a degree pill SHALL highlight that degree's diatonic triad
on the fretboard for 7-degree families, or that single note for other
families.

#### Scenario: Default state shows no highlighting
- **WHEN** the app loads with no prior selection
- **THEN** "None" is selected and no note shows the triad ring

#### Scenario: Selecting a degree pill
- **WHEN** the user selects a degree pill other than "None"
- **THEN** that degree's 3 diatonic-triad notes show the triad ring on
  the fretboard, and no others

#### Scenario: Non-7-degree families keep plain degree/note pills
- **WHEN** the active family's scale does not have 7 degrees (e.g.
  Pentatonic)
- **THEN** the Degrees row still renders, with each pill labeled by
  degree number and note name only (no roman numeral, chord symbols,
  or W/H indicators), and selecting a pill highlights that single note

#### Scenario: Degree pill shows formula label and roman numeral
- **WHEN** the Degrees row renders for a 7-degree family/mode (e.g.
  Phrygian, whose 2nd degree is a semitone above the root)
- **THEN** that degree's pill displays the degree-formula label (`♭2`)
  as its primary label and the degree's quality-cased roman numeral
  directly beneath it

#### Scenario: Degree pill shows chord symbols for its triad quality
- **WHEN** a degree's derived triad quality is, for example, minor
- **THEN** that degree's pill additionally displays the chord symbols
  the `diatonic-chord-vocabulary` lookup returns for the `minor`
  quality, directly beneath the roman numeral

#### Scenario: W/H indicator between adjacent degrees
- **WHEN** the Degrees row renders for a 7-degree family/mode
- **THEN** a `W` or `H` indicator appears between each pair of
  adjacent degree pills, matching the whole/half-step gap from the
  earlier degree to the later one
