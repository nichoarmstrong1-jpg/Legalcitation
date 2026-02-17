import { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  MessageSquare,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import type { SpadingAnnotation } from '../../services/api.ts';
import { AnnotationStatusBadge } from './AnnotationStatusBadge.tsx';

interface AnnotationSidebarProps {
  annotation: SpadingAnnotation;
  onResolve: (annotationId: string, resolved: boolean) => void;
  onNote: (annotationId: string, note: string) => void;
  onViewSource: (annotation: SpadingAnnotation) => void;
}

export function AnnotationSidebar({
  annotation,
  onResolve,
  onNote,
  onViewSource,
}: AnnotationSidebarProps) {
  const [showTrace, setShowTrace] = useState(false);
  const [noteText, setNoteText] = useState(annotation.editorNote || '');
  const [editingNote, setEditingNote] = useState(false);

  // Sync state when a different annotation is selected
  useEffect(() => {
    setNoteText(annotation.editorNote || '');
    setEditingNote(false);
    setShowTrace(false);
  }, [annotation.id]);

  const handleSaveNote = () => {
    onNote(annotation.id, noteText);
    setEditingNote(false);
  };

  return (
    <div className="card p-4 space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <AnnotationStatusBadge status={annotation.status} />
          {annotation.score != null && (
            <span className="ml-2 text-xs text-surface-400">
              Score: {annotation.score}/100
            </span>
          )}
        </div>
        <button
          onClick={() => onResolve(annotation.id, !annotation.resolved)}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
            annotation.resolved
              ? 'bg-verified-100 text-verified-700'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          }`}
        >
          <Check className="w-3 h-3" />
          {annotation.resolved ? 'Resolved' : 'Resolve'}
        </button>
      </div>

      {/* Citation Text */}
      <div>
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
          Citation
        </h4>
        <p className="text-sm text-surface-800 font-mono bg-surface-50 p-2 rounded-lg break-all">
          {annotation.rawCitationText}
        </p>
      </div>

      {/* Verified Citation (if different) */}
      {annotation.verifiedCitation && annotation.verifiedCitation !== annotation.rawCitationText && (
        <div>
          <h4 className="text-xs font-semibold text-verified-600 uppercase tracking-wide mb-1">
            Suggested Correction
          </h4>
          <p className="text-sm text-verified-800 font-mono bg-verified-50 p-2 rounded-lg break-all">
            {annotation.verifiedCitation}
          </p>
        </div>
      )}

      {/* Issues */}
      {annotation.issues.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
            Issues ({annotation.issues.length})
          </h4>
          <div className="space-y-2">
            {annotation.issues.map((issue, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-xs ${
                  issue.severity === 'error'
                    ? 'bg-error-50 border border-error-200'
                    : issue.severity === 'warning'
                    ? 'bg-warning-50 border border-warning-200'
                    : 'bg-surface-50 border border-surface-200'
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {issue.severity === 'error' ? (
                    <XCircle className="w-3 h-3 text-error-500" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle className="w-3 h-3 text-warning-500" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-surface-400" />
                  )}
                  <span className="font-medium text-surface-700">{issue.rule}</span>
                </div>
                <p className="text-surface-600">{issue.message}</p>
                {issue.suggestion && (
                  <p className="text-surface-500 mt-0.5 italic">{issue.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discrepancies */}
      {annotation.discrepancies.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-warning-600 uppercase tracking-wide mb-2">
            Discrepancies
          </h4>
          <div className="space-y-1">
            {annotation.discrepancies.map((d, i) => (
              <div key={i} className="text-xs bg-warning-50 p-2 rounded-lg">
                <span className="font-medium">{d.component}:</span>{' '}
                <span className="text-error-600 line-through">{d.userValue}</span>
                {' → '}
                <span className="text-verified-600">{d.verifiedValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quote Verification */}
      {annotation.quotedText && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
            Quote Check
          </h4>
          <div
            className={`p-2 rounded-lg text-xs ${
              annotation.quoteAccurate
                ? 'bg-verified-50 border border-verified-200'
                : 'bg-error-50 border border-error-200'
            }`}
          >
            <p className="italic text-surface-600">"{annotation.quotedText}"</p>
            <p className="mt-1 font-medium">
              {annotation.quoteAccurate ? 'Quote verified' : 'Quote not found in source'}
            </p>
          </div>
        </div>
      )}

      {/* Source Document Match */}
      {annotation.matchedDocumentId && (
        <button
          onClick={() => onViewSource(annotation)}
          className="w-full flex items-center gap-2 p-2 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-lg text-xs transition-colors"
        >
          <Eye className="w-4 h-4 text-primary-500" />
          <span className="text-surface-700">
            View source
            {annotation.matchedPageNumber ? ` (page ${annotation.matchedPageNumber})` : ''}
          </span>
          <FileText className="w-3 h-3 text-surface-400 ml-auto" />
        </button>
      )}

      {/* Source Text Snippet */}
      {annotation.matchedTextSnippet && (
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
            Source Text
          </h4>
          <p className="text-xs text-surface-600 bg-surface-50 p-2 rounded-lg line-clamp-4">
            {annotation.matchedTextSnippet}
          </p>
        </div>
      )}

      {/* Editor Note */}
      <div>
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1 flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          Editor Note
        </h4>
        {editingNote ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-surface-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
              rows={3}
              placeholder="Add your notes..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNote}
                className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Save
              </button>
              <button
                onClick={() => { setEditingNote(false); setNoteText(annotation.editorNote || ''); }}
                className="px-2 py-1 text-xs text-surface-600 hover:bg-surface-100 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditingNote(true)}
            className="w-full text-left text-xs text-surface-400 hover:text-surface-600 p-2 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors"
          >
            {annotation.editorNote || 'Click to add a note...'}
          </button>
        )}
      </div>

      {/* Logic Trace */}
      {annotation.logicTrace.length > 0 && (
        <div>
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-600"
          >
            {showTrace ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Reasoning ({annotation.logicTrace.length} steps)
          </button>
          {showTrace && (
            <ol className="mt-2 space-y-1 text-xs text-surface-500 list-decimal list-inside">
              {annotation.logicTrace.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
