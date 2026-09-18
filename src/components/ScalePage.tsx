"use client";

import { Guitar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Fretboard } from "@/components/Fretboard";
import { PracticeControls } from "@/components/PracticeControls";
import { PracticeHistory } from "@/components/PracticeHistory";
import { ScaleDashboard, type DisplayMode } from "@/components/ScaleDashboard";
import { ScaleNav } from "@/components/ScaleNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMetronome } from "@/hooks/useMetronome";
import { useNotePlayer } from "@/hooks/useNotePlayer";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { getFamily, type ScaleFamily } from "@/lib/scales";
import { appendSession, loadSessions, type PracticeSession } from "@/lib/storage";
import { buildFretboard, getDegreeLabel, type NoteName } from "@/lib/theory";

type Props = {
  family: ScaleFamily;
  modeId: string;
  variantId?: string;
};

export function ScalePage({ family, modeId, variantId }: Props) {
  const router = useRouter();

  const [root, setRoot] = useState<NoteName>("C");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("note");
  const [selectedDegreeIndex, setSelectedDegreeIndex] = useState<number | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  // A selected degree index is only meaningful within the family it was
  // picked in - switching families (different degreeCount) could leave
  // a stale index out of range for the new family's degree list.
  useEffect(() => {
    setSelectedDegreeIndex(null);
  }, [family.id]);

  const fretboard = useMemo(
    () => buildFretboard(root, family, modeId, variantId),
    [root, family, modeId, variantId],
  );
  // Highlighting is degree-count-agnostic - every note sharing the
  // selected degree's label lights up, for any family (see
  // degree-highlighting spec).
  const selectedDegreeLabel = useMemo(
    () =>
      selectedDegreeIndex === null ? null : getDegreeLabel(family, modeId, selectedDegreeIndex),
    [family, modeId, selectedDegreeIndex],
  );

  const metronome = useMetronome();
  const stopwatch = useStopwatch();
  const { playNote } = useNotePlayer();

  const practiceActive = metronome.isPlaying || stopwatch.status === "running";
  useWakeLock(practiceActive);

  const handleStopwatchStop = () => {
    const durationSec = stopwatch.stop();
    if (durationSec <= 0) return;
    const session: PracticeSession = {
      date: new Date().toISOString(),
      rootNote: root,
      familyId: family.id,
      mode: modeId,
      bpm: metronome.bpm,
      durationSec,
    };
    setSessions(appendSession(session));
  };

  const navigate = (nextFamilyId: string, nextModeId: string, nextVariantId?: string) => {
    const query = nextVariantId ? `?variant=${nextVariantId}` : "";
    router.push(`/${nextFamilyId}/${nextModeId}${query}`);
  };

  const handleFamilyChange = (nextFamilyId: string) => {
    if (nextFamilyId === family.id) return;
    const nextFamily = getFamily(nextFamilyId);
    if (!nextFamily) return;
    navigate(nextFamily.id, nextFamily.modes[0].id);
  };

  const handleModeChange = (nextModeId: string) => {
    if (nextModeId === modeId) return;
    navigate(family.id, nextModeId, variantId);
  };

  const handleVariantChange = (nextVariantId: string | undefined) => {
    const query = nextVariantId ? `?variant=${nextVariantId}` : "";
    router.replace(`/${family.id}/${modeId}${query}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex w-full items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
        <div className="flex flex-1 items-center justify-start">
          <ScaleNav
            family={family}
            modeId={modeId}
            variantId={variantId}
            onFamilyChange={handleFamilyChange}
            onModeChange={handleModeChange}
            onVariantChange={handleVariantChange}
          />
        </div>

        <div className="flex flex-1 items-center justify-center">
          {/* Temporary placeholder - desktop and mobile will get distinct content here later */}
          <div className="flex size-8 items-center justify-center rounded-full bg-black/5 text-text-muted dark:bg-white/10">
            <Guitar className="size-4" aria-hidden />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex w-full flex-1 flex-col items-center gap-6 px-4 pt-6 pb-24">
        <section className="flex w-full max-w-5xl flex-col">
          <ScaleDashboard
            root={root}
            onRootChange={setRoot}
            family={family}
            modeId={modeId}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            selectedDegreeIndex={selectedDegreeIndex}
            onSelectedDegreeIndexChange={setSelectedDegreeIndex}
          />
        </section>

        <section className="flex w-full max-w-5xl flex-col">
          <Fretboard
            fretboard={fretboard}
            displayMode={displayMode}
            onNotePlay={(note) => void playNote(note.freq)}
            selectedDegreeLabel={selectedDegreeLabel}
          />
        </section>

        <section className="flex w-full max-w-5xl flex-col">
          <PracticeHistory sessions={sessions} />
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 w-full px-4 pb-4">
        <PracticeControls
          bpm={metronome.bpm}
          onBpmChange={metronome.setBpm}
          isMetronomePlaying={metronome.isPlaying}
          onToggleMetronome={metronome.toggle}
          stopwatchStatus={stopwatch.status}
          elapsedSec={stopwatch.elapsedSec}
          onStopwatchStart={stopwatch.start}
          onStopwatchPause={stopwatch.pause}
          onStopwatchResume={stopwatch.resume}
          onStopwatchStop={handleStopwatchStop}
        />
      </footer>
    </div>
  );
}
