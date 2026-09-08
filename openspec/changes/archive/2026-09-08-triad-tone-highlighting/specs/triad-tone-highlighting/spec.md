## ADDED Requirements

### Requirement: Root triad tone derivation
The system SHALL derive, for every in-scale fretboard note, whether it is
a member of the current mode's root triad (scale degree base number 1,
3, or 5, with any accidental ignored for the purpose of membership),
producing the correct triad quality per mode: major (1-3-5) for Ionian,
Lydian, and Mixolydian; minor (1-b3-5) for Dorian, Phrygian, and
Aeolian; diminished (1-b3-b5) for Locrian.

#### Scenario: Major mode triad
- **WHEN** the active mode is Ionian, Lydian, or Mixolydian
- **THEN** every note whose degree base number is 1, 3, or 5 is marked as
  a triad tone, regardless of any accidental on that degree

#### Scenario: Minor mode triad
- **WHEN** the active mode is Dorian, Phrygian, or Aeolian
- **THEN** every note whose degree base number is 1, 3, or 5 is marked as
  a triad tone, including the flatted third

#### Scenario: Locrian's diminished triad is not treated as an error
- **WHEN** the active mode is Locrian
- **THEN** the degree-1, degree-3, and degree-5 notes are marked as triad
  tones the same as in any other mode, producing a diminished (1-b3-b5)
  triad without special-casing

### Requirement: Highlight-triad toggle
The system SHALL provide a "Highlight triad" toggle, off by default,
independent of the existing note/degree label display toggle, that
controls whether triad-tone visual highlighting is shown.

#### Scenario: Highlighting is off by default
- **WHEN** the app loads with no prior toggle state
- **THEN** triad tones render with no special highlighting

#### Scenario: Toggling highlighting on
- **WHEN** the user enables "Highlight triad"
- **THEN** every currently rendered triad tone shows the triad visual
  treatment, and no other note does

#### Scenario: Independent of note/degree display mode
- **WHEN** the user toggles between note-name and degree display while
  "Highlight triad" is enabled
- **THEN** the triad highlighting remains shown, unaffected by which
  label text is displayed

### Requirement: Triad visual treatment and precedence
When "Highlight triad" is enabled, the system SHALL render non-root triad
tones with a distinct outline ring, and SHALL NOT apply this ring to the
root note (which already has its own distinct styling), and this
treatment SHALL compose with, not replace, the existing dimmed and
active-press visual states.

#### Scenario: Non-root triad tones get the ring
- **WHEN** "Highlight triad" is enabled and a rendered note is a triad
  tone but not the root
- **THEN** that note shows the triad outline ring in addition to its
  normal fill

#### Scenario: Root note is not double-decorated
- **WHEN** "Highlight triad" is enabled
- **THEN** the root note (itself always a triad tone) does not show the
  triad outline ring, keeping only its existing root styling

#### Scenario: Triad ring combines with dimming
- **WHEN** "Highlight triad" is enabled and a triad tone is currently
  dimmed by the position selector
- **THEN** the triad ring is shown at the same reduced opacity as the
  rest of that dimmed note, rather than overriding the dim
