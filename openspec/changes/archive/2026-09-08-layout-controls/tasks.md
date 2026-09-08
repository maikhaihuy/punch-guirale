## 1. Dependencies and tokens

- [x] 1.1 Add `lucide-react` to `package.json` dependencies
- [x] 1.2 Run `npx shadcn@latest init` to add `components.json` and shadcn's
      companion deps (`class-variance-authority`, `clsx`, `tailwind-merge`)
      — actual companions installed by the current shadcn CLI are
      `@base-ui/react` + `cn` (not Radix/clsx/tailwind-merge); reverted the
      CLI's full oklch theme + `.dark`-class overwrite of `globals.css`
      (would have silently broken the existing `prefers-color-scheme` dark
      mode and had a self-referential `--font-sans` bug) and removed the
      unrequested `Button` scaffold + its now-unused `class-variance-authority`/
      `tw-animate-css` deps — see design.md addendum below
- [x] 1.3 Run `npx shadcn@latest add switch` to generate
      `src/components/ui/switch.tsx`
- [x] 1.4 Add `--accent`, `--text-muted`, and `--surface` custom properties
      to `src/app/globals.css` (light and dark values) — also added
      `--primary`/`--primary-foreground`/`--input`/`--ring`, the minimal
      set the generated Switch component's classes require
- [x] 1.5 Verify exact lucide-react export names against lucide.dev for the
      metronome, play, pause, timer, and stop/reset icons; adjust if the
      spec's assumed names (`Metronome`, `Play`, `Pause`, `Timer`,
      `RotateCcw`, `CircleStop`/`Square`) have changed — all confirmed
      present in the installed version

## 2. Key / Mode / Position rows

- [x] 2.1 Extract the key selector into its own row/section with a "Key"
      label, reusing the existing key button components
- [x] 2.2 Restyle the randomize-root control: circular shape, `--accent`
      fill, dice icon (no text label), separated from the 12 key buttons
      with extra spacing
- [x] 2.3 Extract the mode selector into its own row/section with a "Mode"
      label, reusing the existing mode tab components
- [x] 2.4 Extract the position selector into its own row/section with a
      "Position" label, reusing the existing position tab components

## 3. Display toggles

- [x] 3.1 Replace the note⇄degree `aria-pressed` button with the shadcn
      `Switch`, wired to the existing display-mode state/handler
- [x] 3.2 Replace the highlight-triad `aria-pressed` button with the shadcn
      `Switch`, wired to the existing highlight-triad state/handler
- [x] 3.3 Group both switches together in one row/section, matching the
      layout in `layout-controls.md`

## 4. Page structure

- [x] 4.1 Wrap `page.tsx`'s root in `flex flex-col items-center` (single
      centered column)
- [x] 4.2 Wrap the controls rows (Key/Mode/Position/Display) in a
      `max-w-2xl` container
- [x] 4.3 Wrap the fretboard section (and `PracticeHistory`, per the
      structure diagram) in a wider `max-w-5xl` container
- [x] 4.4 Confirm the bottom bar stays `max-w-2xl` and sticky on mobile only
      — implemented as `sticky bottom-0 sm:static` (sticky below the 640px
      breakpoint used by the existing `isMobile` check, static/in-flow at
      and above it)

## 5. Bottom bar (metronome / stopwatch)

- [x] 5.1 Replace `PracticeControls`' text-label metronome buttons with
      icon-only buttons (`Metronome`, `Play`/`Pause`) plus BPM
      increment/decrement, each with an `aria-label`
- [x] 5.2 Replace `PracticeControls`' text-label stopwatch buttons with
      icon-only buttons (`Timer`, `Play`/`Pause`, `CircleStop`), each with
      an `aria-label` — kept the original idle/running/paused three-state
      machine (pause is resumable, stop finalizes the session) rather than
      collapsing to a single toggle, since that behavior predates this
      change and isn't in scope to alter
- [x] 5.3 Confirm no behavior change to `useMetronome`/`useStopwatch`
      call sites — only the rendered button markup changes; verified via
      `tsc --noEmit` and by re-reading both hooks' call sites unchanged

## 6. Verification

- [x] 6.1 Run `pnpm lint` — fails with a pre-existing, unrelated
      `eslint-plugin-react`/eslint 10 incompatibility (confirmed via
      `git stash` that it fails identically on the pre-change tree);
      `tsc --noEmit` passes clean and is the practical type-safety check
      here
- [x] 6.2 Run `pnpm dev` and manually verify the Definition of Done in
      `layout-controls.md` on a desktop viewport — verified via headless
      Playwright screenshots (1280px, light + dark) since no interactive
      browser is available in this session; centered column, labeled
      rows, distinct dice-icon Random button, grouped switches, and wider
      fretboard section all confirmed
- [x] 6.3 Manually verify the same on a mobile-width viewport (single
      column, sticky bottom bar, horizontal scroll where still needed) —
      verified via Playwright screenshot (375px); layout stacks correctly
      and the bottom bar uses `sticky bottom-0 sm:static` (code-verified;
      not distinguishable from a full-page screenshot capture)
- [x] 6.4 Verify every icon-only button announces a meaningful label via
      the browser accessibility tree (e.g. dev tools accessibility
      inspector) — verified via Playwright DOM query: every icon-only
      button (Random, metronome start/pause, stopwatch start/pause/stop)
      has a descriptive `aria-label`, and both display-mode/highlight-triad
      controls expose `role="switch"` with `aria-checked`
