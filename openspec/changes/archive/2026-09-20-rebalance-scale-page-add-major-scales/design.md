## Context

See `proposal.md` for motivation. Current state that shapes the approach:

- `ScaleDashboard` renders the wheel and info table in a
  `flex flex-wrap items-center gap-2` section. `ScaleWheel`'s wrapper is
  `w-full max-w-96 min-w-40 shrink-0`, so the wheel always claims 100% of the
  line and the table wraps under it — the bug behind "same row".
- The Degrees pills and the Note/Degree switch are two content-sized children
  of a `sm:flex-wrap` section, so neither has a defined share of the row.
- `getScaleRows()` already prefers reference data over derivation, and
  `REFERENCE_BY_PATTERN` is keyed by the resolved interval pattern
  (`intervals.join(",")`). Nothing in either assumes reference patterns are
  non-7-degree, so 7-degree reference patterns should work without logic
  changes.
- Pentatonic already has two families that are rotations of the same five
  patterns (Major / Minor Pentatonic), which is the precedent for a second
  family that shares patterns with an existing one.
- The reference schema has a fixed `ReferenceHint` union
  (`rarely-used | avoid-note | turnaround | not-applicable`); chord suffixes
  are free-form strings.

## Goals / Non-Goals

**Goals:**
- Wheel and table on one row (`md`+), Degrees 8 : switch 2 of their
  row (`md`+), with the degree pills growing to fill the Degrees share, both stacking gracefully below `md`.
- Two new 7-mode families and two hand-authored reference row sets, added as
  data with no new branching in components or `getScaleNotes`.

**Non-Goals:**
- No new `ReferenceHint` for the sheet's "Cực kỳ phổ biến" note on Harmonic
  Major's `iv` row — it is commentary, not a slot property, and adding a hint
  means new UI strings and a schema change for one row.
- No reference rows for Harmonic Major's other six modes or Melodic Major's
  other six; they stay derived (only the base pattern was supplied).
- No changes to wheel drawing, the Degrees pills' content, or the fretboard.
- No Vietnamese UI strings; the reference data and labels stay English like
  the rest of the table.

## Decisions

### 1. Row layout uses CSS grid at `md`, not `flex-wrap`

Wheel/table row: `grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]
md:items-start`. Both cells get `min-w-0`, which is what lets the table's
existing `overflow-x-auto` wrapper scroll inside its column instead of
stretching the page. The wheel wrapper drops `w-full` in favor of `w-full
max-w-96 mx-auto` (centered when stacked; in the wide layout it fills its 2fr
cell, capped at 384px as today). Its existing `ResizeObserver` keeps deciding
whether degree labels fit, so the "wheel scales fluidly" requirement needs no
change: the wheel simply measures a different container.

Degrees/switch row: `grid gap-3 md:grid-cols-[minmax(0,8fr)_minmax(max-content,2fr)]
md:items-center`. `minmax(max-content, 2fr)` gives the switch its 2/10 share
but never less than its own content (`Note ◯ Degree`), which is what the
"never truncated" scenario needs at 768px where 2/10 of the content width is
only ~140px. Inside the Degrees cell each degree wrapper is `flex-auto` and its
button `flex-1`, so the pills stretch across the whole share (a fixed-width
pill row left about half of it empty at 1440px) while `flex-auto`'s content-
based basis keeps wrapping on narrow screens.

*Alternatives:* (a) `flex` with `basis-4/5` / `basis-1/5` (the same 8:2 ratio) — works but the small
cell can shrink under its content, and `flex-wrap` was the original problem;
(b) stay `flex-wrap` and set `md:w-2/5` on the wheel — no defense against
sub-pixel wrap when gap + widths exceed 100%; (c) `lg` instead of `md` as
the breakpoint — rejected: on a tablet (768–1024px) the table would scroll
locally inside its 3fr column, which is better than stacking it under the wheel.

### 2. Melodic Major is its own family; the pentatonic pair is the precedent

Melodic Major's pattern `0,2,4,5,7,8,10` already exists as Melodic Minor's
`mixolydian-b6`. Options:

- **New `melodic-major` family** with 7 rotations (chosen). Users looking for
  "Melodic Major" find it in the nav by name; consistent with Major / Minor
  Pentatonic sharing the same five patterns. Because the reference is keyed by
  pattern, Melodic Minor's Mixolydian ♭6 page also gains the richer table —
  which is correct, it *is* the same scale.
- Alias only (add reference data, no family) — smaller, but Melodic Major
  would be undiscoverable, and its modes (Locrian ♮2 first …) would not read
  as "starting from Melodic Major".
- Rename Melodic Minor's mode — breaks existing URLs.

