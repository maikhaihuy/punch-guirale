# Guitar Scale Trainer — Layout & Controls Spec

Restructures the existing UI into a single centered column (scaled-up
mobile layout, per direction chosen), with each control group in its own
clearly separated row. No new data/logic — pure layout and component
changes on top of the already-built Milestone 1/2 app.

## Page structure

```
min-h-screen, flex flex-col items-center, centered column
├── Controls container (max-w-2xl) — narrower, for readability
│   ├── Key row       (12 note buttons + Random button)
│   ├── Mode row       (7 tabs)
│   ├── Position row   (All + 5 tabs)
│   └── Display row    (Note⇄Degree switch + Highlight triad switch)
├── Fretboard section (max-w-5xl — wider than controls, it's the hero)
└── Bottom bar (max-w-2xl, icon-based, sticky on mobile only)
```

The fretboard section is intentionally wider than the controls container —
it's the hero element and benefits from the extra horizontal room; controls
stay in a narrower, more readable column above it.

## Control rows

Each group gets its own row with a plain-text label (not all-caps/tracked —
that reads as generic template chrome, avoided per the design-tokens spec)
and consistent vertical spacing between rows:

```tsx
<section className="flex flex-col gap-2">
  <span className="text-sm text-text-muted">Key</span>
  <div className="flex flex-wrap items-center gap-2">
    {/* 12 key buttons, then Random button separated with extra gap */}
  </div>
</section>
```

Repeat the same `<section>` shape for Mode (7 tabs) and Position (All + 5
tabs) rows, reusing the existing tab components from Milestone 1/2 — only
the surrounding layout changes, not the tab components themselves.

## Random button — visually distinct

Separate it from the 12 key buttons rather than styling it as a 13th key:

- Circular shape (key buttons stay pill/square), filled with `--accent`.
- Dice icon (`Dice5` from `lucide-react`), no text label.
- Placed at the end of the Key row with extra left margin (`ml-4`) so it
  reads as "a different kind of action," not one more key option.

## Note⇄Degree and Highlight-triad as switches

Use shadcn/ui's `Switch` component (`npx shadcn@latest add switch`) rather
than hand-rolling one — matches the existing "reuse a proven component
instead of custom-building UI chrome" approach:

```tsx
<section className="flex items-center gap-6">
  <label className="flex items-center gap-2 text-sm">
    <span>Note</span>
    <Switch checked={displayMode === 'degree'} onCheckedChange={toggleDisplayMode} />
    <span>Degree</span>
  </label>
  <label className="flex items-center gap-2 text-sm">
    <Switch checked={highlightTriad} onCheckedChange={setHighlightTriad} />
    <span>Highlight triad</span>
  </label>
</section>
```

Grouped together in one row since both are "how the fretboard displays
itself" toggles — conceptually paired, not two unrelated settings.

## Bottom bar — icons instead of text

Confirmed available in `lucide-react`: `Metronome`, `Play`, `Pause`,
`Timer`, `RotateCcw`. There's no dedicated "stop" icon in the library as of
this writing — use `CircleStop` (or `Square` as a fallback) for the
stopwatch's reset/stop action; double check the exact export name against
lucide.dev when implementing, in case it's changed.

```tsx
<div className="w-full max-w-2xl flex items-center justify-between gap-4
                 sticky bottom-0 bg-surface/95 backdrop-blur px-4 py-3 rounded-t-xl">
  {/* Metronome */}
  <div className="flex items-center gap-2">
    <Metronome className="w-5 h-5 text-text-muted" aria-hidden />
    <button aria-label="Decrease BPM">−</button>
    <span className="tabular-nums font-display">{bpm}</span>
    <button aria-label="Increase BPM">+</button>
    <button aria-label={isPlaying ? 'Pause metronome' : 'Start metronome'}>
      {isPlaying ? <Pause /> : <Play />}
    </button>
  </div>

  {/* Stopwatch */}
  <div className="flex items-center gap-2">
    <Timer className="w-5 h-5 text-text-muted" aria-hidden />
    <span className="tabular-nums font-display">{formatTime(elapsed)}</span>
    <button aria-label={isRunning ? 'Pause stopwatch' : 'Start stopwatch'}>
      {isRunning ? <Pause /> : <Play />}
    </button>
    <button aria-label="Reset stopwatch"><RotateCcw /></button>
  </div>
</div>
```

Every icon-only button needs an `aria-label` — there's no visible text to
fall back on, this isn't optional for a usable control.

## Definition of done

- Desktop and mobile both show a single centered column; only the max-width
  and the fretboard's horizontal-scroll behavior differ between them.
- Key / Mode / Position each occupy their own visually separated row with a
  plain-text (not all-caps) label.
- Random is visually and spatially distinct from the 12 key buttons.
- Note⇄Degree and Highlight-triad are switches, grouped together in one row.
- Metronome and stopwatch controls are icon-only with `aria-label`s, no
  visible button text.
