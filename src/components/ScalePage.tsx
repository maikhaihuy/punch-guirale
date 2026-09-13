"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Fretboard } from "@/components/Fretboard";
import { KeyModeBar, type DisplayMode, type SelectedPosition } from "@/components/KeyModeBar";
import { PracticeControls } from "@/components/PracticeControls";
import { PracticeHistory } from "@/components/PracticeHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMetronome } from "@/hooks/useMetronome";
import { useNotePlayer } from "@/hooks/useNotePlayer";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { getFamily, type ScaleFamily } from "@/lib/scales";
import { appendSession, loadSessions, type PracticeSession } from "@/lib/storage";
import { buildFretboard, getPositionRanges, getTriadDegreeLabels, type NoteName } from "@/lib/theory";

const MOBILE_QUERY = "(max-width: 640px)";

type Props = {
  family: ScaleFamily;
  modeId: string;
  variantId?: string;
};

export function ScalePage({ family, modeId, variantId }: Props) {
  const router = useRouter();

  const [root, setRoot] = useState<NoteName>("C");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("note");
  const [selectedPosition, setSelectedPosition] = useState<SelectedPosition>("all");
  const [selectedTriadDegree, setSelectedTriadDegree] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mql.matches);
    if (mql.matches) setSelectedPosition(1);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Position markers and triad highlighting don't apply to every family
  // (see design.md "Non-goals") - fall back to "inactive" rather than
  // clearing the underlying selection, so it's restored if the user
  // switches back to a family where it's meaningful.
  const effectivePosition: SelectedPosition = family.id === "major" ? selectedPosition : "all";
  const effectiveTriadDegree = family.degreeCount === 7 ? selectedTriadDegree : null;

  const fretboard = useMemo(
    () => buildFretboard(root, family, modeId, variantId),
    [root, family, modeId, variantId],
  );
  const positionRanges = useMemo(
    () => (effectivePosition === "all" ? [] : getPositionRanges(root, effectivePosition)),
    [root, effectivePosition],
  );
  const triadDegreeLabels = useMemo(
    () =>
      effectiveTriadDegree === null
        ? null
        : getTriadDegreeLabels(family, modeId, effectiveTriadDegree),
    [family, modeId, effectiveTriadDegree],
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
    <div className="flex min-h-screen w-full flex-col items-center gap-8 px-4 pt-6 pb-4">
      <ThemeToggle />

      <div className="w-full max-w-2xl">
        <KeyModeBar
          root={root}
          onRootChange={setRoot}
          family={family}
          onFamilyChange={handleFamilyChange}
          modeId={modeId}
          onModeChange={handleModeChange}
          variantId={variantId}
          onVariantChange={handleVariantChange}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          selectedPosition={selectedPosition}
          onSelectedPositionChange={setSelectedPosition}
          selectedTriadDegree={selectedTriadDegree}
          onSelectedTriadDegreeChange={setSelectedTriadDegree}
        />
      </div>

      <div className="flex w-full max-w-5xl flex-col gap-6">
        <Fretboard
          fretboard={fretboard}
          displayMode={displayMode}
          selectedPosition={effectivePosition}
          positionRanges={positionRanges}
          onNotePlay={(note) => void playNote(note.freq)}
          autoFitMobile={isMobile}
          triadDegreeLabels={triadDegreeLabels}
        />

        <PracticeHistory sessions={sessions} />
      </div>

      <div className="sticky bottom-0 z-30 w-full max-w-2xl sm:static">
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
      </div>
    </div>
  );
}
