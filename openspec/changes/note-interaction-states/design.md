## Context

`src/components/Fretboard.tsx` currently renders each in-scale note as a
`<g>` with an `onClick` handler, a transparent ~44px touch-target circle,
a visible dot (filled for root, outlined otherwise), and a label. Dimming
from the Milestone 2 position selector is applied as an inline `opacity`
style on the whole `<g>`. There is no visual response to a press beyond
whatever the browser does for a click.

## Goals / Non-Goals

**Goals:**
- Give a note a visible "pressed" state that appears at the same instant
  its pitch starts playing.
- Make that state work identically on mouse and touch, without relying on
  `:hover`.
- Compose cleanly with the two states that already exist per note (root
  identity, dimmed-by-position) rather than replacing them.

**Non-Goals:**
- Triad-tone highlighting or any other new visual layer — tracked
  separately in the `triad-tone-highlighting` change.
- Changing anything about when/whether audio plays, or the touch-target
  sizing — those are `note-playback`'s existing requirements, untouched.

## Decisions

**Active state is local `useState` per note, toggled by pointer events,
not CSS `:hover`.** Touch devices simulate `:hover` inconsistently (it can
stick past the tap), so `onPointerDown` sets active + triggers playback in
the same handler, and `onPointerUp`/`onPointerLeave` clear it. Because
`onPointerDown` already fires on the same enlarged touch-target circle
used for the existing click-to-play handler, this is a drop-in swap of
one event set for another on the same element, not a new element.

**Three independent style layers compose via class list, not a single
enum.** `fret-note--root` (identity), `fret-note--active` (interaction),
`fret-note--dimmed` (position filter) are applied together as needed
(e.g. a dimmed, active, non-root note is valid simultaneously). Using
`cn(...)`-style composition avoids a combinatorial state enum and matches
how `isRoot`/dimmed are already applied today.

**Dimming continues to multiply on top of active/root, applied as opacity
on the outer `<g>`.** No change to the existing dimming mechanism from
Milestone 2 (`scale-positions`) — the active state's `scale`/`filter`
transform lives on the inner visible circle via a CSS class, so the two
compose without one overriding the other's property.

**`transform-box: fill-box` on `.fret-note`.** SVG elements default to
`transform-box: view-box`, which scales a `<circle>` around the SVG
viewport's origin, not its own center — without `fill-box`, the "scale up
on press" effect would visibly shift the dot instead of growing in place.

## Risks / Trade-offs

- [`onPointerDown` fires before a full "click" completes] → Acceptable
  and intentional: the spec explicitly wants the visual glow and the
  audio trigger to land on the same press, not on release.
- [Losing a `pointerup`/`pointerleave` event (e.g. fast multi-touch)
  could leave `isActive` stuck true] → Low-risk for this app's single-note
  interaction pattern; if observed, `onPointerCancel` can be added as a
  fallback clear alongside `onPointerLeave`.
