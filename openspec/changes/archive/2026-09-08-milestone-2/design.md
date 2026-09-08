## Context

Milestone 1 already computes, per root/mode selection, a 6×25 grid of
`FretNote`s (`buildFretboard` in `src/lib/theory.ts`) with `fret`, `midi`,
`name`, `degree`, `inScale`, `isRoot`, `freq`. Rendering is a single SVG
fretboard component that draws one dot per in-scale note; there is no
audio triggered by notes today (only the metronome click), and there is
no concept of a sub-region of the fretboard.

Milestone 2 adds two independent, additive features on top of this: (1)
a position filter that changes only visual emphasis, not which notes
exist in the data, and (2) click-to-play audio on existing notes. Both
reuse Milestone 1's data model and Tone.js instance rather than
introducing new ones.

## Goals / Non-Goals

**Goals:**
- Tag every `FretNote` with which of the 5 standard positions it belongs
  to, without changing the existing in-scale/root computation.
- Let the user select `All | 1 | 2 | 3 | 4 | 5`, dimming (not removing)
  notes outside the selection, keeping the root always prominent.
- Play a note's pitch on click/tap via the existing Tone.js instance.
- Work well on mobile: single-position default, auto-fit to that
  position's fret range, and a touch target large enough to hit
  reliably.

**Non-Goals:**
- Deriving the 5 position shapes algorithmically — they are a fixed,
  hand-verified reference data set.
- CAGED-letter naming — modes other than Ionian don't map cleanly to
  open-chord shapes, so positions are named "Position 1–5" only.
- Realistic/sampled guitar tone — a `Tone.Synth` is sufficient.
- Any storage migration (IndexedDB) — deferred and only revisited if
  Milestone 2 usage actually makes `localStorage` limiting.

## Decisions

**Position data is keyed by scale degree (1–7), not by mode or absolute
note.** All 7 modes built on the same parent major key share one
physical note pool; only which degree acts as "root" changes per mode.
Keying the 5 shape templates by degree means they're defined exactly
once (`src/lib/positions.ts` or similar, a hardcoded config object of
fret-offsets per string per position per degree) and reused for every
mode. Alternative considered: generate/store shapes per mode — rejected
as duplicated data that could drift out of sync and contradicts the
already-established architecture note in CLAUDE.md.

**`patternId` is optional and additive on `FretNote`.** `buildFretboard`
gains a lookup step that tags each already-computed in-scale note with
its position(s) using the degree-keyed template; it does not change
which notes are `inScale` or which is `isRoot`. This keeps the position
feature purely additive to `scale-fretboard`'s existing contract (hence
no delta spec against that capability).

**Dimming via CSS opacity + a class, not conditional rendering.** Notes
outside the selected position stay in the DOM at `opacity: 0.28`; the
root keeps a distinct stroke regardless of dim state. This matches the
milestone spec's requirement that out-of-position notes stay visible
(context, not hidden) and is simpler than mounting/unmounting nodes.

**Audio reuses the existing Tone.js instance from `useMetronome`,
started only inside the note's click handler.** A single shared
`Tone.Synth` is created lazily on first play and reused for subsequent
notes, avoiding per-click instantiation cost. `Tone.start()` is called
from the click handler exactly like the metronome's `start()`, satisfying
the same autoplay-policy constraint already documented in CLAUDE.md.
Alternative considered: a dedicated `useNotePlayer` hook wrapping its own
`Tone.Synth` — chosen over sharing `useMetronome`'s instance directly, to
keep the metronome and note-playback concerns decoupled while still
funneling through the one lazily-initialized Tone.js audio context.

**Touch target is a separate transparent circle, not a larger visible
dot.** A `<g>` wrapping a ~44px transparent hit circle plus the existing
smaller visible dot keeps the visual density of the fretboard unchanged
while making mobile taps reliable, per the milestone spec's example
markup.

**Mobile position default and auto-fit are viewport-based, not a
separate mobile route/component.** The same fretboard component reads a
viewport-width breakpoint (consistent with existing Tailwind responsive
conventions) to pick a default position (`1` instead of `All`) and to
scroll/scale itself to that position's fret range. No separate mobile
component avoids duplicating the SVG rendering logic.

## Risks / Trade-offs

- [5 shape templates encoded wrong] → Manually verify each of the 5
  degree-keyed templates against a real/reference fretboard diagram
  before shipping, as called out in the milestone spec; add them one at
  a time and visually check in the running app.
- [Dimming all off-position notes via opacity could feel visually noisy
  with many notes on screen] → Keep dimmed opacity low (0.28) and the
  position band as a subtle background fill so the eye still lands on
  the active box first.
- [Shared lazy `Tone.Synth` could pop/click on rapid repeated taps] →
  Accept as a stretch-goal-level concern; not required to fix for this
  milestone's definition of done (basic synth tone is explicitly
  sufficient).
- [Viewport-based mobile default could misfire on resize (e.g. tablet
  rotation, split-screen)] → Recompute the default/auto-fit only on
  mount and on explicit position changes, not on every resize tick, to
  avoid fighting a user's manual scroll/zoom mid-session.

## Migration Plan

No data migration — `patternId` is a new optional field, and existing
`localStorage` practice-session records are untouched. Ship both
features together behind no flag (client-only app, single deploy);
rollback is a normal revert of the change since nothing persists
position/audio state across sessions.

## Open Questions

- Exact pixel/opacity values for the dimmed state and position band are
  left to implementation-time visual tuning against the milestone spec's
  example (`opacity: 0.28`) as a starting point, not a hard requirement.
