## Context

Every existing `ScaleFamily` (`src/lib/scales.ts`) models its `modes`
as equal-length rotations of one shared `intervalPattern` —
`getScaleNotes` rotates `family.intervalPattern` by
`mode.rotationIndex` and that's the only arithmetic path. Blues breaks
that assumption: Blues Minor (`1 ♭3 4 ♭5 5 ♭7`, 6 notes) and Blues
Major (`1 ♭3 4 5 ♭7`, 5 notes) are two different-length scales that
should live under one family (shared nav entry, shared "no chords"
behavior), not rotations of each other. This is the first family that
needs it, so the data schema needs a small, additive extension rather
than a rewrite.

Everywhere else in the codebase that gates behavior on "is this a
7-degree family" already reads `family.degreeCount === 7` (never the
exact count otherwise), and `theory.ts`'s actual note computation
(`modeIntervals`, `buildFretboard`, `getDiatonicDegrees`, etc.) already
derives degree count per call from the resolved interval array's
length, not from `family.degreeCount`. So the only real constraint is:
`family.degreeCount` must not equal 7 for Blue, and nothing may assume
every mode in a family shares one interval-array length.

## Goals / Non-Goals

**Goals:**
- Model Blues Minor and Blues Major as a proper `blue` `ScaleFamily`,
  addressable at `/blue/blues-minor` and `/blue/blues-major`.
- Let a `ScaleMode` own its interval pattern outright when it isn't a
  rotation of its family's pattern, without touching any mode that
  still is (every existing family).
- Remove the now-superseded `blue` variant from Minor Pentatonic.
- Confirm, in specs and tests, that the ScaleInfoTable Chords column
  behaves correctly for Blue (hidden) without needing new UI code.

**Non-Goals:**
- No chord vocabulary for Blue (explicitly requested — Blues scales
  don't carry the fixed-chord-table treatment Pentatonic's base modes
  do).
- No generalization of `ScaleVariant` to support *removing* a note
  (e.g. modeling Blues Major as "Blues Minor minus the ♭5"). Two
  independent interval patterns is simpler and matches how the user
  specified both formulas explicitly.
- No change to `CHORD_SUFFIXES`/`MINOR_PENTATONIC_CHORD_SUFFIXES`/
  `MAJOR_PENTATONIC_CHORD_SUFFIXES` (`src/lib/chords.ts`) — these
  already match the requested reference examples exactly (E Major
  Pentatonic → E, F♯m7, G♯m7, Bsus4, C♯m; E Minor Pentatonic → Em, G,
  Am7, Bm7, D5). This change adds spec/test coverage, not new tables.

## Decisions

### `ScaleMode` gains an optional, self-owned `intervalPattern`
When present, `getScaleNotes` uses `mode.intervalPattern` directly in
place of rotating `family.intervalPattern` by `mode.rotationIndex`.
`rotationIndex` stays required on the type (existing modes keep using
it unchanged) but is ignored when `intervalPattern` is set — by
convention it's written as `0` on override modes to signal "unused."

Alternatives considered:
- **Model Blues Minor/Major as two separate single-mode families**
  (`blue-minor`, `blue-major`). Rejected: the user explicitly wants
  one `blue` family containing both as modes/peers, with one shared
  nav entry — matches how every other family groups its modes.
- **Extend `ScaleVariant` to support note removal**, keeping Blues
  Major as "Blues Minor minus ♭5". Rejected: variants are additive by
  design (`insertAfterDegree`/`insertInterval`) and are meant to layer
  onto a *displayed* base scale, not define a whole separate
  first-class, independently-routable scale — forcing that shape
  through the variant mechanism would need the Blues Major page to
  secretly render as "Blues Minor + a hidden subtraction," which is
  more indirection than two flat interval arrays.

