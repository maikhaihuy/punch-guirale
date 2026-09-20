## 1. Playback sequence (pure logic)

- [x] 1.1 Add `src/lib/scalePlayback.ts` with `buildPlaybackSequence(root, family, modeId, variantId?)`: anchor root at MIDI `48 + CHROMATIC.indexOf(root)`, ascending notes via `getScaleNotes`, then octave root once, then the ascending notes reversed; return `{ midi, freq, noteName }[]` (design Decision 1)
- [x] 1.2 Add `src/lib/scalePlayback.test.ts`: C Ionian gives `C D E F G A B C B A G F E D C`; A Minor Pentatonic gives `A C D E G A G E D C A`; octave root appears exactly once; pitch strictly rises then strictly falls for every family/mode in `SCALE_FAMILIES`; top note never exceeds MIDI 71

## 2. Audio hook

- [x] 2.1 Add `src/hooks/useScalePlayer.ts`: dynamic-import Tone, `Tone.start()` only inside `start()`, fresh `Tone.Synth` per run, schedule every note on the audio clock (`Tone.now()` + lead) with `triggerAttackRelease(freq, 0.9 * beat, time)`, beat = `60 / bpm` read once at start; no use of `Tone.Transport` (design Decision 2)
- [x] 2.2 Drive `activeStepIndex` via `Tone.getDraw().schedule` at each note's audio time, and schedule a final callback that clears the index and `isPlaying`, backed by a one-shot `setTimeout` fallback at run end (Draw drops callbacks >0.25s late, e.g. hidden tab); expose `{ isPlaying, activeStepIndex, stepDurationSec, start(steps, bpm), stop() }` (Decision 3)
- [x] 2.3 Implement idempotent `stop()`: no-op while idle, otherwise `Draw.cancel()`, short fade, dispose synth, reset state; also stop on unmount

## 3. Wheel: play/stop hub, highlight, edge sweep

- [x] 3.1 In `ScaleWheel.tsx`, replace the 🎲 hub with a play/stop button (triangle / square shapes, `role="button"`, `tabIndex={0}`, `onClick` + Enter/Space, visible focus indicator, `aria-label` "Play scale"/"Stop scale"); remove the `randomRoot` import and `onPointerDown` randomize (Decision 7)
- [x] 3.2 Add `playback` / `isPlaying` / `onTogglePlayback` props to `ScaleWheel` and render the accent highlight ring on the sounding note's dot (composes with root styling; no change to existing dot classes) (Decision 6)
- [x] 3.3 Render the sweep `<path>` (`pathLength="1"`, `pointer-events-none`, keyed by `stepIndex`, duration = `stepDurationSec`) between the sounding and next notes' polygon vertices, only when a next note exists, drawn after the polygon and before the hub
- [x] 3.4 Add the `wheel-edge-sweep` keyframes and the ring styling to `src/app/globals.css`, with a `prefers-reduced-motion: reduce` override that disables the sweep
- [x] 3.5 Thread the new props through `ScaleDashboard.tsx`; update `ScaleDashboard.test.tsx` for the new required props

## 4. Fretboard echo

- [x] 4.1 Add optional `playingNoteName?: NoteName | null` to `Fretboard.tsx` and compute `isEcho = note.name === (hoveredNoteName ?? playingNoteName)` so hover/touch takes precedence (Decision 8)

## 5. Bottom-bar randomizer

- [x] 5.1 Add `src/components/RootRandomizer.tsx` (dice button `aria-label="Randomize root note"` + truncating readout `"{root} {family.displayName} · {mode.displayName}"` with full text in `title`) (Decision 9)
- [x] 5.2 Make `PracticeControls` wrap on narrow widths (`flex-wrap`, tighter gaps) without changing its props or behavior
- [x] 5.3 In `ScalePage.tsx`, render `RootRandomizer` in the footer with `PracticeControls` (stacked below `md`, one row from `md`) and increase the body's bottom padding to clear the taller bar

## 6. ScalePage wiring

- [x] 6.1 Instantiate `useScalePlayer`, memoize the sequence from `root/family/modeId/variantId`, derive the `playback` object (`activeNote`, `nextNote | null`, `stepIndex`, `stepDurationSec`), and add a toggle handler calling `start(sequence, metronome.bpm)` / `stop()`
- [x] 6.2 Wrap root changes (wheel selection and randomizer) in one handler that calls `stop()` then `setRoot`; add a `useEffect` on `[family.id, modeId, variantId]` that calls `stop()` (Decision 5)
- [x] 6.3 Pass `playingNoteName` (the sounding note's name, or `null`) to `Fretboard`

## 7. Tests and verification

- [x] 7.1 Add `ScaleWheel.test.tsx` (`renderToStaticMarkup`): idle hub is labeled "Play scale" and no 🎲; running hub is labeled "Stop scale"; a highlight ring appears only on the sounding note; the sweep path appears only with a next note and is absent when idle or on the last note; the wheel keeps `pointer-events-none` on both overlays
- [x] 7.2 Add `RootRandomizer.test.tsx`: readout shows root plus family and mode names; randomize button has its accessible label
- [x] 7.3 Run `pnpm test`, `pnpm lint`, and `pnpm build` (test + build pass; `pnpm lint` crashes in eslint-plugin-react under ESLint 10 on any file, including untouched ones, so react-hooks rules were run on the changed files via a temporary config instead: 0 findings)
- [x] 7.4 Browser check (headless Chrome via Playwright against the dev server; 18 checks pass): play/stop; note highlight and line sweep track the audio; descending reverses the sweep; stopping the metronome or tapping a fretboard note mid-playback does not interrupt or throw; changing root, randomizing (including onto the same root), and changing mode all stop playback; reduced-motion shows highlight only; no overflow and no covered content at 360, 375, 768, and 1280px
- [ ] 7.5 On a physical device: playback is audible, the first tap on iOS Safari / Android Chrome unlocks audio, and the edge sweep renders in Safari (not verifiable headless)

## 8. Docs

- [x] 8.1 Update `CLAUDE.md`: the wheel hub is play/stop (not randomize), randomize lives in the bottom bar, and scale playback uses its own synth on the audio clock instead of `Tone.Transport`
