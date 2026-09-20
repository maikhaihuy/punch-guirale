## Context

The wheel hub (`ScaleWheel.tsx`) is the only randomize control, wired to
`randomRoot()`. Audio today is two independent Tone.js users:
`useMetronome` (a `Tone.Loop` on the shared `Tone.Transport`; its `stop()`
calls `transport.stop()`) and `useNotePlayer` (one shared monophonic
`Tone.Synth`, triggered immediately on fretboard tap). `ScalePage.tsx` owns
all page state and hooks; `ScaleDashboard` -> `ScaleWheel` are purely
presentational. The footer is one fixed card (`PracticeControls`) holding
metronome + stopwatch. The fretboard already has a same-pitch-class "echo"
highlight driven by its own internal `hoveredNoteName` state. See
proposal.md for motivation and the specs for required behavior.

## Goals / Non-Goals

**Goals:**
- Play/stop the scale (up, octave, down) with audio-clock-accurate timing and
  UI highlight in step with the audio.
- Keep playback fully decoupled from the metronome and from fretboard taps.
- Reuse existing highlight styling and the theory helpers; no new interval
  math and no new dependency.

**Non-Goals:**
- Looping playback, direction/range options, or a separate tempo control.
- Locking scale playback to the metronome's beat phase (it shares only the BPM
  number, read once at start).
- Keeping the screen awake during playback (wake lock stays tied to
  metronome/stopwatch).
- Changing how randomize picks a root (it may still repeat the current root).
- Randomizing family/mode.

## Decisions

**1. The sequence is a pure helper on top of `getScaleNotes`.**
`buildPlaybackSequence(root, family, modeId, variantId?)` in a new
`src/lib/scalePlayback.ts` anchors the root at MIDI `48 + CHROMATIC.indexOf(root)`
(C3-B3, so the octave root tops out at B4 - comfortable for a synth),
calls `getScaleNotes(rootMidi, ...)` for the ascending notes, appends
`rootMidi + 12`, then the ascending notes reversed (excluding the octave
root, so it is not doubled), returning `{ midi, freq, noteName }[]`. This
keeps `getScaleNotes` the single source of interval arithmetic and works for
any degree count. Interval patterns are ascending within one octave
(`rotateIntervals` normalizes to 0-11), which a test asserts across every
family/mode. Being pure, it is unit-testable without audio.
*Alternative:* deriving from `buildFretboard` cells - rejected, the fretboard
has many duplicate pitches and no ordering.

**2. Own synth, scheduled on the audio clock, independent of `Tone.Transport`.**
`useScalePlayer` creates a fresh `Tone.Synth` per run, schedules every note
up front with `triggerAttackRelease(freq, 0.9 * beat, startTime)` from a
`Tone.now() + small lead`, and disposes the synth on stop/end (after a very
short fade to avoid a click). Two verified constraints drive this:
- A monophonic Tone source throws "Start time must be strictly greater than
  previous start time" if a trigger arrives earlier than an already
  scheduled one (present in `tone@15.1.22` `Source.js`). Sharing
  `useNotePlayer`'s synth would make a fretboard tap during playback (which
  fires at "now", before the scheduled future notes) throw. A dedicated
  synth avoids it.
- `useMetronome.stop()` does `transport.stop()`. Putting playback on the
  Transport (e.g. a `Tone.Part`) would let stopping the metronome kill the
  scale, and would share BPM state. Scheduling on `Tone.now()`-based absolute
  times bypasses the Transport entirely.
*Alternatives:* `setTimeout`/`setInterval` per note - rejected (drifts,
throttled in background tabs; CLAUDE.md already forbids it for tempo).
Scheduling lazily one note ahead - rejected as more code for no benefit at
15 notes.

**3. UI state is driven by `Tone.getDraw().schedule` at each note's audio time.**
Each step schedules a draw callback at its audio start time that sets
`activeStepIndex`; one more at the end of the last note clears it and sets
`isPlaying` false. This keeps highlight and sound aligned without
`setTimeout` drift; `stop()` calls `Draw.cancel()`, disposes the synth, and
resets state (idempotent, and a no-op while idle to avoid needless renders).
The hook exposes `{ isPlaying, activeStepIndex, stepDurationSec, start(steps, bpm), stop() }`;
`start` is the only place `Tone.start()` is called, from the click handler
(per the autoplay rule in CLAUDE.md). `Draw` drops (never invokes) a callback
that is more than its `expiration` (0.25s) past due, which happens when the
tab is hidden and rAF is throttled, so a hidden tab can skip highlight steps
*and* the end-of-run reset. The reset therefore also has a one-shot
`setTimeout` fallback at run end + a margin; it only clears state (tempo
stays on the audio clock), and both paths funnel into the same idempotent
reset.

**4. Playback state is threaded down as one `playback` prop.**
`ScalePage` memoizes the sequence, owns the hook, and passes
`playback: { activeNote, nextNote | null, stepIndex, stepDurationSec } | null`
plus `isPlaying`/`onTogglePlayback` through `ScaleDashboard` to `ScaleWheel`.
Wheel and fretboard stay presentational and no global state is added (matches
the existing architecture).

