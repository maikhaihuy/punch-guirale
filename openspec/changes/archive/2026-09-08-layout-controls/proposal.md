## Why

The current control bar (`KeyModeBar.tsx`) crams key/mode/position selection
and the note⇄degree and highlight-triad toggles into one horizontally
scrolling strip with no visual grouping, and the bottom bar
(`PracticeControls.tsx`) uses text-label buttons ("Metronome", "Stop",
"Start", "Pause", "Resume") that eat horizontal space and don't read as a
compact utility bar. As the control surface has grown across Milestone 1/2
(triad highlighting, position selection, note interaction states), the lack
of grouping and the ad-hoc toggle buttons (plain `<button aria-pressed>`
elements, not real switches) have made the UI harder to scan. This change
restructures composition and styling only — no data model or interaction
logic changes.

## What Changes

- Restructure `src/app/page.tsx` into a single centered column: a narrower
  `max-w-2xl` controls container, a wider `max-w-5xl` fretboard section (the
  hero element), and a `max-w-2xl` bottom bar — consistent across desktop
  and mobile (mobile is a scaled version of the same structure, not a
  separate layout).
- Split `KeyModeBar` into separate labeled rows (Key, Mode, Position,
  Display) each in its own `<section>` with a plain-text (not all-caps)
  label, reusing the existing tab/pill button components — only the
  surrounding layout and grouping changes.
- Give the "Randomize root" control a visually distinct treatment (circular,
  filled with an accent color, dice icon, no text label, separated from the
  12 key buttons with extra spacing) instead of styling it as a 13th key
  button.
- Replace the hand-rolled `aria-pressed` toggle buttons for note⇄degree and
  highlight-triad with shadcn/ui `Switch` components, grouped together in
  one row.
- Replace `PracticeControls`' text-label buttons with icon-only buttons
  (lucide-react icons: metronome, play/pause, timer, reset), each carrying
  an `aria-label` since there's no visible text fallback. **BREAKING**: any
  test or tooling that selects these buttons by their visible text (e.g.
  "Start", "Stop", "Metronome") will need to switch to `aria-label` or
  `data-testid` selectors instead.
- Add `shadcn/ui` (via `npx shadcn@latest init` + `add switch`) and
  `lucide-react` as new dependencies — neither exists in the repo today.
- Define the small set of CSS custom properties this layout needs
  (`--accent`, `--text-muted`, `--surface`) in `globals.css`, since no
  design-tokens spec/file exists yet in this repo to source them from.

## Capabilities

### New Capabilities
- `layout-controls`: page composition (centered column, control-row
  grouping, container widths), the Random button's distinct visual
  treatment, use of switch components for display toggles, and the
  icon-only + `aria-label` requirement for the metronome/stopwatch bar.

### Modified Capabilities
(none — `metronome`, `practice-tracking`, `scale-fretboard`,
`scale-positions`, `note-interaction-states`, `note-playback`, and
`triad-tone-highlighting` specs describe behavior, timing, and data
semantics, none of which change here; only presentation/composition of
existing controls changes)

## Impact

- **Code**: `src/app/page.tsx` (root layout), `src/components/KeyModeBar.tsx`
  (split into row sections + Switch + distinct Random button),
  `src/components/PracticeControls.tsx` (icon-only buttons), new
  `src/components/ui/switch.tsx` (shadcn-generated).
- **Dependencies**: adds `lucide-react`, shadcn/ui's `Switch` component and
  its underlying `@radix-ui/react-switch`, plus shadcn's usual companions
  (`class-variance-authority`, `clsx`, `tailwind-merge`) and a new
  `components.json`.
- **Styling**: new CSS custom properties in `src/app/globals.css`
  (`--accent`, `--text-muted`, `--surface`) referenced by the new layout.
- **No changes** to `src/lib/theory.ts`, `src/lib/storage.ts`,
  `src/hooks/useMetronome.ts`, `src/hooks/useStopwatch.ts`, or
  `src/hooks/useWakeLock.ts` — this is a presentation-layer-only change.
