## Context

`ScaleInfoTable.tsx` builds one row per in-scale degree from
`getDiatonicDegrees()`. It gates the Degree column on
`degreeCount === 7`, and the Chords column on `degreeCount === 7` or a
hard-coded match on the two Pentatonic base modes (family id + mode id →
5-entry positional suffix lists in `chords.ts`). Blue never gets either.

`ScaleWheel.tsx` (from `enrich-scale-wheel`, now archived) renders an outer ring (note + chromatic degree label), an inner
ring at `INNER_RADIUS` (W/H arcs with labels, plus roman-numeral/chord-
symbol circles), and a center randomize hub. `ScaleDashboard.tsx` was
already edited by the user to show the W/H indicator in the Degrees row
for every family and to drop the unused `Dice5`/`randomRoot` imports; its
explanatory comment still describes the old 7-degree gate.

The user's reference sheet is keyed by **diatonic slot**, not by scale
note: it lists 7 (pentatonic) or 8 (blues) slots per scale, including
slots the scale skips, and some chords in a row are not rooted on that
row's note (`C/E`, `C7#9` under `bIII`). Reading it against the data
model also exposed that `blue/blues-major` is currently `1 ♭3 4 5 ♭7`
(`0,3,5,7,10` — Minor Pentatonic), while the sheet's Major Blues is
`1 2 ♭3 3 5 6` (`0,2,3,4,7,9`). See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One authoritative, transposable data source for the seven reference
  scales, with skipped/in-scale status derived rather than duplicated.
- A table that shows skipped slots clearly as skipped without hiding
  them.
- Remove the wheel's inner ring and spend the freed space on larger
  notes and scale connecting lines, with no behavior change to dimming,
  click-to-re-root, or the hub.
- Keep `getScaleNotes` the only place doing interval arithmetic.

**Non-Goals:**
- Reference data for any scale beyond the seven.
- Flat-side note spelling (the app spells every note with sharps) —
  touches every label in the app, so it gets its own spec.
- Building multi-language support. This change only keeps its new UI
  strings in one place (Decision 10) so that work can pick them up.
- Changing mode ids or URLs (only two display names change, Decision 9).

## Decisions

### 1. Reference data lives in a new `scaleReference.ts`, keyed by interval pattern

Shape (illustrative, not final):

```ts
type ChordSpec = { rootOffset: number; suffix: string; bassOffset?: number };
type ReferenceRow = {
  offset: number;            // semitones above the key root
  roman: string;             // "I", "v / V", "bVI7"
  name: string;              // "Tonic", "Minor Mediant"
  blueNote?: true;
  chords: ChordSpec[];
  hint?: "rarely-used" | "avoid-note" | "turnaround";
};
getScaleReference(intervals: number[]): ReferenceRow[] | undefined
```

Lookup joins the mode's resolved intervals (from
`getScaleNotes(0, family, modeId)`) and compares against the seven
patterns. A row is **skipped** when `row.offset` is absent from those
intervals — derived, so the data can't drift from `scales.ts`.

*Why interval-keyed:* both `major-pentatonic` and `blue` families contain
a mode id `blues-minor`/`blues-major`, so ids are ambiguous; and the
Major Pentatonic family's fifth rotation *is* Minor Pentatonic, which
should get the same table for free. This also removes the family-id +
mode-id special-casing currently in `ScaleInfoTable`.

**The pentatonic rotations.** The Major Pentatonic and Minor Pentatonic
families are rotations of the same 5 patterns (Major Pentatonic,
Egyptian/Suspended `0,2,5,7,10`, Man Gong `0,3,5,8,10`, Ritusen
`0,2,5,7,9`, Minor Pentatonic), so the user's ten tables are 5 distinct
tables listed once per family. Pattern keying means each is written once
and serves both families. Egyptian, Man Gong, and Ritusen are added as
7-row tables: their five in-scale rows plus two skipped slots each. The
sheet names those slots but gives no note or interval (`---`) and no
roman numeral or chords (`N/A`), so they are placed at the major scale's
own degree for that position (Egyptian: Mediant `4`, Submediant `9`;
Man Gong: Supertonic `2`, Dominant `7`; Ritusen: Mediant `4`, Leading
Tone `11`), have no roman numeral (shown as `N/A`), and carry a new
*not applicable* hint that renders `N/A` in the Chords cell.
For Major and Minor Pentatonic the sheet's 5-row tables agree with the
earlier 7-slot tables except two extra chords, which are merged in while
keeping the skipped rows the user asked for earlier: `Am11` on Major
Pentatonic's `vi`, and `Gsus4` on Minor Pentatonic's `bVII`. Chord
suffixes with parenthesized alterations (`m7(no3)`, `m7(no5)`,
`sus4(b9)`) are stored verbatim as suffix strings.

*Alternatives:* key by `familyId/modeId` (ambiguous, misses equivalent
rotations, keeps the special-casing); derive roman numerals/names/chords
generically (the sheet encodes editorial choices — `v / V`, `Rarely
used`, `C7#9` under `bIII` — that no rule reproduces).