**5. Stop is explicit in handlers for the root, in an effect for route params.**
`ScalePage` wraps root changes (`onRootChange` from the wheel and the
randomizer) in a handler that calls `stop()` before `setRoot`, and a
`useEffect` on `[family.id, modeId, variantId]` calls `stop()` (and unmount
cleanup stops too). An effect on `root` alone is not enough: randomize can
pick the same root, so the value would not change and playback would
continue, violating the spec.

**6. Wheel visuals: a highlight ring and a sweeping path, additive to the
existing markup.**
- Highlight: when `activeNote` matches a wheel note, render an extra
  ring circle (`r = DOT_RADIUS + 4`, accent stroke, no fill, same accent glow
  as `.fret-note--echo`) inside that note's group. It composes with the
  filled root and doesn't touch existing dot classes.
- Edge: render, above the polygon, a `<path d="M a L b" pathLength="1">`
  between the two notes' polygon vertices (`pointAt(VERTEX_RADIUS, idx)`,
  same points as the polygon, so the sweep sits exactly on the edge, incl.
  the closing edge), `pointer-events-none`, `stroke-dasharray: 1 1`,
  animated `stroke-dashoffset` 1 -> 0 with a `wheel-edge-sweep` keyframe in
  `globals.css`, `linear`, `forwards`, duration = `stepDurationSec`, and
  `key={stepIndex}` so it remounts and restarts on every step. Direction
  falls out of (from = sounding note, to = next note), so descending
  reverses with no extra logic. `@media (prefers-reduced-motion: reduce)`
  disables it. `<path>` with `pathLength` is used rather than `<line>`
  because `pathLength` on `<path>` is the most widely supported form.
- Rendering order: notes, polygon, sweep path, hub. Both additions are
  `pointer-events-none` and sit on the dots' inner edges, so they never
  cover a label or intercept taps (unchanged wheel invariants).
*Alternative:* animating the polygon itself edge by edge - rejected, one
polygon element cannot animate a single edge; an overlay is simpler and
leaves the static polygon (and its spec) untouched.

**7. Hub becomes a keyboard-operable play/stop button using `onClick`.**
Same footprint as the old hub (`HUB_RADIUS`/`HUB_TOUCH_RADIUS`); a drawn
triangle/square instead of the emoji (avoids nesting an icon `<svg>` in the
wheel `<svg>`). It gets `role="button"`, `tabIndex={0}`, Enter/Space
handling, a visible focus ring, and an `aria-label` that flips
("Play scale"/"Stop scale"). It uses `onClick` rather than the wheel notes'
`onPointerDown`: `Tone.start()` must run inside a browser
"user activation" event, and `pointerdown` from touch isn't one (mouse
`mousedown` and touch `pointerup`/`touchend`/`click` are).

**8. Fretboard echo gets an optional external pitch class.**
`Fretboard` gains `playingNoteName?: NoteName | null`;
`isEcho = note.name === (hoveredNoteName ?? playingNoteName)` so hover/touch
takes precedence (spec). `FretboardNote` is `memo`'d, so only notes whose
`isEcho` flips re-render per step.

**9. Bottom bar: new `RootRandomizer` component, layout wraps.**
`RootRandomizer({ root, familyName, modeName, onRandomize })` renders a
dice icon button (`aria-label="Randomize root note"`, lucide `Dices`) and a
readout `"{root} {family.displayName} · {mode.displayName}"` (truncating,
full text in `title`). In `ScalePage`'s footer it sits with `PracticeControls`
in a wrapping layout: stacked (cluster on top) below `md`, one row from `md`.
`PracticeControls` keeps its logic; only its container gets `flex-wrap` and
tighter gaps. The body's bottom padding increases from `pb-24` to a value
that clears the taller bar (verified by measurement, not guessed).
*Alternative:* one shared card with the cluster inside `PracticeControls` -
rejected, it would blur that component's practice-only responsibility.

## Risks / Trade-offs

- **[Bottom bar overflows on phones]** By arithmetic the existing card
  already needs ~384px inside ~343px of available width at 375px (metronome
  ~192 + stopwatch ~128 + gap 32 + padding), so it may already be tight;
  adding a third cluster makes it certain -> wrap layout + measured bottom
  padding, checked at 360/375/768/1280px in the browser.
- **[Scheduled notes can't be cancelled individually]** -> dispose the synth
  on stop (short fade first) and cancel the Draw queue; a fresh synth is
  created per run.
- **[Highlight steps skipped in hidden tabs]** -> acceptable (audio stays on
  the audio clock); the fallback timeout guarantees `isPlaying` still resets
  at the end so the control never sticks on "Stop".
- **[Audio not unlocked on touch]** -> `onClick` (activation event) for the
  hub; manual test on an iOS Safari / Android Chrome device.
- **[Spec drift in `layout-controls`]** That spec's Header scenario (theme
  toggle left, nav right) is the reverse of the current code. Not touched
  here; this change adds the footer cluster via a new capability instead of
  MODIFYING `layout-controls`, so the stale text isn't copied forward.
- **[SVG `pathLength` sweep in Safari]** -> `<path>` form; visually verify in
  Safari, and reduced-motion fallback still shows the highlight.

## Open Questions

- Should randomize avoid returning the current root so the button always
  visibly changes something? (Left as-is; a later small change.)
- Should playback loop, or follow the metronome beat phase? (Explicit
  non-goals here.)
