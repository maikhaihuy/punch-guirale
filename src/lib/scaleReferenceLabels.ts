import type { ReferenceHint } from "./scaleReference";

// UI strings introduced with the reference-driven info table, kept in one
// place (keyed, not inlined in JSX) so a later multi-language change has a
// single spot to lift them from. Not an i18n layer itself.
export const INFO_TABLE_LABELS = {
  roman: "Roman",
  skip: "Skip",
  blueNote: "Blue note",
  notApplicable: "N/A",
} as const;

const HINT_LABELS: Record<Exclude<ReferenceHint, "avoid-note">, string> = {
  "rarely-used": "Rarely used",
  turnaround: "Turnaround",
  "not-applicable": INFO_TABLE_LABELS.notApplicable,
};

// `noteName` is the slot's own would-be note, only used by the avoid-note hint.
export function getHintLabel(hint: ReferenceHint, noteName: string): string {
  return hint === "avoid-note" ? `Avoid ${noteName} when soloing` : HINT_LABELS[hint];
}
