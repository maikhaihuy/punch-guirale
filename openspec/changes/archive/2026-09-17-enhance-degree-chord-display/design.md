## Context

`ScaleDashboard.tsx`'s Degrees row currently renders one `PillGroup`
option per degree with label `${index + 1} ${noteName}` (e.g. `1 C`,
`2 D`). `theory.ts` already computes, per degree, `degreeLabel` (e.g.
`b3`), `romanNumeral` (quality-cased, e.g. `ii`, `vii°`), and `quality`
(`TriadQuality`), via `getDiatonicDegrees`. A separate
`getWholeHalfPattern(family, modeId)` returns the `W`/`H` gap to the
*next* degree for the whole row. None of this is wired into the
Degrees row today — only `.index` and `.noteName` are read.

This change is presentation-only for the degree/roman-numeral/W-H
parts (the data already exists). The one new piece of data is a chord
symbol vocabulary: what chords are conventionally built on a major,
minor, diminished, or augmented triad.

## Goals / Non-Goals

**Goals:**
- Render degree formula label + roman numeral + chord symbols per
  pill, and a W/H marker between pills, using existing `theory.ts`
  data plus one new static chord table.
- Keep the Degrees row's existing role as the triad-highlight control
  (`selectedTriadDegree`) and its `degreeCount === 7` gating unchanged.
- Chord vocabulary is static reference data (fixed table keyed by
  `TriadQuality`), not derived from per-mode 7th-degree interval math.

**Non-Goals:**
- Not deriving the *actual* 7th chord implied by each mode's own
  interval pattern (e.g. Ionian's I is really `maj7`, Mixolydian's I is
  really `7`). That's real music theory but requires extending
  `getTriadQuality`-style interval-gap math to a 4th chord tone, which
  the proposal explicitly scopes out in favor of a fixed, quality-keyed
  table (see proposal "What Changes"). Revisit as a follow-up change if
  per-mode accuracy is wanted later.
- Not changing Pentatonic behavior — the Degrees row (and thus this
  richer pill content) stays gated to `degreeCount === 7` families, same
  as today.
- Not adding new interaction — pills still select/deselect a triad
  degree exactly as before; the added content is read-only annotation.

## Decisions

### Chord vocabulary is a static table keyed by `TriadQuality`, not derived
The proposal calls for "data có sẵn" (pre-existing/static data) rather
than computed chord logic. `theory.ts` already derives `TriadQuality`
per degree from real interval math (`getTriadQuality`), so the new
table only needs 4 entries (major/minor/diminished/augmented), each an
ordered list of chord symbol strings:

```ts
// src/lib/chords.ts
export const CHORD_VOCABULARY: Record<TriadQuality, string[]> = {
  major:      ["", "6", "maj7", "add9"],
  minor:      ["m", "m6", "m7", "m9"],
  diminished: ["dim", "m7b5"],
  augmented:  ["aug", "maj7#5"],
};
```
(Exact symbol set is a content decision, not architectural — refined
during implementation/review.) A `getChordsForQuality(quality)` lookup
mirrors the style of existing small pure helpers in `theory.ts`.

**Alternative considered**: derive the real 7th chord per degree from
the mode's own intervals (stacking a 4th third on top of
`getTriadQuality`'s existing root/third/fifth math). Rejected for this
change because the proposal explicitly asks for static lookup data,
and per-mode 7th accuracy adds a second axis of derived music theory
(7th-interval gap table) that's better scoped as its own change if
wanted.

### Chord data lives in a new `src/lib/chords.ts`, not `theory.ts`
`theory.ts`'s existing comments repeatedly emphasize it as the "central
rendering function" module built on *derived* interval math
(`DEGREE_LABELS_BY_SEMITONE` is the one exception, and even that is a
semitone-indexed fixed table feeding into derived logic). A
quality-keyed content table is a different kind of artifact (display
vocabulary, not interval math) and is kept separate so `theory.ts`
stays focused on note/interval computation. This mirrors how
`positions.ts` already keeps CAGED shape data out of `theory.ts`.

### Degrees row layout: label / roman numeral / chords stacked per pill, W-H between pills
Each pill's content becomes 3 stacked lines (degree label, roman
numeral, chord symbols joined e.g. `maj7 · add9`), and a small `W`/`H`
text node is inserted between adjacent pills in the row (using
`getWholeHalfPattern`'s value at index `i` for the gap after degree
`i`, for `i` in `0..degreeCount-2` — the wrap-around gap after the last
degree isn't shown, matching that this is a linear degree list, not a
circular one). The "None" pill is unaffected (no roman numeral/chords/
W-H, same as today).

**Alternative considered**: a separate row of W/H markers above/below
the pills instead of interleaved. Rejected — interleaving keeps the
step directly between the two degrees it separates, which is the usual
convention in scale-formula diagrams (e.g. `1 – W – 2 – W – 3 – H – 4`).

### Degrees row is composed by hand, not through the shared `PillGroup`
`PillGroup` (`src/components/ui/pill-group.tsx`) owns its own flex
wrapper and maps `options` straight to buttons — it has no slot for
content *between* options, and its `label` is scoped per-button. Since
a W/H marker must sit in the gap between two buttons (not inside
either one), the Degrees row builds its own `<button>` elements
(reusing `PillGroup`'s `pill` variant class strings, or a local
equivalent) interleaved with plain `<span>` W/H markers, rather than
calling `<PillGroup>`. The "None" option stays a single ordinary pill
button before the interleaved sequence starts.

**Alternative considered**: extend `PillGroup` with an optional
`renderSeparator` prop. Rejected for this change — `PillGroup` is used
elsewhere for plain option lists (e.g. the Note/Degree-adjacent
controls), and a separator slot would be dead API surface everywhere
except this one row; revisit if a second caller needs it.

## Risks / Trade-offs

- [Pill content grows from 1 line to 3 lines + inter-pill markers] →
  `PillGroup` is a generic control; confirm it supports multi-line/
  custom option content before implementing, or extend it minimally.
  Verify visually at mobile widths (dashboard already wraps to a
  column at `sm:`).
- [Static chord table is a simplification, not per-mode-accurate] →
  Acceptable per proposal's explicit ask; documented as a Non-Goal so
  it isn't mistaken for an oversight later.
