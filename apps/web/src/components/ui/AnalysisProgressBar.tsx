import { useState, useEffect } from 'react';

const STEPS = [
  'Detecting citations...',
  'Parsing citation components...',
  'Applying Bluebook rules...',
  'Verifying against case law databases...',
  'Calculating scores...',
];

export function AnalysisProgressBar() {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Start progress animation
    const timer = requestAnimationFrame(() => setProgress(90));
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    // Cycle through step descriptions
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8 px-4 text-center">
      <div className="max-w-sm mx-auto">
        {/* Spinner */}
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

        {/* Step description */}
        <p className="text-sm text-surface-600 font-medium mb-1 transition-opacity duration-300">
          {STEPS[stepIndex]}
        </p>
        <p className="text-xs text-surface-400 mb-4">Estimated time: ~10–15 seconds</p>

        {/* Progress bar */}
        <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary-500 h-full rounded-full"
            style={{
              width: `${progress}%`,
              transition: 'width 12s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}
