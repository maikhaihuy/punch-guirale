## Context

`ScaleDashboard.tsx`'s key row (`<ScaleWheel />` + randomize button) sits
in a `max-w-5xl` container, leaving a large empty region beside the
~260px wheel on desktop widths. `theory.ts`'s `getDiatonicDegrees`
already computes `degreeLabel` and `noteName` per degree; this change
adds two new pieces of static reference data (interval quality names,
scale-degree function names) and a concrete-chord-name helper, then
renders all of it as a table beside the wheel.

This change also touches `src/lib/chords.ts`, introduced by the
still-unarchived `enhance-degree-chord-display` change. That module
currently stores `"maj"` as a literal display string for the bare
major triad (chosen there specifically so `"maj" · "6" · "maj7"...`
reads cleanly when joined without a root note). Building *concrete*
chord names for this new table needs the standard bare-triad
convention instead (root note alone, e.g. `C`, not `Cmaj`), so the
underlying data is refactored to a suffix-based table (`""` for bare
major) with a separate label mapper for the existing rootless-display
case. This keeps one source of truth instead of two chord tables that
could drift.

## Goals / Non-Goals

**Goals:**
- Fill the empty space beside `ScaleWheel` with a reference table:
  Formula, Notes, Intervals, Degree (function name), Chords — one row
  per scale degree.
- Concrete chord names (e.g. `C`, `Cm7`, `Cdim`) built from each
  degree's own note + a suffix table, not just abstract quality labels.
- Single source of truth for chord suffixes, reused by both this new
  table and the existing Degrees row's abstract quality labels.

**Non-Goals:**
- Not showing a Degree (function name) column for non-7-degree families
  (Pentatonic) — scale-degree function names (Tonic/Supertonic/...)
  assume a 7-degree scale. Formula, Notes, and Intervals have no such
  assumption (interval naming is a plain semitone-offset lookup) and
  render for every family.
- Not deriving pentatonic Chords from triad quality math (unlike the
  7-degree case) — see the dedicated Decision below.
- Not attempting a Chords column for pentatonic modes other than each
  family's own base/root mode (Minor Pentatonic's `minor-pentatonic`
  mode, and later Major Pentatonic's `major-pentatonic` mode) — the
  user-confirmed chord table is specific to that mode's own interval
  pattern; the other 8 pentatonic mode rotations in this app (Egyptian,
  Blues Minor/Major, Suspended, Man Gong, Ritusen, etc.) have no
  verified equivalent, so they keep no Chords column, same as before
  this change.
- Not localizing interval/degree-function names — English only,
  matching the rest of the app's UI text.
- Not making the table interactive (no click-to-select, no chord
  playback) — it's read-only reference content, same spirit as the
  existing Degrees row's chord-symbol sub-labels.

## Decisions

### Chord data becomes suffix-based (`""` for bare major), with a separate label mapper for rootless display
`src/lib/chords.ts` changes from a quality → display-label table to a
quality → suffix table:

```ts
export const CHORD_SUFFIXES: Record<TriadQuality, string[]> = {
  major: ["", "6", "maj7", "add9"],
  minor: ["m", "m6", "m7", "m9"],
  diminished: ["dim", "m7b5"],
  augmented: ["aug", "maj7#5"],
};

export function getChordSuffixesForQuality(quality: TriadQuality): string[] { ... }

// Rootless display only (e.g. Degrees row's quality summary) - a bare
// major suffix ("") reads as blank without a root note attached.
export function getChordLabel(suffix: string): string {
  return suffix === "" ? "maj" : suffix;
}

export function getConcreteChordName(noteName: NoteName, suffix: string): string {
  return `${noteName}${suffix}`;
}
```

`ScaleDashboard.tsx`'s existing Degrees-row chord line (from
`enhance-degree-chord-display`, not yet archived) updates to
`getChordSuffixesForQuality(degree.quality).map(getChordLabel).join(" · ")`
so it keeps showing `maj · 6 · maj7 · add9` unchanged; only the
underlying data source moves.

**Alternative considered**: keep two separate tables (one for abstract
labels with `"maj"`, one for concrete suffixes with `""`). Rejected —
they'd need to stay in lockstep by hand with no compiler check, and
the whole point of `diatonic-chord-vocabulary` as a capability is to
be the one source of chord truth.

### Interval names and degree-function names are new static, index-keyed tables in a new small module
Two lookups, following the same "fixed table" convention as
`theory.ts`'s `DEGREE_LABELS_BY_SEMITONE`:

