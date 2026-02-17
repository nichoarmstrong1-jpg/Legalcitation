import { useState, Fragment } from 'react';
import { Check, AlertTriangle, XCircle, Circle, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { analyzeText, type AnalyzedCitation } from '../services/api.ts';
import { FileUploader } from './FileUploader.tsx';
import { ScoreCounter } from './ui/ScoreCounter.tsx';
import { AnalysisProgressBar } from './ui/AnalysisProgressBar.tsx';
import { htmlToMarkedText } from '../hooks/useRichPaste.ts';
import { FormattedCitation } from './FormattedCitation.tsx';
import { ShortFormDisplay } from './ShortFormDisplay.tsx';

interface BulkCheckProps {
  onResults: (results: AnalyzedCitation[], input: string) => void;
  onSelectCitation: (citation: AnalyzedCitation) => void;
  results: AnalyzedCitation[];
  formatStyle?: 'italics' | 'underline';
}

export function BulkCheck({ onResults, onSelectCitation, results, formatStyle = 'italics' }: BulkCheckProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [copiedCorrectedIdx, setCopiedCorrectedIdx] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await analyzeText(input.trim());
      onResults(data.results, input.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk check failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileText = (text: string, _fileName: string) => {
    setInput(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <Check className="w-4 h-4 text-verified-500" />;
      case 'partial_match': return <AlertTriangle className="w-4 h-4 text-warning-500" />;
      case 'not_found': return <XCircle className="w-4 h-4 text-error-500" />;
      default: return <Circle className="w-4 h-4 text-surface-400" />;
    }
  };

  const handleCopyCorrectedInline = (text: string, idx: number) => {
    const plainText = text.replace(/\*/g, '');
    const htmlText = text.replace(/\*([^*]+)\*/g, (_m, inner) =>
      formatStyle === 'underline' ? `<u>${inner}</u>` : `<i>${inner}</i>`
    );
    navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
        'text/html': new Blob([htmlText], { type: 'text/html' }),
      }),
    ]).then(() => {
      setCopiedCorrectedIdx(idx);
      setTimeout(() => setCopiedCorrectedIdx(null), 2000);
    });
  };

  const stats = {
    total: results.length,
    verified: results.filter(r => r.verificationStatus === 'verified').length,
    warnings: results.filter(r => r.issues.some(i => i.severity === 'warning')).length,
    errors: results.filter(r => r.issues.some(i => i.severity === 'error')).length,
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-semibold text-primary-900 mb-1">Bulk Check</h2>
        <p className="text-sm text-surface-400 mb-5">
          Paste a list of individual citations (one per line) to validate each against the Bluebook. You can also upload a CSV or TXT file for batch processing.
        </p>

        <FileUploader onTextExtracted={handleFileText} />

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
          placeholder={`Paste citations, one per line:\n\nBrown v. Board of Education, 347 U.S. 483 (1954).\nRoe v. Wade, 410 U.S. 113 (1973).\nMarbury v. Madison, 5 U.S. 137 (1803).`}
          className="input-field h-40 resize-y mt-4 font-mono"
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
                Processing...
              </span>
            ) : 'Check All'}
          </button>
        </div>

        {loading && <AnalysisProgressBar />}

        {error && (
          <div className="mt-4 p-4 bg-error-50 border border-error-100 rounded-2xl text-sm text-error-700">
            {error}
          </div>
        )}
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card text-center py-5">
            <ScoreCounter value={stats.total} className="text-3xl font-bold text-primary-900" />
            <div className="text-xs text-surface-400 mt-1 font-medium">Total</div>
          </div>
          <div className="card text-center py-5">
            <ScoreCounter value={stats.verified} className="text-3xl font-bold text-verified-600" />
            <div className="text-xs text-surface-400 mt-1 font-medium">Verified</div>
          </div>
          <div className="card text-center py-5">
            <ScoreCounter value={stats.warnings} className="text-3xl font-bold text-warning-600" />
            <div className="text-xs text-surface-400 mt-1 font-medium">Warnings</div>
          </div>
          <div className="card text-center py-5">
            <ScoreCounter value={stats.errors} className="text-3xl font-bold text-error-600" />
            <div className="text-xs text-surface-400 mt-1 font-medium">Errors</div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left py-3 px-4 text-surface-500 font-medium text-xs w-8">#</th>
                <th className="text-left py-3 px-4 text-surface-500 font-medium text-xs">Citation</th>
                <th className="text-center py-3 px-4 text-surface-500 font-medium text-xs w-20">Status</th>
                <th className="text-center py-3 px-4 text-surface-500 font-medium text-xs w-16">Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, i) => {
                const isExpanded = expandedIdx === i;
                return (
                  <Fragment key={i}>
                    <tr
                      onClick={() => {
                        setExpandedIdx(isExpanded ? null : i);
                        onSelectCitation(result);
                      }}
                      className={`border-b border-surface-100 hover:bg-primary-50 cursor-pointer transition-all duration-200 animate-fade-in ${isExpanded ? 'bg-primary-50' : ''}`}
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="py-3 px-4 text-surface-400 text-xs">
                        <span className="flex items-center gap-1">
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs truncate max-w-md text-surface-700">
                        {result.parsed?.rawText || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusIcon(result.verificationStatus)}</td>
                      <td className={`py-3 px-4 text-center font-bold text-xs ${
                        result.score >= 80 ? 'text-verified-600' :
                        result.score >= 50 ? 'text-warning-600' : 'text-error-600'
                      }`}>
                        {result.score}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="animate-fade-in">
                        <td colSpan={4} className="p-0">
                          <div className="mx-4 my-3 space-y-3 bg-surface-50 rounded-xl p-4 border border-surface-200">
                            {result.verifiedCitation && (
                              <div className="bg-white rounded-lg border border-verified-200 p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold text-verified-700 uppercase tracking-wider">Correct Citation</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCopyCorrectedInline(result.verifiedCitation!, i); }}
                                    className="flex items-center gap-1 text-[10px] font-medium text-surface-500 hover:text-primary-600 transition-colors"
                                  >
                                    {copiedCorrectedIdx === i ? <Check className="w-3 h-3 text-verified-500" /> : <Copy className="w-3 h-3" />}
                                    {copiedCorrectedIdx === i ? 'Copied' : 'Copy'}
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
                                <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Issues</span>
                                {result.issues.slice(0, 3).map((issue, j) => (
                                  <div key={j} className="flex items-start gap-2 text-xs">
                                    {issue.severity === 'error' ? (
                                      <XCircle className="w-3 h-3 text-error-500 mt-0.5 shrink-0" />
                                    ) : (
                                      <AlertTriangle className="w-3 h-3 text-warning-500 mt-0.5 shrink-0" />
                                    )}
                                    <span className="text-surface-600">{issue.message}</span>
                                  </div>
                                ))}
                                {result.issues.length > 3 && (
                                  <span className="text-[10px] text-surface-400">+{result.issues.length - 3} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
