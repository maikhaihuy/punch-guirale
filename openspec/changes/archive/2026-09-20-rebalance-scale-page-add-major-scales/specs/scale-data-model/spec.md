## ADDED Requirements

### Requirement: Harmonic Major and Melodic Major families
The system SHALL ship a `harmonic-major` family and a `melodic-major`
family, each with 7 modes, selectable and routable like any other
7-note family (`/harmonic-major/<mode>` and `/melodic-major/<mode>`). Each
family's first mode SHALL be the family's own scale and each later mode
SHALL be the next rotation of its interval pattern, so each family lists
7 modes in ascending rotation order.

Harmonic Major's interval pattern from the root SHALL be `0, 2, 4, 5, 7,
8, 11` (`1 2 3 4 5 ♭6 7`, also known as Ionian ♭6). Its modes SHALL be
Harmonic Major, Dorian ♭5, Phrygian ♭4, Lydian ♭3, Mixolydian ♭2, Lydian
Augmented ♯2, and Locrian ♭♭7.

Melodic Major's interval pattern from the root SHALL be `0, 2, 4, 5, 7,
8, 10` (`1 2 3 4 5 ♭6 ♭7`, also known as Mixolydian ♭6 or Aeolian
Dominant). Its modes SHALL be Melodic Major, Locrian ♮2, Super Locrian,
Melodic Minor, Dorian ♭2, Lydian Augmented, and Lydian Dominant.

Adding these families SHALL NOT change any existing family's modes, ids,
or URLs. In particular the Melodic Minor family's own `mixolydian-b6`
mode SHALL remain, and SHALL resolve to the same interval pattern as
Melodic Major.

#### Scenario: Harmonic Major computes its notes
- **WHEN** the scale notes are computed for root C in the Harmonic Major
  family's first mode
- **THEN** they are `C D E F G G# B`, in that order

#### Scenario: Melodic Major computes its notes
- **WHEN** the scale notes are computed for root C in the Melodic Major
  family's first mode
- **THEN** they are `C D E F G G# A#`, in that order

#### Scenario: Both families list seven modes
- **WHEN** the mode list is read for `harmonic-major` and for
  `melodic-major`
- **THEN** each has exactly 7 modes, each mode resolves to a distinct
  interval pattern, and each family's first mode has the interval
  pattern stated above

#### Scenario: Rotations are the expected named modes
- **WHEN** the interval pattern is read for Harmonic Major's Dorian ♭5
  mode and Melodic Major's Melodic Minor mode
- **THEN** they are `0, 2, 3, 5, 6, 9, 10` and `0, 2, 3, 5, 7, 9, 11`
  respectively

#### Scenario: New families are selectable without other code changes
- **WHEN** the two family records are present
- **THEN** both appear in the family/mode navigation and resolve at
  their routes, with no per-family conditional logic added to the mode
  selector, routing, or page component

#### Scenario: Existing Melodic Minor mode is unchanged
- **WHEN** the Melodic Minor family's `mixolydian-b6` mode is read
- **THEN** it still exists and its interval pattern equals Melodic
  Major's first mode
