import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onNewNote: () => void;
  onToggleBackground: () => void;
  onToggleAudio: () => void;
  onToggleFocus: () => void;
  focusMode: boolean;
}

export default function useKeyboardShortcuts({
  onNewNote,
  onToggleBackground,
  onToggleAudio,
  onToggleFocus,
  focusMode,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInTextarea = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';
      
      // Don't intercept shortcuts when modals are open (they handle their own ESC)
      const hasModal = document.querySelector('.fixed.inset-0.bg-black\\/50');
      if (hasModal && e.key === 'Escape') {
        return; // Let modal handle it
      }
      
      // ESC key handling
      if (e.key === 'Escape') {
        if (focusMode && isInTextarea) {
          // In focus mode while typing: unfocus textarea, stay in focus mode
          e.preventDefault();
          e.stopPropagation();
          (target as HTMLTextAreaElement | HTMLInputElement).blur();
          return;
        }
        
        if (!focusMode && isInTextarea) {
          // Normal mode while typing: unfocus textarea
          e.preventDefault();
          e.stopPropagation();
          (target as HTMLTextAreaElement | HTMLInputElement).blur();
          return;
        }
        
        // Don't intercept ESC in focus mode when not typing - let browser exit fullscreen
        // which will trigger our fullscreenchange handler
        if (!isInTextarea && !focusMode) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      // Allow all Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+N: New note (works everywhere)
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          e.stopPropagation();
          onNewNote();
          return;
        }
        
        // Ctrl+B: Background selector (not in textareas)
        if ((e.key === 'b' || e.key === 'B') && !isInTextarea) {
          e.preventDefault();
          e.stopPropagation();
          onToggleBackground();
          return;
        }
        
        // Ctrl+M: Audio player (not in textareas)
        if ((e.key === 'm' || e.key === 'M') && !isInTextarea) {
          e.preventDefault();
          e.stopPropagation();
          onToggleAudio();
          return;
        }
        
        // Ctrl+F: Focus mode (not in textareas to avoid Find conflict)
        if ((e.key === 'f' || e.key === 'F') && !isInTextarea) {
          e.preventDefault();
          e.stopPropagation();
          onToggleFocus();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onNewNote, onToggleBackground, onToggleAudio, onToggleFocus, focusMode]);
}
