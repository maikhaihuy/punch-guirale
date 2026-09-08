## Context

This change is documentation-only: it records specs for behavior that is
already implemented and shipped (Milestone 1). No new code is being written
and no architectural decisions are being made here — the original decisions
were made when Milestone 1 was built and are recorded in `MVP_SPECS.md`
(data model, library choices, out-of-scope boundaries).

## Goals / Non-Goals

**Goals:**
- Produce accurate `openspec/specs/` entries for `scale-fretboard`,
  `metronome`, and `practice-tracking` that match the current codebase.

**Non-Goals:**
- Changing any implementation.
- Re-litigating technical choices (e.g. SVG vs Canvas, Tone.js vs
  `setInterval`) already settled in `MVP_SPECS.md`.

## Decisions

None — no new technical decisions in this change. See `MVP_SPECS.md`
("Tech stack" and "Core data model" sections) for the decisions already
made and implemented.

## Risks / Trade-offs

[Risk] Specs drift from code over time if not kept in sync on future
changes → Mitigation: future feature changes go through `/opsx:propose`
with delta specs against these baseline specs, then `/opsx:archive` to
merge, keeping `openspec/specs/` authoritative going forward.