### 2. Chords are root-relative, not suffix-per-row

Each chord carries its own `rootOffset` (and optional `bassOffset`), so
`C/E`, `C7#9` (on the key root, listed under `bIII`), and `D#°7` (on the
row's own note) all transpose correctly. Rendering: note name at
`(root + offset) % 12` via the existing `CHROMATIC` table + suffix +
`/bass`. The old positional suffix arrays can't express any of these,
so they are deleted rather than kept alongside.

### 3. Table rows become a view-model, then render uniformly

A single data-layer function, `getScaleRows(root, family, modeId)` in
`scaleRows.ts`, returns the rows for whichever of three cases applies
(hand-authored reference / derived 7-degree / neither) in one shape, so
`ScaleInfoTable` has one path that just maps rows to `<tr>`. Only the
row *source* differs: reference rows come from `scaleReference.ts`;
7-degree rows are derived from `getDiatonicDegrees`, the triad-quality
chord table, and `getDegreeFunctionName`, because tertian triad math only
holds for 7 degrees. (Hand-writing tables for all 21 diatonic modes was
rejected: it would drop the "add a 7-note family with no code change"
property and the derived chords.) The "neither" case (a non-7-degree
pattern with no reference) is kept as a Formula/Notes/Intervals-only
fallback so a newly added family still renders.
Column set is derived from the case: Formula, Notes, Intervals, plus
Roman, Degree, Chords for the reference and 7-degree cases. This
replaces the current interleaved `isSevenDegree ? … : …` branches inside
JSX. The 7-degree case gains only the Roman column, whose value is the
`romanNumeral` `getDiatonicDegrees()` already computes for the Degrees
row, so the two can't disagree.

### 4. Skipped-row treatment: dim + strike + text badge

A skipped row is: whole row at reduced opacity; the would-be note
struck through, followed by a `Skip` badge; Formula/Intervals/Roman/
Degree/Chords all still shown; the hint text (`Rarely used`, `Avoid F
when soloing`, `Turnaround`) appended in the Chords cell.

*Why not opacity alone:* dimming is the wheel's existing "not in scale"
convention and stays for consistency, but opacity alone fails for
low-vision users and can't be read in a screenshot; the text badge is
the primary signal. Strikethrough on the note (not the whole row) keeps
the chord suggestions — the point of showing the slot — readable.
Contrast of the dimmed text must be checked against the theme tokens
(task 6).

*Alternatives:* hide skipped rows (current behavior, rejected by the
user); a separate collapsed "Skipped degrees" section (splits one
7-slot mental model into two lists); dashed borders (subtle, and busy
across 2–3 rows in an 8-row table).

Blue notes get a `Blue note` badge beside the degree name (same badge
component, different tone) instead of the sheet's inline
`(BlueNote)` text in the name.

### 5. Wheel: delete the inner ring, enlarge the notes, connect the scale

Remove the W/H arc block, the inner-circle block, `INNER_RADIUS`, the
`getChordSymbol`/`getIllustrativeRomanNumeral`/`getWholeHalfPattern`
imports and the `hasRealTriads`/`innerInfoByNote`/`arcs` computations.
`showEnrichmentRings` is renamed `showDegreeLabels`; its
`MIN_RINGS_WIDTH` threshold stays at first (the degree label is now the
only thing it gates); re-check it once the dots are larger (task 4.5).
The `viewBox` `SIZE` is unchanged, so the wheel's footprint in the
layout doesn't move.
`getChordSymbol` and `getIllustrativeRomanNumeral` lose their only
caller and are deleted from `theory.ts`; `getWholeHalfPattern` stays
(Degrees row).

**Using the freed space.** With no inner ring, the note dots grow
(`DOT_RADIUS`, `TOUCH_RADIUS`, note/degree font sizes, and
`OUTER_RADIUS` up to what `SIZE` allows), and the in-scale notes are
joined by a closed polygon. Two earlier versions failed: a polygon through
the dot centers *behind* the dots was hidden at every vertex and read as
segments hanging off the circles; edge-to-edge segments joined by arcs
around each circle read as a chain of circles, not a polygon (the user
wants the vertices joined to each other). The polygon is now one SVG
`<polygon>` with exactly one vertex per in-scale note, in
`getScaleNoteNames` order (already ascending, so the closing edge wraps
last -> first), each vertex at radius `OUTER_RADIUS - DOT_RADIUS` on the
note's own radial, i.e. the point of the dot's edge facing the center.
Edges are straight chords between those points, so they meet in plain
sight at the vertices, lie entirely inside the ring of notes, and never
cross a note's label. `pointer-events: none` keeps it from stealing a
tap. The largest gap in any shipped scale is 3 semitones (90°), whose
chord passes ~`0.7 · VERTEX_RADIUS` (~72 units) from the center, clear of
the hub (radius 34, touch 42). Neighbor spacing at `OUTER_RADIUS` is
`2·R·sin(15°)`, the cap on dot diameter; exact sizes are tuned by eye. The
polygon is not text, so it stays below the degree-label minimum width.

*Alternatives:* keep the through-the-centers polygon and paint it over
the dots (rejected: it cuts through note names); edge-to-edge segments
joined by arcs on each circle (built, rejected: vertices aren't joined to
each other); a polygon on a smaller inner radius joined to the notes by
spokes (not chosen: adds spokes the user didn't ask for); keep W/H labels on the lines
(rejected: the user removed the wheel's labels; the Degrees row carries
them).

### 6. Fix `BLUE_MAJOR_INTERVALS` in place

Change the constant to `[0, 2, 3, 4, 7, 9]`; keep the mode-owns-its-
pattern mechanism and `degreeCount: 6` (now true for both modes).
*Alternative:* `blues-major` as `rotationIndex: 1` of the family
pattern — cleaner, but it would retire the only user of the
`intervalPattern` override and turn three spec scenarios into dead
text, for no behavioral gain.

### 7. Sequencing against `enrich-scale-wheel`

This change's `scale-dashboard` delta is written against the spec as it
will stand **after** `enrich-scale-wheel` is archived (it renames and
modifies requirements that change introduces). Two things to know:

- `enrich-scale-wheel`'s delta originally MODIFIED `Wheel shows
  chromatic degree labels and chord symbols`, which did not exist in the
  main spec; it was changed to ADDED and `enrich-scale-wheel` has since
  been archived, so this change's `scale-dashboard` delta (which renames
  and modifies that requirement) applies cleanly.
- The main `scale-dashboard` spec still contains a duplicate `Wheel
  indicates scale membership by dimming` requirement. This change
  doesn't touch it.

### 8. Reconcile the Degrees row spec and stale comment

The user already removed the `isSevenDegree` gate on the W/H indicator.
The main spec still says "7-degree only", so the delta modifies it (all
families; `3` for larger gaps) and a task refreshes the comment in
`ScaleDashboard.tsx`.

### 9. Rename the Major Pentatonic family's mislabeled rotations

The Major Pentatonic family lists rotations 3 and 4 as "Blues Minor"
(`0,3,5,8,10`) and "Blues Major" (`0,2,5,7,9`). Those aren't blues
scales — they're the same patterns the Minor Pentatonic family lists as
"Man Gong" and "Ritusen" — and with the real Blue family now correct
they read as duplicates of it. Change only the two `displayName`s to
"Man Gong" and "Ritusen". Ids stay `blues-minor`/`blues-major`, so
`/major-pentatonic/blues-minor` bookmarks and `scales.test.ts` keep
working; the cost is that those ids remain misleading in the URL, which
is cheaper than breaking links. No spec constrains these display names.

### 10. UI strings are English, kept in one place

The user plans multi-language support. This change doesn't add an i18n
framework, but new strings (`Skip`, `Blue note`, `Rarely used`, `Avoid
<note> when soloing`, `Turnaround`, and the new `Roman` header) live in
one small map keyed by id (hints are already keys, not prose), instead
of being inlined in JSX, so that later work has one place to lift them.
Reference rows' degree names and roman numerals stay in the data module
for the same reason.

## Risks / Trade-offs

- **[Existing `/blue/blues-major` content changes]** → It was
  effectively a duplicate of Minor Pentatonic, so this is a correction;
  called out as BREAKING in the proposal. Fretboard/wheel/highlighting
  all derive from `getScaleNotes`, so they follow automatically; verify
  visually.
- **[Interval-keyed match widens who gets the full table]** → The Major
  Pentatonic family's fifth rotation and the Minor Pentatonic family's
  second rotation now get reference data. They *are* those scales, so
  the data is correct; the old spec was conservative, not right.
- **[Sharp-only spelling reads oddly against the sheet]** → `D#°7`
  where the sheet says `Eb°7`. Consistent with every other label in the
  app; changing it is an app-wide decision (Open Questions).
- **[Wide table on narrow screens]** → Six columns with long chord
  lists. The existing `overflow-x-auto` wrapper and `whitespace-nowrap`
  cells keep it scrollable rather than wrapping; verify at ~375px.
- **[Reference data is hand-transcribed]** → Mitigated by unit tests
  that render each scale at its sheet root (C for Major Pentatonic/
  Major Blues, A for Minor Pentatonic/Minor Blues) and assert the sheet's
  chord strings, plus one transposition test.

## Migration Plan

No persisted data is affected (practice sessions in `localStorage` don't
store scale content). Deploy as a normal build; rollback is a revert.
`enrich-scale-wheel` is already archived, so no ordering constraint
remains. After archiving this change, update the stale notes in `CLAUDE.md` (Blue family, test suite).

## Open Questions

Deferred to their own changes; none affects this change's specs, approach,
or tasks:

- **Vietnamese role annotations** on three Major Blues rows (`(Chủ át
  chính)` on `I7`, `(Hạ át át)` on `IV7`, `(Át âm át)` on `V7`). Not shown
  now; they belong with the planned multi-language support, where they can
  be added as localized hints alongside the existing hint keys.
- **Flat spelling** (`Eb7` as in the sheet vs. the app's `D#7`). App-wide
  enharmonic-spelling decision; gets its own spec.
