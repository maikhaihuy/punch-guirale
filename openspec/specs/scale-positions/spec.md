# scale-positions Specification

## Purpose
TBD - created by syncing change milestone-2. Update Purpose after archive.
## Requirements
### Requirement: Position selection
The system SHALL let the user select one of 5 fixed fretboard positions
(labeled "Position 1" through "Position 5") or "All", defaulting to
"All" on desktop/tablet viewports and to "Position 1" on mobile
viewports. The 5 positions SHALL be sourced from a hardcoded set of
shape templates keyed by scale degree (1–7), defined once and reused
across all 7 modes, not derived algorithmically at runtime and not
duplicated per mode.

#### Scenario: Default selection on desktop
- **WHEN** the app loads on a desktop/tablet-width viewport with no
  prior position selection
- **THEN** the position selector shows "All" selected and every in-scale
  note across the full 0–24 fret range is shown undimmed

#### Scenario: Default selection on mobile
- **WHEN** the app loads on a mobile-width viewport with no prior
  position selection
- **THEN** the position selector shows "Position 1" selected instead of
  "All"

#### Scenario: Selecting a position
- **WHEN** the user selects a position (1–5) from the selector
- **THEN** every currently rendered note is tagged as inside or outside
  that position based on the degree-keyed shape template for the note's
  scale degree

#### Scenario: Same shape data reused across modes
- **WHEN** the user changes the mode while a position is selected
- **THEN** the same 5 degree-keyed shape templates are used to
  recompute which notes belong to the selected position, without
  loading or defining mode-specific shape data

### Requirement: Position visual treatment
When a position other than "All" is selected, the system SHALL dim
(not hide) notes outside the selected position, SHALL keep the mode's
root note visually prominent regardless of whether it falls inside the
selected position, and SHALL render a background band over the fret
range the selected position occupies.

#### Scenario: Out-of-position notes are dimmed, not hidden
- **WHEN** a position is selected
- **THEN** notes outside that position remain visible on the fretboard
  at reduced opacity rather than being removed

#### Scenario: Root stays prominent outside the selected position
- **WHEN** a position is selected and the mode's root note falls outside
  that position's note set
- **THEN** the root note is still rendered with its distinct root
  styling rather than the dimmed styling

#### Scenario: Position fret range is marked
- **WHEN** a position is selected
- **THEN** a semi-transparent background band is rendered over the fret
  range that position occupies

#### Scenario: Returning to All clears dimming
- **WHEN** the user selects "All" after a position was selected
- **THEN** no notes are dimmed and no position background band is shown

### Requirement: Mobile fit for position view
The system SHALL, on mobile-width viewports, auto-scroll and/or zoom the
fretboard when a position is selected so that position's fret range fits
within the viewport without requiring horizontal scrolling.

#### Scenario: Selecting a position on mobile fits the view
- **WHEN** the user selects a position on a mobile-width viewport
- **THEN** the fretboard view adjusts so the selected position's fret
  range is fully visible without horizontal scrolling

#### Scenario: Manual scroll/zoom is not overridden mid-session
- **WHEN** the user manually scrolls or zooms the fretboard after a
  position's auto-fit has been applied, without changing the selected
  position
- **THEN** the system does not re-trigger the auto-fit and override the
  user's manual adjustment
