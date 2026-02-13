import { useState, useEffect, useCallback } from 'react';
import type { AnalyzedCitation } from '../services/api.ts';

const HISTORY_KEY = 'legalcitation-history';
const MAX_HISTORY = 50;

export interface HistoryEntry {
  id: string;
  mode: 'in_text' | 'builder' | 'bulk';
  input: string;
  results: AnalyzedCitation[];
  timestamp: string;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore parse errors */ }
  }, []);

  const saveToHistory = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return { history, saveToHistory, deleteEntry, clearHistory };
}
