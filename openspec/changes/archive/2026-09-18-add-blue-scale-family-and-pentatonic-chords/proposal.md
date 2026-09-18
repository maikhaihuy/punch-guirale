## Why

The Blues scale is currently modeled as a `blue` variant bolted onto
Minor Pentatonic (`?variant=blue`, inserting a passing ♭5). That
undersells it: Blues is really two distinct scales in its own right —
a minor form (`1 ♭3 4 ♭5 5 ♭7`) and a major form (`1 ♭3 4 5 ♭7`) — and
neither should carry chord suggestions the way Major or Pentatonic
scales do, which the current variant mechanism has no way to express
(a variant only ever adds a highlighted note to whatever chords its
host family already shows). Splitting Blues out into its own family
gives it a proper home, a dedicated nav entry, and shareable URLs,
consistent with how every other scale in this app is addressed.

Separately, the ScaleInfoTable's Chords column already ships fixed
chord tables for Minor and Major Pentatonic's base modes (verified
against the requested reference examples), so this change confirms
that behavior extends correctly to the new Blue family — by staying
hidden there, not by inventing chords for a scale that traditionally
doesn't carry them.

## What Changes

- Add a new `blue` scale family with two modes, **Blues Minor**
  (`1 ♭3 4 ♭5 5 ♭7`) and **Blues Major** (`1 ♭3 4 5 ♭7`), each
  reachable at its own URL (`/blue/blues-minor`, `/blue/blues-major`)
  like any other family/mode.
- Extend the `ScaleMode` data schema with an optional, fully-owned
  interval pattern, for the rare case (Blue is the first) where a
  family's modes aren't equal-length rotations of one shared pattern.
  Existing rotation-based modes are unaffected.
- Remove the `blue` variant from the Minor Pentatonic family, since
  the new Blue family supersedes it. **BREAKING**: URLs of the form
  `/minor-pentatonic/minor-pentatonic?variant=blue` no longer render
  the ♭5-augmented scale — the unrecognized `variant` value is
  ignored and the base 5-note scale renders instead (per existing
  "unrecognized variant" fallback behavior; the page does not error).
- Confirm (via explicit spec scenarios and tests, no functional code
  change expected) that the ScaleInfoTable's Chords column continues
  to render for Minor/Major Pentatonic's base modes and stays hidden
  for both Blue family modes.

## Capabilities

### New Capabilities
(none — the new family is data added to the existing `scale-data-model`
capability, consistent with how Harmonic Minor, Melodic Minor, and the
Pentatonic families were each added without their own capability spec)

### Modified Capabilities
- `scale-data-model`: `ScaleMode` may now own a complete interval
  pattern instead of only rotating its family's pattern, so a family
  can group modes that aren't equal-length rotations of one another
  (the Blue family's Blues Minor/Blues Major). The Minor Pentatonic
  family's `blue` variant entry is removed.
- `scale-family-routing`: the variant-URL example scenario currently
  cites the Minor Pentatonic `blue` variant, which this change
  removes; the scenario is updated to a family-agnostic example so
  the requirement no longer depends on data this change deletes.
- `scale-fretboard`: same as above — the "Family with a variant
  (Minor Pentatonic + Blues)" scenario is updated since that variant
  no longer exists.
- `scale-info-table`: the "no Chords column" requirement/scenarios
  are updated to name the new Blue family explicitly (alongside the
  existing non-7-degree, non-Pentatonic-base-mode bucket), so the
  spec states — not just implies — that Blues Minor/Blues Major never
  show a Chords column.

## Impact

- `src/lib/scales.ts`: `ScaleMode` type gains an optional
  `intervalPattern` override; `getScaleNotes` consults it in place of
  rotating `family.intervalPattern` when present; new `blue`
  `ScaleFamily` entry; `blue` variant removed from the Minor
  Pentatonic entry.
- `src/lib/scales.test.ts`: replace the Minor-Pentatonic-`blue`-variant
  test with tests for the new Blue family's two modes; add/keep
  coverage for the new per-mode interval-pattern override path.
- `src/components/ScaleInfoTable.tsx`, `ScaleNav.tsx`, `ScalePage.tsx`,
  `ScaleWheel.tsx`, `ScaleDashboard.tsx`: no code changes expected —
  all already derive behavior generically from `family`/`modeId`
  data (degree count, family id) rather than hardcoded family lists;
  this change adds test/spec coverage confirming that holds for Blue.
- `openspec/specs/scale-data-model/spec.md`,
  `scale-family-routing/spec.md`, `scale-fretboard/spec.md`,
  `scale-info-table/spec.md`: updated via delta specs in this change.
