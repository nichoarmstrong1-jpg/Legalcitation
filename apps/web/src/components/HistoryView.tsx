import { useState } from 'react';
import { ClipboardList, X } from 'lucide-react';
import type { HistoryEntry } from '../hooks/useHistory.ts';
import { useToast } from '../context/ToastContext.tsx';
import { ConfirmDialog } from './ui/ConfirmDialog.tsx';

interface HistoryViewProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  selectedEntryId?: string;
}

const modeLabels: Record<string, string> = {
  in_text: 'In-Text',
  builder: 'Builder',
  bulk: 'Bulk',
};

export function HistoryView({ history, onRestore, onDelete, onClear, selectedEntryId }: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { showToast } = useToast();

  const filtered = search.trim()
    ? history.filter(e => e.input.toLowerCase().includes(search.toLowerCase()))
    : history;

  const handleDelete = (id: string) => {
    onDelete(id);
    showToast('Entry deleted', 'info');
  };

  const handleClearAll = () => {
    onClear();
    setShowClearConfirm(false);
    showToast('History cleared', 'info');
  };

  const handleRestore = (entry: HistoryEntry) => {
    onRestore(entry);
    showToast('Loaded citation from history', 'info');
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-primary-900">Citation History</h2>
            <p className="text-sm text-surface-400 mt-0.5">
              {history.length} saved check{history.length !== 1 ? 's' : ''}
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-error-500 hover:text-error-700 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Search */}
        {history.length > 3 && (
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search history..."
            className="input-field text-sm mb-4"
          />
        )}

        {/* Entries */}
        {filtered.length === 0 ? (
          <div className="text-center text-surface-400 py-12">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-6 h-6 text-surface-400" />
            </div>
            {history.length === 0 ? (
              <>
                <p className="font-medium text-surface-600">No history yet</p>
                <p className="text-sm mt-1">Your checked citations will appear here</p>
              </>
            ) : (
              <p className="font-medium text-surface-600">No results match "{search}"</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(entry => {
              const isSelected = entry.id === selectedEntryId;
              const hasResults = entry.results.length > 0;
              const firstResult = hasResults ? entry.results[0] : null;
              const statusColor = firstResult
                ? firstResult.verificationStatus === 'verified' ? 'text-verified-600'
                : firstResult.verificationStatus === 'partial_match' ? 'text-warning-600'
                : firstResult.verificationStatus === 'not_found' ? 'text-error-600'
                : 'text-surface-500'
                : 'text-surface-400';

              return (
                <button
                  key={entry.id}
                  onClick={() => hasResults && handleRestore(entry)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-glow-blue'
                      : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'
                  } ${!hasResults ? 'opacity-60 cursor-default' : ''}`}
                  disabled={!hasResults}
                  title={entry.input}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge-info text-[10px] py-0.5">{modeLabels[entry.mode] || entry.mode}</span>
                        <span className="text-[11px] text-surface-400">
                          {new Date(entry.timestamp).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-mono truncate text-surface-700">{entry.input}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-surface-400">
                          {entry.results.length} citation{entry.results.length !== 1 ? 's' : ''}
                        </span>
                        {firstResult && (
                          <span className={`text-xs font-semibold ${statusColor}`}>
                            {firstResult.verificationStatus === 'verified' ? 'Verified' :
                             firstResult.verificationStatus === 'partial_match' ? 'Partial' :
                             firstResult.verificationStatus === 'not_found' ? 'Not Found' :
                             'Checked'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(entry.id); }}
                      className="shrink-0 w-8 h-8 flex items-center justify-center text-surface-300 hover:text-error-500 rounded-xl hover:bg-error-50 transition-all"
                      aria-label="Delete entry"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Clear Dialog */}
      {showClearConfirm && (
        <ConfirmDialog
          title="Clear all history?"
          message="This will permanently delete all your saved citation checks. This can't be undone."
          confirmLabel="Clear All"
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  );
}
