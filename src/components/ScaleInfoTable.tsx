import type { ReactNode } from "react";

import type { ScaleFamily } from "@/lib/scales";
import { getHintLabel, INFO_TABLE_LABELS } from "@/lib/scaleReferenceLabels";
import { getScaleRows } from "@/lib/scaleRows";
import type { NoteName } from "@/lib/theory";
import { cn } from "cn";

type Props = {
  root: NoteName;
  family: ScaleFamily;
  modeId: string;
};

function Badge({ tone, children }: { tone: "skip" | "blue"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "ml-1.5 rounded-full px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-text",
        tone === "skip" ? "border border-text/40" : "bg-accent/25",
      )}
    >
      {children}
    </span>
  );
}

export function ScaleInfoTable({ root, family, modeId }: Props) {
  const { rows, showDetail } = getScaleRows(root, family, modeId);
  const headers = [
    "Formula",
    "Notes",
    "Intervals",
    ...(showDetail ? [INFO_TABLE_LABELS.roman, "Degree", "Chords"] : []),
  ];

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
          {rows.map((row) => {
            // A skipped slot's text is struck through and dimmed, but the
            // strike/dim is not the only signal: the Skip badge (outside the
            // struck span) says it in words. Chords are never struck: they're
            // the point of showing the slot. Opacity is kept at 70% so text
            // stays above 4.5:1 against both themes (text-muted would fall to
            // ~3:1, so skipped chords use text-text).
            const struck = row.skipped ? "line-through opacity-70" : "";
            return (
              <tr key={row.offset} className="border-t border-black/5 dark:border-white/10">
                <td className="px-2 py-1 whitespace-nowrap">
                  <span className={struck}>{row.degreeLabel}</span>
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <span className={struck}>{row.noteName}</span>
                  {row.skipped && <Badge tone="skip">{INFO_TABLE_LABELS.skip}</Badge>}
                </td>
                <td className="px-2 py-1 whitespace-nowrap">
                  <span className={struck}>{row.intervalName}</span>
                </td>
                {showDetail && (
                  <>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className={struck}>{row.roman ?? INFO_TABLE_LABELS.notApplicable}</span>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      <span className={struck}>{row.name}</span>
                      {row.blueNote && <Badge tone="blue">{INFO_TABLE_LABELS.blueNote}</Badge>}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-1 whitespace-nowrap",
                        row.skipped ? "text-text opacity-70" : "text-text-muted",
                      )}
                    >
                      {row.chords.join(", ")}
                      {row.hint && (
                        <span className={cn("italic", row.chords.length > 0 && "ml-2")}>
                          {getHintLabel(row.hint, row.noteName)}
                        </span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
