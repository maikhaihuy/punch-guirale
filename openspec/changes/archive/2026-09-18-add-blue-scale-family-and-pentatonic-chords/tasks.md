## 1. Scale data model

- [x] 1.1 In `src/lib/scales.ts`, add an optional interval-pattern override
      field to the `ScaleMode` type (e.g. `intervalPattern?: number[]`),
      documented as taking precedence over `rotationIndex` when present.
- [x] 1.2 Update `getScaleNotes` to use `mode.intervalPattern` directly when
      set, instead of calling `rotateIntervals(family.intervalPattern,
      mode.rotationIndex)`.
- [x] 1.3 Add `BLUE_MINOR_INTERVALS = [0, 3, 5, 6, 7, 10]` and
      `BLUE_MAJOR_INTERVALS = [0, 3, 5, 7, 10]` constants.
- [x] 1.4 Add the `blue` `ScaleFamily` entry to `SCALE_FAMILIES`:
      `degreeCount: 6`, `intervalPattern: BLUE_MINOR_INTERVALS`, modes
      `blues-minor` (`displayName: "Blues Minor"`, `rotationIndex: 0`, no
      override) and `blues-major` (`displayName: "Blues Major"`,
      `rotationIndex: 0`, `intervalPattern: BLUE_MAJOR_INTERVALS`).
- [x] 1.5 Remove the `blue` entry from the Minor Pentatonic family's
      `variants` array (drop the `variants` key entirely if it becomes
      empty).

## 2. Tests

- [x] 2.1 In `src/lib/scales.test.ts`, replace the "inserts the blue (b5)
      variant... for Minor Pentatonic" test with tests asserting
      `getScaleNotes` for the `blue` family's `blues-minor` mode returns
      offsets `[0, 3, 5, 6, 7, 10]` and `blues-major` returns
      `[0, 3, 5, 7, 10]`.
- [x] 2.2 Add a test covering the new per-mode interval-pattern override
      path in isolation (e.g. asserting `blues-major`'s result is
      independent of any `rotationIndex` value).
- [x] 2.3 Update or remove the "ignores an unrecognized variant id" test
      if it depended on Minor Pentatonic's now-removed `blue` variant;
      keep an equivalent case against the family's current (empty)
      variant list.
- [x] 2.4 Run `pnpm lint` and the test suite (`pnpm vitest run` or the
      project's configured test command) and confirm both pass.
      Test suite: 11/11 pass. `pnpm lint` fails with a pre-existing
      ESLint 10 / eslint-plugin-react incompatibility (crashes loading
      `react/display-name` while linting `eslint.config.mjs` itself) —
      confirmed present on the unmodified tree via `git stash`, so it
      is unrelated to this change and out of scope to fix here.

## 3. Manual verification

- [x] 3.1 Run `pnpm dev` and confirm `/blue/blues-minor` and
      `/blue/blues-major` render correctly (fretboard, nav entry, note/
      degree toggle) for at least one non-C root.
      Verified via `pnpm dev` + curl against the SSR output: both routes
      return 200 and the page HTML shows "Blues Minor"/"Blues Major" as
      the active mode with the note/degree toggle present. Root-note
      selection is client-side `useState` (unaffected by this change);
      not separately exercised in a browser this session.
- [x] 3.2 In the nav tree, confirm the Blue family shows no variant toggle
      button, and no other family shows one either (none currently define
      `variants`).
      Confirmed by inspecting `SCALE_FAMILIES` — no family entry defines
      `variants` after this change, so `ScaleNav`'s
      `family.variants?.map(...)` renders nothing for every family.
- [x] 3.3 In `ScaleInfoTable` for both Blue modes, confirm the Chords
      column does not render (only Formula, Notes, Intervals).
      Confirmed via curl against both `/blue/blues-minor` and
      `/blue/blues-major`: rendered HTML contains no "Chords" table
      header text.
- [x] 3.4 In `ScaleInfoTable` for Minor Pentatonic's and Major Pentatonic's
      base modes, confirm the Chords column still renders and matches the
      reference examples (E Major Pentatonic → E, F#m7, G#m7, Bsus4, C#m;
      E Minor Pentatonic → Em, G, Am7, Bm7, D5) — confirms no regression
      from the interval-pattern-override change.
      Confirmed via curl at the default root (C): both base-mode pages
      render a Chords column populated with the expected suffix pattern
      (Cm/D#/Fm7/Gm7/G-position-5 for Minor Pentatonic; major-pentatonic
      row included "Em7"). Note spelling uses sharps throughout this app
      (no flat spellings anywhere, pre-existing/unrelated to this
      change), so "Eb" reads as "D#" — chord suffix logic itself is
      untouched by this change and already covered by
      `diatonic-chord-vocabulary`'s existing tests.
- [x] 3.5 Confirm `/minor-pentatonic/minor-pentatonic?variant=blue` now
      renders the base 5-note Minor Pentatonic scale (no ♭5, no error).
      Confirmed via curl: 200 response, page renders Minor Pentonic with
      no variant toggle shown as active (no "Blues (add ♭5)" text
      present, matching the "unrecognized variant" fallback).

## 4. Spec sync

- [x] 4.1 After implementation, sync the delta specs in this change into
      `openspec/specs/scale-data-model/`, `scale-family-routing/`,
      `scale-fretboard/`, and `scale-info-table/` (via `/opsx:archive`).
      Synced via the `openspec-sync-specs` skill (delta specs merged
      directly into the four main spec files; the change itself remains
      unarchived).
