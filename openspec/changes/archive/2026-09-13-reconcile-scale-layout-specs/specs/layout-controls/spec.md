## MODIFIED Requirements

### Requirement: Header, Body, and Footer layout areas
The system SHALL present the page as three layout areas, identical in
structure across desktop and mobile: a Header area split into left,
center, and right sections; a Body area stacking the scale dashboard,
fretboard, and practice-tracking sections; and a Footer area containing
the playback controls, fixed to the bottom of the viewport at full
width.

#### Scenario: Header sections
- **WHEN** the page is loaded on any viewport size
- **THEN** the Header area renders a theme toggle in its left section, a
  placeholder in its center section, and the family/mode navigation
  trigger in its right section

#### Scenario: Body sections stack vertically
- **WHEN** the user views the Body area
- **THEN** the scale dashboard, fretboard, and practice-tracking list
  each render as their own full-width section within the Body, one
  above the other

#### Scenario: Footer is fixed and full width
- **WHEN** the page is loaded on any viewport size
- **THEN** the Footer area remains fixed to the bottom of the viewport
  and spans its full width
