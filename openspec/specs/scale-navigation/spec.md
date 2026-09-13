# scale-navigation Specification

## Purpose

Lets a learner move between scale families and modes via a single,
always-reachable dropdown navigation trigger (identical on desktop and
mobile) instead of a page-level selector, and keeps that navigation
state driven by the route rather than local component state.

## Requirements

### Requirement: Two-level family/mode navigation tree
The system SHALL present a two-level navigation tree: level 1 lists all
scale families, and level 2, nested under the active family, lists that
family's modes (and variants, where present). Selecting a family SHALL
navigate to that family's first mode. Selecting a mode within the
currently active family SHALL navigate to that mode without changing the
active family.

#### Scenario: Selecting a different family
- **WHEN** the user selects a family other than the currently active one
- **THEN** the app navigates to that family's first mode

#### Scenario: Toggling a variant nested under the active family
- **WHEN** the user activates a variant control nested under the active
  family's mode list (e.g. Minor Pentatonic's "Blues" variant)
- **THEN** the `variant` query parameter is added to or removed from the
  current URL to match, without a full page navigation, per
  `scale-family-routing`

#### Scenario: Selecting a mode within the active family
- **WHEN** the user selects a mode nested under the currently active
  family
- **THEN** the app navigates to that mode's route without changing the
  active family

#### Scenario: Active state is visually marked
- **WHEN** the navigation tree is rendered
- **THEN** the active family and active mode are both visually marked,
  the active family's mode list is expanded, and other families are
  collapsed by default

### Requirement: Unified dropdown navigation trigger
The system SHALL render a single always-visible trigger labeling the
active family and mode (e.g. "Major / Ionian"), identical on every
viewport size. Activating it via pointer hover or via tap/click SHALL
reveal the two-level navigation tree in a dropdown panel anchored to the
trigger. The dropdown panel SHALL close on an outside click/tap, on
Escape, or after a family, mode, or variant selection.

#### Scenario: Opening via hover on desktop
- **WHEN** the user hovers the pointer over the navigation trigger on a
  non-touch device
- **THEN** the dropdown panel opens showing the navigation tree

#### Scenario: Opening via tap on mobile
- **WHEN** the user taps the navigation trigger on a touch device
- **THEN** the dropdown panel opens showing the navigation tree

#### Scenario: Closing the dropdown
- **WHEN** the dropdown panel is open and the user clicks/taps outside
  it, presses Escape, or selects a family, mode, or variant
- **THEN** the dropdown panel closes

### Requirement: Keyboard and assistive-technology navigation
The system SHALL expose the navigation tree with `role="tree"` /
`role="treeitem"` semantics (or, for a flattened single-level rendering,
`role="menu"` / `role="menuitem"`), support arrow-key movement between
items, Enter to select the focused item, and Escape to close the
dropdown panel.

#### Scenario: Navigating via keyboard
- **WHEN** the navigation tree has focus and the user presses an arrow
  key, then Enter
- **THEN** focus moves between family/mode entries and Enter selects the
  focused entry exactly as a click would

#### Scenario: Closing the dropdown via keyboard
- **WHEN** the dropdown panel is open and the user presses Escape
- **THEN** the dropdown panel closes
