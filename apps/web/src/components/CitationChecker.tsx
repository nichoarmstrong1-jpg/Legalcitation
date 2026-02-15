import { useState, useRef, useCallback, useEffect } from 'react';
import { FileText as FileTextIcon } from 'lucide-react';
import { analyzeText, type AnalyzedCitation } from '../services/api.ts';
import { FileUploader } from './FileUploader.tsx';
import { ScoreCounter } from './ui/ScoreCounter.tsx';
import { AnalysisProgressBar } from './ui/AnalysisProgressBar.tsx';
import { CitationTooltip } from './CitationTooltip.tsx';
import { SourceViewer } from './SourceViewer.tsx';
import { RichTextInput } from './RichTextInput.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useCaseDocuments } from '../hooks/useCaseDocuments.ts';

type FormatStyle = 'italics' | 'underline';

interface CitationCheckerProps {
  onResults: (results: AnalyzedCitation[], input: string) => void;
  onSelectCitation: (citation: AnalyzedCitation) => void;
  results: AnalyzedCitation[];
  formatStyle: FormatStyle;
  restoredInput?: string;
}

export function CitationChecker({ onResults, onSelectCitation, results, formatStyle, restoredInput }: CitationCheckerProps) {
  const { showToast } = useToast();
  const { findMatchingDocument } = useCaseDocuments();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCitation, setHoveredCitation] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [acceptedChanges, setAcceptedChanges] = useState<Set<number>>(new Set());
  const [deniedChanges, setDeniedChanges] = useState<Set<number>>(new Set());
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const annotatedRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore input from history
  useEffect(() => {
    if (restoredInput !== undefined) {
      setInput(restoredInput);
    }
  }, [restoredInput]);

  const handleCitationMouseEnter = useCallback((idx: number) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoveredCitation(idx);
  }, []);

  const handleCitationMouseLeave = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredCitation(null);
    }, 200);
  }, []);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedIdx(null);
    setAcceptedChanges(new Set());
    setDeniedChanges(new Set());

    try {
      const data = await analyzeText(input.trim());
      onResults(data.results, input.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileText = (text: string, _fileName: string) => {
    setInput(text);
  };

  const handleCitationClick = useCallback((idx: number) => {
    setSelectedIdx(prev => prev === idx ? null : idx);
    onSelectCitation(results[idx]);
  }, [results, onSelectCitation]);

  const handleAcceptChange = useCallback((idx: number) => {
    const result = results[idx];
    if (!result.verifiedCitation) return;
    setAcceptedChanges(prev => new Set(prev).add(idx));
    setDeniedChanges(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
    showToast('Citation corrected', 'success');
  }, [results, showToast]);

  const handleDenyChange = useCallback((idx: number) => {
    if (deniedChanges.has(idx)) {
      // Undo deny
      setDeniedChanges(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    } else {
      setDeniedChanges(prev => new Set(prev).add(idx));
      setAcceptedChanges(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  }, [deniedChanges]);

  const handleCopyCorrection = useCallback(async (result: AnalyzedCitation) => {
    const corrected = result.verifiedCitation;
    if (!corrected) return;
    const plainText = corrected.replace(/\*/g, '');
    try {
      await navigator.clipboard.writeText(plainText);
      showToast('Correction copied to clipboard', 'success');
    } catch {
      showToast('Could not copy — try selecting manually', 'error');
    }
  }, [showToast]);

  const getSeverityColor = (result: AnalyzedCitation) => {
    const errors = result.issues.filter(i => i.severity === 'error').length;
    const warnings = result.issues.filter(i => i.severity === 'warning').length;
    if (errors > 0) return { underline: 'border-error-400', bg: 'bg-error-50/70', hover: 'bg-error-100' };
    if (warnings > 0) return { underline: 'border-warning-400', bg: 'bg-warning-50/70', hover: 'bg-warning-100' };
    if (result.verificationStatus === 'verified') return { underline: 'border-verified-400', bg: 'bg-verified-50/70', hover: 'bg-verified-100' };
    if (result.issues.length === 0) return { underline: 'border-surface-200', bg: 'bg-surface-50/30', hover: 'bg-surface-100' };
    return { underline: 'border-primary-400', bg: 'bg-primary-50/70', hover: 'bg-primary-100' };
  };

  const renderFormattedInline = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const content = part.slice(1, -1);
        return formatStyle === 'italics'
          ? <em key={i} className="font-serif">{content}</em>
          : <u key={i}>{content}</u>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Build annotated text with inline highlights (Grammarly-style)
  const renderAnnotatedText = () => {
    if (results.length === 0 || !input) return null;

    const trimmedInput = input.trim();
    const segments: Array<{ text: string; citationIdx?: number }> = [];
    let lastEnd = 0;

    const sorted = results
      .map((r, i) => ({ result: r, idx: i }))
      .filter(r => r.result.parsed?.position)
      .sort((a, b) => (a.result.parsed.position.start) - (b.result.parsed.position.start));

    for (const { result, idx } of sorted) {
      const pos = result.parsed?.position;
      if (!pos) continue;

      if (pos.start > lastEnd) {
        segments.push({ text: trimmedInput.slice(lastEnd, pos.start) });
      }

      segments.push({ text: trimmedInput.slice(pos.start, pos.end), citationIdx: idx });
      lastEnd = pos.end;
    }

    if (lastEnd < trimmedInput.length) {
      segments.push({ text: trimmedInput.slice(lastEnd) });
    }

    return (
      <div
        ref={annotatedRef}
        className="relative font-serif text-sm leading-relaxed p-5 bg-white border border-surface-200 rounded-2xl min-h-[12rem] whitespace-pre-wrap"
      >
        {segments.map((seg, i) => {
          if (seg.citationIdx === undefined) {
            return <span key={i}>{seg.text}</span>;
          }

          const result = results[seg.citationIdx];
          const colors = getSeverityColor(result);
          const isHovered = hoveredCitation === seg.citationIdx;
          const isSelected = selectedIdx === seg.citationIdx;

          return (
            <span
              key={i}
              className={`relative cursor-pointer border-b-2 ${colors.underline} ${
                isSelected ? colors.hover : isHovered ? colors.bg : ''
              } transition-all duration-200 rounded-sm px-0.5 -mx-0.5`}
              onMouseEnter={() => handleCitationMouseEnter(seg.citationIdx!)}
              onMouseLeave={handleCitationMouseLeave}
              onClick={() => handleCitationClick(seg.citationIdx!)}
            >
              {acceptedChanges.has(seg.citationIdx) && result.verifiedCitation
                ? renderFormattedInline(result.verifiedCitation)
                : seg.text}
              {/* Shared tooltip popover */}
              {(isHovered || isSelected) && (
                <CitationTooltip
                  result={result}
                  citationIdx={seg.citationIdx!}
                  isSelected={isSelected}
                  isAccepted={acceptedChanges.has(seg.citationIdx!)}
                  isDenied={deniedChanges.has(seg.citationIdx!)}
                  originalText={seg.text}
                  formatStyle={formatStyle}
                  onAccept={handleAcceptChange}
                  onDeny={handleDenyChange}
                  onCopy={handleCopyCorrection}
                  onClose={() => setSelectedIdx(null)}
                  onSelect={handleCitationClick}
                  onMouseEnter={() => handleCitationMouseEnter(seg.citationIdx!)}
                  onMouseLeave={handleCitationMouseLeave}
                />
              )}
            </span>
          );
        })}
      </div>
    );
  };

  const errorCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'error').length, 0);
  const warningCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'warning').length, 0);
  const verifiedCount = results.filter(r => r.verificationStatus === 'verified').length;

  const stats = {
    total: results.length,
    verified: verifiedCount,
    warnings: warningCount,
    errors: errorCount,
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-semibold text-primary-900 mb-1">Citation Checker</h2>
        <p className="text-sm text-surface-400 mb-5">
          Upload a document or paste text below. We'll find every citation and check each one against Bluebook rules — hover over highlighted citations for instant feedback.
        </p>

        <FileUploader onTextExtracted={handleFileText} />

        {/* Show annotated view after analysis, otherwise show textarea */}
        {results.length > 0 ? (
          <>
            {/* Stats summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-4">
              <div className="card text-center py-4">
                <ScoreCounter value={stats.total} className="text-2xl font-bold text-primary-900" />
                <div className="text-xs text-surface-400 mt-1 font-medium">Total</div>
              </div>
              <div className="card text-center py-4">
                <ScoreCounter value={stats.verified} className="text-2xl font-bold text-verified-600" />
                <div className="text-xs text-surface-400 mt-1 font-medium">Verified</div>
              </div>
              <div className="card text-center py-4">
                <ScoreCounter value={stats.warnings} className="text-2xl font-bold text-warning-600" />
                <div className="text-xs text-surface-400 mt-1 font-medium">Warnings</div>
              </div>
              <div className="card text-center py-4">
                <ScoreCounter value={stats.errors} className="text-2xl font-bold text-error-600" />
                <div className="text-xs text-surface-400 mt-1 font-medium">Errors</div>
              </div>
            </div>

            {renderAnnotatedText()}

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => { onResults([], ''); setInput(''); setSelectedIdx(null); setAcceptedChanges(new Set()); setDeniedChanges(new Set()); }}
                className="text-xs text-surface-400 hover:text-surface-600 transition-colors"
              >
                Clear and start over
              </button>
              <button onClick={handleAnalyze} disabled={loading} className="btn-primary text-sm disabled:opacity-50">
                {loading ? 'Re-analyzing...' : 'Re-analyze'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-surface-200"></div>
              <span className="mx-3 text-xs font-medium text-surface-400 uppercase tracking-wider">or paste text directly</span>
              <div className="flex-grow border-t border-surface-200"></div>
            </div>

            <div className="input-field h-48 overflow-y-auto">
              <RichTextInput
                value={input}
                onChange={setInput}
                placeholder={`Paste your legal text here. For example:\n\nThe Supreme Court held in Engel v. Vitale, 370 U.S. 421 (1962), that state-sponsored prayer in public schools violated the Establishment Clause. See also Abington School District v. Schempp, 374 U.S. 203 (1963). Id. at 210.`}
                minHeight="10rem"
              />
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleAnalyze}
                disabled={!input.trim() || loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : 'Check All Citations'}
              </button>
            </div>

            {loading && <AnalysisProgressBar />}
          </>
        )}

        {error && (
          <div className="mt-4 p-4 bg-error-50 border border-error-100 rounded-2xl text-sm text-error-700">
            {error}
          </div>
        )}
      </div>

      {/* Citation list below the annotated text */}
      {results.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3 text-primary-900">Citations Found</h3>
          <div className="space-y-2">
            {results.map((result, i) => {
              const colors = getSeverityColor(result);
              const matchingDoc = findMatchingDocument(result);
              return (
                <div
                  key={i}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedIdx === i
                      ? `border-primary-400 bg-primary-50 ring-1 ring-primary-200`
                      : `border-surface-200 hover:border-surface-300 ${hoveredCitation === i ? colors.bg : ''}`
                  }`}
                >
                  <button
                    onClick={() => handleCitationClick(i)}
                    onMouseEnter={() => handleCitationMouseEnter(i)}
                    onMouseLeave={handleCitationMouseLeave}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          result.issues.filter(iss => iss.severity === 'error').length > 0 ? 'bg-error-500' :
                          result.issues.filter(iss => iss.severity === 'warning').length > 0 ? 'bg-warning-500' :
                          result.verificationStatus === 'verified' ? 'bg-verified-500' : 'bg-surface-300'
                        }`} />
                        <span className="text-xs font-mono truncate text-surface-700">
                          {result.parsed?.rawText || 'Unknown citation'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {matchingDoc && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setViewingDocId(matchingDoc.id); }}
                            className="flex items-center gap-1 text-[10px] font-medium text-primary-600 hover:text-primary-700 transition-colors"
                            title="View source document"
                          >
                            <FileTextIcon className="w-3 h-3" />
                            Source
                          </button>
                        )}
                        <span className={`text-xs font-bold ${
                          result.score >= 80 ? 'text-verified-600' :
                          result.score >= 50 ? 'text-warning-600' : 'text-error-600'
                        }`}>
                          {result.score}%
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Source Viewer Modal */}
      {viewingDocId && (
        <SourceViewer
          documentId={viewingDocId}
          onClose={() => setViewingDocId(null)}
        />
      )}
    </div>
  );
}
