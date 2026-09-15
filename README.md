# Punch Guirale

Punch Guirale is a browser-based guitar practice tool. It renders an
interactive fretboard for any key, scale, or mode, plays back the notes
you tap, and pairs that with a metronome and a stopwatch so you can
practice scales in time and keep a log of what you practiced.

## What it does

- **Fretboard visualizer** — pick a root note (or randomize it) and a
  scale/mode, and see every matching note across a 6-string, 24-fret
  neck. The root note is visually distinct from the rest of the scale.
- **Scale & mode library** — Major (Ionian) and its modes, Harmonic
  Minor and its modes, Melodic Minor and its modes, Major Pentatonic,
  and Minor Pentatonic (with a Blues variant that adds the ♭5), each
  reachable at its own URL (`/[family]/[mode]`) so a specific view can
  be bookmarked or shared.
- **Diatonic triad highlighting** — for 7-degree scales, pick a scale
  degree and see that degree's triad ringed on the fretboard, to
  practice arpeggios and chord tones in context.
- **Note or degree labels** — toggle every dot's label between the note
  name (e.g. "C") and its scale degree relative to the root (e.g. "b3").
- **Click-to-play notes** — tap any dot (or an open string's name
  label) to hear that note.
- **Metronome** — an adjustable-BPM click track for practicing scales
  in time, built on `Tone.Transport` so tempo doesn't drift or stall in
  a backgrounded tab.
- **Practice stopwatch & history** — time a practice session, then save
  it (date, root, mode, BPM, duration) to a local practice log that
  persists across reloads.
- **Screen wake lock** — the screen is kept awake automatically while
  the metronome or stopwatch is running, so the display doesn't sleep
  mid-practice.
- **Light/dark theme.**

## Who it's for

Guitarists (or other fretted-instrument players) who want a visual,
audible reference for scale/mode shapes across the whole neck, and a
lightweight way to run and log timed practice sessions — without
needing a DAW, a separate metronome app, and a notebook.

## Tech stack

Next.js (App Router) + React + TypeScript, Tailwind CSS for styling,
and Tone.js for audio timing/playback. State is local component state
plus `localStorage` for practice history — there's no backend.

## Getting started

Requires [pnpm](https://pnpm.io) (`packageManager: pnpm@10.12.1`).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3100](http://localhost:3100) in your browser.

Other scripts:

```bash
pnpm build   # production build
pnpm start   # run the production build
pnpm lint    # ESLint
pnpm test    # Vitest
```

## Project structure

- `src/lib/theory.ts` — core music-theory model: notes by MIDI number,
  `buildFretboard(root, mode)` builds the fretboard grid.
- `src/lib/scales.ts` — the scale/mode/variant data (families, modes,
  intervals) that drives routing and rendering.
- `src/lib/storage.ts` — `localStorage` read/write for practice
  sessions.
- `src/hooks/` — `useMetronome`, `useStopwatch`, `useWakeLock`,
  `useNotePlayer`.
- `src/app/[family]/[mode]/page.tsx` — the fretboard route, generated
  from the scale data (see `openspec/specs/scale-family-routing`).
- `src/components/` — `Fretboard`, `ScaleDashboard`, `ScaleNav`,
  `PracticeControls`, `PracticeHistory`, etc.

See [CLAUDE.md](CLAUDE.md) for a more detailed architecture walkthrough
and this repo's conventions.

## Specs

This repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec)
(spec-driven workflow). `openspec/specs/` holds the current
source-of-truth capability specs (fretboard rendering, scale routing,
metronome, practice tracking, layout, theming, etc.) as SHALL
requirements with WHEN/THEN scenarios.
