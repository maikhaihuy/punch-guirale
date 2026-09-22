## MODIFIED Requirements

### Requirement: Degrees row shows scale degrees with their notes
The system SHALL render a "Degrees" row with one pill per scale degree
plus a "None" option, defaulting to "None", for every family
regardless of degree count. Every degree pill, for every family, SHALL
be labeled with that degree's scale-formula degree label (e.g. `1`,
`♭3`, `5`) and that degree's note name — the same base labeling
convention regardless of degree count. For families whose scale has 7
degrees, each pill SHALL additionally show that degree's roman numeral
(case and suffix reflecting its derived triad quality); this roman
numeral SHALL NOT render for other degree counts, since tertian triads
need 7 degrees to stack thirds. Between each pair of adjacent degree
pills, the system SHALL render a whole/half-step (`W`/`H`) indicator
reflecting the interval from the earlier degree to the later one, for
families whose scale has 7 degrees only (undefined for other degree
counts — see `degree-highlighting`'s scoping).

Selecting a degree pill SHALL highlight that degree's note on the
fretboard, per the `degree-highlighting` capability, identically for
every family.

#### Scenario: Default state shows no highlighting
- **WHEN** the app loads with no prior selection
- **THEN** "None" is selected and no note shows the degree-highlight
  ring

#### Scenario: Selecting a degree pill
- **WHEN** the user selects a degree pill other than "None"
- **THEN** every note on the fretboard sharing that degree's formula
  label shows the degree-highlight ring, and no others

#### Scenario: Degree pill shows formula and note for every family
- **WHEN** the Degrees row renders for a 7-degree family (e.g. Major)
  versus a non-7-degree family (e.g. Pentatonic, Blue)
- **THEN** every pill in both cases is labeled with its degree's
  scale-formula label and note name (e.g. `1`/`C`, `♭3`/`D♯`, `4`/`F`,
  `♭5`/`F♯`, `5`/`G`, `♭7`/`A♯` for a Blues Minor pill set)

#### Scenario: 7-degree families additionally show a roman numeral
- **WHEN** the Degrees row renders for a 7-degree family/mode
- **THEN** each pill additionally shows that degree's quality-cased
  roman numeral beneath its formula label and note name; no other
  degree count shows a roman numeral

#### Scenario: W/H indicator only for 7-degree families
- **WHEN** the Degrees row renders for a 7-degree family/mode
- **THEN** a `W` or `H` indicator appears between each pair of
  adjacent degree pills, matching the whole/half-step gap from the
  earlier degree to the later one; this indicator does not render for
  non-7-degree families

## REMOVED Requirements

### Requirement: Wheel shows degree and triad info for 7-degree families
**Reason**: Superseded by a family-agnostic requirement — the
degree-label portion no longer stays 7-degree-only (see ADDED "Wheel
shows degree info for every family"). The roman-numeral portion is
carried forward by that same new requirement rather than removed,
since it's still derived from `getTriadQuality`/`getRomanNumeral` in
`theory.ts` (kept — `diatonic-triad-highlighting`'s *selection/ring*
behavior is what's removed, not the quality/roman-numeral computation
itself).
**Migration**: See the new "Wheel shows degree info for every family"
requirement below.

## ADDED Requirements

### Requirement: Wheel shows degree info for every family
The system SHALL render, next to each in-scale pitch class on the
scale wheel, that degree's scale-formula degree label, for every
family regardless of degree count. For families whose scale has 7
degrees, the system SHALL additionally render that degree's diatonic
triad roman numeral next to the degree label; this roman numeral SHALL
NOT render for other degree counts.

#### Scenario: Degree label renders for any family
- **WHEN** the active family's scale has 7 degrees (e.g. Major) or
  does not (e.g. Pentatonic, Blue)
- **THEN** each in-scale pitch class on the wheel is labeled with its
  scale-degree label in both cases, with no family rendering a blank
  or reduced label

#### Scenario: Roman numeral renders only for 7-degree families
- **WHEN** the active family's scale has 7 degrees (e.g. Major,
  Harmonic Minor, Melodic Minor)
- **THEN** each in-scale pitch class is additionally labeled with its
  diatonic triad roman numeral; for a non-7-degree family (e.g.
  Pentatonic, Blue) no roman numeral renders for any pitch class
