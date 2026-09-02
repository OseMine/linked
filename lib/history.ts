export interface HistoryEntry {
  id: string;
  name: string;
  artist: string | null;
  image: string | null;
  type: "song" | "album" | "artist";
  linkedUrl: string;
  timestamp: number;
}

const STORAGE_KEY = "linked_history";
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistory();
    // Remove existing entry with same id
    const filtered = history.filter((h) => h.id !== entry.id);
    // Add new entry at the beginning
    filtered.unshift({ ...entry, timestamp: Date.now() });
    // Trim to max entries
    const trimmed = filtered.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage not available
  }
}

export function removeFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistory();
    const filtered = history.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // localStorage not available
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}
