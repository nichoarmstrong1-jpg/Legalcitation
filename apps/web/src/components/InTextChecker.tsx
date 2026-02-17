import { useState, useRef, useCallback } from 'react';
import { Copy, Check, AlertTriangle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { analyzeText, type AnalyzedCitation } from '../services/api.ts';
import { FileUploader } from './FileUploader.tsx';
import { AnalysisProgressBar } from './ui/AnalysisProgressBar.tsx';
import { CitationTooltip } from './CitationTooltip.tsx';
import { FormattedCitation } from './FormattedCitation.tsx';
import { ShortFormDisplay } from './ShortFormDisplay.tsx';
import { htmlToMarkedText } from '../hooks/useRichPaste.ts';
import { useToast } from '../context/ToastContext.tsx';

type FormatStyle = 'italics' | 'underline';

interface InTextCheckerProps {
  onResults: (results: AnalyzedCitation[], input: string) => void;
  onSelectCitation: (citation: AnalyzedCitation) => void;
  results: AnalyzedCitation[];
  formatStyle?: FormatStyle;
}

export function InTextChecker({ onResults, onSelectCitation, results, formatStyle = 'italics' }: InTextCheckerProps) {
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCitation, setHoveredCitation] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [acceptedChanges, setAcceptedChanges] = useState<Set<number>>(new Set());
  const [deniedChanges, setDeniedChanges] = useState<Set<number>>(new Set());
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [copiedCorrectedIdx, setCopiedCorrectedIdx] = useState<number | null>(null);
  const annotatedRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const plainText = corrected.replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1');
    try {
      await navigator.clipboard.writeText(plainText);
      showToast('Correction copied to clipboard', 'success');
    } catch {
      showToast('Could not copy — try selecting manually', 'error');
    }
  }, [showToast]);

  const handleCopyCorrectedInline = useCallback(async (result: AnalyzedCitation, idx: number) => {
    const corrected = result.verifiedCitation;
    if (!corrected) return;

    let htmlContent = corrected.replace(/_([^_]+)_/g, '<u>$1</u>');
    htmlContent = htmlContent.replace(/\*([^*]+)\*/g, (_match: string, content: string) => {
      return formatStyle === 'italics' ? `<em>${content}</em>` : `<u>${content}</u>`;
    });
    const plainText = corrected.replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1');

    try {
      const blob = new Blob([`<html><body>${htmlContent}</body></html>`], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob }),
      ]);
    } catch {
      try {
        await navigator.clipboard.writeText(plainText);
      } catch {
        showToast('Could not copy — try selecting manually', 'error');
        return;
      }
    }

    setCopiedCorrectedIdx(idx);
    showToast('Citation copied with formatting', 'success');
    setTimeout(() => setCopiedCorrectedIdx(null), 2000);
  }, [formatStyle, showToast]);

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
    const parts = text.split(/(\*[^*]+\*|_[^_]+_)/);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const content = part.slice(1, -1);
        return formatStyle === 'italics'
          ? <em key={i} className="font-serif">{content}</em>
          : <u key={i}>{content}</u>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        const content = part.slice(1, -1);
        return <u key={i}>{content}</u>;
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

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-semibold text-primary-900 mb-1">In-Text Citation Checker</h2>
        <p className="text-sm text-surface-400 mb-5">
          Paste a paragraph, page, or brief below. We'll find every citation and check each one against Bluebook rules — hover over highlighted citations for instant feedback.
        </p>

        <FileUploader onTextExtracted={handleFileText} compact />

        {/* Show annotated view after analysis, otherwise show textarea */}
        {results.length > 0 ? (
          <>
            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 mt-4">
              <span className="text-xs font-medium text-surface-500">
                {results.length} citation{results.length !== 1 ? 's' : ''} found
              </span>
              {errorCount > 0 && (
                <span className="badge-error">
                  {errorCount} error{errorCount !== 1 ? 's' : ''}
                </span>
              )}
              {warningCount > 0 && (
                <span className="badge-warning">
                  {warningCount} warning{warningCount !== 1 ? 's' : ''}
                </span>
              )}
              {verifiedCount > 0 && (
                <span className="badge-verified">
                  {verifiedCount} verified
                </span>
              )}
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
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onPaste={e => {
                const html = e.clipboardData.getData('text/html');
                if (html) {
                  e.preventDefault();
                  const marked = htmlToMarkedText(html);
                  setInput(marked.trim() || e.clipboardData.getData('text') || '');
                }
              }}
              placeholder={`Paste your legal text here. For example:\n\nThe Supreme Court held in Engel v. Vitale, 370 U.S. 421 (1962), that state-sponsored prayer in public schools violated the Establishment Clause. See also Abington School District v. Schempp, 374 U.S. 203 (1963). Id. at 210.`}
              className="input-field h-48 resize-y mt-4 font-serif"
            />

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
              const isExpanded = expandedIdx === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => { handleCitationClick(i); setExpandedIdx(isExpanded ? null : i); }}
                    onMouseEnter={() => handleCitationMouseEnter(i)}
                    onMouseLeave={handleCitationMouseLeave}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                      selectedIdx === i
                        ? `border-primary-400 bg-primary-50 ring-1 ring-primary-200`
                        : `border-surface-200 hover:border-surface-300 ${hoveredCitation === i ? colors.bg : ''}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                        )}
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          result.issues.filter(iss => iss.severity === 'error').length > 0 ? 'bg-error-500' :
                          result.issues.filter(iss => iss.severity === 'warning').length > 0 ? 'bg-warning-500' :
                          result.verificationStatus === 'verified' ? 'bg-verified-500' : 'bg-surface-300'
                        }`} />
                        <span className="text-xs font-mono truncate text-surface-700">
                          {result.parsed?.rawText || 'Unknown citation'}
                        </span>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${
                        result.score >= 80 ? 'text-verified-600' :
                        result.score >= 50 ? 'text-warning-600' : 'text-error-600'
                      }`}>
                        {result.score}%
                      </span>
                    </div>
                  </button>

                  {/* Inline expansion with corrected citation + short forms */}
                  {isExpanded && (
                    <div className="mt-2 mb-1 space-y-3 bg-surface-50 rounded-xl p-4 border border-surface-200 animate-fade-in">
                      {result.verifiedCitation && (
                        <div className="bg-white rounded-lg border border-verified-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-verified-700 uppercase tracking-wider">Correct Citation</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopyCorrectedInline(result, i); }}
                              className="flex items-center gap-1 text-xs font-medium text-verified-600 hover:text-verified-700 transition-colors"
                            >
                              {copiedCorrectedIdx === i ? (
                                <><Check className="w-3 h-3" /> Copied</>
                              ) : (
                                <><Copy className="w-3 h-3" /> Copy</>
                              )}
                            </button>
                          </div>
                          <div className="font-serif text-sm leading-relaxed">
                            <FormattedCitation text={result.verifiedCitation} formatStyle={formatStyle} />
                          </div>
                        </div>
                      )}

                      {result.shortForms && result.shortForms.length > 0 && (
                        <ShortFormDisplay shortForms={result.shortForms} formatStyle={formatStyle} />
                      )}

                      {result.issues.length > 0 && (
                        <div className="space-y-1.5">
                          {result.issues.slice(0, 3).map((issue, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs">
                              {issue.severity === 'error' ? (
                                <XCircle className="w-3.5 h-3.5 text-error-500 shrink-0 mt-0.5" />
                              ) : issue.severity === 'warning' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-warning-500 shrink-0 mt-0.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-surface-400 shrink-0 mt-0.5" />
                              )}
                              <span className="text-surface-600">{issue.message}</span>
                            </div>
                          ))}
                          {result.issues.length > 3 && (
                            <div className="text-[10px] text-surface-400 ml-5">
                              +{result.issues.length - 3} more issue{result.issues.length - 3 > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