### `family.intervalPattern`/`degreeCount` represent the family's base mode, not every mode
For Blue, `intervalPattern` is the Blues Minor pattern (6 notes,
`rotationIndex: 0` on the `blues-minor` mode) and `degreeCount: 6`.
`blues-major` overrides with its own 5-note `intervalPattern`. This
mirrors every other family, where `intervalPattern`/`degreeCount`
describe the family's first/base mode and other modes are expressed
relative to it (by rotation, or now, by full override) — no caller
reads `family.degreeCount` expecting it to match the *currently
selected* mode's exact note count; all of them only test `=== 7`
(major-scale-shaped families) vs. anything else.

### Minor Pentatonic's `blue` variant is deleted outright, not deprecated
The `ScaleVariant` type and the generic `?variant=` plumbing
(`ScalePage`, `ScaleNav`, `scale-family-routing`) stay in the codebase
— they're generic, data-driven infrastructure, not Blues-specific —
but no `ScaleFamily` will define a `variants` array after this change,
since Blue was the only one. This is intentional: leaving unused
generic infrastructure in place (rather than deleting it) is cheaper
than re-adding it if a future scale needs a true "add one note to the
displayed base scale" toggle, and CLAUDE.md already documents variants
as generic, family-agnostic infrastructure.

## Risks / Trade-offs

- **Naming overlap**: Major Pentatonic already has mode ids/labels
  `blues-minor`/`Blues Minor` and `blues-major`/`Blues Major` (its own
  2nd/3rd rotations, a pre-existing pentatonic-mode naming
  convention unrelated to the 6-note Blues scale) → different note
  content under the same display names, in different families. Routes
  are scoped by family segment (`/major-pentatonic/blues-minor` vs.
  `/blue/blues-minor`) so there's no technical collision, only a
  possible cosmetic/user-facing naming echo. Mitigation: none needed
  functionally; flagged here for awareness, not fixed in this change
  since the pentatonic mode names are pre-existing and out of scope.
- **Silent behavior change on old bookmarked URLs**:
  `/minor-pentatonic/minor-pentatonic?variant=blue` currently renders
  the ♭5-augmented scale; after this change the same URL silently
  renders the base 5-note scale (unrecognized variant → ignored, per
  existing spec'd fallback) rather than 404ing or redirecting →
  Mitigation: none implemented (no analytics/redirect infra exists to
  detect this case); called out as **BREAKING** in the proposal so
  it's a visible, accepted trade-off rather than a silent regression.
- **`family.degreeCount` no longer describable as "this family's
  degree count"** for Blue specifically, since its two modes have
  different lengths → Mitigation: every current caller only branches
  on `=== 7`, verified by grep across the codebase; documented above
  so a future caller doesn't assume the field is mode-invariant.

## Migration Plan

1. Extend `ScaleMode`/`getScaleNotes` in `src/lib/scales.ts` (additive,
   non-breaking for existing families).
2. Add the `blue` family (Blues Minor as base mode, Blues Major as an
   override mode); remove the `blue` entry from Minor Pentatonic's
   `variants`.
3. Update `src/lib/scales.test.ts`: replace the Minor-Pentatonic-blue-
   variant test with Blue-family tests; add a case covering the new
   override-interval-pattern path.
4. No component changes expected; `generateStaticParams`
   (`src/app/[family]/[mode]/page.tsx`) picks up the new routes
   automatically from `SCALE_FAMILIES`.
5. Update the four affected spec files (delta specs in this change).

Rollback: revert the `src/lib/scales.ts` data/type changes; no
persisted or external state depends on the `blue` family existing.

## Open Questions

None blocking. One judgment call worth surfacing for review before
`/opsx:apply`: the user-specified Blues Major formula (`1 ♭3 4 5 ♭7`)
has the identical note content to the existing Minor Pentatonic base
mode (`1 ♭3 4 5 ♭7`) — it differs only in the context/label it's
presented under, not in which notes it produces. This is implemented
literally as given rather than substituted with a textbook "major
blues scale" (`1 2 ♭3 3 5 6`), since the user's formula was explicit
and unambiguous.