Mode ids follow existing conventions (`dorian-b2`, `locrian-natural-2`,
`lydian-sharp-2`, `super-locrian-bb7`, …), and don't collide within a family:

| Family | Mode ids (rotation 0 → 6) |
| --- | --- |
| `harmonic-major` | `harmonic-major`, `dorian-b5`, `phrygian-b4`, `lydian-b3`, `mixolydian-b2`, `lydian-augmented-sharp-2`, `locrian-bb7` |
| `melodic-major` | `melodic-major`, `locrian-natural-2`, `super-locrian`, `melodic-minor`, `dorian-b2`, `lydian-augmented`, `lydian-dominant` |

Display names use the ♭/♯/♮ glyphs like the existing entries. Alternative
names go in the spec/notes rather than the UI: "Ionian ♭6" (Harmonic Major),
"Mixolydian ♭6 / Aeolian Dominant" (Melodic Major). Family order in
`SCALE_FAMILIES`: Harmonic Major after Harmonic Minor, Melodic Major after
Melodic Minor, so the nav stays grouped by theme.

### 3. 7-degree reference rows reuse the existing shapes

Rows are plain `ReferenceRow`s (`offset`, `roman`, `name`, `chords`); no schema
change. Specific data choices:

- Sharp spelling throughout (`Ab` → `G#`, `Bb` → `A#`), because
  `getReferenceSlots` renders note names from `CHROMATIC`; specs already note
  this convention.
- Chord suffixes are written as the sheet does, minus its spacing:
  `aug` (`G#aug`, not `G# aug`), `maj7#5`, `dim`, `dim7`, `m7b5`, `(maj7)`.
  Note existing rows use `°7` (blues); the sheet says `dim7`, so `dim7` is used
  for the new rows rather than editing existing data.
- Degree name for offset 11 is `Leading Tone` (with a space) to match
  `scaleTerms.ts`; the sheet's `LeadingTone` is a typo-level variation.
- No `hint`, no `blueNote`. The sheet's Vietnamese parentheticals
  (`Nửa giảm - Half-diminished`, `Giảm toàn phần`, `Cực kỳ phổ biến`) are
  explanations, not data, and are dropped.
- `skipped` is derived (`!intervals.includes(offset)`), and since each new
  pattern has exactly 7 in-scale offsets equal to the 7 rows, none are skipped.

### 4. `getScaleRows` needs no logic change

`getReferenceSlots` returns rows first, so a 7-degree family with reference
data automatically takes the reference path, while Harmonic Major's other six
modes (no reference) fall through to the derived path. A test pins both
branches so the precedence isn't accidental. The stray
`console.log("getScaleRows", …)` in that function runs on every render;
removing it is a one-line cleanup done in the same change.

### 5. Spec restructuring

`scale-degree-reference`'s first requirement is renamed (seven → nine) with a
`RENAMED` + `MODIFIED` pair rather than keeping a stale title. The two new
row sets go in an `ADDED` requirement instead of extending the long "by slot"
lists in the two existing requirements, to keep the delta reviewable.

## Risks / Trade-offs

- **[Some supplied chords contain notes outside their scale]** In Melodic
  Major (C `D E F G A♭ B♭`), `Fm7` (F A♭ C **E♭**) and `A#maj7` (B♭ D F **A**)
  use E♭ and A natural, which the scale does not have. This mirrors the
  editorial nature of existing data (`C7#9` under `bIII`), and the user
  supplied it, so it is included as written. → Confirm with the requester
  before implementation whether `Fm7` / `Bbmaj7` were intended (`/opsx:apply`
  will keep them as specified unless told otherwise).
- **[Melodic Minor's Mixolydian ♭6 page changes]** It now shows the Melodic
  Major reference. → Intended and called out in the proposal and spec
  (`Melodic Minor's Mixolydian ♭6 shares the Melodic Major reference`).
- **[The table may scroll horizontally near 768px]** Six `whitespace-nowrap`
  columns with chord lists like `Fm, Fm6, Fm(maj7)` are likely wider than a
  3fr column at that width (not measured). → Keep the existing
  `overflow-x-auto` inside a `min-w-0` cell so the scroll stays local to the
  table.
- **[Wheel gets narrower]** In the 2fr cell the wheel is roughly 290px at
  768px by arithmetic, above its 200px legibility threshold. → No change to
  the threshold; confirm in the manual check at 768px and 1024px.
- **[Component tests can't measure layout]** Tests use `renderToStaticMarkup`,
  so layout assertions are limited to structure/classes. → Verify visually
  (manual pass at 375, 768, 1024, 1440) as part of the tasks.
