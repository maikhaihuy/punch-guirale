# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is pnpm (`packageManager: pnpm@10.12.1` in package.json).

- `pnpm dev` — start the dev server (Turbopack) at http://localhost:3000
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

There is no test suite configured in this repo.

## Architecture

Routing is `/[family]/[mode]` (e.g. `/major/ionian`,
`/harmonic-minor/phrygian-dominant`), generated from the scale-family
data in `src/lib/scales.ts` — not a manual route list. `/` redirects to
the default family/mode; `/[family]` redirects to that family's first
mode (reserved for future single-mode/symmetric families, none of which
ship yet). A variant toggle (e.g. Blues) is a `?variant=<id>` query
param on the `/[family]/[mode]` route, not local state. There is no
global state library — `src/components/ScalePage.tsx` (a client
component rendered by the `[family]/[mode]` page) composes state +
hooks and passes data down to presentational components; family/mode/
variant come from the URL, everything else (root note, display mode,
position, triad selection) is local `useState`.

- **Scale family data** (`src/lib/scales.ts`): `ScaleFamily` /
  `ScaleMode` / `ScaleVariant` schema (a family has an interval pattern,
  a list of modes that rotate it, and optional variants that splice in
  an extra note). `getScaleNotes(rootMidi, family, modeId, variantId?)`
  is the single source of truth for interval arithmetic — no other
  module computes scale intervals itself. `SCALE_FAMILIES` currently
  ships Major, Harmonic Minor, Melodic Minor, Major Pentatonic, and
  Minor Pentatonic (with a `blue` variant). To add a new family: add a
  `ScaleFamily` entry with kebab-case ids (ids double as URL route
  segments, so no separate slug transform) — no other code changes are
  required for a diatonic (any degreeCount) family to become selectable
  and routable.
- **Music theory core** (`src/lib/theory.ts`): notes are modeled by MIDI
  number, not just pitch class, so octave/frequency stay available
  without changing the data model later. `buildFretboard(root, family,
  modeId, variantId?)` is the central rendering function — it returns a
  6×25 grid of `FretNote`s (fret, midi, name, degree, inScale, isRoot,
  freq) built from `getScaleNotes()`'s output; degree labels are a fixed
  semitone→label table (`DEGREE_LABELS_BY_SEMITONE`) so they apply to
  any family. Components only render, never recompute scale membership
  themselves. Two things do **not** generalize past 7-note families and
  are gated by callers rather than by `theory.ts` itself: CAGED position
  markers (`positions.ts`) are Major-scale-specific fingering templates
  — gate on `family.id === "major"`, not just `degreeCount === 7`
  (Harmonic Minor's interval spacing differs); diatonic triad
  highlighting generalizes to any `degreeCount === 7` family but not to
  Pentatonic — gate on `family.degreeCount === 7`.
- **Client-only persistence** (`src/lib/storage.ts`): practice sessions
  are read/written via `localStorage`, guarded by `typeof window`. Any
  state seeded from `loadSessions()` must be initialized empty and
  populated inside a `useEffect`, never in a `useState` initializer —
  the initializer runs during SSR (`window` undefined → `[]`) and then
  synchronously again on client hydration (real data), and the mismatch
  between those two renders throws a hydration error. See
  `src/components/ScalePage.tsx` for the current pattern.
- **Audio timing** (`src/hooks/useMetronome.ts`): uses `Tone.Transport`
  + `Tone.Loop`, not `setInterval`, so tempo doesn't drift or get
  throttled in background tabs. `Tone` is dynamically imported and
  `Tone.start()` is only ever called from inside the user's click
  handler (`start()`), per browser autoplay policy — never on mount.
- **Stopwatch** (`src/hooks/useStopwatch.ts`): elapsed time is derived
  from `Date.now()` timestamp differences on start/pause/resume, not by
  counting interval ticks, so it stays accurate even if the tab is
  throttled.
- **Wake lock** (`src/hooks/useWakeLock.ts`): requested/released based
  on a single derived `practiceActive` boolean (metronome playing OR
  stopwatch running) computed in `ScalePage.tsx`. The Wake Lock API is
  unsupported in some browsers (older Safari) — failures are swallowed
  silently and must never block metronome/stopwatch functionality.

## OpenSpec

This repo uses OpenSpec (`openspec/config.yaml`, schema `spec-driven`).
`openspec/specs/` holds the current source-of-truth capability specs
(`scale-fretboard`, `metronome`, `practice-tracking`) as SHALL
requirements with WHEN/THEN scenarios. `MVP_SPECS.md` at the repo root
is the original Milestone 1 build prompt these specs were baselined
from.

For new features or behavior changes, use `/opsx:propose` to create a
change with delta specs, then `/opsx:archive` to merge it into
`openspec/specs/` once implemented — don't hand-edit files under
`openspec/specs/` directly.
