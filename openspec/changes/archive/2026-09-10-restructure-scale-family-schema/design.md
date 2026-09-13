# Design: Scale Family/Mode/Variant Schema

## Context

Prior data model assumed exactly one family (Major) with exactly 7 rotations
(modes), each mapped 1:1 to a display name (Ionian..Locrian). This does not
hold for non-diatonic or symmetric families, so the schema below separates
"how many notes" from "how many musically distinct rotations" from
"optional inserted notes."

## Data Model

```ts
type ScaleFamily = {
  id: string;                 // 'major' | 'harmonic-minor' | 'major-pentatonic' ...
  displayName: string;
  degreeCount: number;        // 5, 6, 7, 8...
  intervalPattern: number[];  // semitone steps from root; length = degreeCount
  modes: ScaleMode[];          // length 1 for symmetric families
  symmetric?: boolean;         // true if rotations repeat the same interval set
  variants?: ScaleVariant[];   // optional inserted-note toggles (e.g. blues)
};

type ScaleMode = {
  id: string;                 // 'ionian' | 'dorian' | 'phrygian-dominant' ...
  displayName: string;
  rotationIndex: number;      // index into intervalPattern to rotate from
};

type ScaleVariant = {
  id: string;                 // 'blue'
  displayName: string;
  insertAfterDegree: number;  // 0-indexed position in the rotated pattern
  insertInterval: number;     // semitone offset from root (e.g. 6 for b5)
};
```

Ids are kebab-case, full stop — for every family, mode, and variant. They are
used directly as route segments (`/[family]/[mode]`), so there is no
separate camelCase-internal / kebab-case-URL pair to keep in sync: the id
*is* the slug. `ScaleMode.id` values for the migrated Major family keep the
exact strings already in use today (`ionian`, `dorian`, `phrygian`,
`lydian`, `mixolydian`, `aeolian`, `locrian`) — these are already
single-word and lowercase, so they satisfy kebab-case as-is and need no
translation.

## Note computation

Single function, no per-family branching:

```
getScaleNotes(rootMidi, family, modeId, variantId?) -> number[]
```

1. Look up `mode` in `family.modes` by `modeId`; rotate `intervalPattern` by
   `mode.rotationIndex`.
2. Map rotated intervals to MIDI numbers from `rootMidi`.
3. If `variantId` given, look up `variant` in `family.variants`; splice in
   `rootMidi + variant.insertInterval` at `variant.insertAfterDegree`.

This function is the only place that knows about interval arithmetic. UI
and routing layers never compute notes themselves.

## Families shipped in M4

| Family | degreeCount | modes | symmetric | variants |
|---|---|---|---|---|
| Major (migrated) | 7 | 7 (Ionian..Locrian) | no | — |
| Harmonic Minor | 7 | 7 | no | — |
| Major Pentatonic | 5 | 5 | no | — |
| Minor Pentatonic | 5 | 5 | no | `blue` (insert b5) |

Symmetric families (Whole Tone, Diminished, Augmented) and Exotic families
(Hungarian Minor, Byzantine, Hirajoshi, etc.) are explicitly **not** part of
M4. The schema must not require code changes to add them later — that is
the acceptance bar for "the schema generalizes," not shipping them now.

## UI decisions

- `ScalePage` reads `family.modes.length`:
  - `> 1` → render mode selector (tabs), default to first mode.
  - `1` → hide mode selector entirely (prepares for symmetric families later,
    even though none ship in M4).
- `ScalePage` reads `family.variants`:
  - present and non-empty → render variant toggle(s) per entry.
  - absent/empty → no toggle rendered.
- No `if (family.id === 'major')`-style branching is permitted anywhere in
  the UI layer. Any reviewer finding such a branch should block the PR.

## Routing decisions

- `/[family]/[mode]` for families with `modes.length > 1`.
- `/[family]` alone (mode segment omitted) reserved for `modes.length === 1`
  — not exercised by any M4 family, but route generation must not assume
  a mode segment always exists.
- Existing major-scale URLs must keep resolving after migration (redirect or
  identical path shape — implementer's choice, call out in `tasks.md`).
- Variant selection is part of the URL, as a query string parameter:
  `/[family]/[mode]?variant=<variantId>`. It is a query param rather than a
  third path segment because variants are optional and per-family (only
  Minor Pentatonic ships one in M4) — a path segment would force every
  route to reason about a slot that's usually empty, including for the
  `modes.length === 1` families that already omit the mode segment. Absence
  of `?variant=` means the base scale (no inserted note); an unrecognized
  `variantId` for the current family is treated the same as absent rather
  than erroring. The toggle UI reads/writes this query param directly (via
  `next/navigation`'s router), so it stays in sync with the URL as the
  single source of truth — no separate local toggle state that could drift
  from it.

## Migration / compatibility

`src/lib/storage.ts` persists `PracticeSession` records with `rootNote:
string` and `mode: ModeName` (today's 7-value union: `ionian` | `dorian` |
... | `locrian`). Since the Major family's `modes[].id` values are chosen to
match those exact strings (see Data Model above), **no data migration is
needed** — old `PracticeSession` records resolve against the new schema
unchanged, option (b) from the two choices this section originally posed.
The only code change required is `storage.ts`'s `PracticeSession.mode`
type: it currently imports `ModeName` from `theory.ts`, which won't exist
after `theory.ts`'s major-scale-specific code path is removed (task 2.6).
Change it to `string` (a mode id) — `storage.ts` never validated mode
membership beyond the type, so this is a type-only change, not a runtime
one. `PracticeHistory`'s rendering of `mode` (currently via
`MODE_LABELS[mode]` or similar display lookup) needs to resolve the id
against the new family/mode data for display instead.

## Non-goals: capabilities not generalized in M4

`getScaleNotes()` generalizes note *computation*, but two existing
capabilities layer degree-count-specific logic on top of it and are **not**
part of this change's scope beyond the 7-note diatonic families (Major,
Harmonic Minor):

- **`scale-positions` / `fret-position-markers`**: `src/lib/positions.ts`'s
  `POSITION_SHAPES` are CAGED fret shapes keyed by `degree: 1-7`, tied to a
  7-note diatonic parent scale. They are not defined for `degreeCount: 5`
  (Pentatonic). Pentatonic families ship in M4 with position markers simply
  unavailable/hidden — extending CAGED-style positions to non-7-note
  families is out of scope here.
- **`diatonic-triad-highlighting`**: `getTriadQuality`/`getRomanNumeral`/
  `getDiatonicDegrees` in `theory.ts` hardcode a 7-entry `ROMAN_NUMERALS`
  array and `% 7` interval arithmetic. Triad highlighting for Pentatonic
  families is out of scope for M4; the degree-selector UI for triads is
  hidden (or disabled) for any family where `degreeCount !== 7`.

Both are pre-existing capabilities defined for the 7-note diatonic case;
this change neither breaks nor extends them for Pentatonic. A future
milestone that wants CAGED positions or triads for 5-note (or other
non-7-note) families needs its own change.
