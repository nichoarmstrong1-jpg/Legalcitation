import { X, Lightbulb, AlertTriangle, ListOrdered } from 'lucide-react';
import { RULE_EXPLANATIONS } from '@legalcitation/rule-engine';

interface RuleExplanationModalProps {
  ruleKey: string;
  onClose: () => void;
  onNavigate?: (ruleKey: string) => void;
}

export function RuleExplanationModal({ ruleKey, onClose, onNavigate }: RuleExplanationModalProps) {
  const rule = RULE_EXPLANATIONS[ruleKey];

  const handleReferenceClick = (ref: string) => {
    if (onNavigate) {
      onNavigate(ref);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="rule-modal-title" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-modal max-w-md w-full max-h-[80vh] flex flex-col p-5 sm:p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs font-mono text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg font-semibold">{ruleKey}</span>
            <h3 id="rule-modal-title" className="text-lg font-semibold mt-2 text-primary-900">{rule?.title || ruleKey}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-xl transition-all" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {rule ? (
            <>
              <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-line">{rule.explanation}</p>

              {rule.examples && rule.examples.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-semibold text-surface-500 mb-2 uppercase tracking-wider">Examples:</div>
                  <div className="space-y-1.5">
                    {rule.examples.map((ex, i) => (
                      <div key={i} className="text-sm font-mono bg-surface-50 px-4 py-2 rounded-xl text-surface-700">{ex}</div>
                    ))}
                  </div>
                </div>
              )}

              {rule.tips && rule.tips.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-primary-500" />
                    <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Expert Tips</div>
                  </div>
                  <ul className="space-y-1.5">
                    {rule.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-primary-700 bg-primary-50 px-4 py-2.5 rounded-xl leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rule.commonMistakes && rule.commonMistakes.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />
                    <div className="text-xs font-semibold text-warning-600 uppercase tracking-wider">Common Mistakes</div>
                  </div>
                  <ul className="space-y-1.5">
                    {rule.commonMistakes.map((mistake, i) => (
                      <li key={i} className="text-sm text-warning-700 bg-warning-50 px-4 py-2.5 rounded-xl leading-relaxed">{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rule.decisionSteps && rule.decisionSteps.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ListOrdered className="w-3.5 h-3.5 text-surface-500" />
                    <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider">How to Apply This Rule</div>
                  </div>
                  <ol className="space-y-1.5">
                    {rule.decisionSteps.map((step, i) => (
                      <li key={i} className="text-sm text-surface-700 bg-surface-50 px-4 py-2.5 rounded-xl leading-relaxed flex gap-2.5">
                        <span className="text-primary-500 font-bold shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {rule.references && rule.references.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-semibold text-surface-500 mb-2 uppercase tracking-wider">See Also:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.references.map((ref) => (
                      <button
                        key={ref}
                        onClick={() => handleReferenceClick(ref)}
                        className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-all ${
                          RULE_EXPLANATIONS[ref]
                            ? 'text-primary-600 bg-primary-50 hover:bg-primary-100 cursor-pointer'
                            : 'text-surface-400 bg-surface-50 cursor-default'
                        }`}
                        disabled={!RULE_EXPLANATIONS[ref]}
                      >
                        {ref}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-surface-500">No detailed explanation available for this rule. Consult the Bluebook (21st ed.) for full guidance.</p>
          )}
        </div>

        <button onClick={onClose} className="btn-primary w-full mt-6 flex-shrink-0">Close</button>
      </div>
    </div>
  );
}
