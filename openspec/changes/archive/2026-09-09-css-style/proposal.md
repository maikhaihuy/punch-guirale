## Why

The app currently only has two ad-hoc color tokens (`--background`/
`--foreground`, plus a handful added incidentally by the `layout-controls`
change) and no deliberate visual identity — it reads as generic Tailwind
default styling rather than something evoking guitar wood and analog
gear. There's also no way for a user to override the system's light/dark
preference. This change gives the app a coherent "warm, rustic" visual
direction: named color tokens tied to real guitar materials, a
manual-override theme toggle, distinct heading/body typefaces, and
functional fret-position inlay markers matching a real guitar neck.

## What Changes

- Replace the current ad-hoc token set (`--background`, `--foreground`,
  `--surface`, `--text-muted`, `--accent`, plus the Switch-only `--primary`/
  `--primary-foreground`/`--input`/`--ring` tokens) with the named
  "Spruce" (light) / "Rosewood" (dark) palettes: `--bg`, `--surface`,
  `--text`, `--text-muted`, `--accent`, `--accent-soft`. **BREAKING**: every
  component using the old Tailwind utility names (`bg-background`,
  `text-foreground`, `stroke-foreground`, `fill-foreground`, etc.) needs
  updating to the new names — this touches every component file.
- Add a manual light/dark theme toggle: defaults to system preference
  (`prefers-color-scheme`) on first load, persists an explicit user choice
  to `localStorage`, and applies it via a `dark` class on `<html>` (Tailwind
  v4 `@custom-variant dark` — this repo has no `tailwind.config.js`, so the
  source spec's CommonJS config example is adapted to the CSS-first v4
  setup already in place).
- Add two typefaces via `next/font/google`, replacing the current
  Geist Sans/Mono: **Zilla Slab** for headings, the key/mode display, and
  fretboard note-letter labels; **Karla** for everything else (tabs,
  buttons, body copy).
- Enable tabular figures on fret numbers and scale-degree labels
  specifically (not the note-name labels), so columns stay aligned down
  the neck as the player scrolls.
- Add functional fret-position inlay markers to the fretboard: single dots
  at frets 3, 5, 7, 9, 15, 17, 19, 21 and double dots at 12 and 24 — a new
  visual element, not present today.
- Audit existing component chrome (tabs, buttons, panels) against the
  "no uniform rounded-card-plus-shadow, no all-caps eyebrow labels, no
  button arrows" principle and adjust anywhere the current Tailwind
  defaults conflict with it.

**Explicitly out of scope**: the source spec's "left-aligned control row"
layout description is superseded by the already-implemented
`layout-controls` change (single centered column) — no layout/structural
changes are part of this proposal, only color, type, theme-toggle
mechanics, and the new fret markers.

## Capabilities

### New Capabilities
- `design-tokens`: the named color token system (light/dark palettes),
  the manual theme-toggle mechanism (system-preference default,
  localStorage-persisted override), and the tabular-figure requirement for
  fret numbers/degree labels.
- `fret-position-markers`: the inlay dot markers at standard guitar fret
  positions, rendered on the fretboard independent of the current
  scale/root selection.

### Modified Capabilities
(none — `scale-fretboard`'s existing requirements describe note-dot
placement and root/in-scale distinction in terms of filled-vs-outlined,
not specific colors, so recoloring via tokens doesn't change any existing
requirement's contract; fret markers are an additive visual layer, not a
change to how scale notes are selected or rendered)

## Impact

- **Code**: `src/app/globals.css` (full token replacement + `dark` class
  variant setup), `src/app/layout.tsx` (font swap to Zilla Slab/Karla),
  every component currently referencing the old token names
  (`KeyModeBar.tsx`, `PracticeControls.tsx`, `PracticeHistory.tsx`,
  `Fretboard.tsx`, `src/components/ui/switch.tsx`), a new theme-toggle
  control and `src/lib/theme.ts` (or similar) for the
  get/apply-initial-theme logic, and `Fretboard.tsx` for the new inlay
  marker rendering.
- **No changes** to `src/lib/theory.ts`, `src/lib/storage.ts`,
  `src/hooks/*`, or any interaction/audio behavior — this is a visual
  restyle plus one small additive rendering feature (fret markers).
