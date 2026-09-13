# Spec: Navigation, Header & Fretboard Position Restructure

## Context

Following the M4 generic Family/Mode/Variant scale schema, this spec restructures the UI around a clear split:

- **Navigation (route params)** — `family` and `mode` drive the URL (`/{family}/{mode}/{key}`). Changing either navigates to a different page.
- **Header (page-local state)** — everything that describes the *current* scale/page without changing the route: degree/note info, triad highlight, note/degree toggle, W–H interval pattern.
- **Fretboard body (viewport state)** — fret position and zoom are properties of the fretboard viewport itself, not page-level settings, and live inside the fretboard component.

This doc covers desktop and mobile layouts for all three.

## Non-goals

- Backend/data layer changes (schema already covered by M4).
- Audio playback interaction (separate backlog item).
- Practice-tracking panel redesign (separate backlog item).

---

## 1. Navigation — Family scale + Mode scale

**Behavior**: selecting a family resets mode to that family's first mode. Selecting a mode within the current family updates the route without touching family.

### Desktop (≥1024px)
- Left sidebar, persistent, nav tree:
  - Level 1: family list (Major, Melodic minor, Harmonic minor, Pentatonic, …).
  - Level 2 (nested under the active family): its modes/variants.
- Active family and active mode both visually marked (accent background), family row always expanded for the current family; other families collapsed by default, expandable on click.
- Sidebar can later host the M5 "general settings" floating panel content (see Open Questions) — do not build a second competing floating panel on the same side.
- Right side of the layout is reserved for contextual info (chord-at-degree, W–H diagram) — not for navigation.

### Mobile (<768px)
- No persistent sidebar. Top-left corner button shows current state as a compact label, e.g. `[≡ Major / Ionian]`.
- Tapping opens a **bottom sheet** (not a side drawer — better thumb reach, doesn't collide with the sticky footer):
  - Same two-level list as desktop sidebar (family group headers, modes nested).
  - Drag handle to dismiss, backdrop tap to dismiss.
  - Sheet height ~40–50% of viewport.
- Top-right corner is reserved for a symmetric "info" entry point (chord/degree detail), mirroring the left=nav / right=info convention used on desktop.

### Accessibility
- Tree items use `role="tree"` / `role="treeitem"`, or at minimum `role="menu"` / `role="menuitem"` for the flat case, with arrow-key navigation, Enter to select, Escape to close (mobile sheet).

---

## 2. Header — page-local state

Everything here changes without navigating (no route change), scoped to the currently loaded `{family}/{mode}` page.

**Content**:
1. Primary row (always visible): current degree + note (e.g. `Degree 1 — C`) and the full note list of the scale (e.g. `C · D · E · F · G · A · B`). This updates on fretboard note-click.
2. Secondary row (controls, low change-frequency): `Highlight triad` toggle, `Note/Degree` toggle, `W–H pattern` display.

**Fret position and zoom are explicitly removed from the header** — see Section 3.

### Desktop
- Header sits above the fretboard/practice-list body, centered as its own layout area (per earlier layout decision).
- Both rows shown inline, no collapsing needed at this width.

### Mobile
- Primary row always visible (degree + notes) — this is the info users need most.
- Secondary row (triad / note-degree / W-H) is either:
  - a horizontally scrollable chip row, or
  - collapsed behind a `⋯` (more) button in the header's top-right, toggling the chip row's visibility.
- Recommendation: default to the `⋯` toggle to save vertical space for the fretboard; revisit with real content once W–H pattern's visual form (image vs text) is decided.

---

## 3. Fretboard body — fret position & zoom (moved out of header)

Fret position/zoom is a property of the fretboard viewport, manipulated directly on/around the fretboard rather than via separate header buttons.

**Components**:

1. **Position pills** (`Pos 1`–`Pos 5`, CAGED-style), anchored along the top edge of the fretboard component itself. Selecting one moves/zooms the visible fret range to that position's span.
2. **Range minimap**: a thin strip below the main fretboard spanning all 24 frets, with a draggable "viewport window" showing the currently visible range. Dragging the window scrolls the main view freely (not constrained to the 5 fixed positions). This is the primary "pick a spot on the neck" control.
3. **Zoom control**: small `−` / `+` anchored to the bottom-right corner of the fretboard viewport (Google-Maps-style), not header. Adjusts the width of the visible fret window.
4. **Touch**: pinch-to-zoom directly on the fretboard is the primary mobile zoom gesture; horizontal drag/swipe on the fretboard is the primary mobile pan gesture. The `−`/`+` corner buttons and minimap remain as the precise/desktop-friendly fallback and as the "see the whole neck at a glance" affordance.

**Notes**:
- Fret numbering starts at 1 (fret 0 is dropped per backlog) — minimap and position-to-fret mapping must account for this off-by-one.
- Default visible range remains frets 1–12; minimap and position pills operate within the full 1–24 range.
- The "full-screen fretboard" backlog item reuses this same component with the bottom bar kept sticky; position pills, minimap, and zoom controls stay attached to the fretboard, not the page chrome.

---

## 4. Component summary

| Component | Lives in | Changes route? |
|---|---|---|
| Family/Mode tree (sidebar / bottom sheet) | Navigation | Yes |
| Degree + note list | Header (primary row) | No |
| Triad / Note-Degree / W-H toggles | Header (secondary row) | No |
| Position pills, range minimap, zoom controls | Fretboard body | No |

## Open questions

- Should the M5 "floating settings panel" (highlight triad, general settings) be merged into the same left sidebar surface as the family/mode tree, or kept as a separate floating panel? Recommendation: merge, to avoid two competing floating panels on desktop.
- Final visual form of the W–H interval pattern (image vs. inline text) — affects how much space the header secondary row needs, and whether it fits in the mobile chip row at all.
- Exact CAGED position-to-fret-range mapping per scale family (pentatonic vs. 7-note families may need different position spans).