import { useState, useCallback } from 'react';
import type { AnalyzedCitation } from '../services/api.ts';
import { submitFeedback } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface AnalysisSidebarProps {
  citation: AnalyzedCitation;
  formatStyle: 'italics' | 'underline';
}

export function AnalysisSidebar({ citation, formatStyle }: AnalysisSidebarProps) {
  const { showToast } = useToast();
  const [correctedCopied, setCorrectedCopied] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleFeedback = useCallback(async (rating: number) => {
    setFeedbackRating(rating);
    if (rating <= 2) {
      setShowFeedbackForm(true);
      return;
    }
    try {
      await submitFeedback({
        rating,
        citationText: citation.parsed?.rawText,
      });
      setFeedbackSent(true);
    } catch { /* non-critical */ }
  }, [citation]);

  const submitDetailedFeedback = useCallback(async () => {
    try {
      await submitFeedback({
        rating: feedbackRating!,
        comment: feedbackComment,
        citationText: citation.parsed?.rawText,
        expectedOutput: feedbackComment,
      });
      setFeedbackSent(true);
      setShowFeedbackForm(false);
    } catch { /* non-critical */ }
  }, [feedbackRating, feedbackComment, citation]);

  const buildCorrectedCitation = useCallback((): string => {
    if (citation.verifiedCitation) return citation.verifiedCitation;
    return citation.parsed?.rawText || '';
  }, [citation]);

  const handleCopyCorrected = useCallback(async () => {
    const corrected = buildCorrectedCitation();
    if (!corrected) return;

    const htmlContent = corrected.replace(/\*([^*]+)\*/g, (_match, content) => {
      return formatStyle === 'italics' ? `<em>${content}</em>` : `<u>${content}</u>`;
    });

    const plainText = corrected.replace(/\*([^*]+)\*/g, '$1');

    try {
      const blob = new Blob([`<html><body>${htmlContent}</body></html>`], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': textBlob,
        }),
      ]);
    } catch {
      try {
        await navigator.clipboard.writeText(plainText);
      } catch {
        showToast('Could not copy — try selecting and copying manually', 'error');
        return;
      }
    }

    setCorrectedCopied(true);
    showToast('Citation copied with formatting', 'success');
    setTimeout(() => setCorrectedCopied(false), 2000);
  }, [buildCorrectedCitation, formatStyle, showToast]);

  const statusConfig = {
    verified: { label: 'Verified against Bluebook 21st Ed.', color: 'text-verified-700 bg-verified-50 border-verified-200' },
    partial_match: { label: 'Partially verified against Bluebook 21st Ed.', color: 'text-warning-700 bg-warning-50 border-warning-200' },
    not_found: { label: 'Case not found in records', color: 'text-error-700 bg-error-50 border-error-200' },
    pending: { label: 'Format checked against Bluebook 21st Ed.', color: 'text-surface-600 bg-surface-50 border-surface-200' },
    error: { label: 'Verification unavailable', color: 'text-surface-600 bg-surface-50 border-surface-200' },
  };

  const status = statusConfig[citation.verificationStatus as keyof typeof statusConfig] || statusConfig.pending;

  const renderFormattedCitation = (text: string) => {
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

  // Filter out raw HTTP/technical details
  const cleanTrace = citation.logicTrace.filter(step =>
    !step.includes('http://') &&
    !step.includes('https://') &&
    !step.match(/\b(403|401|500)\b.*error/i) &&
    !step.includes('ANTHROPIC_API_KEY') &&
    !step.includes('API_KEY')
  );

  const correctedText = buildCorrectedCitation();

  return (
    <div className="space-y-4">
      {/* Corrected Citation — Primary Result */}
      {correctedText && (
        <div className="card border-2 border-verified-200 bg-gradient-to-br from-verified-50 to-white shadow-glow-green animate-result-reveal">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-verified-700 uppercase tracking-wider">Correct Citation</span>
          </div>
          <div className="font-serif text-sm leading-relaxed p-4 bg-white rounded-xl border border-verified-100">
            {renderFormattedCitation(correctedText)}
          </div>

          <button
            onClick={handleCopyCorrected}
            className={`w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
              correctedCopied
                ? 'bg-verified-500 text-white shadow-glow-green'
                : 'bg-verified-600 text-white hover:bg-verified-700 shadow-md hover:shadow-lg'
            }`}
          >
            {correctedCopied ? (
              <>
                <span>{'\u2713'}</span>
                Copied with Formatting!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Citation
              </>
            )}
          </button>
          <div className="text-[10px] text-surface-400 mt-2 text-center">
            {formatStyle === 'italics' ? 'Italic' : 'Underline'} formatting &middot; Pastes into Word & Google Docs
          </div>
        </div>
      )}

      {/* Verification Badge */}
      <div className="flex items-center gap-2 px-1">
        <svg className="w-4 h-4 text-verified-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Verification Steps (collapsible) */}
      {cleanTrace.length > 0 && (
        <div className="card">
          <details>
            <summary className="text-xs font-semibold text-surface-500 cursor-pointer hover:text-surface-700 transition-colors flex items-center gap-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Bluebook rules consulted ({cleanTrace.length} steps)
            </summary>
            <div className="mt-3 space-y-2 ml-1">
              {cleanTrace.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="mt-0.5 shrink-0">
                    {step.includes('verified') || step.includes('Verified') || step.includes('accurate') || step.includes('correct') || step.includes('confirmed') ? (
                      <span className="text-verified-500 font-bold">{'\u2713'}</span>
                    ) : step.includes('issue') || step.includes('could not') || step.includes('discrepan') || step.includes('correction') ? (
                      <span className="text-warning-500">{'\u26A0'}</span>
                    ) : (
                      <span className="text-surface-300">{'\u25B8'}</span>
                    )}
                  </div>
                  <span className={`leading-relaxed ${
                    step.includes('verified') || step.includes('Verified') || step.includes('accurate') || step.includes('confirmed')
                      ? 'text-verified-700 font-medium'
                      : step.includes('issue') || step.includes('could not') || step.includes('correction')
                      ? 'text-warning-700'
                      : 'text-surface-600'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Feedback */}
      <div className="card">
        {feedbackSent ? (
          <div className="text-center py-2">
            <span className="text-verified-600 font-medium text-sm">{'\u2713'} Thanks for your feedback!</span>
          </div>
        ) : showFeedbackForm ? (
          <div>
            <p className="text-sm font-medium text-primary-900 mb-2">What would you expect?</p>
            <textarea
              value={feedbackComment}
              onChange={e => setFeedbackComment(e.target.value)}
              placeholder="Describe what the correct result should be..."
              className="input-field h-20 resize-none text-xs"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => { setShowFeedbackForm(false); setFeedbackRating(null); }} className="btn-secondary text-xs px-3 py-1.5">
                Cancel
              </button>
              <button onClick={submitDetailedFeedback} disabled={!feedbackComment.trim()} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400">Was this helpful?</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleFeedback(5)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  feedbackRating === 5 ? 'bg-verified-100 text-verified-600' : 'hover:bg-surface-100 text-surface-400'
                }`}
                title="Helpful"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              </button>
              <button
                onClick={() => handleFeedback(1)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  feedbackRating === 1 ? 'bg-error-100 text-error-600' : 'hover:bg-surface-100 text-surface-400'
                }`}
                title="Not helpful"
              >
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
