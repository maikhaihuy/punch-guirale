## 1. Fret 0 drop

- [x] 1.1 In `Fretboard.tsx`, filter fret index 0 out of the rendered
      grid (columns, fret-position markers, note dots) without changing
      `theory.ts#buildFretboard`'s internal 0-based generation.
- [x] 1.2 Confirm `POSITION_SPANS`/`POSITION_SHAPES` in `positions.ts`
      need no data changes — position 1's fret-0 note simply stops
      rendering (design.md Decision 1) — and spot-check position 1
      against a real fretboard per design.md's Risks section.
- [x] 1.3 Make each string's name label at the fretboard's left edge
      clickable, playing that string's open (fret 0) note when it's in
      the current scale (per user feedback during apply — see
      `scale-fretboard` spec, "Open string remains playable via the
      string label"); inactive/silent for a string whose open note is
      not in scale. Verified via live dev server: C Ionian shows all 6
      open strings (E A D G B E) as playable (all diatonic to C major);
      C Minor Pentatonic shows only the G string as playable, the other
      5 muted with no click handler — matches scale membership exactly.

## 2. Fretboard viewport (position pills, minimap, zoom, touch)

- [x] 2.1 Move position-pill rendering (`Pos 1`–`Pos 5`) from
      `KeyModeBar` into `Fretboard.tsx`, anchored along its top edge;
      `Fretboard` now owns `selectedPosition` state instead of
      receiving it from `KeyModeBar`/`ScalePage`.
- [x] 2.2 Remove the `autoFitMobile` gate from the existing
      `zoomFretWidth`/`scrollLeft` fit effect so position-pill selection
      fits the viewport on every viewport size, not just mobile
      (design.md Decision 2).
- [x] 2.3 Add a range minimap below the main fretboard spanning frets
      1–24 with a draggable window reflecting the current
      `zoomFretWidth`/`scrollLeft`; dragging it updates `scrollLeft`
      directly (unconstrained by the 5 fixed positions).
- [x] 2.4 Add `−`/`+` zoom controls anchored to the fretboard's
      bottom-right corner that adjust `zoomFretWidth` within its
      existing `[MIN_ZOOM_FRET_WIDTH, FRET_WIDTH]` bounds.
- [x] 2.5 Implement pinch-to-zoom (native Pointer Events, two-finger)
      and horizontal drag/swipe (native browser touch-scroll on the
      `overflow-x-auto` + `touch-action: pan-x` container - no custom
      code needed for single-finger pan) on the fretboard's scroll
      container (design.md Decision 3); pinch adjusts `zoomFretWidth`
      and re-centers `scrollLeft` on the pinch midpoint.
- [x] 2.6 Default visible range to frets 1–12 on load (no prior
      viewport adjustment) — satisfied by `scrollLeft` starting at 0
      (leftmost = fret 1) with the default `FRET_WIDTH`.
- [x] 2.7 Verify manual pan/zoom (drag, pinch, minimap, corner buttons)
      is never overridden by a stale auto-fit effect unless the user
      selects a different position pill — confirmed by inspection: the
      fit effect's dependency array is `[effectivePosition]` only, so
      minimap/zoom-button/pinch writes to `zoomFretWidth`/`scrollLeft`
      never get clobbered by it.

## 3. Header extraction

- [x] 3.1 Create a header component with a key row (12 chromatic root
      buttons + randomize dice, moved from `KeyModeBar`'s existing "Key"
      section) as decided in the apply session (scale-header spec,
      "Key row hosts root note selection").
- [x] 3.2 Add the primary row (current degree + note, full ordered scale
      note list) to the same header component, tracking the
      last-clicked fretboard note as new page-local state in
      `ScalePage` (defaulting to the root/degree 1).
- [x] 3.3 Add the secondary row (triad-highlight toggle, note/degree
      toggle, W–H pattern) to the same header component, reusing the
      existing `Switch`/`PillGroup` components from `KeyModeBar`. Gate
      the W–H display on `family.degreeCount === 7` (letters, e.g.
      "W-W-H-W-W-W-H"), same gating pattern as triad highlighting;
      hidden for Pentatonic. Verified via live dev server: Major shows
      "W-W-H-W-W-W-H" (Ionian) / "H-W-W-H-W-W-W" (Locrian); Harmonic
      Minor shows its own pattern; Minor Pentatonic shows neither Triad
      nor W–H.
- [x] 3.4 On viewports narrower than 768px, hide the secondary row
      behind a `⋯` toggle button in the header, defaulting to hidden.
- [x] 3.5 Wire the new header component into `ScalePage`'s `<header>`,
      replacing the bare `ThemeToggle`-only header (keep `ThemeToggle`
      alongside it).

## 4. Navigation (sidebar + mobile sheet)

- [x] 4.1 Build the two-level family/mode nav tree content (family list
      level 1, nested mode/variant list level 2 for the active family),
      sourced from `SCALE_FAMILIES`, with `role="tree"`/`role="treeitem"`
      semantics and arrow-key/Enter navigation.
- [x] 4.2 Render it as a persistent left `<aside>` on viewports ≥1024px,
      always expanded for the active family, others collapsed and
      expandable on click.
- [x] 4.3 On viewports <768px, replace the sidebar with a compact
      top-left button showing the current family/mode label; wire it to
      open a `@base-ui/react` `Drawer` (`swipeDirection="down"`) bottom
      sheet containing the same tree content (design.md Decision 4).
- [x] 4.4 Wire tree selection to `ScalePage`'s existing
      `handleFamilyChange`/`handleModeChange` navigation logic
      (family select → that family's first mode; mode select → same
      family, new mode).
- [x] 4.5 Support Escape to close the mobile bottom sheet and return
      focus to its trigger button — relies on `@base-ui/react` Drawer's
      built-in `modal="trap-focus"` behavior, same pattern the deleted
      `SettingsPanel` used; not click-tested in a real browser this
      session (see 6.3).

## 5. Cleanup

- [x] 5.1 Remove root/family/mode/variant/position/note-degree/
      triad-highlight props and rendering from `KeyModeBar.tsx` as each
      moves to its new home; delete the file once nothing remains in it.
- [x] 5.2 Delete `SettingsPanel.tsx` and its usage in `ScalePage.tsx`
      (design.md Decision 5) once nothing renders inside it anymore.
- [x] 5.3 Update `ScalePage.tsx`'s layout to the four-area structure
      (Navigation / Header / Body / Footer), keeping `Fretboard` and
      `PracticeHistory` in Body and `PracticeControls` in Footer
      unchanged.

## 6. Verification

- [x] 6.1 Run `pnpm lint` and fix any resulting issues — currently
      blocked by a pre-existing tooling bug unrelated to this change
      (`eslint-plugin-react`/ESLint 10 incompatibility throws even
      linting `eslint.config.mjs` itself); `tsc --noEmit` is clean.
      Revisit once the lint toolchain itself is fixed.
- [x] 6.2 Manually verify on a desktop viewport: sidebar nav
      family/mode selection navigates correctly and updates active
      markers; header primary row updates on fretboard note-click;
      secondary-row toggles work; position pills, minimap drag, and
      corner zoom controls all move/resize the visible fret range;
      pinch/drag are not required on desktop but corner buttons and
      minimap are usable with a mouse. Partially verified via SSR HTML
      inspection against the live dev server (elements present, family
      gating correct, W–H math correct) — not yet click-tested in an
      actual browser.
- [x] 6.3 Manually verify on a mobile viewport (or device emulation):
      top-left nav button opens the bottom sheet; drag-handle, backdrop
      tap, and item selection all dismiss it; header secondary row stays
      hidden behind `⋯` until toggled; pinch-to-zoom and swipe-to-pan
      work on the fretboard; position pills fit their span without
      horizontal overflow. Not yet tested on a real device/emulator.
- [x] 6.4 Verify no hydration warnings in the browser console on load.
- [x] 6.5 Confirm fret 0 never renders a note dot or fret marker, and
      the fretboard grid visually begins at fret 1 — verified: fret
      column labels run 1..24 (24 total) and the minimum note-dot `cx`
      inside the fretboard SVG equals `fretX(1)`, i.e. no dot renders
      left of fret 1.

## 7. Spec sync

- [x] 7.1 Resolve the `layout-and-settings-panel` sequencing call from
      design.md Decision 6 — user explicitly chose to archive both,
      this change first, accepting the known `layout-controls` conflict
      risk called out in that decision.
- [x] 7.2 Run `/opsx:archive` (or `openspec archive`) once implementation
      matches the delta specs in `specs/scale-navigation/`,
      `specs/scale-header/`, `specs/fretboard-viewport/`,
      `specs/layout-controls/`, `specs/scale-fretboard/`, and
      `specs/scale-positions/` in this change, to merge them into
      `openspec/specs/`. Synced via `openspec-sync-specs` subagent -
      all 18 validation checks pass.