```ts
// src/lib/scaleTerms.ts
const INTERVAL_NAMES_BY_SEMITONE = [
  "Unison", "Minor second", "Major second", "Minor third", "Major third",
  "Perfect fourth", "Diminished fifth", "Perfect fifth", "Minor sixth",
  "Major sixth", "Minor seventh", "Major seventh",
] as const;

// Degrees 1-6 (index 0-5) are named by position alone; degree 7 (index 6)
// is intentionally excluded from this table - its name depends on the
// degree's own interval (see getDegreeFunctionName below), not just its
// position, unlike every other degree.
const DEGREE_FUNCTION_NAMES = [
  "Tonic", "Supertonic", "Mediant", "Subdominant", "Dominant", "Submediant",
] as const;

export function getIntervalName(semitoneOffset: number): string { ... }

// Degree 7 is the one scale-degree function name that isn't purely
// positional: a major 7th (11 semitones from root) is the "Leading Tone"
// (a half step below the octave, with the pull that name implies); any
// other 7th - a minor 7th (10 semitones), as in Dorian, Mixolydian,
// Aeolian, etc. - is a "Subtonic" instead (a whole step below, no
// leading-tone pull). Every other degree's name depends only on its
// position, same simplification the codebase already makes for roman
// numerals' base numeral - only degree 7 needs the interval too.
export function getDegreeFunctionName(degreeIndex: number, semitoneOffsetFromRoot: number): string {
  if (degreeIndex === 6) return semitoneOffsetFromRoot === 11 ? "Leading Tone" : "Subtonic";
  return DEGREE_FUNCTION_NAMES[degreeIndex];
}
```

Verified against every mode in this app's three 7-degree families
(Major, Harmonic Minor, Melodic Minor): each mode's own rotated
interval pattern always lands degree 7 at either 10 or 11 semitones
from that mode's root (never, say, a diminished 7th) - a consequence
of all three families being rotations/single-note alterations of the
same 7-note diatonic collection - so the `=== 11` check has no
unhandled offset to fall through on within this app's actual data.

**Alternative considered** (from the original design): keep
`getDegreeFunctionName` purely positional and always return "Leading
Tone" for degree 7, documenting the Dorian/Mixolydian/Aeolian
inaccuracy as an accepted simplification. Superseded — the interval
data needed to disambiguate (`semitoneOffsetFromRoot`) was already
available at the call site (`ScaleInfoTable` already computes it for
the Intervals column), so there was no real cost to getting it right
instead of documenting the shortcut.

Kept in a new file rather than `theory.ts` (mirrors `chords.ts`'s
precedent of keeping display vocabulary separate from interval math)
and rather than folded into `chords.ts` (different concern - chord
vocabulary vs. interval/degree naming).

### Minor and Major Pentatonic's base modes each get a fixed, position-indexed Chords table — not derived, and not the same kind of data as the 7-degree Chords column
The 7-degree Chords column derives its suffixes from a *computed* triad
quality (`getTriadQuality`, real interval-gap math). Pentatonic scales
have no such derivation available (`getTriadQuality` assumes stacking
thirds across 7 degrees), so the equivalent for each pentatonic
family's base mode is instead a small fixed table, keyed by degree
*position* (0-4), mirroring `getDegreeFunctionName`'s positional
lookup rather than the quality-keyed one:

```ts
// src/lib/chords.ts
export const MINOR_PENTATONIC_CHORD_SUFFIXES = ["m", "", "m7", "m7", "5"] as const;
export const MAJOR_PENTATONIC_CHORD_SUFFIXES = ["", "m7", "m7", "sus4", "m"] as const;
```

This is user-supplied reference data (conventional chords played over
each pentatonic scale). It is intentionally *not* "chords built only
from this scale's own notes" the way the 7-degree Chords column is —
e.g. C Minor Pentatonic's iv/v chords, Fm7/Gm7, use a 3rd (Ab/Bb) that
isn't itself one of the 5 pentatonic notes. A derivation attempt
(parent-scale diatonic triad at each position, dropped to a power
chord when its 3rd falls outside the pentatonic collection) was tried
by hand against the confirmed Minor Pentatonic data and only matched 3
of 5 positions (it wrongly predicts `F5`/`G5` instead of the actual
`Fm7`/`Gm7`) — confirming this really is fixed reference data, not a
formula, for both tables.

