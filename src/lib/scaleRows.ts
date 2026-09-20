import { getChordSuffixesForQuality, getConcreteChordName } from "./chords";
import { getScaleNotes, type ScaleFamily } from "./scales";
import { getReferenceSlots, type ReferenceSlot } from "./scaleReference";
import { getDegreeFunctionName, getIntervalName } from "./scaleTerms";
import { getDiatonicDegrees, type NoteName } from "./theory";

// One row of the scale info table, whichever source it came from.
export type ScaleRow = ReferenceSlot;

export type ScaleRows = {
  rows: ScaleRow[];
  // Whether Roman / Degree / Chords carry real values. False only for the
  // fallback case below, where those fields are empty placeholders.
  showDetail: boolean;
};

// The rows for a family/mode, in one shape. Only the SOURCE differs:
// - a pattern with hand-authored reference data (Pentatonic / Blues): those
//   rows, including any slots the scale skips;
// - any 7-degree family: derived per degree, because tertian-triad math
//   (roman-numeral case, chord quality, degree function) only holds for 7
//   degrees - hand-writing all 21 diatonic modes would drop the "add a
//   family with no code change" property;
// - anything else: Formula/Notes/Intervals only, so a newly added family
//   with no reference still renders.
export function getScaleRows(root: NoteName, family: ScaleFamily, modeId: string): ScaleRows {
  // rootMidi 0 anchor mirrors theory.ts's own convention: getScaleNotes'
  // output then equals each degree's own semitone offset from root, in
  // the same order as getDiatonicDegrees.
  const semitoneOffsets = getScaleNotes(0, family, modeId);
  console.log("getScaleRows", { root, family: family.id, modeId, semitoneOffsets });

  const reference = getReferenceSlots(root, semitoneOffsets);
  if (reference) return { rows: reference, showDetail: true };

  const isSevenDegree = family.degreeCount === 7;
  const rows = getDiatonicDegrees(root, family, modeId).map((degree, i): ScaleRow => ({
    offset: semitoneOffsets[i],
    degreeLabel: degree.degreeLabel,
    noteName: degree.noteName,
    intervalName: getIntervalName(semitoneOffsets[i]),
    roman: isSevenDegree ? degree.romanNumeral : "",
    name: isSevenDegree ? getDegreeFunctionName(degree.index, semitoneOffsets[i]) : "",
    chords: isSevenDegree
      ? getChordSuffixesForQuality(degree.quality).map((suffix) =>
          getConcreteChordName(degree.noteName, suffix),
        )
      : [],
    blueNote: false,
    skipped: false,
  }));
  return { rows, showDetail: isSevenDegree };
}
