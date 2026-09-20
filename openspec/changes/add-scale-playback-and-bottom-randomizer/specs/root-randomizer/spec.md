## Purpose

Gives the player a one-tap way to jump to a random key from the bottom bar,
alongside the other practice controls, while always showing which key and
scale/mode is currently active.

## ADDED Requirements

### Requirement: Bottom bar hosts a randomize-root cluster
The system SHALL render, in the fixed bottom bar alongside the metronome and
stopwatch controls, a cluster containing a randomize control and a readout of
the current key and scale/mode. The randomize control SHALL have an
accessible label ("Randomize root note").

#### Scenario: Cluster is present in the bottom bar
- **WHEN** the page is loaded on any viewport size
- **THEN** the fixed bottom bar contains the randomize control and the
  key/scale readout, in addition to the metronome and stopwatch controls

### Requirement: Readout shows the current key and scale/mode
The system SHALL show, in the cluster, the current root note together with
the active scale's family and mode names, and SHALL keep it in step with the
active root, family, and mode.

#### Scenario: Initial readout
- **WHEN** the app loads at `/major/ionian` with the default root
- **THEN** the readout shows the default root together with the Major family
  and Ionian mode names

#### Scenario: Readout follows the root
- **WHEN** the user selects D on the scale wheel
- **THEN** the readout shows D as the key, with the family and mode unchanged

#### Scenario: Readout follows navigation
- **WHEN** the user navigates to `/harmonic-minor/phrygian-dominant`
- **THEN** the readout shows the current root together with the Harmonic
  Minor family and Phrygian Dominant mode names

### Requirement: Randomize changes only the root
The system SHALL, when the user activates the randomize control, set the root
to one of the 12 chromatic pitch classes and SHALL leave the family, mode,
variant, route, display mode, and degree selection unchanged, updating the
fretboard, wheel, info table, and readout for the new root.

#### Scenario: Randomizing the root
- **WHEN** the user activates the randomize control
- **THEN** the root is set to one of the 12 chromatic pitch classes, the
  fretboard, wheel, table, and readout reflect it, and the route does not
  change

#### Scenario: Family and mode are preserved
- **WHEN** the user activates the randomize control while viewing
  `/melodic-minor/dorian`
- **THEN** the page remains at `/melodic-minor/dorian`

### Requirement: Bottom bar fits narrow viewports without hiding content
The system SHALL lay out the cluster together with the metronome and
stopwatch controls so that none of them overflows the viewport horizontally
at a width of 360px or more, wrapping the bar onto more than one row where
needed, and SHALL reserve enough space at the bottom of the page that the
last content section can scroll fully clear of the fixed bar at every
viewport width.

#### Scenario: Narrow phone width
- **WHEN** the page is viewed at a width of 360px
- **THEN** every bottom-bar control is fully visible and reachable, with no
  horizontal page scroll

#### Scenario: End of page is not covered
- **WHEN** the user scrolls to the bottom of the page at any viewport width
- **THEN** the last body section is fully visible above the bottom bar
