## Context

`src/app/page.tsx` currently renders a flat `flex-col` stack: theme
toggle, then `KeyModeBar` (key/mode/position selectors + note⇄degree and
triad-highlight switches) in a `max-w-2xl` block, then a `max-w-5xl`
block with `Fretboard` + `PracticeHistory`, then a sticky
`PracticeControls` footer. There's no structural distinction between
"header," "body," and "footer" today — everything is one column
distinguished only by `max-w-*` widths.

`KeyModeBar.tsx` (167 lines) owns key/mode/position selection and the
two display switches; its internal control behavior (labeled rows,
random-key styling, switch rendering) is defined by the existing
`layout-controls` spec and is not changing — only its container moves.

The project already depends on `@base-ui/react` (used today for
`src/components/ui/switch.tsx`), which ships unstyled `Dialog` and
`Popover` primitives with built-in focus trapping, outside-click
dismissal, and Escape-to-close — covering the floating panel's
accessibility requirements without a new dependency.

## Goals / Non-Goals

**Goals:**
- Introduce explicit Header / Body / Footer regions in `page.tsx`.
- Move `KeyModeBar`'s controls into a floating panel that opens via a
  toggle affordance and closes on dismiss, outside click, or Escape.
- Preserve all existing control behavior (key/mode/position selection,
  switches, random-key styling) unchanged — this is a relocation, not a
  redesign of the controls themselves.
- Keep the footer (`PracticeControls`, sticky metronome + stopwatch bar)
  visually and behaviorally as-is; only its wrapper is reframed as the
  Footer area.

**Non-Goals:**
- Redesigning what the footer contains (backlog marks this "TBD" —
  explicitly out of scope for this change).
- Header scale/degree info display, W–H interval visualization,
  click-to-play fretboard notes, chord-at-degree display, practice-panel
  delete/export/chart, or scale/key URL routing — each is a separate
  backlog item/future change.
- Any change to `src/lib/theory.ts`, `src/lib/storage.ts`, or the audio
  hooks (`useMetronome`, `useStopwatch`, `useNotePlayer`, `useWakeLock`).
- Persisting panel open/closed state across reloads (each page load
  starts closed).

## Decisions

**1. Use `@base-ui/react`'s `Drawer` primitive for the panel shell, not
`Popover` or a hand-rolled overlay.**
The project already takes `@base-ui/react` as a dependency (used for
`Switch`), so this adds no new package. `Drawer` (found alongside
`Popover` in the same package) is purpose-built for exactly this shape
— "a panel that slides in from the edge of the screen" — and its
`swipeDirection="left" | "right"` gives edge-anchored slide-in behavior
plus swipe-to-dismiss on touch for free. `Drawer.Root` (open/
onOpenChange, `modal` for focus trap + scroll lock) +
`Drawer.Trigger` + `Drawer.Portal` + `Drawer.Backdrop` + `Drawer.Popup`
covers outside-click dismiss, Escape-to-close, and focus return to the
trigger without any custom logic — we only supply Tailwind classes for
position/size (anchored to one viewport edge, full-height, `w-[...]`
capped width on desktop) and set `modal="trap-focus"` rather than the
default `modal={true}`: the always-visible edge toggle lives outside
`Drawer.Portal`, and a fully modal drawer marks everything outside the
dialog (the toggle included) inert, which would make "click the toggle
again to close" — a required dismiss path — unreachable. `trap-focus`
keeps keyboard focus inside the panel without inerting the trigger.
`Popover`
was the first candidate but is meant for content anchored to a trigger
element inline in the page (tooltips, menus); `Drawer` matches the
"floating left/right panel" language in the proposal more directly and
needs no extra positioning math.

**2. Left/right edge toggle, not a hamburger-menu-in-header pattern.**
The backlog explicitly says "floating left/right panel that expands on
click/tap." An edge-anchored toggle (a small pill/tab fixed to the
viewport edge) keeps the header uncluttered for the scale/degree info
planned in a later change, and reads as persistent chrome rather than a
transient header icon.

**3. `KeyModeBar` is relocated, not rewritten.**
Its internal JSX/props stay the same component; only its parent
changes from an inline `<div className="w-full max-w-2xl">` in
`page.tsx` to the `Popover.Popup` content. This minimizes risk of
regressing the existing `layout-controls` switch/random-key/labeled-row
requirements, which are unit-tested only by the existing OpenSpec
scenarios (no automated test suite exists in this repo per CLAUDE.md).
Consider renaming the file in a follow-up if the "KeyModeBar" name
becomes misleading once it's panel content rather than a bar — not
required for this change.

**4. Body uses a `flex flex-col gap-*` two-section stack
(fretboard, then practice list), matching the proposal's "stack/flex"
wording rather than introducing CSS Grid.**
The current code already stacks these two vertically in a
`max-w-5xl` flex column; the change is naming/wrapping it as the `Body`
region, not restructuring the stacking axis. Grid would be
over-engineering for two vertically-stacked, full-width sections.

**5. Panel open state lives in `page.tsx` (or inside a new
`SettingsPanel` component) as local `useState`, not global state.**
Consistent with the existing architecture note in CLAUDE.md: "there is
no global state library." A single boolean (`panelOpen`) plus which
edge it's anchored to (if both left and right triggers exist, or one
toggle that always opens on the same edge — see Open Questions).

## Risks / Trade-offs

- [Hiding controls behind an extra click could feel like a regression
  for users who had them always visible] → Mitigate with a clearly
  labeled, always-visible edge toggle (not hidden inside another menu)
  so the affordance is discoverable; keep the panel's open animation
  fast (no perceived lag switching key/mode mid-practice).
- [`@base-ui/react` `Popover` is a newer/less battle-tested primitive
  than e.g. Radix] → Already adopted in this codebase for `Switch`, so
  this change doesn't introduce new integration risk; if `Popover`
  proves awkward for edge-anchored full-height layout, fall back to
  `Dialog` with non-modal styling.
- [Moving `KeyModeBar` changes its rendering context (inside a
  positioned popup vs. static flow), which could break its internal
  responsive assumptions if any exist] → Verify manually across mobile
  and desktop viewports per CLAUDE.md's "test the golden path... in a
  browser" guidance before marking tasks complete.

## Open Questions

- Single toggle (always same edge) vs. two independent triggers (left
  and right, potentially hosting different control groups later)?
  Proposal only requires one settings panel for now — default to a
  single toggle unless implementation reveals a need to split.
- Exact edge/position (left vs. right) and icon for the toggle
  affordance — a small implementation detail, left to whoever picks up
  `tasks.md`, informed by where the future header content (scale/degree
  info) ends up sitting.
