## ADDED Requirements

### Requirement: Single-note degree highlight selector
The system SHALL provide a selector covering every scale degree of the
current family/mode plus a "None" option (the default), for any
family regardless of degree count. Selecting a degree SHALL highlight
that degree's note wherever it recurs on the fretboard; selecting
"None" SHALL clear the highlight. Exactly one degree (or "None") SHALL
be selected at a time.

#### Scenario: Default state shows no highlighting
- **WHEN** the app loads with no prior selection
- **THEN** "None" is selected and no note shows the degree-highlight
  ring

#### Scenario: Selecting a degree
- **WHEN** the user selects a degree other than "None"
- **THEN** every in-scale note on the fretboard sharing that degree's
  formula label shows the degree-highlight ring, and no others

#### Scenario: Switching between degrees
- **WHEN** the user selects a different degree while one is already
  active
- **THEN** the ring moves to the newly selected degree's notes and no
  longer shows on the previous selection's notes

#### Scenario: Works identically for any degree count
- **WHEN** the active family is Pentatonic or Blue (5 or 6 degrees) as
  opposed to a 7-degree family
- **THEN** the selector and its highlighting behavior are identical —
  no degree count renders a reduced or different interaction

### Requirement: Highlight visual treatment
The system SHALL render every in-scale note whose own degree label
matches the currently selected degree with a highlight ring — except
the scale's root note, which keeps only its existing root styling.

#### Scenario: Scale root is never double-decorated
- **WHEN** the selected degree's note is the scale's root note
- **THEN** the scale root shows only its existing root styling, not
  the highlight ring

#### Scenario: Composes with dimming and mode changes
- **WHEN** a highlighted note is currently dimmed by the position
  selector, or the mode changes while a degree is selected
- **THEN** the highlight ring is shown at the same reduced opacity as
  the rest of that dimmed note, and updates to match the new mode's
  actual notes sharing that degree label
