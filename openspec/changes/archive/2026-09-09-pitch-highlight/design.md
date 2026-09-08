## Context

`Fretboard.tsx` renders each in-scale note via a `FretboardNote` component
that owns its own `active` boolean (set on `onPointerDown`, cleared on
`onPointerUp`/`onPointerLeave`/`onPointerCancel`), driving the existing
`.fret-note--active` CSS class. Root/dimmed/triad-ring styling is computed
per-note in the parent's `.map()` and passed down as props; none of it is
shared across sibling notes today — nothing currently reads or affects
another note's rendering. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Add a `hoveredNoteName` string-or-null piece of state, lifted to
  `Fretboard` (not per-note), so every note can check "does my name match
  the currently hovered/touched name" and render the echo style if so.
- Keep the existing per-note `active` (press) state and its CSS class
  untouched; the echo state is a new, separate class applied to *other*
  notes, never the interacted note itself.
- Preserve existing mouse/touch/dimmed/root interplay exactly as it is
  today except for the new echo layer.

**Non-Goals:**
- Changing how notes are selected as in-scale, positioned, or labeled
  (`buildFretboard`/`theory.ts` untouched).
- Changing audio playback triggering (`note-playback` capability) — hover
  never plays sound, matching the existing click/tap-only playback model.
- Resolving the two ambiguities flagged in the source spec (pitch-class vs.
  exact-octave matching; echo-on-dimmed-notes vs. suppressed) beyond
  documenting the chosen default in each case — see proposal.md's
  "Assumptions carried over" list.

## Decisions

**Lift `hoveredNoteName` to `Fretboard`, not a context/global store.**
`Fretboard` already owns the single `.map()` that renders every
`FretboardNote`, so it can pass `isEcho={note.name === hoveredNoteName}`
down alongside the props it already computes per-note (`dimmed`,
`showTriadRing`). No new state layer is needed since there is exactly one
`Fretboard` instance on the page (per `page.tsx`). Alternative considered:
a React context — rejected as unnecessary indirection for a single-level
prop that only `Fretboard`'s direct children need.

**Compare by `note.name` (pitch class), not `note.midi` (exact pitch).**
Matches the source spec's stated default and the standard "show me this
note everywhere" fretboard-visualizer convention. `FretNote.name` already
exists on the Milestone 1 data model (per `theory.ts`), so no new field is
needed. If exact-octave matching is later wanted, the comparison in
`Fretboard`'s render loop changes from `note.name === hoveredNoteName` to
comparing `note.midi` against a stored `hoveredMidi`, and nowhere else.

**Branch on `event.pointerType` inside the existing pointer handlers**,
rather than adding separate `onMouseEnter`/`onTouchStart` handlers.
`FretboardNote` already uses `onPointerDown`/`onPointerUp`/`onPointerLeave`/
`onPointerCancel` for the active-press state (per `note-interaction-states`
design), so extending those same handlers keeps one source of truth for
"what interaction is happening" instead of two parallel event systems that
could disagree. Mouse gets two new handlers (`onPointerEnter`/
`onPointerLeave`, gated to `pointerType === 'mouse'`) that only touch
`hoveredNoteName`, not `active`; touch's existing `onPointerDown`/
`onPointerUp` additionally set/clear `hoveredNoteName` alongside `active`.

**New `.fret-note--echo` CSS class, reusing the `--accent` token.** Same
mechanism as the existing `.fret-note--triad` ring class
(`Fretboard.tsx`'s `showTriadRing` prop already renders a second `<circle>`
with a state-driven class) — echo uses a glowing outline (`stroke` +
`drop-shadow`) via `--accent`, the token the `layout-controls` change
already introduced, rather than inventing a new color token.

**Wrap `FretboardNote` in `React.memo`.** With up to 150 notes rendered
(6 strings × 25 frets), a single hover event re-rendering the entire
`Fretboard` tree without memoization would re-run every note's render on
every pointer move. `React.memo`'s default shallow-prop comparison is
sufficient since all props passed to `FretboardNote` are primitives
(strings, numbers, booleans) or a stable-per-render callback; only notes
whose `dimmed`/`showTriadRing`/`isEcho`/`note` props actually change will
re-render.

## Risks / Trade-offs

- [`React.memo` alone doesn't help if `onPlay` is a new closure identity
  every render] → Mitigation: `onPlay={() => onNotePlay(note)}` is already
  constructed fresh per-note per-render today; memoizing the component
  still cuts re-renders for the ~148 *other* notes whose closures and
  props are unchanged on a given hover, even if the two or three notes
  whose `isEcho`/`active` prop actually flips still re-render (which is
  correct — they should).
- [Pitch-class matching means hovering a note highlights notes on multiple
  strings/octaves at once, which could visually clutter a dense chord/scale
  view] → Mitigation: this is the intended, spec'd behavior (the standard
  pattern), and the echo style (thin outline, no scale-up) is deliberately
  calmer than the active-press style to stay legible alongside it.
- [The two flagged ambiguities (octave-exact matching; dimmed-note
  suppression) could be wrong for this player's actual intent] →
  Mitigation: both defaults and their one-line alternate implementations
  are documented in proposal.md and this file, so a follow-up change is
  cheap if the assumption is wrong; not blocking this change on
  confirmation keeps momentum per the source spec's own framing.
