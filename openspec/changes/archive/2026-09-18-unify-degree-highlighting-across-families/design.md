## Context

Two controls currently show per-note "degree" info and both branch on
`family.degreeCount === 7`:

- `ScaleDashboard`'s Degrees row: for 7-degree families, each pill
  shows the formula label (`degree.degreeLabel`), a roman numeral
  (`degree.romanNumeral`, cased/suffixed by `degree.quality`), and a
  chord-symbol summary (`getChordSuffixesForQuality(degree.quality)`);
  selecting a pill sets `selectedTriadDegree`, which `ScalePage`
  fans out to two fretboard highlight props: `triadDegreeLabels` (the
  3-note diatonic triad ring, 7-degree only — `null` otherwise) and
  `selectedDegreeLabel` (a single-note ring, computed for *any* family).
  For non-7-degree families, the pill instead shows `${index+1}
  ${noteName}` (e.g. `1 C`), and only the single-note ring ever fires,
  since `triadDegreeLabels` is `null`.
- `ScaleWheel`'s inner ring: only renders at all when
  `family.degreeCount === 7`, showing `degreeLabel` + `romanNumeral`
  per in-scale pitch class. Pentatonic/Blue show no inner ring.

Both `degree.degreeLabel` and `degree.noteName` (from
`getDiatonicDegrees`) are already computed the same way regardless of
degree count — only `degree.quality`/`degree.romanNumeral` require 7
degrees (tertian triads need 7 scale steps to stack thirds by skipping
every other degree; the modulo math in `getTriadQuality` doesn't error
for n=5/6, it just produces musically meaningless results, which is why
the doc comments in `theory.ts` already tell callers to gate on
`degreeCount === 7`). So the underlying data was never the blocker —
only the UI's choice to key its whole pill/ring content, not just the
triad-specific parts, off that same gate.

## Goals / Non-Goals

**Goals:**
- One single-note highlight interaction, driven by the Degrees row,
  identical for every family regardless of degree count.
- One base degree-label convention (formula label + note name) shown
  consistently in both the Degrees row and the scale wheel's inner
  ring, for every family — with the roman numeral, which genuinely
  doesn't generalize past 7 degrees, layered on top for 7-degree
  families only, in both places identically.
- Remove now-dead triad-*selection* code paths (the 3-note ring prop/
  computation/CSS) instead of leaving them unreachable, while keeping
  the roman-numeral/triad-quality *display* data that's still used.

**Non-Goals:**
- No whole/half-step (`W`/`H`) indicator for non-7-degree families —
  pentatonic/blue gaps include 3-semitone jumps that a binary W/H
  label can't represent without new modeling; out of scope here.
- No replacement chord/triad information for Pentatonic or Blue in the
  Degrees row — that already exists separately in `ScaleInfoTable`'s
  Chords column (Minor/Major Pentatonic's base modes; none ever
  existed for Blue, and none is being added there).
- No change to `getTriadQuality`, `degree.quality`, or the
  `ScaleInfoTable` Chords column — still needed and still 7-degree
  (or Pentatonic-base-mode) gated, unaffected by this change.

## Decisions

### Drop the triad ring outright rather than extend it to Pentatonic/Blue
A 5- or 6-note scale can't stack tertian thirds the way a 7-note scale
can, so there's no musically valid "triad" to ring for Pentatonic or
Blue's degrees. Rather than inventing a substitute (e.g. treating
scale-adjacent notes as a fake triad), this change removes the triad
ring for every family and keeps only the single-note highlight, which
was already correct and family-agnostic. This is a real behavior
change for 7-degree families (Major, Harmonic Minor, Melodic Minor
lose the 3-note ring), not just a fix for Pentatonic/Blue — that's why
it's called out as **BREAKING** in the proposal.

### Pill/ring content drops the chord-symbol summary but keeps roman numerals as reference info
The chord-symbol summary existed specifically to describe *which
chord* a pill's triad would select. With triad selection gone, showing
it would describe an interaction that no longer exists, so it's
dropped from the Degrees row entirely. Roman numerals are different:
they're a standalone piece of music-theory reference info (which
scale-degree-as-chord-root this is, e.g. `ii`, `V`), independently
useful whether or not selecting it also rings a triad — so they're
kept for 7-degree families, in both the Degrees row and the scale
wheel, unchanged from before. What both controls unify on instead is
their *base* content: formula label + note name, shown identically for
every family, with the roman numeral layered on top only where it's
musically valid (7 degrees).

