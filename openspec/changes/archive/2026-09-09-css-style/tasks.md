## 1. Color tokens

- [x] 1.1 Replace `src/app/globals.css`'s `:root` token block with the
      Spruce (light) palette: `--bg`, `--surface`, `--text`,
      `--text-muted`, `--accent`, `--accent-soft`
- [x] 1.2 Add `@custom-variant dark (&:is(.dark *));` and a `.dark { ... }`
      block with the Rosewood palette, replacing the current
      `@media (prefers-color-scheme: dark)` block
- [x] 1.3 Remap `--primary`/`--primary-foreground` to `--text`/`--bg` and
      `--input`/`--ring` to semi-transparent `--text` values, keeping the
      Switch component's existing quiet (non-accent) treatment
- [x] 1.4 Update the `@theme inline` block's `--color-*` mappings to the
      new token names (`--color-bg`, `--color-surface`, `--color-text`,
      `--color-text-muted`, `--color-accent`, `--color-accent-soft`,
      plus the retained `--color-primary`/etc.)
- [x] 1.5 Update `src/app/layout.tsx`'s `body` background/text classes and
      any other direct token references to the new names — `body`'s plain
      CSS rule in globals.css already covers this (no Tailwind utility
      classes on `<body>` referenced the old names); font-family wiring
      happens in Group 4 when `layout.tsx` is touched for the font swap

## 2. Component token references

- [x] 2.1 Update `src/components/KeyModeBar.tsx`'s token utility classes
      (`bg-background`, `text-foreground`, etc.) to the new names
- [x] 2.2 Update `src/components/PracticeControls.tsx`'s token utility
      classes to the new names — also dropped the leftover `font-mono`
      class (Geist Mono is being retired; tabular-nums was already doing
      the alignment work)
- [x] 2.3 Update `src/components/PracticeHistory.tsx`'s token utility
      classes to the new names, and remove the all-caps/`tracking-wide`
      "PRACTICE HISTORY" heading treatment (Principle 5: no all-caps
      eyebrow labels)
- [x] 2.4 Update `src/components/Fretboard.tsx`'s token utility classes
      (`bg-white`/`dark:bg-black`, `stroke-foreground`, `fill-foreground`,
      `fill-background`, etc.) to the new names — also converted the
      fret-line/string-line `black/20`+`white/20` and `black/30`+`white/30`
      hardcoded pairs to single `text/20`/`text/30` token references
      (same "hardcoded pair standing in for a themed surface" pattern as
      the board background), since the design-tokens requirement says
      every themed surface derives from these tokens
- [x] 2.5 Update `src/components/ui/switch.tsx` if any hardcoded/old token
      class names remain after the `@theme inline` remap
- [x] 2.6 Grep the whole `src/` tree for any remaining old token utility
      names (`bg-background`, `text-foreground`, `fill-foreground`,
      `stroke-foreground`, `fill-background`, `bg-surface` referencing the
      old mapping) and confirm none remain — confirmed clean; only
      remaining `black/`, `white/` references are interactive-state hover
      tints, intentionally left out of scope per design.md

## 3. Theme toggle

- [x] 3.1 Add `src/lib/theme.ts` with `getInitialTheme()`/`applyTheme()`
      per design.md (system-preference default, `localStorage`-persisted
      override)
