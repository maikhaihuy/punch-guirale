## REMOVED Requirements

### Requirement: Single centered column layout
**Reason**: Replaced by an explicit Header / Body / Footer structure —
see the "Header, Body, and Footer layout areas" requirement added to
this capability.
**Migration**: No user action required. Pages previously assuming a
flat single-column layout should reference the new Header/Body/Footer
areas instead.

### Requirement: Controls grouped into labeled rows
**Reason**: The key, mode, and position selectors this requirement
described no longer render inline on the main page — they moved into
the floating settings panel introduced by the `settings-panel`
capability.
**Migration**: See the "Controls grouped into labeled rows" requirement
in `specs/settings-panel/spec.md` — the labeling behavior itself is
unchanged, only its location.

### Requirement: Random key control is visually distinct
**Reason**: The random-key control moved into the floating settings
panel along with the rest of key/mode/position selection.
**Migration**: See the "Random key control is visually distinct"
requirement in `specs/settings-panel/spec.md`.

### Requirement: Display toggles rendered as switches
**Reason**: The note⇄degree and highlight-triad switches moved into the
floating settings panel along with the rest of the controls.
**Migration**: See the "Display toggles rendered as switches"
requirement in `specs/settings-panel/spec.md`.

## ADDED Requirements

### Requirement: Header, Body, and Footer layout areas
The system SHALL present the page as three distinct layout areas: a
centered Header, a Body containing the fretboard and practice-tracking
list, and a Footer containing the playback controls.

#### Scenario: Viewing the page layout
- **WHEN** the page is loaded on any viewport size
- **THEN** a Header area is rendered centered at the top of the page, a
  Body area below it stacks the fretboard section above the
  practice-tracking list, and a Footer area at the bottom renders the
  playback controls

#### Scenario: Body sections stack vertically
- **WHEN** the user views the Body area
- **THEN** the fretboard section and the practice-tracking list each
  render as their own full-width section within the Body, one above the
  other
