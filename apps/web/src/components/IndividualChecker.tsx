import { useState } from 'react';
import { analyzeSingle, type AnalyzedCitation } from '../services/api.ts';

interface IndividualCheckerProps {
  onResult: (result: AnalyzedCitation, input: string) => void;
}

export function IndividualChecker({ onResult }: IndividualCheckerProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeSingle(input.trim());
      onResult(result, input.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-semibold text-primary-900 mb-1">Individual Citation Check</h2>
        <p className="text-sm text-surface-400 mb-5">
          Paste a single citation to check its Bluebook (21st ed.) compliance and verify it against case law records.
        </p>

        {/* Usage Tips */}
        <div className="mb-5 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
          <div className="text-xs font-semibold text-primary-700 mb-2">For best results:</div>
          <ul className="text-xs text-primary-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">&#8250;</span>
              Include the full citation with reporter, volume, page, and year
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">&#8250;</span>
              Include the trailing period for citation sentences
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">&#8250;</span>
              Works with cases, statutes (U.S.C.), constitutions, and regulations (C.F.R.)
            </li>
          </ul>
        </div>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g., Brown v. Board of Education, 347 U.S. 483 (1954)."
          className="input-field h-32 resize-none font-mono"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleAnalyze();
            }
          }}
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-surface-400">Press Cmd+Enter to analyze</span>
          <button
            onClick={handleAnalyze}
            disabled={!input.trim() || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </span>
            ) : 'Check Citation'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-error-50 border border-error-100 rounded-2xl text-sm text-error-700">
            {error}
          </div>
        )}
      </div>

      {/* Quick examples */}
      <div className="card">
        <h3 className="text-sm font-medium text-surface-500 mb-3">Try an example:</h3>
        <div className="space-y-1">
          {[
            'Engel v. Vitale, 370 U.S. 421, 430 (1962).',
            'Baker v. Carr, 369 U.S. 186, 195 (1962).',
            'Marbury v. Madison, 5 U.S. 137 (1803).',
          ].map(example => (
            <button
              key={example}
              onClick={() => setInput(example)}
              className="block w-full text-left text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-4 py-2 rounded-xl transition-all duration-200 font-mono"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
