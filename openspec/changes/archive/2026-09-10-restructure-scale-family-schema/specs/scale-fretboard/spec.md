## MODIFIED Requirements

### Requirement: The fretboard page SHALL render any scale family from data alone
The `ScalePage` component SHALL accept a `family`, `modeId`, and optional
`variantId`, and render the fretboard using `getScaleNotes()` output. The
component SHALL NOT contain conditional logic branching on a specific family
id (e.g. no `if (family.id === 'major')`).

#### Scenario: Rendering a family with multiple modes
- **WHEN** `ScalePage` is given a family with `modes.length > 1`
- **THEN** it displays a mode selector populated from `family.modes` and
  renders the fretboard for the selected mode

#### Scenario: Rendering a family with a single mode
- **WHEN** `ScalePage` is given a family with `modes.length === 1`
- **THEN** it renders the fretboard for that mode and does not display a
  mode selector

### Requirement: The fretboard page SHALL render variant toggles from data
The `ScalePage` component SHALL display a toggle control for each entry in
`family.variants`, and SHALL display no variant controls when `variants` is
absent or empty. `variantId` is sourced from the `variant` URL query
parameter (see `scale-family-routing`), not local component state — toggling
the control updates the URL, and the component re-renders from the new
`variantId` prop rather than owning its own on/off state.

#### Scenario: Family with a variant (Minor Pentatonic + Blues)
- **WHEN** `ScalePage` is given the Minor Pentatonic family with its `blue`
  variant and the user enables the toggle
- **THEN** the fretboard adds the highlighted note returned by
  `getScaleNotes(..., variantId: 'blue')` without altering the base 5-note
  display when the toggle is off

#### Scenario: Family without any variant (Major)
- **WHEN** `ScalePage` is given the Major family
- **THEN** no variant toggle is rendered

## RENAMED Requirements

- FROM: `### Requirement: Root note and mode selection`
- TO: `### Requirement: The fretboard page SHALL render any scale family from data alone`
