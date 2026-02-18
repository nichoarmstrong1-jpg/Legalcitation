import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { X, Check, Copy, AlertTriangle, Undo2 } from 'lucide-react';
import type { AnalyzedCitation } from '../services/api.ts';

type FormatStyle = 'italics' | 'underline';

interface CitationTooltipProps {
  result: AnalyzedCitation;
  citationIdx: number;
  isSelected: boolean;
  isAccepted: boolean;
  isDenied: boolean;
  originalText: string;
  formatStyle: FormatStyle;
  onAccept: (idx: number) => void;
  onDeny: (idx: number) => void;
  onCopy: (result: AnalyzedCitation) => void;
  onClose: () => void;
  onSelect: (idx: number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onJumpToCitation?: (citationIdx: number) => void;
  onOpenSidebarAnalysis?: (citationIdx: number) => void;
}

function renderFormattedText(text: string, formatStyle: FormatStyle) {
  const normalizedText = text
    .replace(/(\*Id\.\*|_Id\._)(?=[A-Za-z0-9])/g, '$1 ')
    .replace(/(\*Id\.\*|_Id\._)\s+(?=\.)/g, '$1');
  const parts = normalizedText.split(/(\*[^*]+\*|_[^_]+_)/);
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
    return <span key={i}>{part.replace(/[*_]/g, '')}</span>;
  });
}

