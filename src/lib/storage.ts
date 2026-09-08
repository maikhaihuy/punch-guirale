import type { ModeName } from "./theory";

export type PracticeSession = {
  date: string;
  rootNote: string;
  mode: ModeName;
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
