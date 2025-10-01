import { useState, useCallback } from 'react';
import { Note } from '../types';

interface HistoryState {
  notes: Note[];
  action: string;
}

export function useUndoRedo(initialNotes: Note[]) {
  const [history, setHistory] = useState<HistoryState[]>([{ notes: initialNotes, action: 'init' }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const saveState = useCallback((notes: Note[], action: string) => {
    setHistory((prev) => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new state
      newHistory.push({ notes: JSON.parse(JSON.stringify(notes)), action });
      // Limit history to last 50 states
      return newHistory.slice(-50);
    });
    setCurrentIndex((prev) => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return history[currentIndex - 1].notes;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return history[currentIndex + 1].notes;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { saveState, undo, redo, canUndo, canRedo };
}
