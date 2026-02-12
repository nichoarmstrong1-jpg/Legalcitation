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
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-xl transition-all text-xl" aria-label="Close">
            &times;
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
