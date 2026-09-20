## MODIFIED Requirements

### Requirement: Variant selection SHALL be encoded in the URL as a query parameter
The system SHALL represent the active variant (if any) as a `variant` query
string parameter on the family/mode route (`/[family]/[mode]?variant=<id>`)
rather than as local component state. Omitting the parameter SHALL select
the base scale with no inserted note. An unrecognized `variant` value for
the current family SHALL be treated the same as an absent parameter. No
family ships with a `variants` list in this change (Blues, the one family
that previously used this mechanism, is now modeled as its own `blue`
family instead — see `scale-data-model`), but the mechanism itself remains
generic and family-agnostic for any future family that needs it.

#### Scenario: Sharing a URL with a variant enabled
- **WHEN** a user navigates to `/[family]/[mode]?variant=<id>` for a family
  that defines a variant with that id (no family ships one in this change)
- **THEN** the fretboard renders that family/mode's scale with the
  variant's inserted note, and the variant toggle control shows as enabled

#### Scenario: No variant parameter present
- **WHEN** a user navigates to `/minor-pentatonic/minor-pentatonic` with no
  `variant` query parameter
- **THEN** the fretboard renders the base 5-note scale with no inserted note

#### Scenario: Toggling the variant control updates the URL
- **WHEN** a user enables or disables a variant toggle in the UI
- **THEN** the `variant` query parameter is added to or removed from the
  current URL to match, without a full page navigation

#### Scenario: Old Minor Pentatonic Blues variant URL no longer applies the variant
- **WHEN** a user navigates to
  `/minor-pentatonic/minor-pentatonic?variant=blue` (a pre-existing,
  now-unrecognized variant id for that family)
- **THEN** the fretboard renders the base 5-note Minor Pentatonic scale, per
  the "unrecognized variant" fallback, rather than the ♭5-augmented scale it
  previously rendered
