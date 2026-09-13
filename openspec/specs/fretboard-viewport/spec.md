# fretboard-viewport Specification

## Purpose

Gives the fretboard control over its own visible fret range and zoom
level — via a range minimap, zoom buttons, and touch gestures anchored
to the fretboard itself — independent of any page-level or navigation
state.

## Requirements

### Requirement: Range minimap for free scrolling
The system SHALL render a range minimap below the main fretboard,
spanning the full 1–24 fret range, showing a draggable window
representing the currently visible fret range. Dragging the window
SHALL scroll the main fretboard view to match, without being
constrained to the 5 fixed positions.

#### Scenario: Dragging the minimap window
- **WHEN** the user drags the minimap's viewport window
- **THEN** the main fretboard's visible fret range scrolls to match the
  window's new position, including fret ranges that fall between or
  outside the 5 fixed positions

### Requirement: Corner-anchored zoom controls
The system SHALL render `−` and `+` zoom controls anchored to the
bottom-right corner of the fretboard viewport. Activating them SHALL
narrow or widen the visible fret window.

#### Scenario: Zooming in with the corner control
- **WHEN** the user activates the `+` zoom control
- **THEN** the fretboard's visible fret window narrows, showing fewer
  frets in more detail

#### Scenario: Zooming out with the corner control
- **WHEN** the user activates the `−` zoom control
- **THEN** the fretboard's visible fret window widens, showing more
  frets

### Requirement: Touch pan and zoom gestures
The system SHALL support pinch-to-zoom and horizontal drag/swipe
directly on the fretboard as the primary touch-based zoom and pan
gestures, in addition to the minimap and corner zoom controls.

#### Scenario: Pinch-to-zoom on the fretboard
- **WHEN** the user performs a pinch gesture on the fretboard on a
  touch-capable device
- **THEN** the fretboard's visible fret window zooms in or out to match
  the pinch gesture

#### Scenario: Swipe to pan on the fretboard
- **WHEN** the user performs a horizontal drag/swipe gesture on the
  fretboard on a touch-capable device
- **THEN** the fretboard's visible fret range pans in the swipe
  direction

### Requirement: Default visible range
The system SHALL default the fretboard's visible fret range to frets
1–12 on load, with the minimap and position pills able to reach the
full 1–24 range.

#### Scenario: Default range on load
- **WHEN** the fretboard is rendered with no prior viewport adjustment
- **THEN** frets 1 through 12 are visible in the main fretboard view
