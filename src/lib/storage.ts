export type PracticeSession = {
  date: string;
  rootNote: string;
  // familyId is absent on sessions logged before the family/mode schema
  // (Milestone 4) - all pre-migration sessions were implicitly "major",
  // and mode ids for that family are unchanged, so no data migration is
  // needed (see openspec design.md "Migration / compatibility").
  familyId?: string;
  mode: string;
  bpm: number;
  durationSec: number;
};

const STORAGE_KEY = "guitar-scale-trainer:sessions";

export function loadSessions(): PracticeSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendSession(session: PracticeSession): PracticeSession[] {
  const next = [session, ...loadSessions()];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — fail silently
  }
  return next;
}
