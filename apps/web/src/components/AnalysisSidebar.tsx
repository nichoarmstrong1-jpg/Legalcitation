import { useState, useCallback } from 'react';
import type { AnalyzedCitation, ValidationIssue } from '../services/api.ts';
import { useClipboard } from '../hooks/useClipboard.ts';
import { RuleExplanationModal } from './RuleExplanationModal.tsx';
import { ProgressRing } from './ui/ProgressRing.tsx';
import { AnimatedCheckmark } from './ui/AnimatedCheckmark.tsx';
import { ConfettiEffect } from './ui/ConfettiEffect.tsx';

interface AnalysisSidebarProps {
  citation: AnalyzedCitation;
  formatStyle: 'italics' | 'underline';
}

export function AnalysisSidebar({ citation, formatStyle }: AnalysisSidebarProps) {
  const { copied, copyRichText } = useClipboard();
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const submitFeedback = useCallback(async (rating: number) => {
    setFeedbackRating(rating);
    if (rating <= 2) {
      setShowFeedbackForm(true);
      return;
    }
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rating,
          citationText: citation.parsed?.rawText,
        }),
      });
      setFeedbackSent(true);
    } catch { /* non-critical */ }
  }, [citation]);

  const submitDetailedFeedback = useCallback(async () => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment,
          citationText: citation.parsed?.rawText,
          expectedOutput: feedbackComment,
        }),
      });
      setFeedbackSent(true);
      setShowFeedbackForm(false);
    } catch { /* non-critical */ }
  }, [feedbackRating, feedbackComment, citation]);

  const statusConfig = {
    verified: { label: 'Case Verified', color: 'bg-verified-100 text-verified-700 border-verified-200', iconBg: 'bg-verified-500' },
    partial_match: { label: 'Partially Verified', color: 'bg-warning-100 text-warning-700 border-warning-400', iconBg: 'bg-warning-500' },
    not_found: { label: 'Not Found in Records', color: 'bg-error-100 text-error-700 border-error-400', iconBg: 'bg-error-500' },
    pending: { label: 'Format Check Only', color: 'bg-surface-100 text-surface-600 border-surface-300', iconBg: 'bg-surface-400' },
    error: { label: 'Verification Unavailable', color: 'bg-error-100 text-error-700 border-error-400', iconBg: 'bg-error-500' },
  };

  const status = statusConfig[citation.verificationStatus as keyof typeof statusConfig] || statusConfig.pending;

  const bluebookIssues = citation.issues.filter(i => i.source === 'Bluebook');
  const indigoIssues = citation.issues.filter(i => i.source === 'Indigo');
  const contextIssues = citation.issues.filter(i => i.source === 'Context');

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

  // Filter out technical trace entries — only show law-student-facing steps
  const cleanTrace = citation.logicTrace.filter(step =>
    !step.includes('API') &&
    !step.includes('api') &&
    !step.includes('http') &&
    !step.includes('403') &&
    !step.includes('ANTHROPIC') &&
    !step.includes('CourtListener') &&
    !step.includes('Skipping') &&
    !step.includes('provider') &&
    !step.includes('timeout') &&
    !step.includes('config')
  );

  const displayedSteps = showAllSteps ? cleanTrace : cleanTrace.slice(0, 6);

  const barColor = citation.score >= 80 ? 'bg-verified-500' :
    citation.score >= 50 ? 'bg-warning-500' : 'bg-error-500';

  return (
    <div className="space-y-4">
      {/* Confetti on perfect score */}
      <ConfettiEffect trigger={citation.score === 100} />

      {/* Score + Status Header */}
      <div className="card bg-gradient-to-br from-surface-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ProgressRing score={citation.score} size={80} strokeWidth={6} />
            <div>
              <div className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Bluebook Compliance</div>
              <div className="flex items-center gap-2 mt-1">
                <AnimatedCheckmark status={citation.verificationStatus as 'verified' | 'partial_match' | 'not_found' | 'pending' | 'error'} size={18} />
                <span className={`text-xs font-semibold ${status.color} px-2 py-0.5 rounded-lg border`}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
            style={{ width: `${citation.score}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-surface-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error-500" />
            {citation.issues.filter(i => i.severity === 'error').length} errors
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
            {citation.issues.filter(i => i.severity === 'warning').length} warnings
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
            {citation.issues.filter(i => i.severity === 'suggestion').length} suggestions
          </span>
        </div>
      </div>

      {/* Verification Reasoning */}
      {cleanTrace.length > 0 && (
        <div className="card border-l-4 border-l-primary-400">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-primary-900">Verification Steps</span>
            <span className="text-[10px] text-surface-400 ml-auto bg-surface-100 px-2 py-0.5 rounded-full">{cleanTrace.length} steps</span>
          </div>
          <div className="space-y-2.5 ml-1">
            {displayedSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="mt-0.5 shrink-0">
                  {step.includes('verified') || step.includes('Verified') || step.includes('accurate') || step.includes('correct') || step.includes('confirmed') ? (
                    <span className="text-verified-500 font-bold">{'\u2713'}</span>
                  ) : step.includes('issue') || step.includes('could not') || step.includes('discrepan') || step.includes('correction') ? (
                    <span className="text-warning-500">{'\u26A0'}</span>
                  ) : step.includes('Searching') || step.includes('Checking') || step.includes('Cross-ref') ? (
                    <span className="text-primary-400">{'\u25B8'}</span>
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
          {cleanTrace.length > 6 && (
            <button
              onClick={() => setShowAllSteps(!showAllSteps)}
              className="text-xs text-primary-500 hover:text-primary-700 mt-3 ml-1 font-medium"
            >
              {showAllSteps ? 'Show less' : `Show all ${cleanTrace.length} steps...`}
            </button>
          )}
        </div>
      )}

      {/* Recommended Citation with Copy */}
      {citation.verifiedCitation && (
        <div className="card border border-verified-200 bg-gradient-to-br from-verified-50 to-white shadow-glow-green">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-verified-700 uppercase tracking-wider">Correct Citation</span>
            <button
              onClick={() => copyRichText(citation.verifiedCitation!, formatStyle)}
              className={`px-4 py-1.5 text-xs rounded-xl font-medium transition-all duration-200 ${
                copied
                  ? 'bg-verified-500 text-white shadow-glow-green'
                  : 'bg-verified-100 text-verified-700 hover:bg-verified-200'
              }`}
            >
              {copied ? '\u2713 Copied!' : 'Copy'}
            </button>
          </div>
          <div className="font-serif text-sm leading-relaxed p-4 bg-white rounded-xl border border-verified-100">
            {renderFormattedCitation(citation.verifiedCitation)}
          </div>
          <div className="text-[10px] text-surface-400 mt-3">
            Formatting: {formatStyle === 'italics' ? 'Italics' : 'Underline'} | Pastes with formatting into Word & Google Docs
          </div>
        </div>
      )}

      {/* Discrepancies (Diff View) */}
      {citation.discrepancies.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary-900">
            <span className="text-warning-500">{'\u26A0'}</span>
            Corrections Needed
          </h3>
          <div className="space-y-2">
            {citation.discrepancies.map((d, i) => (
              <div key={i} className="text-xs border border-surface-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-surface-50 font-medium text-surface-600 capitalize border-b border-surface-200">
                  {d.component}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-error-500 text-[10px] font-bold uppercase w-10 shrink-0">yours</span>
                    <span className="px-2.5 py-1 bg-error-50 text-error-700 rounded-lg line-through font-mono">{d.userValue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-verified-600 text-[10px] font-bold uppercase w-10 shrink-0">fix</span>
                    <span className="px-2.5 py-1 bg-verified-50 text-verified-700 rounded-lg font-mono">{d.verifiedValue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rule Violations */}
      {citation.issues.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-4 text-primary-900">
            Bluebook Issues ({citation.issues.length})
          </h3>

          {bluebookIssues.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-bold text-primary-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                Bluebook Rules ({bluebookIssues.length})
              </div>
              <IssueList issues={bluebookIssues} onRuleClick={setSelectedRule} />
            </div>
          )}

          {indigoIssues.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Indigo Book ({indigoIssues.length})
              </div>
              <IssueList issues={indigoIssues} onRuleClick={setSelectedRule} />
            </div>
          )}

          {contextIssues.length > 0 && (
            <div>
              <div className="text-xs font-bold text-orange-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Context Rules ({contextIssues.length})
              </div>
              <IssueList issues={contextIssues} onRuleClick={setSelectedRule} />
            </div>
          )}
        </div>
      )}

      {/* Reference Examples */}
      {citation.referenceExamples.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3 text-primary-900">Usage in Legal Literature</h3>
          <div className="space-y-2">
            {citation.referenceExamples.map((ref, i) => (
              <div key={i} className="text-xs border border-surface-200 rounded-xl p-4">
                <div className="font-medium text-surface-700">{ref.source}</div>
                <p className="text-surface-500 mt-1 italic font-serif">{ref.context}</p>
                {ref.url && (
                  <a href={ref.url} target="_blank" rel="noreferrer"
                    className="text-primary-600 hover:text-primary-800 mt-1.5 inline-block text-xs font-medium">
                    View source {'\u2192'}
                  </a>
                )}
              </div>
            ))}
          </div>
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
            <span className="text-xs text-surface-400">Was this analysis helpful?</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => submitFeedback(5)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  feedbackRating === 5 ? 'bg-verified-100 text-verified-600' : 'hover:bg-surface-100 text-surface-400'
                }`}
                title="Helpful"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              </button>
              <button
                onClick={() => submitFeedback(1)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
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

      {/* Parsed Components (collapsible detail) */}
      {citation.parsed && (
        <div className="card">
          <details>
            <summary className="text-xs font-medium text-surface-400 cursor-pointer hover:text-surface-600 transition-colors">
              Citation Components
            </summary>
            <div className="mt-3 text-xs font-mono bg-surface-50 p-4 rounded-xl overflow-x-auto">
              <pre className="text-surface-600">{JSON.stringify(citation.parsed.components, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}

      {/* Rule Explanation Modal */}
      {selectedRule && (
        <RuleExplanationModal
          ruleKey={selectedRule}
          onClose={() => setSelectedRule(null)}
        />
      )}
    </div>
  );
}

function IssueList({ issues, onRuleClick }: { issues: ValidationIssue[]; onRuleClick: (rule: string) => void }) {
  const severityConfig = {
    error: { bg: 'bg-error-50 border-error-100', text: 'text-error-700', dot: 'bg-error-500', label: 'Error' },
    warning: { bg: 'bg-warning-50 border-warning-100', text: 'text-warning-700', dot: 'bg-warning-500', label: 'Warning' },
    suggestion: { bg: 'bg-primary-50 border-primary-100', text: 'text-primary-700', dot: 'bg-primary-400', label: 'Tip' },
  };

  return (
    <div className="space-y-2">
      {issues.map(issue => {
        const config = severityConfig[issue.severity];
        return (
          <div key={issue.id} className={`text-xs border rounded-xl p-3 ${config.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                <span className={`font-mono font-bold ${config.text}`}>{issue.rule}</span>
                <button
                  onClick={() => onRuleClick(issue.rule)}
                  className="text-surface-400 hover:text-surface-600 ml-0.5 transition-colors"
                  title="Learn about this rule"
                >
                  {'\u24D8'}
                </button>
              </div>
              <span className={`text-[10px] uppercase font-bold ${config.text} opacity-70`}>{config.label}</span>
            </div>
            <p className={`mt-2 leading-relaxed ${config.text}`}>{issue.message}</p>
            {issue.suggestion && (
              <p className="mt-1.5 text-surface-500 italic leading-relaxed">
                {'\u2192'} {issue.suggestion}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
