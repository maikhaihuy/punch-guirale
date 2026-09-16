## Context

`ScaleWheel.tsx` (from `add-circular-scale-wheel`) renders a 12-wedge outer
ring (note names, dimmed when out-of-scale) plus an inner ring that's gated
on `family.degreeCount === 7` and only populated for in-scale wedges, via
`getDiatonicDegrees()`. `theory.ts` already has a family-agnostic 12-entry
degree-label table (`DEGREE_LABELS_BY_SEMITONE` / `degreeLabelForSemitone`,
currently module-private) and a `getWholeHalfPattern(family, modeId)`
function whose gap check only distinguishes `H` (1 semitone) from `W`
(everything else) — correct for 7-note families where every gap is 1 or 2,
but silently wrong for Pentatonic, where root→b3 is a 3-semitone gap. There
is no chord-symbol function yet, only `getRomanNumeral` +
`getTriadQuality`. Randomize today is a separate control next to the wheel,
wired to `randomRoot()`. The wheel's outer width is two fixed Tailwind
classes (`w-[240px] sm:w-[260px]`) rather than the continuous,
`ResizeObserver`-driven scaling `Fretboard.tsx` already uses for its
`fretWidth`.

Khai-Huy prototyped this change's wheel concept in a standalone HTML demo
(`scale_wheel_concentric_rings.html`, not part of the app) and gave feedback
on it in a separate conversation, reconciled into this design/spec pass:
dual-name degree labels are confirmed (Decision 1, already reflected
below); the demo's illustrative chord table is a visual mockup only, not a
source of truth for real per-family chord logic (see Non-Goals); and two
more gaps surfaced that this revision folds in — `Fretboard.tsx`'s
`fretWidth` has no floor at all today (`(containerWidth -
STRING_LABEL_WIDTH) / displayFretCount`, shrinking without limit on narrow
containers with many visible frets), and the wheel's own fluid-sizing plan
(Decision 6) only described growing larger, not what happens as it shrinks
past legibility.

A later look at that same demo file settled a point this design had open:
the demo renders the wheel inline (no modal/popup), so a since-removed
Decision 9 (compact indicator + expanded modal view) is reverted — Khai-Huy
confirmed the wheel stays inline.

A further round of feedback refined the ring geometry beyond even the
demo's own literal layout: rather than the demo's W/H-arc-on-the-outer-ring
approach, Khai-Huy asked for exactly two rings — the degree label combined
directly with the note name on the outer ring, and the W/H arcs moved onto
the *inner* ring alongside the roman-numeral/chord-symbol content.
Decisions 1 and 3 below reflect this final geometry.

Once that two-ring layout was in place, Khai-Huy flagged that Pentatonic's
inner ring came up empty — no roman numeral, no "suggested chord" — unlike
the demo, whose Pentatonic preset does show something there (`i`, `♭III`,
`iv`, `v`, `♭VII`). Investigating confirmed the existing gate was correct
to withhold *real* triad math: `getTriadQuality`'s every-other-degree
stacking assumes 7 degrees per octave, and running it over a 5-note
interval pattern lands on non-third gaps that report "augmented" for
nearly every degree — not usably wrong, just wrong. Asked to choose between
matching the demo's specific (hand-picked, mode-specific) labels, inventing
a generalizable illustrative label, or leaving it empty, Khai-Huy picked
the generalizable illustrative label (Decision 9). Separately, Khai-Huy
asked to enlarge the wheel ("phóng to"); `SIZE` and every radius grew
accordingly (Decision 6).

## Goals / Non-Goals

**Goals:**
- Every wedge shows a chromatic degree label, regardless of family or
  scale membership.
- Whole/half-step relationships between in-scale notes are visible on the
  wheel itself, correctly labeled for both 7-note and 5-note families.
- Chord symbols (not just roman numerals) render for 7-degree families.
- Randomize is part of the wheel, not a separate sibling control.
- The wheel scales fluidly with its container instead of snapping between
  two fixed widths, and degrades (hides rings) rather than shrinking text
  past legibility at small sizes.
- The fretboard's fret cells scale fluidly down to a tappable minimum
  width, then rely on existing scroll/zoom instead of shrinking further.

**Non-Goals:**
- Real chord *letter* symbols and true triad quality for non-7-degree
  (Pentatonic) families — tertian triads don't generalize the same way;
  still deferred (see Open Questions). Non-7-degree families do now get
  an illustrative roman numeral (Decision 9), just no chord letter and no
  quality-based case distinction.
