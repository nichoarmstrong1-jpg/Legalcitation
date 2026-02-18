import { useState, useRef, useCallback, useEffect } from 'react';
import { Copy, Check, AlertTriangle, XCircle, ChevronDown, ChevronRight, FileCheck, Undo2, CheckCheck, X, Link2, AlertOctagon } from 'lucide-react';
import { analyzeText, analyzeFootnotes, type AnalyzedCitation, type FootnoteAnalyzeResponse, type DocumentIntegrityReport } from '../services/api.ts';
import { FileUploader } from './FileUploader.tsx';
import { AnalysisProgressBar } from './ui/AnalysisProgressBar.tsx';
import { CitationTooltip } from './CitationTooltip.tsx';
import { FormattedCitation } from './FormattedCitation.tsx';
import { ShortFormDisplay } from './ShortFormDisplay.tsx';
import { htmlToMarkedText } from '../hooks/useRichPaste.ts';
import { useToast } from '../context/ToastContext.tsx';

type FormatStyle = 'italics' | 'underline';
type AnalysisMode = 'in_text' | 'footnotes';

interface FootnoteSummary {
  number: number;
  citationCount: number;
  citationIds: string[];
}

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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{ type: 'accept' | 'deny'; citationIdx: number; prevAccepted: Set<number>; prevDenied: Set<number> }>>([]);
  const [mode, setMode] = useState<AnalysisMode>('in_text');
  const [footnoteSummary, setFootnoteSummary] = useState<FootnoteSummary[]>([]);
  const [integrityReport, setIntegrityReport] = useState<DocumentIntegrityReport | null>(null);
  const [integrityExpanded, setIntegrityExpanded] = useState(false);
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
    setIntegrityReport(null);
    setFootnoteSummary([]);

    try {
      if (mode === 'footnotes') {
        const data = await analyzeFootnotes(input.trim()) as FootnoteAnalyzeResponse;
        onResults(data.results, input.trim());
        setFootnoteSummary(data.footnotes);
        setIntegrityReport(data.integrityReport);
      } else {
        const data = await analyzeText(input.trim());
        onResults(data.results, input.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileText = async (text: string, fileName: string) => {
    setUploadedFileName(fileName);
    setInput(text);
    setLoading(true);
    setError(null);
    setSelectedIdx(null);
    setAcceptedChanges(new Set());
    setDeniedChanges(new Set());
    setIntegrityReport(null);
    setFootnoteSummary([]);

    try {
      if (mode === 'footnotes') {
        const data = await analyzeFootnotes(text.trim()) as FootnoteAnalyzeResponse;
        onResults(data.results, text.trim());
        setFootnoteSummary(data.footnotes);
        setIntegrityReport(data.integrityReport);
      } else {
        const data = await analyzeText(text.trim());
        onResults(data.results, text.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCitationClick = useCallback((idx: number) => {
    setSelectedIdx(prev => prev === idx ? null : idx);
    onSelectCitation(results[idx]);
  }, [results, onSelectCitation]);

  const handleAcceptChange = useCallback((idx: number) => {
    const result = results[idx];
    if (!result.verifiedCitation) return;
    setUndoStack(prev => [...prev, { type: 'accept', citationIdx: idx, prevAccepted: new Set(acceptedChanges), prevDenied: new Set(deniedChanges) }]);
    setAcceptedChanges(prev => new Set(prev).add(idx));
    setDeniedChanges(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
    showToast('Citation corrected', 'success');
  }, [results, showToast, acceptedChanges, deniedChanges]);

  const handleDenyChange = useCallback((idx: number) => {
    setUndoStack(prev => [...prev, { type: 'deny', citationIdx: idx, prevAccepted: new Set(acceptedChanges), prevDenied: new Set(deniedChanges) }]);
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
  }, [deniedChanges, acceptedChanges]);

  const handleUndo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setAcceptedChanges(last.prevAccepted);
      setDeniedChanges(last.prevDenied);
      showToast('Change undone', 'info');
      return prev.slice(0, -1);
    });
  }, [showToast]);

  const handleAcceptAll = useCallback(() => {
    const correctable = results
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.verifiedCitation && r.issues.some(iss => iss.severity === 'error' || iss.severity === 'warning'));
    if (correctable.length === 0) return;
    setUndoStack(prev => [...prev, { type: 'accept', citationIdx: -1, prevAccepted: new Set(acceptedChanges), prevDenied: new Set(deniedChanges) }]);
    setAcceptedChanges(new Set(correctable.map(({ i }) => i)));
    setDeniedChanges(new Set());
    showToast(`${correctable.length} correction${correctable.length !== 1 ? 's' : ''} accepted`, 'success');
  }, [results, acceptedChanges, deniedChanges, showToast]);

  const handleDismissAll = useCallback(() => {
    setUndoStack(prev => [...prev, { type: 'deny', citationIdx: -1, prevAccepted: new Set(acceptedChanges), prevDenied: new Set(deniedChanges) }]);
    setDeniedChanges(new Set(results.map((_, i) => i)));
    setAcceptedChanges(new Set());
    showToast('All changes dismissed', 'info');
  }, [results, acceptedChanges, deniedChanges, showToast]);

  const handleCopyAllCorrected = useCallback(async () => {
    const trimmedInput = input.trim();
    let correctedText = trimmedInput;
    const sorted = results
      .map((r, i) => ({ result: r, idx: i }))
      .filter(r => r.result.parsed?.position && acceptedChanges.has(r.idx) && r.result.verifiedCitation)
      .sort((a, b) => (b.result.parsed.position.start) - (a.result.parsed.position.start));

    for (const { result } of sorted) {
      const pos = result.parsed?.position;
      if (!pos || !result.verifiedCitation) continue;
      const plain = result.verifiedCitation.replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1');
      correctedText = correctedText.slice(0, pos.start) + plain + correctedText.slice(pos.end);
    }

    try {
      await navigator.clipboard.writeText(correctedText);
      showToast('Corrected text copied to clipboard', 'success');
    } catch {
      showToast('Could not copy — try selecting manually', 'error');
    }
  }, [input, results, acceptedChanges, showToast]);

  // Keyboard shortcut: Ctrl/Cmd+Z for undo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && undoStack.length > 0 && results.length > 0) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, undoStack.length, results.length]);

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
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-primary-900">Citation Checker</h2>
          <div className="flex rounded-lg border border-surface-200 overflow-hidden">
            <button
              onClick={() => { setMode('in_text'); }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'in_text'
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-surface-400 hover:text-surface-600 hover:bg-surface-50'
              }`}
            >
              In-Text
            </button>
            <button
              onClick={() => { setMode('footnotes'); }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-surface-200 ${
                mode === 'footnotes'
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-surface-400 hover:text-surface-600 hover:bg-surface-50'
              }`}
            >
              Footnotes
            </button>
          </div>
        </div>
        <p className="text-sm text-surface-400 mb-5">
          {mode === 'footnotes'
            ? 'Paste footnotes below (numbered 1, 2, 3...). We\'ll parse footnote boundaries, validate cross-references (Id., supra, infra), and check citation ordering within each footnote.'
            : 'Paste a paragraph, page, or brief below. We\'ll find every citation and check each one against Bluebook rules — hover over highlighted citations for instant feedback.'}
        </p>

        <FileUploader onTextExtracted={handleFileText} compact />

        {/* Uploaded file badge */}
        {uploadedFileName && loading && (
          <div className="mt-3 flex items-center gap-2 p-2.5 bg-primary-50 border border-primary-100 rounded-xl">
            <FileCheck className="w-4 h-4 text-primary-600 shrink-0" />
            <span className="text-xs text-primary-800 font-medium truncate">{uploadedFileName}</span>
            <span className="text-[11px] text-primary-500">analyzing...</span>
          </div>
        )}
        {uploadedFileName && results.length > 0 && !loading && (
          <div className="mt-3 flex items-center gap-2 p-2.5 bg-verified-50 border border-verified-100 rounded-xl">
            <FileCheck className="w-4 h-4 text-verified-600 shrink-0" />
            <span className="text-xs text-verified-800 font-medium truncate">{uploadedFileName}</span>
            <span className="text-[11px] text-verified-500">analyzed</span>
          </div>
        )}

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
            {/* Action buttons toolbar */}
            {results.some(r => r.verifiedCitation) && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex items-center gap-1.5 text-xs font-medium text-verified-700 bg-verified-50 hover:bg-verified-100 border border-verified-200 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Accept All
                </button>
                <button
                  onClick={handleDismissAll}
                  className="flex items-center gap-1.5 text-xs font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Dismiss All
                </button>
                {acceptedChanges.size > 0 && (
                  <button
                    onClick={handleCopyAllCorrected}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy All Corrected
                  </button>
                )}
                {undoStack.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 transition-colors ml-auto"
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    Undo
                  </button>
                )}
              </div>
            )}

            {/* Footnote summary & integrity report (footnote mode only) */}
            {mode === 'footnotes' && footnoteSummary.length > 0 && (
              <div className="mb-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {footnoteSummary.map(fn => {
                    const fnCitations = results.filter(r => r.parsed?.footnoteContext?.footnoteNumber === fn.number);
                    const fnErrors = fnCitations.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'error').length, 0);
                    return (
                      <span
                        key={fn.number}
                        className={`text-[11px] font-medium px-2 py-1 rounded-md border ${
                          fnErrors > 0
                            ? 'bg-error-50 border-error-200 text-error-700'
                            : 'bg-surface-50 border-surface-200 text-surface-600'
                        }`}
                      >
                        FN {fn.number}: {fn.citationCount} cit.{fnErrors > 0 ? `, ${fnErrors} err` : ''}
                      </span>
                    );
                  })}
                </div>

                {integrityReport && integrityReport.crossReferenceIssues.length > 0 && (
                  <div className="rounded-xl border border-warning-200 bg-warning-50/50">
                    <button
                      onClick={() => setIntegrityExpanded(!integrityExpanded)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-warning-600" />
                        <span className="text-xs font-semibold text-warning-800">
                          Document Integrity Report
                        </span>
                        <span className="text-[11px] text-warning-600">
                          {integrityReport.crossReferenceIssues.length} cross-reference issue{integrityReport.crossReferenceIssues.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {integrityExpanded
                        ? <ChevronDown className="w-4 h-4 text-warning-500" />
                        : <ChevronRight className="w-4 h-4 text-warning-500" />}
                    </button>
                    {integrityExpanded && (
                      <div className="px-3 pb-3 space-y-2">
                        {integrityReport.crossReferenceIssues.map((issue, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs p-2 bg-white rounded-lg border border-warning-100">
                            <AlertOctagon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                              issue.severity === 'error' ? 'text-error-500' : 'text-warning-500'
                            }`} />
                            <div>
                              <p className="text-surface-700">{issue.message}</p>
                              <p className="text-surface-400 mt-0.5">{issue.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {integrityReport && integrityReport.crossReferenceIssues.length === 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-verified-200 bg-verified-50/50">
                    <Check className="w-4 h-4 text-verified-600" />
                    <span className="text-xs font-medium text-verified-700">
                      All cross-references validated — no broken Id., supra, or infra chains found.
                    </span>
                  </div>
                )}
              </div>
            )}

            {renderAnnotatedText()}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => { onResults([], ''); setInput(''); setSelectedIdx(null); setAcceptedChanges(new Set()); setDeniedChanges(new Set()); setUploadedFileName(null); setFootnoteSummary([]); setIntegrityReport(null); }}
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
              placeholder={mode === 'footnotes'
                ? `Paste your footnotes here. For example:\n\n1. Brown v. Bd. of Educ., 347 U.S. 483 (1954).\n2. Id. at 490.\n3. See Plessy v. Ferguson, 163 U.S. 537 (1896); Brown, 347 U.S. at 495.\n4. Id. at 500.`
                : `Paste your legal text here. For example:\n\nThe Supreme Court held in Engel v. Vitale, 370 U.S. 421 (1962), that state-sponsored prayer in public schools violated the Establishment Clause. See also Abington School District v. Schempp, 374 U.S. 203 (1963). Id. at 210.`}
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