- [x] 3.2 Add an inline `<script>` in `layout.tsx`'s `<head>` that runs
      `getInitialTheme()`/`applyTheme()` before first paint, to avoid a
      flash of the wrong theme — used `next/script`'s `beforeInteractive`
      strategy (this Next.js version's documented mechanism for
      head-injected pre-hydration scripts) rather than a raw `<script>`
      tag; the inline script duplicates the detection logic in plain JS
      (can't import the TS module into a raw pre-hydration script) with a
      comment pointing back at `theme.ts`'s storage key so they don't
      silently drift apart
- [x] 3.3 Add a theme-toggle control to the UI (button with an
      accessible label, e.g. "Switch to dark theme"/"Switch to light
      theme") wired to `applyTheme()` — new `ThemeToggle.tsx`, a small
      fixed-position icon button (Sun/Moon), rendered from `page.tsx`
      without altering any existing container's structure
- [x] 3.4 Verify the toggle overrides system preference immediately and
      that the explicit choice survives a reload — verified via
      Playwright: with system=light, clicking the toggle set the `dark`
      class + `localStorage`, and it was still applied after a full
      reload; also caught and fixed a hydration-mismatch warning this
      pattern causes (server can't know the persisted/system theme, so
      the pre-hydration script's DOM mutation disagrees with React's
      first render) by adding `suppressHydrationWarning` to `<html>`

## 4. Typography

- [x] 4.1 Add Zilla Slab and Karla via `next/font/google` in
      `layout.tsx`, replacing Geist Sans/Mono, and expose them as CSS
      variables consumed by `@theme inline`'s `--font-sans`/`--font-display`
      — done alongside the theme-init script edit, same file
- [x] 4.2 Apply the display font to headings, the key/mode display, and
      fretboard note-letter labels; apply the sans font everywhere else —
      applied to `PracticeHistory`'s "Practice history" heading and its
      per-session `{rootNote} {mode}` line (the only existing "key/mode
      display" element in the app today), and to `FretboardNote`'s label
      when showing note names; `font-sans` (Karla) is the `body` default
      so no other component needed a class change
- [x] 4.3 Add `tabular-nums` to the fret-number header cells in
      `Fretboard.tsx`
- [x] 4.4 Add `tabular-nums` to the degree `<text>` label in
      `FretboardNote`, applied only when `displayMode === "degree"`

## 5. Fret position markers

- [x] 5.1 Add a `FRET_MARKERS: Record<number, 1 | 2>` constant in
      `Fretboard.tsx` mapping fret number to marker count (1 for 3, 5, 7,
      9, 15, 17, 19, 21; 2 for 12, 24)
- [x] 5.2 Render single markers as one low-contrast `--text-muted`-toned
      `<circle>` centered via `fretX(fret)`, vertically centered on the
      board height, drawn before the string lines
- [x] 5.3 Render double markers (frets 12, 24) as two vertically-offset
      circles instead of one
- [x] 5.4 Verify markers render regardless of root/mode/position
      selection and don't shift, hide, or restyle any note dot —
      verified via Playwright: exactly 12 marker circles render (8
      single-fret + 2 double-fret × 2), at the expected x-positions for
      frets 3/5/7/9/12/15/17/19(off visible viewport)/21/24, independent
      of root/mode selection; note dots unaffected

## 6. Chrome audit

- [x] 6.1 Review tabs/buttons/panels across `KeyModeBar.tsx`,
      `PracticeControls.tsx`, and `PracticeHistory.tsx` against Principle
      5 (no uniform rounded-card-plus-shadow, no all-caps eyebrow labels,
      no button arrows) and adjust any remaining violations beyond the
      `PracticeHistory` heading already covered in task 2.3 — grepped for
      `shadow-`, `uppercase`, `tracking-`, and arrow glyphs/icons across
      all of `src/`; the `PracticeHistory` heading was the only hit, no
      other violations found

## 7. Verification

- [x] 7.1 Run `pnpm exec tsc --noEmit` — passes clean
- [x] 7.2 Run `pnpm dev` and verify both palettes render correctly (system
      light, system dark, and both manual toggle overrides), fret markers
      appear at the correct frets in both themes, and fret
      numbers/degrees stay column-aligned — verified via headless
      Playwright screenshots (no interactive browser in this session);
      screenshots sent to the user
- [x] 7.3 Confirm no regression to existing note-interaction, triad-ring,
      or pitch-echo styling (all of which reference color tokens this
      change renames) — verified via Playwright: triad rings render (27
      circles with highlight-triad on) and pitch-echo rings render (11
      circles on hovering a C), both using the renamed `--text`/`--accent`
      tokens correctly, no console/page errors
