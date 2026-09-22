## ADDED Requirements

### Requirement: Minimum fret cell width with scroll/zoom fallback
The system SHALL scale fret cell width fluidly with the fretboard's
available container width, the same way the scale wheel scales fluidly
with its own container, down to a minimum cell width sufficient for a
touch target (approximately 32–40px). Once the available width would
require cells narrower than that minimum, the system SHALL hold cell
width at the minimum and rely on the existing range minimap, zoom
controls, and touch pan/zoom gestures to reach additional frets, rather
than continuing to shrink cell width.

#### Scenario: Fret cells scale down to their minimum width
- **WHEN** the fretboard's available container width narrows
- **THEN** fret cell width shrinks to match, down to but not below the
  minimum tappable width

#### Scenario: Narrower containers rely on scroll/zoom instead of smaller cells
- **WHEN** the fretboard's available container width is too narrow to fit
  the currently visible fret range at the minimum cell width
- **THEN** fret cell width stays at the minimum and the visible fret
  range narrows (via the existing zoom/minimap controls) instead of cells
  shrinking further
