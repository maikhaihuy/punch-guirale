## Context

`FretNote.degree` (from Milestone 1) is a label string like `"1"`,
`"b3"`, `"#4"`, relative to the active root+mode. `buildFretboard` already
computes this per note via `getScaleMap`/`getDegreeLabels`. No triad
concept exists yet; the fretboard currently layers root identity, M2
position dimming, and (pending `note-interaction-states`) a press-active
state per note.

## Goals / Non-Goals

**Goals:**
- Let a learner see the root triad (1–3–5, with mode-correct accidentals)
  highlighted on top of the full scale, toggle-controlled and off by
  default.
- Derive triad membership from data already on `FretNote`, no new scale
  math.
- Define this layer's precedence clearly against root/dimmed/active so it
  never visually competes with or hides them.

**Non-Goals:**
- Diatonic triads on scale degrees other than 1 (e.g. the ii, iii, IV
  chords built from other scale tones) — root-triad only.
- 7th-chord tones (adding the 7th to the highlighted set).
- Any change to which notes render or how dimming/audio/active-state work.

## Decisions

**`isTriadTone` is computed by stripping accidentals from `degree` and
checking the base number, not by re-deriving intervals from scratch.**
`degree` already encodes the correct accidental per mode (e.g. Dorian's
third is `"b3"`); stripping leading `b`/`#` characters and parsing the
remaining digit as 1, 3, or 5 reuses that existing, already-correct
computation instead of adding a second, parallel interval calculation
that could drift out of sync with `getDegreeLabels`.

**Triad ring is a stroke-only visual, not a fill change.** The root
already owns the strongest visual (filled dot). Non-root triad tones get
a thin outline ring at reduced opacity so they read as "part of something
notable" without competing with root or with the active-press glow
(`note-interaction-states`) for visual weight. The root's own styling is
left untouched when `isTriadTone` is also true for it (it always is,
1 is always in the triad) — the requirement note in proposal.md that
"the root already stands out" means the triad ring simply doesn't apply
to root notes, avoiding double-decoration.

**Toggle is independent of Note/Degree display mode.** Highlighting is a
visual overlay orthogonal to which text label a note shows, so both
toggles are simple, separately-stored booleans rather than a combined
enum - consistent with how `displayMode` and `selectedPosition` are
already independent pieces of state in `page.tsx`.

**Precedence order for combined styling:** dimming (opacity, outermost) →
root fill vs. plain fill (identity) → triad ring (if enabled and not
root) → active-press scale/glow (innermost, on top of everything since
it's momentary and directly tied to the current gesture). This mirrors
the existing layering approach (identity, then overlay, then dim) rather
than introducing a new precedence system.

## Risks / Trade-offs

- [Triad ring could be visually noisy alongside dimming + active state on
  a busy fretboard] → Default the toggle off; keep the ring low-opacity
  and stroke-only so it stays a subtle secondary cue.
- [Locrian's diminished triad (1-b3-b5) might read as "wrong" to a user
  expecting a stable triad] → Intentional and called out in proposal.md;
  no special-casing — Locrian's root triad genuinely is diminished.
