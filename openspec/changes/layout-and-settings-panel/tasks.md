## 1. Settings panel component

- [x] 1.1 Create `src/components/SettingsPanel.tsx` built on
      `@base-ui/react`'s `Drawer.Root` / `Drawer.Trigger` /
      `Drawer.Portal` / `Drawer.Backdrop` / `Drawer.Popup`, with
      `swipeDirection` set to the chosen edge, exposing `open`/
      `onOpenChange` control and rendering its `children` inside the
      popup.
- [x] 1.2 Add the always-visible edge-anchored toggle
      (`Drawer.Trigger`) with an accessible label (e.g. "Open
      settings") and an icon, positioned per the design's chosen edge.
- [x] 1.3 Style the popup as a left/right-anchored panel (full-height
      or near-full-height on mobile, fixed-width on desktop) using
      Tailwind, matching existing design tokens.
- [ ] 1.4 Verify dismiss behavior: re-clicking the toggle, clicking
      the backdrop, and pressing Escape all close it, and Escape
      returns focus to the toggle (exercise `Drawer`'s built-in
      behavior; add manual handling only if it doesn't already cover
      one of these).

## 2. Relocate key/mode controls into the panel

- [x] 2.1 Render `KeyModeBar` as the `SettingsPanel`'s content instead
      of its current always-visible placement in `page.tsx`.
- [ ] 2.2 Confirm `KeyModeBar`'s internal layout (labeled rows, switch
      row, random-key styling) still renders correctly inside the
      popup's width/height constraints; adjust `SettingsPanel` sizing
      (not `KeyModeBar`'s internals) if it doesn't.
- [x] 2.3 Remove the now-unused inline `<div className="w-full
      max-w-2xl">` wrapper for `KeyModeBar` from `page.tsx`.

## 3. Header / Body / Footer restructure in `page.tsx`

- [x] 3.1 Wrap `ThemeToggle` (and the new `SettingsPanel` toggle, if
      it's conceptually header chrome rather than a floating edge
      element) in a centered Header container. Resolved: the settings
      toggle stayed a floating edge element (per design.md decision 2,
      it's persistent chrome distinct from header content), so only
      `ThemeToggle` moved into `<header>`.
- [x] 3.2 Wrap `Fretboard` and `PracticeHistory` in a Body container
      matching the existing `flex flex-col gap-6` stack, renamed/
      reframed as the Body area (no change to stacking order or
      widths).
- [x] 3.3 Reframe the existing sticky `PracticeControls` wrapper as the
      Footer area (container/class rename only — no behavioral change
      to the metronome/stopwatch bar).
- [x] 3.4 Confirm the three areas are visually distinct in the DOM
      (e.g. via semantic `<header>`/`<main>`/`<footer>` or clearly
      named wrapper elements) without changing existing spacing/width
      conventions unnecessarily.

## 4. Verification

- [ ] 4.1 Run `pnpm lint`.
- [ ] 4.2 Run `pnpm dev` and manually verify on desktop and a mobile
      viewport: settings toggle opens/closes the panel; outside click
      and Escape close it; key/mode/position selection and both
      switches still work identically to before; fretboard and
      practice list still render in the Body; footer playback controls
      still work and stay sticky.
- [ ] 4.3 Verify no hydration warnings in the browser console on load
      (practice history still seeded via `useEffect`, unaffected by
      this change, but confirm the panel's own state doesn't introduce
      an SSR/client mismatch).

## 5. Spec sync

- [ ] 5.1 Run `/opsx:archive` (or `openspec archive`) once implementation
      matches `specs/layout-controls/spec.md` and
      `specs/settings-panel/spec.md` in this change, to merge the delta
      into `openspec/specs/`.