- Moving triad-degree selection (the Degrees `PillGroup`) onto the wheel —
  still out of scope, unchanged from `add-circular-scale-wheel`'s
  Non-Goals.
- Root-locked-at-top rotation — the wheel stays fixed-chromatic-order per
  the prior change's Decision 3; not revisited here.
- Randomizing family/mode from the wheel's center — the center hub tap
  randomizes the root only, within the current family/mode (unchanged
  behavior from `add-circular-scale-wheel`). Family/mode is route-driving,
  so a random family/mode jump is a bigger, more surprising action than a
  random root; if ever added, it needs its own more deliberate interaction
  (e.g. long-press vs. tap) and confirmation, not designed here.
- Deriving real per-family/mode chord-building logic from the prototype
  HTML demo's chord table. That table (standard diatonic triads for Major,
  an approximated set for Pentatonic) is an illustrative mockup only;
  `getChordSymbol` (Decision 4) consumes the existing `TriadQuality` from
  `getTriadQuality`, which is unchanged by this design.

## Decisions

1. **Export `getChromaticDegreeLabel(offset: number): string[]`** as a
   thin public wrapper around the existing `degreeLabelForSemitone` /
   `DEGREE_LABELS_BY_SEMITONE` table in `theory.ts`, extended to return
   both enharmonic names at the 5 semitone offsets that have one (`1` →
   `["b2", "#1"]`, `3` → `["b3", "#2"]`, `6` → `["b5", "#4"]`, `8` →
   `["b6", "#5"]`, `10` → `["b7", "#6"]`) and a single-entry array at the
   other 7 (`0` → `["1"]`, etc). `ScaleWheel` calls this for all 12
   wedges, independent of `scaleNotes.has(note)`.
   - **Resolved (was an Open Question): dual-name display.** Khai-Huy
     confirmed the wheel should show both the flat-side and sharp-side
     name at each accidental position (e.g. `b2/#1`), reversing this
     design's earlier single-name default. `FretNote.degree` and
     `getTriadDegreeLabels` are untouched — they keep their existing
     single (flat-side) label; the dual-name change is scoped to the
     wheel's chromatic degree ring only, since only the wheel needs to
     represent "any family/mode could land here" rather than one
     already-resolved scale's degree.
   - **Geometry resolved: stacked with the note, on the outer ring
     itself — not a separate ring.** After two rounds of feedback on the
     reference demo, the final layout is exactly two rings: the degree
     label renders as a second, smaller line directly under the note name
     within the same outer-ring wedge (both anchored at `OUTER_RADIUS`),
     rather than floating at its own radius outside the note ring (an
     intermediate pass of this design) or occupying a distinct middle
     ring (the original draft). "1-2-3 ở vòng tròn ngoài đưa vô cùng note
     luôn" — the degree number belongs with the note, on the outer ring.

2. **Roman numeral and chord symbol render together, gated on
   `degreeCount === 7`**, unchanged gate from today — only the *chromatic
   degree label* ring becomes universal (Decision 1). This keeps the
   existing, already-correct gate for diatonic-triad math
   (`getTriadQuality`/`getRomanNumeral` don't generalize to 5-note
   interval patterns — same reasoning as the original design.md's
   Non-Goals) while fixing the actual gap: Pentatonic had *no* degree info
   at all, when it could always have had the degree-label part.
   - **Resolved (was an Open Question): alongside, not replacing.** The
     chord symbol is rendered next to the existing roman numeral, not in
     place of it — nothing about "diatonic triad roman numeral" is being
     removed from the wheel, the chord symbol is purely additive.

3. **`getWholeHalfPattern`'s gap check becomes 3-way**: `1` semitone → `H`,
   `2` semitones → `W`, anything else → the semitone count as a string
   (e.g. `"3"`). This is an in-place fix to the existing function, not a
   new one — the function's current binary check was never correct for
   non-7-note families; it just had no caller that exercised that path
   yet. `ScaleWheel` becomes a caller that doesn't apply the
   `degreeCount === 7` convention this function's comment describes, since
   the fixed 3-way version is now meaningful for Pentatonic too.
   - Arc labels render between consecutive **in-scale** wedges only
     (sorted by chromatic index, wrapping past B→C), matching the visual
     mock discussed with Khai-Huy: the arc *is* the interval between two
     active degrees, so it has no meaning between two dimmed wedges.
   - The `H`/`W`/count label sits at the arc's angular midpoint — the
     label reads most naturally as "the gap between these two," positioned
     on the gap itself rather than anchored to either wedge.
   - **Geometry resolved: arcs trace the inner ring, alongside the
     roman-numeral/chord-symbol content — not the outer note ring.** This
     is the final word after two rounds of feedback: an intermediate pass
     had the arc trace `OUTER_RADIUS` (matching the reference demo's
     literal code), but Khai-Huy's follow-up was explicit — "W-H đặt ở
     vòng tròn bên trong" (W-H goes on the inner ring). The arc path, its
     `H`/`W`/count label, and (for `degreeCount === 7` in-scale wedges) the
     roman numeral/chord symbol all now share `INNER_RADIUS`. Combined
     with Decision 1's geometry note, the wheel is exactly two rings: outer
     (note + degree, stacked) and inner (W/H arcs + roman numeral/chord
     symbol), plus the center hub.

