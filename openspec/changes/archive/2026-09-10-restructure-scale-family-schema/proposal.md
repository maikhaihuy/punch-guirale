# Proposal: Restructure Scale Data as Family/Mode/Variant Model

## Why

The app currently models scales as a single hardcoded structure: one keynote,
7 modes of the major scale, rendered by logic that assumes "7-mode diatonic
family" everywhere it touches scale data. This does not generalize:

- Some scale families are not 7-note diatonic (Pentatonic = 5 notes, Whole
  Tone = 6, Diminished/Octatonic = 8).
- Some families have fewer *musically distinct* modes than their note count
  (Whole Tone has 1 unique mode, Diminished/Augmented have 2, not 7).
- Some families need an optional inserted note that isn't a "real" scale
  degree (Blues = Minor Pentatonic + chromatic passing tone).

Milestone 4 replaces the major-scale-only data model with a generic
Family → Mode → Variant schema, validated against two representative
families (Harmonic Minor as a second 7-note diatonic family, Pentatonic as
a 5-note family with a Blues variant), and updates the UI/routing layer to
render any family from data instead of major-scale-specific code paths.

## What Changes

- **BREAKING**: Internal scale data structure changes from a flat major-mode
  list to a `ScaleFamily` schema (see `design.md`). Any code reading the old
  structure directly must be updated.
- Add `getScaleNotes(rootMidi, family, modeId, variantId?)` as the single
  source of truth for computing scale notes, replacing the existing
  major-scale-specific note calculation.
- Existing Major scale is migrated to the new schema (no behavior change for
  end users).
- Add Harmonic Minor family (7 modes) as a second diatonic family to prove
  the schema generalizes beyond major.
- Add Pentatonic family (Major Pentatonic + Minor Pentatonic, 5 modes each)
  with a Blues variant toggle that inserts the chromatic passing tone.
- `ScalePage` UI component becomes family-agnostic: it reads `modes.length`
  and `variants` from data to decide whether to show a mode selector and/or
  variant toggle, instead of branching on family name.
- Add routing: `/[family]/[mode]` for diatonic families,
  `/[family]` (no mode segment) for single-mode/symmetric families going
  forward — out of scope for M4 itself since no symmetric family ships yet,
  but the route structure must not block adding one later.

## Impact

- Affected capabilities: `scale-data-model` (new), `scale-family-routing`
  (new), `scale-fretboard` (modified to consume the new data shape and
  render family-agnostically)
- This app currently has no routing beyond the single `/` page (see
  CLAUDE.md) — `scale-family-routing` is a genuine architecture addition
  (Next.js dynamic route segments, splitting the page, generating static
  params from data), not just a data-model refactor. Scoped in deliberately
  per M4, not deferred.
- Affected code: scale data source file(s), note-computation logic, mode
  selector component, page/route component, `src/lib/storage.ts`'s
  `PracticeSession.mode` type (see `design.md` "Migration / compatibility" —
  no data migration needed, only a type change)
- No change to Milestone 1/2 features (metronome, stopwatch, pitch-echo) for
  any family — they work against `getScaleNotes()` output unchanged. Triad
  highlighting and CAGED position markers continue working unchanged for
  7-note diatonic families (Major, Harmonic Minor) but are explicitly out of
  scope for Pentatonic — see `design.md` "Non-goals: capabilities not
  generalized in M4".
