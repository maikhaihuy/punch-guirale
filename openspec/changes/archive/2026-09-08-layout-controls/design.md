## Context

Today `src/app/page.tsx` renders `KeyModeBar` → `Fretboard` →
`PracticeHistory` → `PracticeControls` with no wrapping max-width
container; only `PracticeControls` self-constrains to `max-w-3xl mx-auto`.
`KeyModeBar.tsx` renders key/mode/position selection and the two display
toggles as one horizontally scrolling strip of near-identical pill buttons
(toggles are plain `<button aria-pressed>` elements, not switches).
`PracticeControls.tsx` is a `fixed inset-x-0 bottom-0` bar with text-label
buttons for metronome and stopwatch actions. No `src/components/ui/`
directory, `components.json`, `lucide-react`, or CSS custom properties
beyond `--background`/`--foreground` exist yet. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Reorganize existing controls into the labeled-row / centered-column
  structure and switch/icon affordances described in `layout-controls.md`
  and `specs/layout-controls/spec.md`, without touching hook or lib logic.
- Introduce shadcn/ui and lucide-react as the standing pattern for future
  UI chrome (switches, icon buttons) instead of hand-rolled equivalents.
- Keep the change reviewable as presentation-only: no prop/behavior changes
  to `useMetronome`, `useStopwatch`, `useWakeLock`, or `theory.ts`.

**Non-Goals:**
- Building a general design-tokens system. This change defines only the
  three tokens the new layout needs (`--accent`, `--text-muted`,
  `--surface`); a fuller token set is out of scope.
- Changing any music-theory, audio-timing, or persistence behavior.
- Redesigning `Fretboard.tsx` or `PracticeHistory.tsx` internals beyond
  the width/container change to their wrapping section.

## Decisions

**Split `KeyModeBar` into row subcomponents, not one file.** Extract
`KeyRow`, `ModeRow`, `PositionRow`, and `DisplayTogglesRow` (or inline
`<section>` blocks within a slimmer `KeyModeBar`) rather than keeping one
150-line component with conditional layout branches. Alternative
considered: keep a single component and just restructure its JSX in place
— rejected because the row grouping is now a real structural boundary
(each row has its own label and spacing rules) and separate components
make the labeled-row requirement easy to verify per-row.

**Use shadcn/ui's `Switch` (Radix-backed) instead of a hand-rolled
toggle.** Matches the existing codebase preference for proven components
over custom UI chrome (per `layout-controls.md`) and gets keyboard/ARIA
behavior for free. Alternative considered: keep the existing
`aria-pressed` button pattern and only restyle it — rejected because a
real switch role communicates on/off state more accurately to assistive
tech than a toggle button, and the spec explicitly calls for switches.

**Use lucide-react icons + `aria-label` for the bottom bar rather than
icon font or inline SVG.** lucide-react is tree-shakeable, has the exact
icons needed (`Play`, `Pause`, `Timer`, `RotateCcw`; confirm `Metronome`
and the stop/reset icon name against lucide.dev at implementation time
since the spec flags this as unverified), and avoids hand-maintaining SVG
paths. Every icon-only button gets an explicit `aria-label` since there is
no visible text fallback.

**Define `--accent`, `--text-muted`, `--surface` directly in
`globals.css`** rather than standing up a separate design-tokens spec/file
first. No such spec exists yet (confirmed: `openspec/specs/` has no
`design-tokens` capability), and inventing one is out of scope for a
layout change — three tokens don't warrant a new capability. If a broader
token system is needed later, it can absorb these three.

**Root layout becomes three stacked max-width containers** (`max-w-2xl`
controls, `max-w-5xl` fretboard, `max-w-2xl` bottom bar) inside one
`flex flex-col items-center` column on `page.tsx`, replacing the current
full-width stack. `PracticeHistory`'s existing width is left as-is except
for being placed inside the fretboard's wider section per the structure
diagram in `layout-controls.md`.

## Risks / Trade-offs

- [Adding shadcn/ui + Radix + lucide-react as new dependencies increases
  bundle size and introduces a new dependency-update surface] → Mitigation:
  these are limited to one component (`Switch`) and a handful of icons;
  `next build` bundle analysis can confirm impact stays small before
  merging.
- [Selector-based tests or tooling that queries buttons by visible text
  ("Start", "Stop", "Metronome") will break] → Mitigation: called out as
  **BREAKING** in the proposal; no automated tests exist in this repo
  today (per CLAUDE.md: "There is no test suite configured"), so the
  practical impact is limited to manual QA scripts, if any.
- [lucide-react's exact icon export names may have changed since the spec
  was written] → Mitigation: `layout-controls.md` already flags this;
  verify each icon name against lucide.dev during implementation and fall
  back to `Square`/`CircleStop` equivalents as noted.
- [Restructuring `KeyModeBar` into subcomponents could regress existing
  scroll/overflow behavior on narrow viewports] → Mitigation: manually
  verify each row's horizontal scroll (where still needed, e.g. 12-key row
  on small screens) after extraction, per CLAUDE.md's guidance to test
  UI changes in a browser before reporting done.

## Migration Plan

Single-PR, presentation-only change with no data migration:
1. Add dependencies (`lucide-react`, shadcn `Switch` + companions) and run
   `shadcn init`.
2. Add the three CSS custom properties to `globals.css`.
3. Extract `KeyModeBar` row subcomponents and restyle the Random control.
4. Swap the two toggle buttons for `Switch`.
5. Restructure `page.tsx`'s root containers.
6. Convert `PracticeControls` buttons to icon-only with `aria-label`s.
7. Manual verification in-browser (desktop + mobile viewport) per the
   Definition of Done in `layout-controls.md`.

Rollback is a plain revert of the PR — no persisted state, schema, or
external system is touched.