`MINOR_PENTATONIC_CHORD_SUFFIXES` is confirmed against two different
roots (C: `Cm, Eb, Fm7, Gm7, Bb5`; D: `Dm, F, Gm7, Am7, C5`) mapping to
the identical per-position suffix sequence once the root is factored
out. `MAJOR_PENTATONIC_CHORD_SUFFIXES` is confirmed against one root
(D: `D, Em7, F#m7, Asus4, Bm`) — both tables are genuinely positional,
not root-specific, so each 5-entry table transposes correctly via
`getConcreteChordName` for any root.

Each table is gated on its own family id *and* base mode id
specifically (`family.id === "minor-pentatonic" && modeId ===
"minor-pentatonic"`, respectively `family.id === "major-pentatonic" &&
modeId === "major-pentatonic"`) — not just `family.degreeCount === 5`
— since each table is only confirmed accurate for that one mode, same
spirit as `buildFretboard`'s existing `family.id === "major"` gate for
CAGED position shapes (a named-mode-specific template, not a
generalizable one). The other 8 pentatonic mode rotations in this app
(Egyptian, Blues Minor, Blues Major, Suspended, Man Gong, Ritusen, and
each family's "other mode" rotation) have no verified table and the
Chords column simply stays absent for them.

**Alternative considered**: derive a general "pentatonic chord
quality" function analogous to `getTriadQuality`, so it'd generalize to
every pentatonic mode automatically. Rejected — attempted this by hand
first (stacking "thirds" within the 5-note scale, i.e. skip-one-degree)
and it does not reproduce the confirmed tables (see above); a fixed
table confirmed against real examples beats a plausible-looking
formula that's actually wrong.

### New `ScaleInfoTable` component, placed beside `ScaleWheel`, with per-column 7-degree gating instead of an all-or-nothing render
A semantic `<table>` (proper reference-data markup, matches its
tabular nature better than a div grid) rendered in `ScaleDashboard`'s
key-row `<section>`, after the existing wheel + randomize button, so
the row's existing `flex flex-wrap` already drops it to a new line on
narrow viewports without extra breakpoint logic. The table itself gets
`overflow-x-auto` on its wrapper for viewports narrower than its
content width, the standard pattern for data tables that can't
usefully reflow into cards.

Rather than the table as a whole being gated on `family.degreeCount
=== 7` (the original design), each column is gated independently.
Formula/Notes/Intervals render for every family, since none of that
data depends on a 7-degree assumption. `getDiatonicDegrees` (from
`theory.ts`) is called unconditionally either way — same as the
Degrees row already does — since `degreeLabel`/`noteName` are valid
for any `degreeCount`. The Degree column stays gated on
`degreeCount === 7` (position-based function names are a 7-degree
concept). The Chords column renders for `degreeCount === 7` (via
`.quality` and `CHORD_SUFFIXES`), or for Minor/Major Pentatonic's own
base modes specifically (via `MINOR_PENTATONIC_CHORD_SUFFIXES` /
`MAJOR_PENTATONIC_CHORD_SUFFIXES`, see the dedicated Decision above) —
every other pentatonic mode rotation shows no Chords column yet.

**Alternative considered** (from the original design): keep the whole
table gated on `degreeCount === 7`, hiding it entirely for Pentatonic.
Superseded — Formula/Notes/Intervals are meaningful and accurate for
any family, so hiding them along with the two genuinely 7-degree-only
columns threw away useful, correct reference content for no reason.

**Alternative considered**: reflow into a stacked card-per-degree
layout on mobile instead of horizontal scroll. Rejected for now as
more design work than this change's scope calls for; horizontal
scroll is a one-line, well-understood fallback and the table is
reference content, not a primary interaction surface.

## Risks / Trade-offs

- [`getDegreeFunctionName`'s degree-7 Leading-Tone/Subtonic check only
  handles offsets 10 and 11] → Confirmed by hand (see Decisions) that
  every mode across this app's three 7-degree families always lands
  degree 7 at one of those two offsets; if a future family introduces
  a degree 7 at some other offset (e.g. a diminished 7th), it would
  fall through to "Subtonic" by default rather than crash - acceptable
  since no such family exists yet, but worth re-checking if one is
  added.
- [Refactoring `chords.ts`'s data shape touches a file from a
  still-unarchived change] → Both changes are in the same working
  tree pre-archive, so this is a normal in-flight adjustment, not a
  cross-release migration; `enhance-degree-chord-display`'s tasks.md
  will need its own Degrees-row chord line updated to the new helper
  names as part of this change's tasks.
- [Table widens the key row significantly on desktop] → Acceptable
  per proposal's explicit goal (filling otherwise-empty space);
  `overflow-x-auto` prevents layout breakage on narrow viewports.
