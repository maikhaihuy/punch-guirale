## REMOVED Requirements

### Requirement: Desktop persistent sidebar
**Reason**: Replaced by a single dropdown trigger that behaves the same
way on desktop and mobile — see "Unified dropdown navigation trigger"
added to this capability.
**Migration**: See `specs/scale-navigation/spec.md`, "Unified dropdown
navigation trigger" (this file).

### Requirement: Mobile bottom sheet navigation
**Reason**: Replaced by the same unified dropdown trigger used on
desktop, opened by tap instead of hover.
**Migration**: See "Unified dropdown navigation trigger" below.

## ADDED Requirements

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

## MODIFIED Requirements

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
