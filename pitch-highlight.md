# Guitar Scale Trainer — Same-Pitch Hover/Touch Highlight Spec

Hovering or touching a note highlights every other note on the fretboard
that shares the same **pitch class** (same letter name, any octave/fret) —
the standard "show me this note everywhere on the neck" pattern used in
most fretboard visualizers. Confirm this matches your intent before
building — if you actually meant "same exact octave only," the logic below
needs a small change (compare `midi` instead of `name`).

## State

Lift a single piece of state to the Fretboard component (not per-note) so
every note can check against it:

```ts
const [hoveredNoteName, setHoveredNoteName] = useState<string | null>(null);
```

## Two distinct visual treatments

Don't reuse the existing `--active` (press) style for the "related" notes —
they mean different things and should look different:

- **The note actually under the pointer**: existing `.fret-note--active`
  (scale up + glow) — unchanged from the interaction-states spec.
- **Other notes sharing its name**: a new, calmer treatment — glowing
  outline only, no scale transform, so it reads as "related" rather than
  "the one you're touching":

```css
.fret-note--echo {
  stroke: var(--accent);
  stroke-width: 2px;
  filter: drop-shadow(0 0 3px var(--accent));
}
```

## Mouse vs. touch behavior

True hover only exists for mouse — branch on `pointerType` so touch doesn't
end up in a stuck-hover state:

```tsx
function FretboardNote({ note, dimmed, hoveredNoteName, onHover, onPlay }: Props) {
  const [isActive, setIsActive] = useState(false);
  const isEcho = note.name === hoveredNoteName;

  return (
    <g
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') onHover(note.name); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') onHover(null); }}
      onPointerDown={() => { setIsActive(true); onHover(note.name); onPlay(note.midi); }}
      onPointerUp={() => { setIsActive(false); onHover(null); }}
    >
      <circle r={14} fill="transparent" />
      <circle
        r={7}
        className={cn(
          'fret-note',
          note.isRoot && 'fret-note--root',
          isActive && 'fret-note--active',
          isEcho && !isActive && 'fret-note--echo',
          dimmed && 'fret-note--dimmed'
        )}
      />
    </g>
  );
}
```

- Mouse: hovering (no click) sets `hoveredNoteName` → other same-name notes
  get the echo ring, no sound plays.
- Touch: a tap has no separate hover phase, so `onPointerDown` sets both the
  active state (this note) and `hoveredNoteName` (triggers the echo on the
  others) together, and both clear on release.

## Interaction with existing states

- **Root notes**: no special-casing needed — every root instance already
  shares the same `name`, so hovering any root note automatically echoes
  every other root instance on the neck, on top of their existing root
  styling.
- **Dimmed notes (position filter)**: the echo ring still renders on
  dimmed notes, at the same reduced opacity as everything else in that
  state. This is a deliberate default — it lets the player see that a
  pitch also occurs in a position they're not currently focused on. Flag
  it if you'd rather echo highlighting be limited to the visible/undimmed
  notes only; that's a one-line change (skip rendering `--echo` when
  `dimmed` is true).

## Performance note

Wrap `FretboardNote` in `React.memo` — with up to 150 note elements on
screen, this keeps a hover event from re-rendering notes whose own props
didn't actually change.

## Definition of done

- Hovering (mouse) or touching any in-scale note highlights every other
  note sharing its letter name across the full 0–24 fretboard, using a
  distinct "echo" style from the note actually being interacted with.
- Behavior is correct on both mouse (hover without click) and touch (tap),
  with no stuck-highlight state on touch devices.