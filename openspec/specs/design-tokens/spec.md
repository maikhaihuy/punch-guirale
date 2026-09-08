# design-tokens Specification

## Purpose

Defines the app's named color palettes, the light/dark theme selection
mechanism, and the typographic rules that keep fretboard numbers aligned,
independent of any single component's implementation.

## Requirements

### Requirement: Named light and dark color palettes
The system SHALL define a complete set of named color tokens (background,
surface, primary text, muted text, primary accent, secondary accent) for
both a light and a dark palette, and every themed surface in the app
SHALL derive its color from these tokens rather than a hardcoded or
one-off color value.

#### Scenario: Light palette applied by default
- **WHEN** the user's system is set to a light color scheme and they have
  not made an explicit theme choice
- **THEN** the app renders using the light palette's token values

#### Scenario: Dark palette applied by default
- **WHEN** the user's system is set to a dark color scheme and they have
  not made an explicit theme choice
- **THEN** the app renders using the dark palette's token values

### Requirement: Manual theme override persists across sessions
The system SHALL let the user explicitly choose light or dark theme,
overriding the system preference, and SHALL persist that choice so it
still applies on a later visit without the user re-selecting it.

#### Scenario: User overrides the system preference
- **WHEN** the user's system prefers one theme and the user explicitly
  selects the other via the app's theme control
- **THEN** the app immediately switches to the selected theme regardless
  of the system preference

#### Scenario: Explicit choice survives a reload
- **WHEN** the user has previously made an explicit theme choice and
  reloads the app, even if their system preference has since changed
- **THEN** the app applies the previously chosen theme, not the current
  system preference

### Requirement: Fret numbers and degree labels use tabular figures
The system SHALL render fret-position numbers and scale-degree labels
with tabular (fixed-width) figures, so that numeric columns stay
vertically aligned as the player scrolls the fretboard. This SHALL NOT
apply to note-name labels, which are not purely numeric.

#### Scenario: Fret numbers stay aligned
- **WHEN** the fretboard's fret-number header row is rendered
- **THEN** every digit is rendered with tabular figures, so a fret's
  number occupies the same horizontal width regardless of its digits

#### Scenario: Degree labels stay aligned
- **WHEN** the display mode shows scale degrees instead of note names
- **THEN** every degree label is rendered with tabular figures
