import { useState, useRef, useCallback, useEffect } from 'react';
import {
  analyzeSingle,
  type AnalyzedCitation,
  type SingleAnalysisResult,
  type SuggestionResponse,
  type GuidanceResponse,
  isSuggestionResponse,
  isGuidanceResponse,
  isAnalyzedCitation,
} from '../services/api.ts';
import { htmlToMarkedText } from '../hooks/useRichPaste.ts';

interface IndividualCheckerProps {
  onResult: (result: AnalyzedCitation, input: string) => void;
}

export function IndividualChecker({ onResult }: IndividualCheckerProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null);
  const [guidance, setGuidance] = useState<GuidanceResponse | null>(null);
  const [pasteIndicator, setPasteIndicator] = useState(false);
  const pasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current);
    };
  }, []);

  const handleAnalyze = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setSuggestion(null);
    setGuidance(null);

    try {
      const result: SingleAnalysisResult = await analyzeSingle(text);

      if (isSuggestionResponse(result)) {
        setSuggestion(result);
      } else if (isGuidanceResponse(result)) {
        setGuidance(result);
      } else if (isAnalyzedCitation(result)) {
        onResult(result, text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [input, onResult]);

  // Paste-and-Go: auto-analyze after paste with debounce
  // Preserves italic/underline formatting from Word, Google Docs, etc.
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text');

    // If the clipboard has HTML content, convert italic/underline to *markers*
    let textToUse: string;
    if (html) {
      e.preventDefault();
      const marked = htmlToMarkedText(html);
      // Fall back to plain text if HTML conversion produced empty result
      textToUse = marked.trim() ? marked : (plainText || '');
      setInput(textToUse);
    } else {
      textToUse = plainText;
    }

    if (!textToUse.trim()) return;

    // Show paste indicator
    setPasteIndicator(true);

    // Clear any existing timer
    if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current);

    // Auto-analyze after 500ms debounce
    pasteTimerRef.current = setTimeout(() => {
      setPasteIndicator(false);
      // For rich text paste we already set input; for plain text read from textarea
      const currentVal = html ? textToUse : (textareaRef.current?.value || '');
      if (currentVal.trim()) {
        handleAnalyze(currentVal.trim());
      }
    }, 600);
  }, [handleAnalyze]);

  // Handle "Use This" from suggestion card
  const handleUseSuggestion = useCallback(async (suggestedCitation: string) => {
    setInput(suggestedCitation);
    setSuggestion(null);
    setLoading(true);
    setError(null);
    setGuidance(null);

    try {
      const result: SingleAnalysisResult = await analyzeSingle(suggestedCitation);
      if (isAnalyzedCitation(result)) {
        onResult(result, suggestedCitation);
      } else if (isSuggestionResponse(result)) {
        setSuggestion(result);
      } else if (isGuidanceResponse(result)) {
        setGuidance(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  const renderFormattedCitation = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="font-serif">{part.slice(1, -1)}</em>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-semibold text-primary-900 mb-1">Individual Citation Check</h2>
        <p className="text-sm text-surface-400 mb-5">
          Paste a citation to check its Bluebook (21st ed.) compliance. Handles messy input — just paste and go!
        </p>

        {/* Usage Tips */}
        <div className="mb-5 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
          <div className="text-xs font-semibold text-primary-700 mb-2">Accepts any format:</div>
          <ul className="text-xs text-primary-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">&#8250;</span>
              Perfect Bluebook: <span className="font-mono">Brown v. Bd. of Educ., 347 U.S. 483 (1954).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">&#8250;</span>
              Rough input: <span className="font-mono">brown v board of education 347 US 483 1954</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">&#8250;</span>
              Just the case name: <span className="font-mono">roe v wade</span>
            </li>
          </ul>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste a citation — analysis starts automatically..."
            className="input-field h-32 resize-none font-mono"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleAnalyze();
              }
            }}
          />
          {pasteIndicator && (
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-xl animate-pulse">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing pasted text...
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-4">
          <span className="text-xs text-surface-400 text-center sm:text-left">Paste to auto-analyze or press Cmd+Enter</span>
          <button
            onClick={() => handleAnalyze()}
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

      {/* Smart Suggestion Card (Tier 4 response) */}
      {suggestion && (
        <div className="card border-2 border-primary-300 bg-gradient-to-br from-primary-50 to-white shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">&#128270;</span>
            <span className="text-sm font-semibold text-primary-900">{suggestion.message}</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-primary-100 mb-4">
            <div className="font-serif text-sm leading-relaxed">
              {renderFormattedCitation(suggestion.suggestedCitation)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleUseSuggestion(suggestion.suggestedCitation)}
              className="btn-primary flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <>
                  <span>&#10003;</span> Use This Citation
                </>
              )}
            </button>
            <button
              onClick={() => setSuggestion(null)}
              className="btn-secondary text-xs"
            >
              Dismiss
            </button>
          </div>

          {/* Logic trace for suggestion */}
          {suggestion.logicTrace.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-surface-400 cursor-pointer hover:text-surface-600">
                How we found this ({suggestion.logicTrace.length} steps)
              </summary>
              <div className="mt-2 space-y-1.5 ml-1">
                {suggestion.logicTrace.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-surface-500">
                    <span className="text-primary-400 mt-0.5 shrink-0">&#9656;</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Guidance Card (Tier 5 response) */}
      {guidance && (
        <div className="card border border-warning-200 bg-gradient-to-br from-warning-50 to-white animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">&#128161;</span>
            <span className="text-sm font-semibold text-warning-800">{guidance.message}</span>
          </div>

          <p className="text-xs text-surface-500 mb-4">Try one of these formats:</p>
          <div className="space-y-1.5">
            {guidance.examples.map((example, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(example);
                  setGuidance(null);
                  // Auto-analyze the example
                  setTimeout(() => handleAnalyze(example), 100);
                }}
                className="block w-full text-left text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono border border-transparent hover:border-primary-100"
              >
                {example}
              </button>
            ))}
          </div>

          {guidance.logicTrace.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-surface-400 cursor-pointer hover:text-surface-600">
                What we tried ({guidance.logicTrace.length} steps)
              </summary>
              <div className="mt-2 space-y-1.5 ml-1">
                {guidance.logicTrace.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-surface-500">
                    <span className="text-surface-300 mt-0.5 shrink-0">&#9656;</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Quick examples */}
      {!suggestion && !guidance && (
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
                onClick={() => {
                  setInput(example);
                  handleAnalyze(example);
                }}
                className="block w-full text-left text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-4 py-2 rounded-xl transition-all duration-200 font-mono"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
