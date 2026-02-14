import { useEffect } from 'react';

interface ShortcutHandlers {
  onSubmit?: () => void;
  onFocusInput?: () => void;
  onSwitchMode?: (index: number) => void;
  onToggleHistory?: () => void;
  onCloseModal?: () => void;
  onShowShortcuts?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Cmd+Enter — Submit
      if (meta && e.key === 'Enter') {
        e.preventDefault();
        handlers.onSubmit?.();
        return;
      }

      // Cmd+K — Focus input
      if (meta && e.key === 'k') {
        e.preventDefault();
        handlers.onFocusInput?.();
        return;
      }

      // Cmd+H — Toggle history
      if (meta && e.key === 'h') {
        e.preventDefault();
        handlers.onToggleHistory?.();
        return;
      }

      // Escape — Close modal
      if (e.key === 'Escape') {
        handlers.onCloseModal?.();
        return;
      }

      // Don't intercept shortcuts when typing in inputs
      if (isInput) return;

      // Cmd+1-3 — Switch modes
      if (meta && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        handlers.onSwitchMode?.(parseInt(e.key, 10) - 1);
        return;
      }

      // ? — Show shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        handlers.onShowShortcuts?.();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

export const SHORTCUTS = [
  { keys: ['Enter'], description: 'Search / Analyze' },
  { keys: ['Cmd', 'K'], description: 'Focus citation input' },
  { keys: ['Cmd', '1-3'], description: 'Switch modes' },
  { keys: ['Cmd', 'H'], description: 'Toggle history' },
  { keys: ['Esc'], description: 'Close modal' },
  { keys: ['?'], description: 'Show shortcuts' },
];
