## Context

`FretNote.degree` (from Milestone 1) is a label string like `"1"`,
`"b3"`, `"#4"`, relative to the active root+mode; `getDegreeLabels`
already computes all 7 of these per mode in scale order. The previous
`triad-tone-highlighting` change added a boolean "Highlight triad"
toggle that always highlights the fixed root triad (degree 1's 1-3-5),
via a precomputed `isTriadTone` field on every `FretNote`, rendered as
a `.fret-note--triad` outline ring that composes with the existing
root/dimmed/active-press states in a fixed precedence order (dim →
identity → triad ring → active-press). `KeyModeBar.tsx` already has a
pill-row pattern for the Position selector (`All` plus one pill per
position, single-select).

## Goals / Non-Goals

**Goals:**
- Let a learner pick any of the 7 diatonic degrees and see that
  degree's own triad highlighted, not just the root's, to practice
  chord-tone targeting while soloing.
- Compute triad quality generically from the mode's own interval
  table, so major/minor/diminished/augmented is always correct without
  a hardcoded per-mode table.
- Reuse, not duplicate, the existing ring visual and its precedence
  rules from `triad-tone-highlighting`.

**Non-Goals:**
- 7th chords or any extended harmony.
- Multi-select (highlighting more than one degree's triad at once).
- Distinguishing the 3 ring members from each other (e.g. marking
  which one is that triad's own root) — all three get the same ring.
- Any change to which notes render, position dimming, pitch-echo
  highlighting, or audio playback.

## Decisions

**Triad membership is computed as a 3-label `Set` for the selected
degree, not a per-note precomputed field.** Unlike the old fixed root
triad (`isTriadTone`, computed once in `buildFretboard` because there
is only ever one root), which degree is selected can now change
independently of the scale itself. Precomputing "is this note in the
triad of every possible degree" would mean carrying 7 booleans per note
for a selection that is usually inactive. Instead,
`getTriadDegreeLabels(mode, degreeIndex)` returns the 3 degree-label
strings for the current selection, computed on selection change and
membership-tested per note at render time
(`triadDegreeLabels.has(note.degree)`) — cheap against ~150 notes, and
the same pattern already used for `positions` membership per note.

**Triad quality (and therefore roman-numeral case/symbol) is derived
from interval math, not a hardcoded per-mode table.** For degree index
`i` in `MODES[mode]`, the triad is `[i, (i+2)%7, (i+4)%7]`; its quality
comes from the semitone gaps between consecutive members (root→third,
third→fifth), wrapping by 12 across the octave boundary: `4+3`
semitones is major, `3+4` is minor, `3+3` is diminished, `4+4` is
augmented. This is the same kind of derivation that already made
Locrian's diminished root triad fall out of the math instead of needing
a special case, generalized from degree 0 to any degree — e.g. a mode
whose `ii` happens to be major resolves to major correctly instead of
being assumed minor because "ii is usually minor".

**Reuse, don't fork, the existing ring visual.** In `Fretboard.tsx`,
`showTriadRing` becomes `!!triadDegreeLabels && note.degree !==
undefined && triadDegreeLabels.has(note.degree) && !note.isRoot` — same
`.fret-note--triad` class, same `TRIAD_RING_RADIUS`, same position in
the precedence stack (dim → identity → triad ring → active-press). Only
the boolean-vs-set source of truth changes; nothing about how the ring
renders or composes with other states does.

**"None" is an explicit pill, not an implicit toggle-off.** Mirrors the
existing Position row's "All" pill rather than reintroducing a separate
on/off switch alongside the degree picker — one control, one selection
model (`number | null`, `null` meaning "None"), consistent with how
position selection already works in this codebase.

**The scale root's exclusion from the ring is unchanged and still falls
out for free.** When the selected degree is `I` (index 0), the triad's
own root is the scale root, and `!note.isRoot` still correctly excludes
it from the ring — no special-casing needed, same as before. When the
selected degree is anything else (e.g. `ii`), that degree's own root
(e.g. D in C Ionian) is a plain scale tone, not the scale root, so it
receives the ring like its 3rd and 5th — this is correct per the
Non-Goals above (no visual distinction between a triad's root/3rd/5th),
not an oversight.

## Risks / Trade-offs

- [Removing `isTriadTone` and the old toggle is a breaking change to
  the `triad-tone-highlighting` capability rather than an additive one]
  → Acceptable: the old boolean control had no persisted state (default
  off, not saved to `localStorage`) and no other capability reads
  `isTriadTone`, so nothing downstream depends on the removed shape.
- [7 extra pills add width to `KeyModeBar`, which already shows
  Key/Mode/Position rows] → Match the existing row's `flex-wrap`/scroll
  pattern; no new layout mechanism needed.
- [A learner might expect a triad's own root, e.g. D in a `ii` triad,
  to stand out from its 3rd/5th the way the scale root does] →
  Deferred per Non-Goals; worth a follow-up if practice feedback asks
  for it, not blocking this pass.
