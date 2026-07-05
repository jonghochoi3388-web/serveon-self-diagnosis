import { DiagnosisSnapshot } from "./types";

const STORAGE_KEY = "serveon_diagnosis_snapshots";

export function loadSnapshots(): DiagnosisSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DiagnosisSnapshot[]) : [];
  } catch {
    return [];
  }
}

export function saveSnapshot(snapshot: DiagnosisSnapshot): DiagnosisSnapshot[] {
  const snapshots = [snapshot, ...loadSnapshots()];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  }
  return snapshots;
}
