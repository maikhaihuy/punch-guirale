import { getScaleNotes, type ScaleFamily } from "./scales";
import { CHROMATIC, midiToFreq, midiToNoteName, type NoteName } from "./theory";

export type PlaybackStep = {
  midi: number;
  freq: number;
  noteName: NoteName;
};

// C3 is MIDI 48, so the root lands somewhere in C3-B3 and the octave root tops
// out at B4 - a comfortable register for a plain synth.
const BASE_MIDI = 48;

function toStep(midi: number): PlaybackStep {
  return { midi, freq: midiToFreq(midi), noteName: midiToNoteName(midi) };
}

// The order a "play the scale" run sounds notes: root up through the scale to
// the octave root, then back down to the root. The octave root is the turning
// point, so it appears once, not twice. Interval arithmetic stays in
// getScaleNotes; this only orders and mirrors its output.
export function buildPlaybackSequence(
  root: NoteName,
  family: ScaleFamily,
  modeId: string,
  variantId?: string,
): PlaybackStep[] {
  const rootMidi = BASE_MIDI + CHROMATIC.indexOf(root);
  const ascending = getScaleNotes(rootMidi, family, modeId, variantId);
  const octaveRoot = rootMidi + 12;
  const descending = [...ascending].reverse();
  return [...ascending, octaveRoot, ...descending].map(toStep);
}
