"use client";

import { Guitar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Fretboard } from "@/components/Fretboard";
import { PracticeControls } from "@/components/PracticeControls";
import { PracticeHistory } from "@/components/PracticeHistory";
import { RootRandomizer } from "@/components/RootRandomizer";
import { ScaleDashboard, type DisplayMode } from "@/components/ScaleDashboard";
import { ScaleNav } from "@/components/ScaleNav";
import type { WheelPlayback } from "@/components/ScaleWheel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMetronome } from "@/hooks/useMetronome";
import { useNotePlayer } from "@/hooks/useNotePlayer";
import { useScalePlayer } from "@/hooks/useScalePlayer";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { buildPlaybackSequence } from "@/lib/scalePlayback";
import { getFamily, getMode, type ScaleFamily } from "@/lib/scales";
import { appendSession, loadSessions, type PracticeSession } from "@/lib/storage";
import { buildFretboard, getDegreeLabel, randomRoot, type NoteName } from "@/lib/theory";

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

  const scalePlayer = useScalePlayer();
  const { start: startPlayback, stop: stopPlayback } = scalePlayer;

  // Scale playback deliberately doesn't count toward practiceActive: it's a
  // short one-shot, not a session, so it doesn't hold the wake lock.
  const practiceActive = metronome.isPlaying || stopwatch.status === "running";
  useWakeLock(practiceActive);

  const sequence = useMemo(
    () => buildPlaybackSequence(root, family, modeId, variantId),
    [root, family, modeId, variantId],
  );
  // A route change can render with the new mode's (possibly shorter) sequence
  // for one pass before the effect below stops playback, so the step is
  // looked up defensively rather than assumed in range.
  const activeStep = scalePlayer.activeStepIndex === null ? undefined : sequence[scalePlayer.activeStepIndex];
  const playback: WheelPlayback | null =
    activeStep && scalePlayer.activeStepIndex !== null
      ? {
          activeNote: activeStep.noteName,
          nextNote: sequence[scalePlayer.activeStepIndex + 1]?.noteName ?? null,
          stepIndex: scalePlayer.activeStepIndex,
          stepDurationSec: scalePlayer.stepDurationSec,
        }
      : null;

  // Stopping lives in the handler, not an effect on `root`: randomize can
  // land on the same root, which wouldn't change the value and so wouldn't
  // fire an effect. Route params (family/mode/variant) only change through
  // navigation, so an effect covers those.
  const handleRootChange = (next: NoteName) => {
    stopPlayback();
    setRoot(next);
  };
  const handleRandomize = () => handleRootChange(randomRoot());

  useEffect(() => {
    stopPlayback();
  }, [family.id, modeId, variantId, stopPlayback]);

  const handleTogglePlayback = () => {
    if (scalePlayer.isPlaying) {
      stopPlayback();
    } else {
      void startPlayback(sequence, metronome.bpm);
    }
  };

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

      {/* Bottom padding clears the fixed footer: two stacked cards (one of them
          possibly wrapped to two rows) below md, one row from md. */}
      <div className="flex w-full flex-1 flex-col items-center gap-6 px-4 pt-6 pb-52 md:pb-28">
        <section className="flex w-full max-w-5xl flex-col">
          <ScaleDashboard
            root={root}
            onRootChange={handleRootChange}
            family={family}
            modeId={modeId}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            selectedDegreeIndex={selectedDegreeIndex}
            onSelectedDegreeIndexChange={setSelectedDegreeIndex}
            isPlaying={scalePlayer.isPlaying}
            playback={playback}
            onTogglePlayback={handleTogglePlayback}
          />
        </section>

        <section className="flex w-full max-w-5xl flex-col">
          <Fretboard
            fretboard={fretboard}
            displayMode={displayMode}
            onNotePlay={(note) => void playNote(note.freq)}
            selectedDegreeLabel={selectedDegreeLabel}
            playingNoteName={playback?.activeNote ?? null}
          />
        </section>

        <section className="flex w-full max-w-5xl flex-col">
          <PracticeHistory sessions={sessions} />
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 flex w-full flex-col gap-2 px-4 pb-4 md:flex-row md:items-stretch">
        <RootRandomizer
          root={root}
          familyName={family.displayName}
          modeName={getMode(family, modeId)?.displayName ?? modeId}
          onRandomize={handleRandomize}
        />
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
