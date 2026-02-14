import { useState, useEffect } from 'react';
import { Scale, Check } from 'lucide-react';

const RULES_STEPS = [
  { rule: 'R. 10.2.1', description: 'Formatting case name' },
  { rule: 'T6', description: 'Applying abbreviations' },
  { rule: 'R. 10.3 / T1', description: 'Selecting correct reporter' },
  { rule: 'R. 10.4 / T7', description: 'Determining court designation' },
  { rule: 'R. 10.5', description: 'Formatting year' },
  { rule: 'R. 3.2', description: 'Checking pinpoint citation' },
];

export function CitationGeneratingView() {
  const [progress, setProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    // Start progress animation
    const timer = requestAnimationFrame(() => setProgress(90));
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    // Reveal steps one by one
    if (visibleSteps < RULES_STEPS.length) {
      const timer = setTimeout(() => {
        setVisibleSteps(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [visibleSteps]);

  return (
    <div className="card py-10 px-6">
      <div className="max-w-md mx-auto text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-5">
          <Scale className="w-7 h-7 text-primary-600 animate-pulse" />
        </div>

        {/* Header */}
        <h3 className="text-lg font-semibold text-primary-900 mb-1">Generating your citation...</h3>
        <p className="text-xs text-surface-400 mb-6">Usually takes 5–10 seconds</p>

        {/* Progress bar */}
        <div className="w-full bg-surface-100 rounded-full h-1.5 mb-8 overflow-hidden">
          <div
            className="bg-primary-500 h-full rounded-full"
            style={{
              width: `${progress}%`,
              transition: 'width 10s linear',
            }}
          />
        </div>

        {/* Rules being consulted */}
        <div className="text-left space-y-3">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">
            Bluebook rules being consulted
          </p>
          {RULES_STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                i < visibleSteps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              <div className="shrink-0">
                {i < visibleSteps - 1 ? (
                  <Check className="w-4 h-4 text-verified-500" />
                ) : i === visibleSteps - 1 ? (
                  <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin inline-block" />
                ) : null}
              </div>
              <span className="font-mono text-xs text-primary-700 font-semibold w-24 shrink-0">
                {step.rule}
              </span>
              <span className={`text-xs ${
                i < visibleSteps - 1 ? 'text-verified-600' : 'text-surface-600'
              }`}>
                {step.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
