import { SHORTCUTS } from '../hooks/useKeyboardShortcuts.ts';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-modal max-w-sm w-full p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-primary-900 mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-3">
          {SHORTCUTS.map(shortcut => (
            <div key={shortcut.description} className="flex items-center justify-between">
              <span className="text-sm text-surface-600">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map(key => (
                  <kbd
                    key={key}
                    className="px-2 py-1 text-xs font-mono bg-surface-100 border border-surface-200 rounded-lg text-surface-600"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="btn-secondary w-full mt-6 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
