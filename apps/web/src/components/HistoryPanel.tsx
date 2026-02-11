import type { HistoryEntry } from '../hooks/useHistory.ts';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onClose, onDelete, onClear }: HistoryPanelProps) {
  const modeLabels = {
    in_text: 'In-Text',
    individual: 'Individual',
    builder: 'Builder',
    bulk: 'Bulk',
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-modal overflow-y-auto animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 frosted border-b border-surface-200/60 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary-900">Citation History</h2>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button onClick={onClear} className="text-xs text-error-500 hover:text-error-700 font-medium transition-colors">
                Clear All
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-xl transition-all">
              &times;
            </button>
          </div>
        </div>

        <div className="p-6">
          {history.length === 0 ? (
            <div className="text-center text-surface-400 py-16">
              <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">&#128203;</span>
              </div>
              <p className="font-medium text-surface-600">No history yet</p>
              <p className="text-sm mt-1">Your checked citations will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(entry => (
                <div key={entry.id} className="border border-surface-200 rounded-2xl p-4 hover:shadow-card transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge-info">
                      {modeLabels[entry.mode]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-surface-400">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="w-6 h-6 flex items-center justify-center text-surface-300 hover:text-error-500 rounded-lg hover:bg-error-50 transition-all text-sm"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-mono truncate text-surface-700">{entry.input.slice(0, 80)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-surface-400">
                      {entry.results.length} citation{entry.results.length !== 1 ? 's' : ''}
                    </span>
                    {entry.results.length > 0 && (
                      <span className={`text-xs font-bold ${
                        entry.results[0].score >= 80 ? 'text-verified-600' :
                        entry.results[0].score >= 50 ? 'text-warning-600' : 'text-error-600'
                      }`}>
                        {entry.results[0].score}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
