# scale-family-routing Specification

## Purpose
TBD - created by archiving change restructure-scale-family-schema. Update Purpose after archive.

## Requirements
### Requirement: Each family/mode combination SHALL be reachable via a distinct URL
The system SHALL expose a route of the form `/[family]/[mode]` for every
family with more than one mode, generated from the `ScaleFamily` data rather
than from a hardcoded route list.

#### Scenario: Navigating directly to a family/mode URL
- **WHEN** a user navigates to the URL for the Harmonic Minor family and its
  `phrygian-dominant` mode
- **THEN** the app renders the fretboard for that family/mode without
  requiring the user to reselect it via UI

#### Scenario: Route list reflects available families without manual registration
- **WHEN** a new family is added to the scale data with N modes
- **THEN** N new routes become resolvable without editing a route table by
  hand (i.e. routes are generated from the family/mode data)

### Requirement: Routing SHALL NOT assume every family has a mode segment
The system SHALL support families with exactly one mode resolving at
`/[family]` without a mode segment, even though no such family ships in this
change.

#### Scenario: Single-mode family route shape is not blocked by current implementation
- **WHEN** a future family is added with `modes.length === 1`
- **THEN** the routing implementation does not require code changes beyond
  the data addition to serve it at `/[family]`

### Requirement: Variant selection SHALL be encoded in the URL as a query parameter
The system SHALL represent the active variant (if any) as a `variant` query
string parameter on the family/mode route (`/[family]/[mode]?variant=<id>`)
rather than as local component state. Omitting the parameter SHALL select
the base scale with no inserted note. An unrecognized `variant` value for
the current family SHALL be treated the same as an absent parameter.

#### Scenario: Sharing a URL with a variant enabled
- **WHEN** a user navigates to `/minor-pentatonic/minor-pentatonic?variant=blue`
- **THEN** the fretboard renders the Minor Pentatonic scale with the `blue`
  variant's inserted note, and the variant toggle control shows as enabled

#### Scenario: No variant parameter present
- **WHEN** a user navigates to `/minor-pentatonic/minor-pentatonic` with no
  `variant` query parameter
- **THEN** the fretboard renders the base 5-note scale with no inserted note

#### Scenario: Toggling the variant control updates the URL
- **WHEN** a user enables or disables a variant toggle in the UI
- **THEN** the `variant` query parameter is added to or removed from the
  current URL to match, without a full page navigation

### Requirement: Existing Major scale URLs SHALL continue to resolve after migration
The system SHALL preserve access to previously bookmarked or linked Major
scale URLs after the data model migration, either by keeping the same path
shape or by redirecting old paths to the new equivalents.

#### Scenario: Pre-migration Major scale link still works
- **WHEN** a user opens a URL for the Major family/mode that existed before
  this change
- **THEN** the user lands on the correct, equivalent fretboard view
