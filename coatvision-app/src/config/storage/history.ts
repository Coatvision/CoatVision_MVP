// src/storage/history.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CoatVisionMode, CoatVisionResult } from '@/src/config/api/coatvision';

const HISTORY_KEY = '@coatvision_history_v1';

// Hvor kom analysen fra?
export type HistoryEntrySource = 'analyze-screen' | 'live-screen';

// Én historikk-linje
export type HistoryEntry = {
  id: string;
  timestamp: number;
  mode: CoatVisionMode;
  source: HistoryEntrySource;
  imageUri?: string; // kun for bildeanalyser
  result: CoatVisionResult;
};

// Intern: last historikk fra AsyncStorage
async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('Kunne ikke lese CoatVision-historikk:', err);
    return [];
  }
}

// Intern: lagre historikk til AsyncStorage
async function saveHistory(entries: HistoryEntry[]): Promise<void> {
  try {
    const serialized = JSON.stringify(entries);
    await AsyncStorage.setItem(HISTORY_KEY, serialized);
  } catch (err) {
    console.warn('Kunne ikke lagre CoatVision-historikk:', err);
  }
}

// Legg til en ny historikk-linje
export async function addHistoryEntry(input: {
  mode: CoatVisionMode;
  source: HistoryEntrySource;
  imageUri?: string;
  result: CoatVisionResult;
}): Promise<HistoryEntry> {
  const existing = await loadHistory();

  const now = Date.now();
  const newEntry: HistoryEntry = {
    id: `${now}-${Math.round(Math.random() * 1_000_000)}`,
    timestamp: now,
    mode: input.mode,
    source: input.source,
    imageUri: input.imageUri,
    result: input.result,
  };

  const updated = [newEntry, ...existing].slice(0, 100); // behold maks 100
  await saveHistory(updated);
  return newEntry;
}

// Hent hele historikken
export async function getHistory(): Promise<HistoryEntry[]> {
  return loadHistory();
}

// Hent én spesifikk historikk-linje
export async function getHistoryEntryById(
  id: string
): Promise<HistoryEntry | null> {
  const all = await loadHistory();
  const entry = all.find((e) => e.id === id);
  return entry ?? null;
}

// Tøm historikken
export async function clearHistory(): Promise<void> {
  await saveHistory([]);
}
