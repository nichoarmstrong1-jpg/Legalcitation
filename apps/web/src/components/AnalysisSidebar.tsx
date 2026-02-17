import { useState, useCallback } from 'react';
import { Copy, ShieldCheck, ThumbsUp, ThumbsDown, Check, AlertTriangle, Info } from 'lucide-react';
import type { AnalyzedCitation } from '../services/api.ts';
import { submitFeedback } from '../services/api.ts';
import { ShortFormDisplay } from './ShortFormDisplay.tsx';
import { CitationBreakdown } from './CitationBreakdown.tsx';
import { FormattedCitation } from './FormattedCitation.tsx';
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

    let htmlContent = corrected.replace(/_([^_]+)_/g, '<u>$1</u>');
    htmlContent = htmlContent.replace(/\*([^*]+)\*/g, (_match, content) => {
      return formatStyle === 'italics' ? `<em>${content}</em>` : `<u>${content}</u>`;
    });

    const plainText = corrected.replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1');

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
    return <FormattedCitation text={text} formatStyle={formatStyle} />;
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
                <Check className="w-4 h-4" />
                Copied with Formatting!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Citation
              </>
            )}
          </button>
          <div className="text-[10px] text-surface-400 mt-2 text-center">
            {formatStyle === 'italics' ? 'Italic' : 'Underline'} formatting &middot; Pastes into Word & Google Docs
          </div>

          {/* Article pinpoint page warning */}
          {citation.parsed?.type === 'article' && citation.parsed.components?.pinCite && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2 bg-warning-50 border border-warning-200 rounded-lg">
              <Info className="w-3.5 h-3.5 text-warning-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-warning-700 leading-relaxed">
                Pinpoint pages were extracted from the source. Verify these are the pages you intend to cite.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Short Form Citations */}
      {citation.shortForms && citation.shortForms.length > 0 && (
        <ShortFormDisplay
          shortForms={citation.shortForms}
          formatStyle={formatStyle}
          suggestions={citation.shortFormSuggestions}
        />
      )}

      {/* Antecedent / Context Info */}
      {citation.issues.some(iss => iss.antecedentText) && (
        <div className="card border border-primary-100 bg-primary-50/50">
          <div className="text-[10px] font-bold text-primary-700 uppercase tracking-wider mb-2">Citation Context</div>
          {citation.issues
            .filter(iss => iss.antecedentText)
            .slice(0, 3)
            .map((iss, i) => (
              <div key={iss.id || i} className="text-xs text-surface-600 mb-1.5 last:mb-0">
                <span className="text-primary-600 font-medium">
                  References #{(iss.antecedentIndex ?? 0) + 1}:
                </span>{' '}
                <span className="font-serif">
                  {iss.antecedentText!.slice(0, 100)}
                  {iss.antecedentText!.length > 100 ? '...' : ''}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Citation Component Breakdown */}
      <CitationBreakdown citation={citation} formatStyle={formatStyle} />

      {/* Verification Badge */}
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck className="w-4 h-4 text-verified-500 shrink-0" />
        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${status.color}`}>
          {status.label}
        </span>
      </div>
      <p className="text-[10px] text-surface-400 px-1 leading-relaxed">
        AI-powered verification. Always confirm with your research platform.
      </p>

      {/* Pinpoint Match Result */}
      {citation.pinpointMatch && (
        <div className={`card border ${citation.pinpointMatch.matched ? 'border-verified-200 bg-verified-50' : 'border-warning-200 bg-warning-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {citation.pinpointMatch.matched ? (
              <Check className="w-4 h-4 text-verified-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-warning-600" />
            )}
            <span className={`text-xs font-semibold ${citation.pinpointMatch.matched ? 'text-verified-700' : 'text-warning-700'}`}>
              {citation.pinpointMatch.matched ? 'Source Page Verified' : 'Source Page Not Found'}
            </span>
          </div>
          <p className="text-xs text-surface-600 mb-1">
            Checked against: {citation.pinpointMatch.documentName}
          </p>
          {citation.pinpointMatch.pages.map((page, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-surface-500 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${page.found ? 'bg-verified-500' : 'bg-warning-500'}`} />
              Page {page.pageNumber}: {page.found ? 'Found' : 'Not found'}
              {page.textSnippet && (
                <span className="text-surface-400 truncate max-w-[180px]" title={page.textSnippet}>
                  — {page.textSnippet}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Verification Steps (collapsible) */}
      {cleanTrace.length > 0 && (() => {
        const isRuleStep = (step: string) =>
          /[RBT]\.\s*[\d]/.test(step) ||
          /verified|accurate|correct|confirmed|abbreviat|format|court|reporter|case name|year|page|pinpoint|italic|underlin|spacing|signal/i.test(step);

        const ruleSteps = cleanTrace.filter(isRuleStep);
        const processSteps = cleanTrace.filter(step => !isRuleStep(step));

        return (
          <>
            {ruleSteps.length > 0 && (
              <div className="card">
                <details open>
                  <summary className="text-xs font-semibold text-surface-500 cursor-pointer hover:text-surface-700 transition-colors">
                    Bluebook rules consulted ({ruleSteps.length} steps)
                  </summary>
                  <div className="flex items-center gap-3 mt-2 mb-3 text-[10px] text-surface-400">
                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-verified-500" /> Verified</span>
                    <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning-500" /> Needs attention</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-surface-300 inline-block" /> Informational</span>
                  </div>
                  <div className="space-y-2 ml-1">
                    {ruleSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="mt-1 shrink-0">
                          {step.includes('verified') || step.includes('Verified') || step.includes('accurate') || step.includes('correct') || step.includes('confirmed') ? (
                            <Check className="w-3.5 h-3.5 text-verified-500" />
                          ) : step.includes('issue') || step.includes('could not') || step.includes('discrepan') || step.includes('correction') ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-surface-300 inline-block mt-0.5" />
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

            {processSteps.length > 0 && (
              <div className="card">
                <details>
                  <summary className="text-xs font-medium text-surface-400 cursor-pointer hover:text-surface-600 transition-colors">
                    Process details ({processSteps.length} steps)
                  </summary>
                  <div className="mt-3 space-y-1.5 ml-1">
                    {processSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-surface-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-surface-200 inline-block mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </>
        );
      })()}

      {/* Feedback */}
      <div className="card">
        {feedbackSent ? (
          <div className="text-center py-2">
            <span className="text-verified-600 font-medium text-sm flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Thanks for your feedback!</span>
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
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFeedback(1)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  feedbackRating === 1 ? 'bg-error-100 text-error-600' : 'hover:bg-surface-100 text-surface-400'
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
