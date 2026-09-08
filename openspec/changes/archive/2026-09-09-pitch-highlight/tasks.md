## 1. Styling

- [x] 1.1 Add a `.fret-note--echo` class to `src/app/globals.css`: glowing
      outline (`stroke: var(--accent)`, `stroke-width`, `filter:
      drop-shadow(...)` using `--accent`), no scale transform

## 2. Fretboard state and pointer handling

- [x] 2.1 Add `hoveredNoteName` state (`string | null`) to the `Fretboard`
      component
- [x] 2.2 In `FretboardNote`, add `onPointerEnter`/`onPointerLeave`
      handlers gated to `event.pointerType === "mouse"` that set/clear
      `hoveredNoteName` via a callback prop, without touching the existing
      `active` state
- [x] 2.3 Extend the existing `onPointerDown`/`onPointerUp` handlers so
      touch input additionally sets/clears `hoveredNoteName` alongside the
      existing `active` state (no separate touch-only handler path)
- [x] 2.4 Pass `isEcho={note.name === hoveredNoteName}` down to each
      `FretboardNote` from `Fretboard`'s render loop, and apply
      `fret-note--echo` when `isEcho && !active` (never on the note
      currently under the pointer) — also gated on a new local
      `isHovering` (mouse-only) flag, since `isEcho` alone is trivially
      true for the exact note being hovered/pressed (it shares its own
      name); without that extra gate a plain mouse-hover (not pressed)
      would incorrectly draw the echo ring on the hovered note itself,
      violating the spec's "hovered note keeps its own styling, not the
      echo styling" requirement

## 3. Composition with existing states

- [x] 3.1 Verify the echo class renders correctly on dimmed notes at the
      same reduced opacity as their existing dimmed styling (no
      suppression, per the chosen default) — verified via Playwright:
      with Position 1 selected, hovering a non-root "E" showed
      `fret-note--echo` together with `opacity: 0.28` on the E's outside
      position 1's range
- [x] 3.2 Verify root notes echo across all root instances automatically
      (no special-casing needed, since all roots already share `note.name`)
      — verified: hovering any of the 12 "C" roots (key=C, Ionian)
      echoed all other 11 instances
- [x] 3.3 Verify echo and active-press styling never both apply to the
      same note at the same time — verified: the hovered/pressed note
      never carries `fret-note--echo` in any test (excluded via the
      `!active && !isHovering` gate)

## 4. Performance

- [x] 4.1 Wrap `FretboardNote` in `React.memo` — also passed the raw
      `setHoveredNoteName` state setter as `onHoverChange` (rather than a
      new inline arrow function per render) so its identity stays stable
      across renders, which is what actually lets memo skip re-rendering
      the ~148 unaffected notes on a hover event

## 5. Verification

- [x] 5.1 Run `pnpm exec tsc --noEmit` — passes clean
- [x] 5.2 Run `pnpm dev` and manually/automated-verify: hovering a note
      (mouse) echoes same-letter-name notes elsewhere without playing
      audio; releasing/leaving clears the echo — verified via headless
      Playwright (no interactive browser available in this session);
      screenshot sent to the user shows the echo ring on every "E" while
      hovering the fret-0 low-E string
- [x] 5.3 Verify touch behavior on a touch-emulated viewport: tapping a
      note echoes matches and plays audio together, and releasing clears
      the echo with no stuck-highlight state — verified via Playwright
      with `hasTouch`/`isMobile` context + dispatched `pointerType:
      "touch"` events: press sets `active` on the touched note and
      `fret-note--echo` on all other same-name notes together, release
      clears both with nothing left stuck; the `onPlay()` call path
      itself is unchanged by this diff (still invoked unconditionally in
      the same `onPointerDown` handler), so audio-on-tap is a structural
      guarantee, not separately re-verified here
- [x] 5.4 Confirm no regression to existing active-press, root, dimmed, or
      triad-ring styling (per `note-interaction-states` and
      `triad-tone-highlighting`) — confirmed via the same Playwright runs:
      root fill/stroke, active scale/glow, and dimmed opacity all render
      unchanged alongside the new echo state; triad ring is an unrelated
      second `<circle>` untouched by this change