Alternative considered (and initially implemented, then reverted after
user feedback): drop roman numerals entirely, everywhere, so the pill
shows only the formula label for every family. Rejected — conflating
"the triad-selection *interaction* is removed" with "the roman-numeral
*information* is removed" throws away reference info the user still
wants for 7-degree families; those are independent axes, and only the
first was actually requested.

### New `degree-highlighting` capability replaces `diatonic-triad-highlighting`
`diatonic-triad-highlighting` is a whole capability built around triad
math and 3-note ring rendering, all of which is being removed. Rather
than heavily rewrite it in place (which would misrepresent its own
history — a removed feature reads better as removed, not silently
mutated into something unrecognizable), this change removes it
outright and adds a new, smaller `degree-highlighting` capability
covering just the surviving single-note case, mirroring the same
capability/requirement shape (selector + visual-treatment
requirements) so the "compose with dimming/mode-change" scenarios
carry over without being lost.

### `ScaleMode`/`ScaleFamily` degreeCount gating stays where it's still musically necessary
`family.degreeCount === 7` gating is removed from degree-label display
(Degrees row pill content, wheel inner ring) but stays exactly where
it already was for the W/H indicator and for `ScaleInfoTable`'s Degree
column/`degree.quality`-driven Chords column — those remain genuinely
7-degree-specific, unlike the label itself.

## Risks / Trade-offs

- **Removes an existing, working feature for 7-degree families** (the
  triad ring) → Mitigation: none needed beyond the explicit
  **BREAKING** callout — this is the user's explicit, direct request
  (bullet 1), not a side effect.
- **Dead-code removal must not overreach into still-used data** — the
  triad-selection *interaction* (`getTriadDegreeLabels`, the 3-note
  ring prop/CSS) is genuinely dead once removed and is deleted, but
  `getRomanNumeral`/`ROMAN_NUMERALS`/`DiatonicDegree.romanNumeral`
  remain live (both `ScaleDashboard.tsx` and `ScaleWheel.tsx` still
  read them for 7-degree families) → Mitigation: verified via grep
  which symbols lose all callers vs. which don't before deciding what
  to delete, rather than deleting everything triad-adjacent
  wholesale.
- **Prop/state rename** (`selectedTriadDegree` → e.g.
  `selectedDegreeIndex`) touches `ScalePage.tsx` and
  `ScaleDashboard.tsx`'s prop signature → Mitigation: pure rename, no
  behavior change; low risk, improves readability now that "triad"
  no longer describes what's being selected.

## Migration Plan

1. `src/lib/theory.ts`: remove `getTriadDegreeLabels` only. Keep
   `ROMAN_NUMERALS`, `getRomanNumeral`, the `romanNumeral` field on
   `DiatonicDegree`, `getTriadQuality`, and `quality`.
2. `src/components/ScaleDashboard.tsx`: render `degree.degreeLabel` +
   `degree.noteName` in every pill; additionally render
   `degree.romanNumeral` when `isSevenDegree`; drop the chord-symbol
   sub-line; keep the W/H indicator gated on `isSevenDegree`; rename
   `selectedTriadDegree`/`onSelectedTriadDegreeChange` props.
3. `src/components/ScaleWheel.tsx`: remove the `showInnerRing` gate on
   the degree *label*; always populate `degreeByNote` from
   `getDiatonicDegrees`; keep rendering `romanNumeral` in the inner
   ring, gated on `isSevenDegree` (the note name itself isn't repeated
   there since the outer dot already shows it).
4. `src/components/ScalePage.tsx`: remove `triadDegreeLabels`
   computation and the `getTriadDegreeLabels` import; rename local
   state to match the renamed props; `Fretboard` now only receives
   `selectedDegreeLabel`.
5. `src/components/Fretboard.tsx`: remove the `triadDegreeLabels` prop
   and `showTriadRing` logic; the ring renders solely from
   `isSelectedDegree`.
6. `src/app/globals.css`: remove `.fret-note--triad`.
7. Update/add the affected spec files (delta specs in this change).

Rollback: revert the above; no persisted state depends on any of this
(all in-memory `useState`, not `localStorage`).

## Open Questions

None blocking.
