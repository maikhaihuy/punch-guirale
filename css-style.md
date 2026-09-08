# Guitar Scale Trainer — Design Tokens & Style Direction

Direction chosen: warm, rustic — the tone of guitar wood and analog gear, not
a slick SaaS look. Both light and dark themes, auto-detected from system
preference with a manual toggle override.

## Principles

1. **Every color traces to a real guitar material** — amber/sunburst for the
   primary accent, aged bronze for secondary elements, rosewood brown for
   the dark theme's base. Nothing is an arbitrary brand color.
2. **Fret markers are functional, not decorative.** The fretboard's inlay
   dots sit at the same frets a real guitar uses — 3, 5, 7, 9, 15, 17, 19,
   21 (single dot), and 12, 24 (double dot) — so they double as a wayfinding
   device for the player, the same job they do on a real instrument.
3. **Numbers behave like a grid, because the fretboard is one.** Fret
   numbers and scale degrees use tabular figures so columns stay aligned
   down the neck.
4. **Spend the boldness on the note markers.** The root/in-scale/dimmed
   note states (already built in Milestone 2) are the one place color does
   real work. Chrome around them — tabs, buttons, panels — stays quiet and
   low-contrast so it doesn't compete.
5. **Avoid SaaS-card and template-chrome defaults**: no uniform
   rounded-card-plus-drop-shadow treatment on every panel, no all-caps
   eyebrow labels, no arrows appended to buttons. Prefer flat surface-tone
   shifts over heavy shadows — it reads more like a piece of hardware than
   a dashboard.

## Color

Named tokens, both themes. Use CSS custom properties so the toggle just
swaps a class on `<html>`.

**Light theme — "Spruce"**
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F2E8D5` | App background — warm maple/spruce tone, not neutral cream |
| `--surface` | `#EDE0C8` | Panels, cards, tab bar |
| `--text` | `#2B1D12` | Primary text — dark walnut, not pure black |
| `--text-muted` | `#6B5A45` | Secondary text, labels |
| `--accent` | `#C77B2E` | Primary accent — sunburst amber (root note, active tab, primary buttons) |
| `--accent-soft` | `#8A6D3A` | Secondary accent — aged bronze/wound-string tone (in-scale notes, secondary UI) |

**Dark theme — "Rosewood"**
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#1C1410` | App background — dark rosewood, not neutral near-black |
| `--surface` | `#2A1F17` | Panels, cards, tab bar |
| `--text` | `#EDE3D3` | Primary text — warm off-white |
| `--text-muted` | `#A6957E` | Secondary text, labels |
| `--accent` | `#E0964B` | Primary accent — brighter amber for dark-mode contrast (tube-amp-glow feel) |
| `--accent-soft` | `#A67C3D` | Secondary accent — aged bronze |

Dimmed note state (Milestone 2's position selector) = `--accent-soft` at
~28% opacity in both themes, as already spec'd.

## Type

Two families, clearly distinct roles:

- **Zilla Slab** — headings, the key/mode display, and the note-letter
  labels on the fretboard itself. A slab serif with enough weight to read
  like vintage gear lettering, without going full "high-contrast display
  serif" (that combination reads as a generic AI-design tell — deliberately
  avoided here).
- **Karla** — everything else: tabs, buttons, body copy, settings. A
  humanist sans with a little warmth, kept plain so it doesn't compete with
  Zilla Slab in headings.
- Enable tabular figures (`font-variant-numeric: tabular-nums`) on fret
  numbers and degree labels specifically — this is the grid-alignment
  point from Principle 3, not a stylistic flourish.

## Layout

- The fretboard is the hero — it gets the most visual weight and the only
  saturated color (the note markers). Everything else stays quiet.
- Left-aligned control row (key picker, mode tabs, position tabs) above the
  fretboard, consistent with the mobile layout already spec'd in Milestone
  1/2 (bottom-anchored metronome/stopwatch, sticky fret-number row on
  horizontal scroll).
- Avoid uniform rounded-card treatment — use a subtle `--surface` vs `--bg`
  tone shift to separate panels instead of borders/shadows on every block.

## Implementation: theme tokens + toggle

```css
/* globals.css */
:root {
  --bg: #F2E8D5;
  --surface: #EDE0C8;
  --text: #2B1D12;
  --text-muted: #6B5A45;
  --accent: #C77B2E;
  --accent-soft: #8A6D3A;
}

.dark {
  --bg: #1C1410;
  --surface: #2A1F17;
  --text: #EDE3D3;
  --text-muted: #A6957E;
  --accent: #E0964B;
  --accent-soft: #A67C3D;
}
```

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
      },
      fontFamily: {
        display: ['"Zilla Slab"', 'serif'],
        sans: ['Karla', 'sans-serif'],
      },
    },
  },
};
```

```ts
// theme.ts — system preference by default, manual override persisted
function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
}

// Run getInitialTheme() + applyTheme() once on app load, and call
// applyTheme() again from the toggle button's click handler.
```