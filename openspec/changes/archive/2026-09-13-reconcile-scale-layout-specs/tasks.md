## 1. Verify deltas match the running code

- [x] 1.1 Confirm `src/components/Fretboard.tsx` has no position-pill
      UI, position dimming, or position bands (matches
      `fretboard-viewport`'s and `scale-positions`'s REMOVED deltas).
      Verified via grep: no functional position code left; also cleaned
      up one stale comment referencing "position selection" on the
      unrelated `FRET_MARKERS` inlay-dot definition.
- [x] 1.2 Confirm `src/components/ScaleNav.tsx` renders a single
      hover/click dropdown trigger, not a sidebar or bottom sheet
      (matches `scale-navigation`'s deltas). Verified: no `Drawer`/
      `aside` references; `onMouseEnter`/`aria-haspopup` present on the
      single trigger.
- [x] 1.3 Confirm `src/components/ScaleDashboard.tsx` has exactly the
      key row, Degrees row, and Note/Degree toggle — no primary row, no
      W–H, no mobile collapse (matches `scale-dashboard`'s ADDED
      requirements and `scale-header`'s REMOVED requirements). Verified
      via grep: no `MoreHorizontal`/`secondaryOpen`/W–H remnants.
- [x] 1.4 Confirm `src/components/ScalePage.tsx` renders the 3-column
      header, 3-section body, and fixed full-width footer (matches
      `layout-controls`'s MODIFIED requirement). Verified: 3
      `flex-1 items-center justify-{start,center,end}` header columns,
      3 `<section>` body blocks, `fixed inset-x-0 bottom-0` footer.
      `tsc --noEmit` clean after the comment cleanup.

## 2. Archive and sync

- [x] 2.1 Run `/opsx:archive` (or `openspec archive`) for this change,
      syncing `scale-dashboard` (new), and the `fretboard-viewport`,
      `scale-positions`, `scale-header`, `layout-controls`, and
      `scale-navigation` deltas into `openspec/specs/`. Synced via
      `openspec-sync-specs` subagent; confirmed the resulting content
      of `scale-positions`/`scale-header` matched the expected
      zero-requirements outcome before proceeding.
- [x] 2.2 After sync, delete `openspec/specs/scale-positions/` and
      `openspec/specs/scale-header/` entirely — both ended up with zero
      requirements after their deltas applied (design.md Decision 2).
      Deleted both folders.
- [x] 2.3 Directly edit `openspec/specs/scale-navigation/spec.md`'s
      `## Purpose` text to drop the now-inaccurate "sidebar on desktop,
      bottom sheet on mobile" wording, replacing it with a description
      of the unified dropdown trigger. Also fixed `fretboard-viewport`'s
      Purpose text (same issue, not originally called out as its own
      task item but same root cause — stale "position pills" wording).
      `openspec validate --all --strict` passes 16/16 after both edits.
