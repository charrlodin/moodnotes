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

      // Allow all Ctrl shortcuts even when typing
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          e.stopPropagation();
          onNewNote();
          return;
        }
        
        if (e.key === 'b' && !isInTextarea) {
          e.preventDefault();
          e.stopPropagation();
          onToggleBackground();
          return;
        }
        
        if (e.key === 'm' && !isInTextarea) {
          e.preventDefault();
          e.stopPropagation();
          onToggleAudio();
          return;
        }
        
        if (e.key === 'f' && !isInTextarea) {
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
