## Context

Tailwind v4 is already in place (`@import "tailwindcss"` + `@theme inline`
in `globals.css`, no `tailwind.config.js`/`.ts` anywhere in the repo), so
the source spec's CommonJS `tailwind.config.js` example doesn't apply
as-is. Dark mode today is purely `@media (prefers-color-scheme: dark)` —
there is no `dark` class toggle anywhere, and no theme-choice persistence.
Current tokens (`--background`, `--foreground`, `--surface`,
`--text-muted`, `--accent`, plus `--primary`/`--primary-foreground`/
`--input`/`--ring` added for the shadcn `Switch`) live in
`src/app/globals.css`, mapped to Tailwind utilities via `@theme inline`.
`layout.tsx` loads Geist Sans/Mono via `next/font/google` and exposes them
as CSS variables consumed by the same `@theme inline` block.
`Fretboard.tsx` renders fret lines, string lines, and note dots in one
SVG per `fretX(fret)`/`stringY(stringIndex)` helpers (`fretX` already
computes the horizontal center of a fret's cell — 0..24 across a
`STRING_LABEL_WIDTH`-offset, `fretWidth`-per-fret grid); there is no
existing per-fret decoration layer to extend. See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Replace the token set with the named Spruce/Rosewood palettes and wire
  every existing component to the new names, with no visual regression
  beyond the intended recolor.
- Add a working manual theme toggle (system-default, localStorage-
  persisted override) using Tailwind v4's `@custom-variant dark` pattern
  instead of a JS config file.
- Swap in Zilla Slab/Karla and apply tabular figures precisely where
  Principle 3 calls for it (fret numbers, degree labels) — not globally.
- Add fret-position inlay markers as a new, independent SVG layer in
  `Fretboard.tsx`.

**Non-Goals:**
- Any layout/structural change (left-alignment vs. centered column) — per
  the user's explicit choice, the centered-column structure from
  `layout-controls` stays as-is; only color/type/theme-toggle/fret-marker
  work is in scope.
- A general-purpose theming system beyond the six named tokens this spec
  defines (no new component variants, no per-component override API).
- Changing `scale-fretboard`'s note-selection or note-rendering logic —
  fret markers are additive and never affect which notes render.

## Decisions

**Rename tokens outright rather than aliasing old names to new values.**
The old names (`--background`, `--foreground`) don't match this palette's
vocabulary and keeping both would leave two ways to reference the same
concept. Every component's Tailwind utility classes (`bg-background`,
`text-foreground`, `stroke-foreground`, `fill-foreground`, `fill-background`,
`bg-surface`, `text-text-muted`, `bg-accent`) get updated in the same pass
via the `@theme inline` mapping (`--color-bg`, `--color-surface`,
`--color-text`, `--color-text-muted`, `--color-accent`,
`--color-accent-soft`) so `bg-bg`, `text-text`, etc. become the new
utility names. Alternative considered: keep old names as aliases pointing
at new values — rejected, since the proposal's explicit goal is a clean
palette, and aliasing would let stale utility classes linger unnoticed.

**Keep `--primary`/`--primary-foreground`/`--input`/`--ring` (the
Switch-only tokens from `layout-controls`), remapped to the new palette.**
`--primary`/`--primary-foreground` already mean "the app's default
foreground/background pairing," which under the new palette is
`--text`/`--bg`. Per style Principle 4 ("chrome stays quiet, boldness is
for note markers"), the Switch's "on" state should NOT switch to
`--accent` — it stays a quiet `--text`-toned track, matching its existing
neutral treatment. `--input`/`--ring` become semi-transparent `--text`
values in each theme, same role as today.

**Theme toggle: Tailwind v4 `@custom-variant dark (&:is(.dark *));` plus a
plain `theme.ts` helper**, not a JS config file. This is exactly the
mechanism shadcn's default init scaffolded (and that the `layout-controls`
change deliberately reverted, because nothing implemented the toggle at
the time) — now that this change adds the actual toggle button and
persistence logic, adopting the class-based variant is correct. All
`dark:` utility variants already used throughout the codebase
(`dark:bg-black`, `dark:fill-black`, etc.) continue to work unchanged,
since `@custom-variant dark` redefines what `dark:` compiles to without
changing its syntax. `getInitialTheme()`/`applyTheme()` run once in a
small inline script in `layout.tsx` (before hydration, to avoid a flash of
the wrong theme) plus from the toggle button's click handler, per the
source spec's sketch — adapted only in that the class toggle now targets
Tailwind v4's variant instead of a `darkMode: 'class'` config flag.

**Fret markers as a new SVG layer, positioned via the existing
`fretX(fret)` helper.** `Fretboard.tsx` already computes each fret's
horizontal cell-center via `fretX`, which is exactly where a real
instrument's inlay sits (centered in the fret's physical space, not on
the fret wire). Render one `<circle>` (single-marker frets) or two
stacked `<circle>`s (12 and 24) per marked fret, vertically centered on
the board's full height, drawn before the string lines so strings and
notes visually sit on top of the markers, matching a real neck's
layering. A `FRET_MARKERS: Record<number, 1 | 2>` constant map (single vs.
double) avoids repeating the fret-number list in multiple places.

**Tabular figures via a targeted Tailwind class, not a global CSS rule.**
`font-variant-numeric: tabular-nums` (Tailwind's `tabular-nums` utility)
gets added specifically to the fret-number header cells and to the degree
`<text>` label (only reached when `displayMode === "degree"`), not to
note-name labels or any other text, matching Principle 3's explicit scope.

## Risks / Trade-offs

- [Renaming every color token is a wide, mechanical diff across every
  component file] → Mitigation: it's a rename, not a redesign — each
  substitution is a direct name-for-name swap (`bg-background` →
  `bg-bg`, `text-foreground` → `text-text`, etc.), verifiable by grepping
  for any leftover old token name after the change.
- [A flash of the wrong theme on load if the inline script runs after
  first paint] → Mitigation: place the theme-detection script in
  `layout.tsx`'s `<head>` (via a small inline `<script>`, not a
  `useEffect`), so it runs before the page paints, matching the standard
  no-flash pattern for class-based dark mode.
- [Fret markers could visually clash with the position-selector's
  translucent highlight band or the note dots at marked frets] →
  Mitigation: markers render as a low-contrast `--text-muted`-toned fill
  beneath the note layer in SVG paint order, so they recede when a note
  dot occupies the same fret and don't compete with the position band's
  existing low opacity.
- [Google Fonts (Zilla Slab, Karla) add a new network dependency at
  build/serve time] → Mitigation: `next/font/google` self-hosts the font
  files at build time (same mechanism already used for Geist), so there's
  no added runtime request to Google's servers.
