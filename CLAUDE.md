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

This is a single-page client app (`src/app/page.tsx`) — there is no
routing beyond the one App Router page. It composes state + hooks and
passes data down to presentational components; there is no global state
library.

- **Music theory core** (`src/lib/theory.ts`): notes are modeled by MIDI
  number, not just pitch class, so octave/frequency stay available
  without changing the data model later. `buildFretboard(root, mode)`
  is the central function — it returns a 6×25 grid of `FretNote`s
  (fret, midi, name, degree, inScale, isRoot, freq) driven by the
  `MODES` interval table. Components only render, never recompute scale
  membership themselves.
- **Client-only persistence** (`src/lib/storage.ts`): practice sessions
  are read/written via `localStorage`, guarded by `typeof window`. Any
  state seeded from `loadSessions()` must be initialized empty and
  populated inside a `useEffect`, never in a `useState` initializer —
  the initializer runs during SSR (`window` undefined → `[]`) and then
  synchronously again on client hydration (real data), and the mismatch
  between those two renders throws a hydration error. See
  `src/app/page.tsx` for the current pattern.
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
  stopwatch running) computed in `page.tsx`. The Wake Lock API is
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
