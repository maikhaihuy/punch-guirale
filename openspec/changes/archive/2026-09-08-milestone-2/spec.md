# Guitar Scale Trainer — Milestone 2 Spec

Milestone 1 is complete: key/mode selection, 0–24 fret display, note/degree
toggle, metronome, stopwatch, and localStorage practice history are all
working. This spec covers **Milestone 2**, built on top of that existing
codebase — not a rewrite.

## Tech stack (unchanged from M1)

- Next.js + React + TypeScript, Tailwind CSS
- SVG fretboard rendering
- Tone.js — already wired up for the metronome (`Tone.Transport`); this
  milestone reuses the same Tone.js instance for per-note audio, no new
  audio library needed
- No new dependencies required for the core M2 scope

## Features to build

### 1. Position selector (5 positions across the fretboard)

Extend the existing `FretNote` type from Milestone 1 with an optional field:

```ts
type FretNote = {
  // ...all existing M1 fields (fret, midi, name, degree, inScale, isRoot, freq)
  patternId?: 1 | 2 | 3 | 4 | 5; // which of the 5 positions this note belongs to
};
```

**Selector UI**: a segmented control / tab row consistent with the existing
mode tabs: `All | 1 | 2 | 3 | 4 | 5`. Default: `All` (current M1 behavior
unchanged when no position is selected).

**Naming**: call these "Position 1–5", not CAGED chord-shape letters — the
open-chord-shape correspondence only holds cleanly for the major scale
(Ionian); across the other 6 modes it stops mapping neatly, so a neutral
"Position N" label avoids implying something that isn't true for those modes.

**Shape data**: the 5 positions are a fixed, well-documented set of shapes —
do not attempt to derive them algorithmically at runtime. Source the 5 shape
templates once from a reliable reference (fret-offset per string, tagged by
scale degree 1–7, not by absolute note name), hardcode as a config object,
and manually verify against a real fretboard before shipping.

Key architecture point to preserve: because all 7 modes built on the same
parent major key share the same physical note pool, **the 5 shape templates
only need to be defined once** (keyed by scale degree) and reused across all
7 modes — only which degree is treated as "root" changes per mode. Do not
duplicate the shape data per mode.

**Visual treatment** (do not hide notes outside the selected position —
dim them):

```tsx
<circle
  className={cn(
    'fret-note',
    note.isRoot && 'fret-note--root',
    selectedPattern && note.patternId !== selectedPattern && 'fret-note--dimmed'
  )}
/>
```

```css
.fret-note { opacity: 1; transition: opacity 0.2s ease; }
.fret-note--dimmed { opacity: 0.28; }
.fret-note--root { stroke-width: 2px; } /* stays prominent even when dimmed */
```

- The mode's root note stays visually prominent even when it falls outside
  the currently selected position.
- Add a subtle semi-transparent background band over the fret range the
  selected position occupies, so the eye can locate the "box" without
  reading individual notes.
- On mobile, default to a single position view (not `All`) since 24 frets
  don't fit a narrow screen without horizontal scroll. When a position is
  selected, auto-scroll/zoom the fretboard to that position's fret range.

### 2. Per-note audio playback

- Clicking/tapping a note plays its pitch using the `freq` (or `midi`)
  already present on every `FretNote` from the Milestone 1 data model — no
  new calculation needed.
- Reuse the existing Tone.js setup from the metronome. Start with
  `Tone.Synth` — a soundfont/sampler upgrade for a more realistic guitar
  timbre is a stretch goal, not required for this milestone's definition of
  done.
- `Tone.start()` must be called inside a user gesture handler, same
  constraint as the metronome in M1.
- Touch targets: separate the clickable area from the visible dot so mobile
  taps land reliably:

```tsx
<g onClick={() => playNote(note.midi)}>
  <circle r={14} fill="transparent" /> {/* touch target, ~44px */}
  <circle r={7} className="fret-note" />  {/* visible dot */}
</g>
```

### 3. (Optional, only if needed) Practice history storage upgrade

- Milestone 1 uses `localStorage` for practice history. Only migrate to
  IndexedDB via `dexie` if the localStorage approach is actually becoming
  limiting (data volume, need for filtering/querying). Not required to call
  this milestone done — evaluate after the two features above are working.

## Explicitly OUT of scope for Milestone 2

- Authentication / user accounts
- Backend or database of any kind
- Cross-device sync of practice history
- Realistic sampled/soundfont guitar audio (stretch goal only — a basic
  synth tone satisfies this milestone)
- Chords, arpeggios, or any theory beyond the 7 modes already in place

## Definition of done for Milestone 2

A user can, on the already-working M1 app:
1. Select a position (1–5) or view the full 0–24 fretboard as before.
2. See notes outside the selected position dimmed, not hidden, with the
   root always visible and the selected position's fret range visually
   marked.
3. Tap/click any in-scale note and hear it played at the correct pitch.
4. Use both of the above comfortably on a phone-sized screen (position
   view fits without horizontal scrolling; touch targets are reliably
   tappable).