import { useState, useRef, useCallback } from 'react';
import { analyzeText, type AnalyzedCitation } from '../services/api.ts';
import { FileUploader } from './FileUploader.tsx';
import { htmlToMarkedText } from '../hooks/useRichPaste.ts';

interface InTextCheckerProps {
  onResults: (results: AnalyzedCitation[], input: string) => void;
  onSelectCitation: (citation: AnalyzedCitation) => void;
  results: AnalyzedCitation[];
}

export function InTextChecker({ onResults, onSelectCitation, results }: InTextCheckerProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCitation, setHoveredCitation] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const annotatedRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedIdx(null);

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
    setSelectedIdx(idx);
    onSelectCitation(results[idx]);
  }, [results, onSelectCitation]);

  const getSeverityColor = (result: AnalyzedCitation) => {
    const errors = result.issues.filter(i => i.severity === 'error').length;
    const warnings = result.issues.filter(i => i.severity === 'warning').length;
    if (errors > 0) return { underline: 'border-error-400', bg: 'bg-error-50/70', hover: 'bg-error-100' };
    if (warnings > 0) return { underline: 'border-warning-400', bg: 'bg-warning-50/70', hover: 'bg-warning-100' };
    if (result.verificationStatus === 'verified') return { underline: 'border-verified-400', bg: 'bg-verified-50/70', hover: 'bg-verified-100' };
    return { underline: 'border-primary-400', bg: 'bg-primary-50/70', hover: 'bg-primary-100' };
  };

  // Build annotated text with inline highlights (Grammarly-style)
  const renderAnnotatedText = () => {
    if (results.length === 0 || !input) return null;

    // Use trimmed text for slicing — positions from the API are relative to trimmed input
    const trimmedInput = input.trim();
    const segments: Array<{ text: string; citationIdx?: number }> = [];
    let lastEnd = 0;

    // Sort results by position
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
              onMouseEnter={() => setHoveredCitation(seg.citationIdx!)}
              onMouseLeave={() => setHoveredCitation(null)}
              onClick={() => handleCitationClick(seg.citationIdx!)}
            >
              {seg.text}
              {/* Inline tooltip popover */}
              {isHovered && (
                <span className="absolute z-20 left-0 bottom-full mb-2 w-72 p-4 bg-white rounded-2xl shadow-modal border border-surface-200 text-left pointer-events-none">
                  <span className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${
                      result.issues.filter(i => i.severity === 'error').length > 0
                        ? 'bg-error-100 text-error-700'
                        : result.verificationStatus === 'verified'
                        ? 'bg-verified-100 text-verified-700'
                        : 'bg-warning-100 text-warning-700'
                    }`}>
                      {result.issues.filter(i => i.severity === 'error').length > 0
                        ? `${result.issues.filter(i => i.severity === 'error').length} Error${result.issues.filter(i => i.severity === 'error').length !== 1 ? 's' : ''}`
                        : result.verificationStatus === 'verified'
                        ? 'Verified'
                        : 'Needs Review'}
                    </span>
                    <span className={`text-xs font-bold ${
                      result.score >= 80 ? 'text-verified-600' :
                      result.score >= 50 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {result.score}%
                    </span>
                  </span>
                  {result.issues.length > 0 && (
                    <span className="block text-xs text-surface-600 leading-relaxed">
                      {result.issues[0].message}
                      {result.issues.length > 1 && (
                        <span className="text-surface-400"> (+{result.issues.length - 1} more)</span>
                      )}
                    </span>
                  )}
                  {result.verifiedCitation && (
                    <span className="block text-xs text-verified-700 mt-2 font-serif italic">
                      {result.verifiedCitation.replace(/\*/g, '')}
                    </span>
                  )}
                  <span className="block text-[10px] text-surface-400 mt-1.5">Click for details</span>
                </span>
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
          Paste legal text to check all citations in context — hover over highlighted citations for instant feedback.
        </p>

        <FileUploader onTextExtracted={handleFileText} compact />

        {/* Show annotated view after analysis, otherwise show textarea */}
        {results.length > 0 ? (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-3 mb-4 mt-4">
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
                onClick={() => { onResults([], ''); setInput(''); setSelectedIdx(null); }}
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
                  setInput(htmlToMarkedText(html));
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
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : 'Check All Citations'}
              </button>
            </div>
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
              return (
                <button
                  key={i}
                  onClick={() => handleCitationClick(i)}
                  onMouseEnter={() => setHoveredCitation(i)}
                  onMouseLeave={() => setHoveredCitation(null)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedIdx === i
                      ? `border-primary-400 bg-primary-50 ring-1 ring-primary-200`
                      : `border-surface-200 hover:border-surface-300 ${hoveredCitation === i ? colors.bg : ''}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        result.issues.filter(i => i.severity === 'error').length > 0 ? 'bg-error-500' :
                        result.issues.filter(i => i.severity === 'warning').length > 0 ? 'bg-warning-500' :
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
