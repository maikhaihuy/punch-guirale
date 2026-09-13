## Context

Unlike a normal spec-driven change, the implementation here already
exists and is merged — this change only brings `openspec/specs/` back
in sync with it. The code was built conversationally across two
sessions: `nav-header-fretboard-restructure` (archived, specs synced)
covered the sidebar/bottom-sheet nav + position pills + old
`ScaleHeader`, then a follow-up conversation removed position selection
entirely, unified nav into a hover/click dropdown, trimmed/renamed
`ScaleHeader` to `ScaleDashboard`, and made the footer fixed/full-width
— all without going through `/opsx:propose`. See proposal.md for the
full list of what changed.

## Goals / Non-Goals

**Goals:**
- Make every delta in this change match the code exactly (read from
  `src/components/ScaleNav.tsx`, `ScaleDashboard.tsx`, `Fretboard.tsx`,
  `ScalePage.tsx` as the source of truth, not from memory of the older
  archived specs).
- Leave a clean `openspec/specs/` with no capability describing
  nonexistent UI.

**Non-Goals:**
- No code changes. This change is spec-only (`tasks.md`'s only "task"
  is the archive/sync itself, plus the manual folder-deletion cleanup
  below).
- Not deciding whether to delete `src/lib/positions.ts` or `theory.ts`'s
  `getPositionRanges`/`tagPositions` — they're unreferenced now but
  left in place; that's a separate call for whoever wants to make it.

## Decisions

### 1. `ScaleHeader` becomes a new capability (`scale-dashboard`), not a renamed one
OpenSpec's delta operations (ADDED/MODIFIED/REMOVED/RENAMED) work at the
*requirement* level within a capability folder; there's no operation to
rename a whole capability folder. Since the component's scope
meaningfully shrank (no more primary row, no W–H, no mobile collapse)
on top of the name change, treating it as REMOVE-old + ADD-new is more
honest than MODIFYing `scale-header` in place and leaving a
misleadingly-named folder.

### 2. `scale-positions` and `scale-header` will end up empty — delete the folders manually
Removing every requirement in a capability via delta doesn't delete the
capability's folder; it would leave `openspec/specs/scale-positions/
spec.md` and `openspec/specs/scale-header/spec.md` with a stale
`## Purpose` and no `## Requirements`. Since delta ops don't reach
Purpose text or delete files, this needs a manual step after sync (see
tasks.md) rather than something the archive tooling does for us.

### 3. `layout-controls` and `scale-navigation` deltas assume the archived baseline
These two capabilities were touched by `nav-header-fretboard-restructure`
in the *previous* archive, so this change's deltas are written against
that already-merged baseline (confirmed by reading the current
`openspec/specs/layout-controls/spec.md` and `.../scale-navigation/
spec.md` directly before drafting), not against the pre-that-change
state. No stacking-order risk this time since there's no other active
change touching these capabilities concurrently.

## Risks / Trade-offs

- [Manual folder deletion could be forgotten, leaving two
  zero-requirement capability specs with stale Purpose text] →
  Called out explicitly as its own tasks.md item, done at archive time.
- [`scale-navigation`'s Purpose text still says "sidebar on desktop,
  bottom sheet on mobile" and can't be fixed via delta for an existing
  capability] → Same as above: flagged as a manual direct-edit task
  alongside the folder deletions, since Purpose edits for existing
  capabilities happen outside the delta mechanism regardless.
