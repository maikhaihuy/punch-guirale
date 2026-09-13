## Why

Milestone 4 finished the generic scale schema, but the page layout hasn't
kept pace: `KeyModeBar` (key, mode, position, note⇄degree toggle, triad
highlight toggle) sits permanently visible above the fretboard, competing
for space with the two things the user actually practices with — the
fretboard and the practice history list. As more settings get added
(upcoming: scale family selection, W–H interval display, chord-at-degree
info), an always-visible controls block won't scale, especially on mobile.
This change restructures the page into explicit Header/Body/Footer areas
and moves settings into an on-demand floating panel, clearing space for
body content and future header/fretboard features from the rest of the
backlog.

## What Changes

- Restructure `src/app/page.tsx` into three explicit layout areas:
  - **Header**: its own area, centered in the layout (currently just
    holds `ThemeToggle`; becomes the container for future scale/degree
    info from later changes).
  - **Body**: a stack/flex region containing the two main sections —
    the fretboard and the practice-tracking list (`Fretboard`,
    `PracticeHistory`) — replacing the current flat `flex-col` stack.
  - **Footer**: the existing sticky `PracticeControls` bar (metronome +
    stopwatch) stays as-is; only its container is renamed/reframed as
    the Footer area, no behavior change.
- Introduce a floating settings panel component that opens on
  click/tap from a toggle affordance (left or right edge of the
  viewport) and closes on dismiss (re-click the toggle, click outside,
  or Escape).
- Move the existing key selector, mode selector, position selector,
  note⇄degree switch, and highlight-triad switch from the always-visible
  `KeyModeBar` into this floating panel. No change to what these
  controls do — only where and how they're presented.
- Remove the permanently-visible controls container from the main page
  flow. **BREAKING** (UX): controls are no longer visible without an
  extra interaction; existing `layout-controls` requirement "Single
  centered column layout" is replaced by the new Header/Body/Footer
  requirement below.

## Capabilities

### New Capabilities
- `settings-panel`: the floating, click/tap-expandable left/right panel
  that hosts key/mode/position selection and display toggles, including
  its open/close interaction and accessibility behavior (focus handling,
  Escape to close, dismiss on outside click).

### Modified Capabilities
- `layout-controls`: replaces "Single centered column layout" with an
  explicit Header (centered) / Body (fretboard + practice list) / Footer
  (playback bar) structure, and replaces "Controls grouped into labeled
  rows" + the switch/random-key requirements with pointers into the new
  `settings-panel` capability (the controls themselves — labeling,
  switch rendering, random-key distinction — keep their existing
  behavior, just relocated).

## Impact

- `src/app/page.tsx`: restructure top-level JSX into Header/Body/Footer
  containers; wire panel open/close state.
- `src/components/KeyModeBar.tsx`: becomes the content rendered inside
  the new settings panel (rename/relocate as needed); its internal
  control behavior is unchanged.
- New component(s) for the floating panel shell (toggle affordance,
  overlay/drawer, focus trap).
- `openspec/specs/layout-controls/spec.md`: delta spec updates.
- No changes to `src/lib/theory.ts`, `src/lib/storage.ts`,
  `useMetronome`, `useStopwatch`, or `useWakeLock` — this change is
  presentation/layout only.
