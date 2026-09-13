## 1. Schema & data
- [x] 1.1 Define `ScaleFamily` / `ScaleMode` / `ScaleVariant` types (per `design.md`)
- [x] 1.2 Migrate Major scale data into the new schema (7 modes, no variants)
- [x] 1.3 Add Harmonic Minor family data (7 modes)
- [x] 1.4 Add Major Pentatonic family data (5 modes)
- [x] 1.5 Add Minor Pentatonic family data (5 modes) + `blue` variant (insert b5)
- [x] 1.6 Apply kebab-case identifier convention across family/mode/variant ids (they double as route segments — no separate slug transform); Major's mode ids keep today's exact strings (`ionian`, `dorian`, ...)

## 2. Note computation
- [x] 2.1 Implement `getScaleNotes(rootMidi, family, modeId, variantId?)` as pure function
- [x] 2.2 Unit tests: Major (all 7 modes) match pre-migration output exactly
- [x] 2.3 Unit tests: Harmonic Minor modes produce correct interval sets
- [x] 2.4 Unit tests: Pentatonic modes (both major/minor) produce correct interval sets
- [x] 2.5 Unit tests: Minor Pentatonic + `blue` variant inserts b5 at correct position, base scale unaffected when variant omitted
- [x] 2.6 Remove old major-scale-specific note calculation code path entirely

## 3. UI component
- [x] 3.1 Refactor `ScalePage` to accept `family`/`modeId`/`variantId` props, no family-id branching
- [x] 3.2 Mode selector renders from `family.modes`; hidden when `modes.length === 1`
- [x] 3.3 Variant toggle(s) render from `family.variants`, driven by the `variant` URL query param (not local state) — hidden when `family.variants` absent/empty
- [x] 3.4 Verify Milestone 1/2 features (Note/Degree toggle, triad highlight, pitch-echo, metronome, stopwatch) work unchanged for the 7-note diatonic families (Major, Harmonic Minor)
- [x] 3.5 Manual QA: Major scale UI is pixel/behavior-identical to pre-migration
- [x] 3.6 Hide/disable CAGED position markers and the triad degree-selector for families where `degreeCount !== 7` (Pentatonic) — see design.md "Non-goals"

## 4. Routing
- [x] 4.1 Implement `/[family]/[mode]` dynamic route generated from family/mode data
- [x] 4.2 Confirm route generation does not hardcode a mode segment (supports future `modes.length === 1` families)
- [x] 4.3 Preserve or redirect existing Major scale URLs so old links keep working
- [x] 4.4 Generate static params (if using Next.js SSG) from the family data instead of a manual list
- [x] 4.5 Read/write the `variant` query param via `next/navigation` (`useSearchParams` / `router.replace`) so toggling a variant updates the URL without a full navigation; treat an unrecognized `variant` value for the current family as absent

## 5. Persistence / migration
- [x] 5.1 No data migration: Major family's `modes[].id` values reuse today's exact `ModeName` strings, so existing `PracticeSession` records resolve unchanged (see design.md "Migration / compatibility")
- [x] 5.2 Update `storage.ts`: change `PracticeSession.mode` type from `ModeName` (removed in 2.6) to `string`; update `PracticeHistory`'s mode-label display to resolve the id against the new family/mode data
- [x] 5.3 Manual QA: existing practice history still displays correctly after upgrade

## 6. Docs
- [x] 6.1 Update CLAUDE.md / MVP_SPEC.md pointer if scale-data module location changes
- [x] 6.2 Note in README (if present) how to add a new scale family going forward — README.md is untouched create-next-app boilerplate, not this repo's real docs; folded "how to add a family" guidance into CLAUDE.md's new scales.ts bullet instead