4. **New `getChordSymbol(noteName: NoteName, quality: TriadQuality):
   string`** in `theory.ts` — e.g. `("D", "minor") → "Dm"`,
   `("B", "diminished") → "B°"`, `("C", "major") → "C"`. Rendered in the
   wheel's chord ring for `degreeCount === 7` in-scale wedges, **alongside**
   the existing roman numeral (resolved — see Decision 2). Kept as a pure
   string-formatting function parallel to `getRomanNumeral`, not a new
   theory concept — it consumes the same `TriadQuality` that already
   exists.

5. **Center hub becomes the randomize control.** A new clickable circle at
   `(CENTER, CENTER)` with its own oversized touch target (same technique
   as the outer wedges' `TOUCH_RADIUS` circle), `onPointerDown={() =>
   onRootChange(randomRoot())}`, visually distinct fill (accent color, not
   the wedge fill/stroke language) so it doesn't read as a 13th wedge. The
   standalone randomize button is removed from `ScaleDashboard.tsx`.
   - Alternative considered: keep the sibling button *and* add a center
     hub, offering both. Rejected — duplicate controls for the same action
     next to each other is confusing, and Khai-Huy's intent was explicitly
     to fold it in, not add a second entry point.

6. **Fluid width via CSS only, no `ResizeObserver`.** Replace
   `"h-auto w-[240px] shrink-0 sm:w-[260px]"` with a fluid width (e.g.
   `w-full max-w-[N] min-w-[M]`, exact px values an implementation detail
   — see Open Questions). Because `ScaleWheel` is a single self-contained
   `viewBox` SVG (unlike `Fretboard.tsx`, which must snap fret cells to
   real pixel boundaries across a horizontally-scrolling multi-string
   grid), the internal wedge/ring geometry already scales proportionally
   with whatever pixel width the wrapper resolves to — no JS measurement
   needed, just loosening the CSS constraint. This is no longer just
   implementation polish: Khai-Huy asked for the wheel to scale with
   screen size the same way the fretboard already scales, so this is now
   captured as its own spec requirement ("Wheel scales fluidly with
   available width").
   - `SIZE`/`OUTER_RADIUS`/`INNER_RADIUS`/`TOUCH_RADIUS` all move outward
     to make room for the new chord ring and W/H arc labels without
     crowding the existing note + degree rings. Exact new values are an
     implementation detail to tune during build (same stance the original
     design.md took on wheel diameter).
   - **Resolved: no separate expanded/modal view.** An intermediate pass
     of this design tried moving the wheel behind a compact indicator +
     modal (density concerns), tracked as a since-removed Decision 9.
     Reviewing the reference demo (`scale_wheel_concentric_rings.html`)
     directly settled it the other way: the demo itself renders the wheel
     inline, confirming Khai-Huy wants it inline, growing larger and
     denser in place (this decision) rather than moving behind an
     extra tap. Decision 7's size-based ring degradation is what handles
     the "too dense for a narrow layout" case instead.

7. **Wheel hides its enrichment rings below a minimum rendered size,
   instead of shrinking their text.** Below a size threshold (exact px
   value TBD — see Open Questions), `ScaleWheel` renders only what
   `add-circular-scale-wheel` originally shipped: the outer note ring,
   scale-membership dimming, root distinction, and center randomize hub.
   The degree ring, whole/half-step arcs, and roman-numeral/chord-symbol
   ring disappear entirely below that point rather than rendering at an
   illegible size. This is a step function on rendered size (checked
   against the same resolved pixel width Decision 6 already computes for
   the wheel), not a text-scaling problem — below the threshold there
   isn't room to keep those rings legible, so they're hidden rather than
   shrunk.

8. **Fretboard fret cells get a minimum tappable width, then defer to
   existing scroll/zoom.** `Fretboard.tsx`'s `fretWidth` computation
   (`(containerWidth - STRING_LABEL_WIDTH) / displayFretCount`) gets a
   floor of ~32–40px. Once the computed width would fall below that floor,
   `fretWidth` clamps to the floor instead of continuing to shrink;
   reaching more of the fretboard at that point relies on the range
   minimap, corner zoom controls, and touch pinch/pan gestures that
   `fretboard-viewport` already provides (e.g. by narrowing
   `displayFretCount`), not on cells getting smaller than a tap target.
   This mirrors the wheel's own floor behavior (Decision 7) applied to the
   fretboard's existing sizing mechanism, per Khai-Huy's explicit ask that
   both controls follow "the same principle."

9. **New `getIllustrativeRomanNumeral(degreeLabel: string): string`** in
   `theory.ts` — parses the existing `degreeLabel` string (e.g. `"b3"`,
   `"5"`) into a flat prefix plus a 1-7 position, and returns a roman
   numeral for that position (e.g. `"bIII"`, `"V"`), always uppercase,
   with no chord letter and no case-based quality distinction. Used for
   the wheel's inner ring on non-7-degree families, in place of the real
   `getRomanNumeral`/`getChordSymbol` pairing (Decision 2/4), which stays
   7-degree-only. This is explicitly a scale-*position* label, not a
   triad-*quality* label — the doc comment on the function calls this out
   so a future reader doesn't mistake it for real harmonic analysis.
   - Rejected alternative: hardcode the demo's exact minor-pentatonic
     mapping (`i`, `♭III`, `iv`, `v`, `♭VII`). That's mode-specific (case
     signals quality the demo picked by ear for one preset) and wouldn't
     generalize to Major Pentatonic or the other pentatonic-family modes
     without a separate hand-picked table per mode — Khai-Huy chose the
     generalizable option instead.
   - Rejected alternative: leave the inner ring empty for non-7-degree
     families (today's/the prior decision's behavior). Rejected because
     it reads as broken/incomplete next to the demo, which always shows
     *something* there.

## Risks / Trade-offs

- [Third ring (chord symbols) plus arc labels risks visual clutter,
  worse than the original change's two-ring concern] → Mitigation: only
  the outer ring carries touch targets, same as today; every new ring
  (degree, chord, W/H arc label) stays display-only text, so density adds
  visual complexity but not interaction complexity.
- [`getWholeHalfPattern`'s existing callers (Degrees row, if any) get a
  3-way return value instead of binary] → Mitigation: existing callers are
  already gated to `degreeCount === 7` families, where gaps are always 1
  or 2, so the new third branch never triggers for them — behavior is
  unchanged for existing call sites.
- [Dual-name degree labels double the text at 5 of the 12 wedge
  positions] → Mitigation: only the chromatic degree ring uses dual
  names; the note-name ring and the roman-numeral/chord-symbol ring stay
  single-label, so the density increase is confined to one ring, sized by
  Decision 6's now-larger wheel.
- [Wheel is now denser than the original "compact dashboard control" goal]
  → Accepted, not fully resolved: the wheel stays inline (per the
  reference demo) and grows larger to fit every ring at sizes above its
  minimum (Decision 6), falling back to the original, less-dense ring set
  below it (Decision 7). Unlike an earlier draft of this design, there's
  no separate compact/expanded split — the dashboard is simply denser
  than `add-circular-scale-wheel` shipped, which is the accepted
  trade-off for showing this much scale structure inline.
- [Fretboard's new width floor (Decision 8) could clip a wide fret range
  on a narrow screen] → Mitigation: this is exactly what
  `fretboard-viewport`'s existing minimap/zoom/pan controls are for —
  the floor only changes what happens once cells would go below tappable
  size (narrow the visible range / prompt scroll-zoom) instead of
  changing the default visible range or those controls' existing
  behavior.
- [Illustrative roman numeral (Decision 9) could be mistaken for a real,
  quality-bearing roman numeral like `getRomanNumeral` produces for
  7-degree families] → Mitigation: it's always uppercase (no lowercase/°/+
  variants), so it never visually claims a quality it didn't compute; the
  function's doc comment states explicitly that it's position-only.

## Migration Plan

N/A — presentational plus pure-function additions to `theory.ts`; no
persisted state, schema, or routing changes.

## Open Questions

- Real chord *letter* symbols for non-7-degree families (Pentatonic) —
  still deferred; needs its own design pass on what "a chord" even means
  over a 5-note collection before it's worth speccing. The illustrative
  roman numeral (Decision 9) covers the "empty inner ring" gap without
  answering this.
- The Decision 7 minimum-size threshold at which the wheel drops its
  enrichment rings — implementation detail, tune during build.