export function CitationTooltip({
  result,
  citationIdx,
  isSelected,
  isAccepted,
  isDenied,
  originalText,
  formatStyle,
  onAccept,
  onDeny,
  onCopy,
  onClose,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onJumpToCitation,
  onOpenSidebarAnalysis,
}: CitationTooltipProps) {
  const [flipVertical, setFlipVertical] = useState(false);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Detect viewport boundary clipping and reposition
  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // If tooltip extends above viewport, flip to show below
    if (rect.top < 0) {
      setFlipVertical(true);
    }
    // If tooltip extends past right edge, align to right
    if (rect.right > window.innerWidth) {
      setFlipHorizontal(true);
    }
  }, []);

  // Reset flip state when tooltip is re-shown for a different citation
  useEffect(() => {
    setFlipVertical(false);
    setFlipHorizontal(false);
  }, [citationIdx]);

  const errorCount = result.issues.filter(i => i.severity === 'error').length;
  const hasCorrection = result.verifiedCitation &&
    result.verifiedCitation.replace(/\*/g, '') !== originalText;

  // Filter logic trace to rule-related steps
  const cleanTrace = (result.logicTrace || []).filter(step =>
    !step.includes('http://') &&
    !step.includes('https://') &&
    !step.match(/\b(403|401|500)\b.*error/i) &&
    !step.includes('ANTHROPIC_API_KEY') &&
    !step.includes('API_KEY')
  );
  const traceIssueWithAntecedent = result.issues.find(iss => iss.antecedentText);
  const warningCount = result.issues.filter(i => i.severity === 'warning').length;
  const suggestionCount = result.issues.filter(i => i.severity === 'suggestion').length;
  const isVerifiedUi = errorCount === 0 && warningCount === 0;
  const statusLabel = errorCount > 0
    ? `${errorCount} Error${errorCount !== 1 ? 's' : ''}`
    : warningCount > 0
      ? `${warningCount} Warning${warningCount !== 1 ? 's' : ''}`
      : isVerifiedUi
        ? 'Verified'
        : 'Needs Review';
  const statusClass = errorCount > 0
    ? 'bg-error-100 text-error-700'
    : warningCount > 0
      ? 'bg-warning-100 text-warning-700'
      : isVerifiedUi
        ? 'bg-verified-100 text-verified-700'
        : 'bg-warning-100 text-warning-700';

  useEffect(() => {
    if (!traceIssueWithAntecedent) return;
    // #region agent log
    fetch('http://127.0.0.1:7472/ingest/c1a4ccbe-c7b9-4841-b61e-69a7587183b0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9e31dc'},body:JSON.stringify({sessionId:'9e31dc',runId:'pre-fix',hypothesisId:'H2',location:'apps/web/src/components/CitationTooltip.tsx:136',message:'Tooltip antecedent reference available',data:{citationIdx,antecedentIndex:traceIssueWithAntecedent.antecedentIndex,antecedentText:traceIssueWithAntecedent.antecedentText?.slice(0,120),issueRule:traceIssueWithAntecedent.rule},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [traceIssueWithAntecedent, citationIdx]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7472/ingest/c1a4ccbe-c7b9-4841-b61e-69a7587183b0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9e31dc'},body:JSON.stringify({sessionId:'9e31dc',runId:'pre-fix',hypothesisId:'H13',location:'apps/web/src/components/CitationTooltip.tsx:161',message:'Tooltip status badge decision snapshot',data:{citationIdx,errorCount,warningCount,suggestionCount,verificationStatus:result.verificationStatus,score:result.score,statusLabel,isVerifiedUi},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [citationIdx, errorCount, warningCount, suggestionCount, result.verificationStatus, result.score, statusLabel, isVerifiedUi]);

  return (
    <div
      ref={tooltipRef}
      className={`absolute z-20 w-[calc(100vw-3rem)] sm:w-80 p-3 sm:p-4 bg-white rounded-2xl shadow-modal border border-surface-200 text-left ${
        flipVertical ? 'top-full mt-2' : 'bottom-full mb-2'
      } ${flipHorizontal ? 'right-0' : 'left-0'}`}
      onClick={e => e.stopPropagation()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header: status badge + score + close */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${
            statusClass
          }`}>
            {statusLabel}
          </span>
          <span className={`text-xs font-bold ${
            result.score >= 80 ? 'text-verified-600' :
            result.score >= 50 ? 'text-warning-600' : 'text-error-600'
          }`}>
            {result.score}%
          </span>
        </div>
        {isSelected && (
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-surface-100 text-surface-400"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Full citation display */}
      {result.verifiedCitation && (
        <div className="text-xs font-serif leading-relaxed mb-2 p-2 bg-surface-50 rounded-lg border border-surface-100">
          <div className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Full Citation</div>
          <div className="text-verified-700">
            {renderFormattedText(result.verifiedCitation, formatStyle)}
          </div>
        </div>
      )}

      {/* Short forms summary */}
      {result.shortForms && result.shortForms.length > 0 && (
        <div className="mb-2 p-2 bg-primary-50 rounded-lg border border-primary-100">
          <div className="text-[10px] font-bold text-primary-700 uppercase tracking-wider mb-1">Short Forms</div>
          <div className="space-y-0.5">
            {result.shortForms.map((sf, i) => {
              const form = typeof sf === 'string' ? sf : sf.form;
              return (
                <div key={i} className="text-[11px] font-serif text-primary-800">
                  {renderFormattedText(form, formatStyle)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* First issue */}
      {result.issues.filter(iss => iss.severity !== 'suggestion').length > 0 && (
        <div className="text-xs text-surface-600 leading-relaxed mb-2">
          {result.issues.filter(iss => iss.severity !== 'suggestion')[0].message}
          {result.issues.filter(iss => iss.severity !== 'suggestion').length > 1 && (
            <span className="text-surface-400"> (+{result.issues.filter(iss => iss.severity !== 'suggestion').length - 1} more)</span>
          )}
        </div>
      )}

      {/* Antecedent info (from traceability) */}
      {result.issues.some(iss => iss.antecedentText) && (
        <div className="text-[11px] text-surface-500 mb-2 p-1.5 bg-surface-50 rounded-lg">
          {(() => {
            const traceIssue = result.issues.find(iss => iss.antecedentText);
            if (!traceIssue) return null;
            const targetIdx = traceIssue.antecedentIndex;
            const canJump = typeof targetIdx === 'number' && targetIdx >= 0;
            return (
              <button
                type="button"
                className={`text-left ${canJump ? 'hover:text-primary-700 transition-colors' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  // #region agent log
                  fetch('http://127.0.0.1:7472/ingest/c1a4ccbe-c7b9-4841-b61e-69a7587183b0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9e31dc'},body:JSON.stringify({sessionId:'9e31dc',runId:'pre-fix',hypothesisId:'H5',location:'apps/web/src/components/CitationTooltip.tsx:229',message:'Tooltip antecedent reference clicked',data:{citationIdx,targetIdx,canJump,hasJumpHandler:Boolean(onJumpToCitation)},timestamp:Date.now()})}).catch(()=>{});
                  // #endregion
                  if (canJump && onJumpToCitation) {
                    onJumpToCitation(targetIdx);
                  }
                }}
                disabled={!canJump}
              >
                References citation #{(traceIssue.antecedentIndex ?? 0) + 1}:{' '}
                <span className="font-serif text-surface-600">
                  {traceIssue.antecedentText!.slice(0, 60)}
                  {traceIssue.antecedentText!.length > 60 ? '...' : ''}
                </span>
              </button>
            );
          })()}
        </div>
      )}

      {/* Action buttons */}
      {hasCorrection && !isAccepted && !isDenied && (
        <div className="flex gap-2 mb-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(citationIdx); }}
            className="btn-success text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> Accept
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(result); }}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeny(citationIdx); }}
            className="text-xs px-3 py-1.5 rounded-xl text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Dismiss
          </button>
        </div>
      )}

      {/* Accepted state */}
      {isAccepted && (
        <div className="text-xs text-verified-600 font-medium mb-2">
          Change applied
        </div>
      )}

      {/* Denied state */}
      {isDenied && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-surface-400">Change dismissed</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDeny(citationIdx); }}
            className="text-[10px] text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
          >
            <Undo2 className="w-2.5 h-2.5" /> Undo
          </button>
        </div>
      )}

      {/* Pinpoint match badge */}
      {result.pinpointMatch && (
        <div className={`flex items-center gap-1.5 text-[11px] mb-2 px-2 py-1 rounded-lg ${
          result.pinpointMatch.matched
            ? 'bg-verified-50 text-verified-700'
            : 'bg-warning-50 text-warning-700'
        }`}>
          {result.pinpointMatch.matched ? (
            <><Check className="w-3 h-3" /> Source page verified — {result.pinpointMatch.documentName}</>
          ) : (
            <><AlertTriangle className="w-3 h-3" /> Page not found in source document</>
          )}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          // #region agent log
          fetch('http://127.0.0.1:7472/ingest/c1a4ccbe-c7b9-4841-b61e-69a7587183b0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9e31dc'},body:JSON.stringify({sessionId:'9e31dc',runId:'pre-fix',hypothesisId:'H15',location:'apps/web/src/components/CitationTooltip.tsx:322',message:'Tooltip requested full analysis in sidebar',data:{citationIdx,hasHandler:Boolean(onOpenSidebarAnalysis),issueCount:result.issues.length,traceCount:cleanTrace.length},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          if (onOpenSidebarAnalysis) {
            onOpenSidebarAnalysis(citationIdx);
            return;
          }
          onSelect(citationIdx);
        }}
        className="flex items-center gap-1 text-[10px] text-surface-400 hover:text-primary-600 transition-colors w-full mt-1"
      >
        View full analysis in sidebar
        <span className="text-surface-300 ml-auto">{result.issues.length} issue{result.issues.length !== 1 ? 's' : ''} checked</span>
      </button>
    </div>
  );
}
