## MODIFIED Requirements

### Requirement: The fretboard page SHALL render variant toggles from data
The `ScalePage` component SHALL display a toggle control for each entry in
`family.variants`, and SHALL display no variant controls when `variants` is
absent or empty. `variantId` is sourced from the `variant` URL query
parameter (see `scale-family-routing`), not local component state — toggling
the control updates the URL, and the component re-renders from the new
`variantId` prop rather than owning its own on/off state. No family ships
with a `variants` list in this change.

#### Scenario: Family with a variant
- **WHEN** `ScalePage` is given a family that defines a variant and the
  user enables that variant's toggle (no family ships one in this change,
  but the mechanism remains generic)
- **THEN** the fretboard adds the highlighted note returned by
  `getScaleNotes(..., variantId: <id>)` without altering the base scale
  display when the toggle is off

#### Scenario: Family without any variant (Major, Blue)
- **WHEN** `ScalePage` is given the Major family, or the new Blue family
  (either `blues-minor` or `blues-major` mode)
- **THEN** no variant toggle is rendered
