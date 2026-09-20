import {
  getChordSuffixesForQuality,
  getConcreteChordName,
  MAJOR_PENTATONIC_CHORD_SUFFIXES,
  MINOR_PENTATONIC_CHORD_SUFFIXES,
} from "@/lib/chords";
import { getScaleNotes, type ScaleFamily } from "@/lib/scales";
import { getDegreeFunctionName, getIntervalName } from "@/lib/scaleTerms";
import { getDiatonicDegrees, type NoteName } from "@/lib/theory";

type Props = {
  root: NoteName;
  family: ScaleFamily;
  modeId: string;
};

export function ScaleInfoTable({ root, family, modeId }: Props) {
  // Formula/Notes/Intervals are valid for any degreeCount (same as the
  // Degrees row already relies on getDiatonicDegrees for any family).
  // Degree function names (Tonic, Supertonic...) assume a 7-degree scale,
  // so that column stays 7-degree-only. Chords also assume a 7-degree
  // scale when derived from triad quality - except Minor/Major
  // Pentatonic's own base modes, which each have their own fixed,
  // position-indexed chord table (see design.md "Minor and Major
  // Pentatonic's base modes each get a fixed... Chords table").
  const isSevenDegree = family.degreeCount === 7;
  const pentatonicChordSuffixes =
    family.id === "minor-pentatonic" && modeId === "minor-pentatonic"
      ? MINOR_PENTATONIC_CHORD_SUFFIXES
      : family.id === "major-pentatonic" && modeId === "major-pentatonic"
        ? MAJOR_PENTATONIC_CHORD_SUFFIXES
        : null;
  const showChordsColumn = isSevenDegree || pentatonicChordSuffixes !== null;
  const headers = [
    "Formula",
    "Notes",
    "Intervals",
    ...(isSevenDegree ? ["Degree"] : []),
    ...(showChordsColumn ? ["Chords"] : []),
  ];

  const diatonicDegrees = getDiatonicDegrees(root, family, modeId);
  // rootMidi 0 anchor mirrors theory.ts's own convention: getScaleNotes'
  // output then equals each degree's own semitone offset from root, in
  // the same order as getDiatonicDegrees.
  const semitoneOffsets = getScaleNotes(0, family, modeId);

  return (
    <div className="w-full overflow-x-auto">
      <table className="text-sm">
        <thead>
          <tr className="text-xs text-text-muted">
            {headers.map((header) => (
              <th key={header} className="px-2 py-1 text-left font-medium whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {diatonicDegrees.map((degree, i) => (
            <tr key={degree.index} className="border-t border-black/5 dark:border-white/10">
              <td className="px-2 py-1 whitespace-nowrap">{degree.degreeLabel}</td>
              <td className="px-2 py-1 whitespace-nowrap">{degree.noteName}</td>
              <td className="px-2 py-1 whitespace-nowrap">{getIntervalName(semitoneOffsets[i])}</td>
              {isSevenDegree && (
                <td className="px-2 py-1 whitespace-nowrap">
                  {getDegreeFunctionName(degree.index, semitoneOffsets[i])}
                </td>
              )}
              {showChordsColumn && (
                <td className="px-2 py-1 whitespace-nowrap text-text-muted">
                  {isSevenDegree
                    ? getChordSuffixesForQuality(degree.quality)
                        .map((suffix) => getConcreteChordName(degree.noteName, suffix))
                        .join(", ")
                    : getConcreteChordName(degree.noteName, pentatonicChordSuffixes![degree.index])}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
