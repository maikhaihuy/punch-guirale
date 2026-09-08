# Guitar Scale Trainer — MVP (Milestone 1) Build Prompt

You are building the MVP of a web app that helps guitarists practice scale
fingerings across the fretboard, driven by music theory (key + mode). This
prompt describes exactly what to build for **Milestone 1** — everything else
is explicitly out of scope for now.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS for styling
- Plain SVG for the fretboard (no Canvas — note count is small, SVG gives
  easy per-note styling and future click handlers)
- Tone.js — used now for the metronome via `Tone.Transport` (not
  `setInterval`, which drifts and gets throttled in background tabs).
  Set it up so the same Tone.js instance can be reused for per-note audio
  in Milestone 2.
- No backend, no database, no authentication. All state is client-side.
  Practice history persists to `localStorage`.

## Core data model (music theory)

Represent every fretboard note primarily by **MIDI number**, not just pitch
class — this keeps octave/pitch information available for future audio work
without changing the data model later.

```ts
const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const MODES = {
  ionian:     [0,2,4,5,7,9,11],
  dorian:     [0,2,3,5,7,9,10],
  phrygian:   [0,1,3,5,7,8,10],
  lydian:     [0,2,4,6,7,9,11],
  mixolydian: [0,2,4,5,7,9,10],
  aeolian:    [0,2,3,5,7,8,10],
  locrian:    [0,1,3,5,6,8,10],
} as const;

type ModeName = keyof typeof MODES;

// Standard tuning, string 6 (low E) to string 1 (high E)
const OPEN_STRINGS = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4

function midiToNoteName(midi: number) {
  return CHROMATIC[midi % 12];
}

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Degree label relative to major scale (e.g. dorian -> 1,2,b3,4,5,6,b7)
function getDegreeLabels(mode: ModeName) {
  const MAJOR = MODES.ionian;
  return MODES[mode].map((interval, i) => {
    const diff = interval - MAJOR[i];
    const num = i + 1;
    if (diff === 0) return `${num}`;
    return diff < 0 ? `${'b'.repeat(-diff)}${num}` : `${'#'.repeat(diff)}${num}`;
  });
}

// Map note name -> degree label for the chosen root + mode
function getScaleMap(root: string, mode: ModeName) {
  const rootIdx = CHROMATIC.indexOf(root);
  const degrees = getDegreeLabels(mode);
  const map = new Map<string, string>();
  MODES[mode].forEach((iv, i) => map.set(CHROMATIC[(rootIdx + iv) % 12], degrees[i]));
  return map;
}

type FretNote = {
  fret: number;
  midi: number;
  name: string;      // e.g. "E"
  degree?: string;   // e.g. "b3" — present only if inScale
  inScale: boolean;
  isRoot: boolean;
  freq: number;       // ready for Milestone 2 audio, not used yet
};

function buildFretboard(root: string, mode: ModeName, maxFret = 24): FretNote[][] {
  const scaleMap = getScaleMap(root, mode);
  return OPEN_STRINGS.map(openMidi =>
    Array.from({ length: maxFret + 1 }, (_, fret) => {
      const midi = openMidi + fret;
      const name = midiToNoteName(midi);
      const degree = scaleMap.get(name);
      return {
        fret, midi, name, degree,
        inScale: degree !== undefined,
        isRoot: name === root,
        freq: midiToFreq(midi),
      };
    })
  );
}
```

## Features to build

### 1. Key & Mode selection
- Let the user pick a root note (12 chromatic options), or randomize it.
- 7 modes shown as tabs: Ionian, Dorian, Phrygian, Lydian, Mixolydian,
  Aeolian, Locrian. Default: **Ionian**.

### 2. Fretboard display (frets 0–24)
- Render with SVG, 6 strings × 25 frets, using `buildFretboard()` above.
- Only render dots for `inScale` notes.
- Visually distinguish the root note from other scale notes (e.g. filled
  vs outlined, or a distinct color/stroke).

### 3. Note / Degree toggle
- A single switch: `displayMode: 'note' | 'degree'`.
- Renders `note.name` or `note.degree` as the label inside each dot — no
  recomputation needed, both fields already exist on every note object.

### 4. Metronome
- BPM input/slider.
- Start/stop using `Tone.Transport` + `Tone.Loop`, not `setInterval`.
- Must call `Tone.start()` inside the user's click handler (browser
  autoplay policy), not on page load.

### 5. Practice stopwatch
- Start / pause / resume / stop.
- Compute elapsed time from timestamp differences (`Date.now()`), not by
  counting ticks, so it stays correct even if the tab is throttled in the
  background.

### 6. Practice history
- On stopping a practice session, save a record to `localStorage`:
  `{ date, rootNote, mode, bpm, durationSec }`.
- Show a simple list of past sessions (most recent first). No filtering,
  charts, or stats needed for this milestone.

### 7. Mobile-responsive layout
- Fretboard is the hero element — give it the most screen space.
- Since there is no position/pattern selector yet in this milestone, the
  full 0–24 fret view must scroll horizontally on narrow screens
  (`overflow-x: auto`), with a **sticky fret-number row** at the top so
  the user never loses track of which fret they're looking at.
- Key/mode controls stay compact and always visible; mode tabs can scroll
  horizontally if needed.
- Metronome and stopwatch controls go in a bottom-anchored bar with large
  touch targets (thumb-reachable — the user's hands are usually busy
  holding the guitar).
- Request a Screen Wake Lock when a practice session (metronome or
  stopwatch) starts, and release it on stop, so the phone screen doesn't
  sleep mid-practice:

```ts
let wakeLock: WakeLockSentinel | null = null;
async function startPractice() {
  try { wakeLock = await navigator.wakeLock.request('screen'); } catch {}
}
function stopPractice() {
  wakeLock?.release();
}
```

  This API isn't supported everywhere (e.g. older Safari) — fail silently,
  it must never block the core flow.

## Explicitly OUT of scope for Milestone 1

Do not build any of the following yet:

- 5-position (CAGED-style) pattern selector and the dim/highlight UX for it
- Per-note audio playback (clicking a note to hear its pitch)
- User accounts / authentication
- Backend or database of any kind
- Cross-device sync of practice history
- Any music theory beyond the 7 modes above (no chords, no arpeggios)

## Definition of done for Milestone 1

A user can, entirely client-side with no login:
1. Pick or randomize a key, pick a mode (or use the Ionian default).
2. See the correct scale notes rendered on a 24-fret fretboard.
3. Toggle between seeing note names and scale degrees.
4. Run a metronome at a chosen BPM without audible drift.
5. Run a practice stopwatch (start/pause/stop).
6. See their finished sessions saved and listed after reloading the page.
7. Use all of the above comfortably on a phone-sized screen.