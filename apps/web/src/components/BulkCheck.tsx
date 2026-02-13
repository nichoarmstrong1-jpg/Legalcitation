import { useState } from 'react';
import { Check, AlertTriangle, XCircle, Circle } from 'lucide-react';
import { analyzeText, type AnalyzedCitation } from '../services/api.ts';
import { FileUploader } from './FileUploader.tsx';
import { ScoreCounter } from './ui/ScoreCounter.tsx';
import { htmlToMarkedText } from '../hooks/useRichPaste.ts';

interface BulkCheckProps {
  onResults: (results: AnalyzedCitation[], input: string) => void;
  onSelectCitation: (citation: AnalyzedCitation) => void;
  results: AnalyzedCitation[];
}

export function BulkCheck({ onResults, onSelectCitation, results }: BulkCheckProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          Paste multiple citations (one per line) or upload a CSV/TXT file.
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
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : 'Check All'}
          </button>
        </div>

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
              {results.map((result, i) => (
                <tr
                  key={i}
                  onClick={() => onSelectCitation(result)}
                  className="border-b border-surface-100 hover:bg-primary-50 cursor-pointer transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="py-3 px-4 text-surface-400 text-xs">{i + 1}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
