## REMOVED Requirements

### Requirement: Single centered column layout
**Reason**: Replaced by an explicit Navigation / Header / Body / Footer
structure — see the "Navigation, Header, Body, and Footer layout areas"
requirement added to this capability. Family/mode navigation is no
longer part of the centered column; it is a persistent sidebar
(desktop) or bottom sheet (mobile).
**Migration**: No user action required. Pages previously assuming a
flat single-column layout should reference the new layout areas
instead.

### Requirement: Controls grouped into labeled rows
**Reason**: The key/mode/position selectors this requirement described
no longer render as page-level labeled rows. Family/mode selection
moved to `scale-navigation`'s navigation tree; position selection moved
to `fretboard-viewport`'s position pills.
**Migration**: See `specs/scale-navigation/spec.md` for family/mode
selection and `specs/fretboard-viewport/spec.md` for position
selection.

### Requirement: Random key control is visually distinct
**Reason**: Root-note selection remains in the page-local header
control set (unchanged behavior), not in a page-level labeled-rows
container this requirement described.
**Migration**: No behavior change to the randomize control itself;
only the surrounding labeled-rows container this requirement referenced
no longer exists.

### Requirement: Display toggles rendered as switches
**Reason**: The note⇄degree and highlight-triad switches moved into the
new header's secondary row.
**Migration**: See the "Secondary row hosts display toggles"
requirement in `specs/scale-header/spec.md` — the switch-based
rendering itself is unchanged, only its location.

## ADDED Requirements

### Requirement: Navigation, Header, Body, and Footer layout areas
The system SHALL present the page as four layout areas: a Navigation
area for family/mode selection, a centered Header area for page-local
display state, a Body area containing the fretboard and
practice-tracking list, and a Footer area containing the playback
controls.

#### Scenario: Desktop layout areas
- **WHEN** the page is loaded on a viewport at least 1024px wide
- **THEN** a persistent left sidebar renders the Navigation area, a
  centered Header area renders above the Body, the Body stacks the
  fretboard section above the practice-tracking list, and a Footer area
  at the bottom renders the playback controls

#### Scenario: Mobile layout areas
- **WHEN** the page is loaded on a viewport narrower than 768px
- **THEN** the Navigation area is reachable via a compact top-left
  button rather than persistently visible, a Header area renders below
  it, the Body stacks below the Header, and the Footer remains sticky
  at the bottom

#### Scenario: Body sections stack vertically
- **WHEN** the user views the Body area
- **THEN** the fretboard section and the practice-tracking list each
  render as their own full-width section within the Body, one above the
  other
