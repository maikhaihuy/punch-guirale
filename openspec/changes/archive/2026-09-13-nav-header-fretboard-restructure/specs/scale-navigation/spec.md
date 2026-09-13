## Purpose

Lets a learner move between scale families and modes via a persistent,
always-reachable navigation surface (sidebar on desktop, bottom sheet on
mobile) instead of a page-level selector, and keeps that navigation
state driven by the route rather than local component state.

## ADDED Requirements

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

### Requirement: Desktop persistent sidebar
The system SHALL render the navigation tree as a persistent left sidebar
on viewports 1024px wide or greater, remaining visible without requiring
an extra interaction to open it.

#### Scenario: Desktop viewport shows the sidebar
- **WHEN** the app is loaded on a viewport at least 1024px wide
- **THEN** the family/mode navigation tree is visible in a left sidebar
  without any user interaction required to reveal it

### Requirement: Mobile bottom sheet navigation
The system SHALL, on viewports narrower than 768px, hide the persistent
sidebar and instead show a compact top-left button labeling the current
family and mode; activating it SHALL open a bottom sheet containing the
same navigation tree, dismissible via a drag handle, a backdrop tap, or
selecting a family/mode.

#### Scenario: Opening navigation on mobile
- **WHEN** the user activates the compact top-left navigation button on
  a viewport narrower than 768px
- **THEN** a bottom sheet opens from the bottom of the viewport
  containing the family/mode navigation tree

#### Scenario: Dismissing the bottom sheet
- **WHEN** the bottom sheet is open and the user drags it down via its
  handle, taps the backdrop, or selects a family/mode entry
- **THEN** the bottom sheet closes

### Requirement: Keyboard and assistive-technology navigation
The system SHALL expose the navigation tree with `role="tree"` /
`role="treeitem"` semantics (or, for a flattened single-level rendering,
`role="menu"` / `role="menuitem"`), support arrow-key movement between
items, Enter to select the focused item, and Escape to close the mobile
bottom sheet.

#### Scenario: Navigating via keyboard
- **WHEN** the navigation tree has focus and the user presses an arrow
  key, then Enter
- **THEN** focus moves between family/mode entries and Enter selects the
  focused entry exactly as a click would

#### Scenario: Closing the mobile sheet via keyboard
- **WHEN** the mobile bottom sheet is open and the user presses Escape
- **THEN** the bottom sheet closes
