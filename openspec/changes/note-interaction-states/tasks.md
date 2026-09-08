## 1. Styling

- [ ] 1.1 In `src/app/globals.css` (or wherever component-level styles
  live), define `.fret-note`, `.fret-note--root`, `.fret-note--active`
  classes per design.md (including `transform-box: fill-box` and
  `transform-origin: center` on `.fret-note`).
- [ ] 1.2 Reconcile the new classes with the existing Tailwind-class-based
  root/dimmed styling in `src/components/Fretboard.tsx` (either migrate
  those to the new class names or layer the new classes alongside the
  existing Tailwind classes).

## 2. Pointer-driven active state

- [ ] 2.1 In `src/components/Fretboard.tsx`, add local `isActive` state
  per rendered note (component-per-note or a small wrapper component).
- [ ] 2.2 Replace the note's `onClick` handler with `onPointerDown` (sets
  active + calls `onNotePlay`), `onPointerUp` and `onPointerLeave` (clear
  active), on the same enlarged touch-target circle already used for
  audio.
- [ ] 2.3 Apply `fret-note--active` alongside the existing root/dimmed
  classes so all three compose correctly (verify via the scenarios in
  specs/note-interaction-states/spec.md).

## 3. Verification

- [ ] 3.1 Manually test: pressing a note shows the active glow/scale
  immediately and it clears on release, on both a mouse-driven desktop
  view and a touch-emulated mobile view.
- [ ] 3.2 Manually test: pressing a root note shows both root and active
  styling together; pressing a dimmed note (position selected) shows
  active styling at the dimmed opacity, not full opacity.
- [ ] 3.3 Manually test: tapping a note then tapping elsewhere on a touch
  emulation does not leave the first note visually stuck active.
- [ ] 3.4 Confirm audio playback still fires correctly after switching
  from `onClick` to `onPointerDown` (no double-fire, no missed taps).
- [ ] 3.5 Run `pnpm lint` (note: this repo's lint is currently broken by a
  pre-existing ESLint/eslint-plugin-react version mismatch unrelated to
  this change - confirm no *new* issues via `tsc --noEmit` if lint itself
  cannot run).
