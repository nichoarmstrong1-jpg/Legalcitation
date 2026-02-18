import { useState, useEffect, useRef, useCallback } from 'react';

const PHASES = [
  { label: 'Detecting citations in your document...', target: 30, duration: 10000 },
  { label: 'Parsing citation components...', target: 50, duration: 15000 },
  { label: 'Consulting Bluebook rules...', target: 65, duration: 20000 },
  { label: 'Verifying against case law databases...', target: 80, duration: 30000 },
  { label: 'Cross-referencing and scoring...', target: 90, duration: 60000 },
] as const;

const BLUEBOOK_RULES = [
  'Checking R. 10.2.1 — Case name formatting...',
  'Checking R. 10.3.1 — Reporter abbreviations...',
  'Consulting T.6 — Abbreviations in case names...',
  'Checking R. 10.5 — Date and court parenthetical...',
  'Checking B1 — Typeface conventions...',
  'Checking R. 12.1 — Statute citation format...',
  'Consulting T.1 — United States Jurisdictions...',
  'Checking R. 15.1 — Book citation format...',
  'Checking R. 16.1 — Periodical citation format...',
  'Checking R. 10.7 — Prior and subsequent history...',
  'Checking R. 10.9 — Short citation forms...',
  'Consulting T.10 — Geographical terms...',
  'Checking R. 1.2 — Introductory signals...',
  'Checking R. 1.4 — Order of signals...',
  'Verifying against Westlaw databases...',
  'Verifying against LexisNexis databases...',
];

interface AnalysisProgressBarProps {
  progress?: number;
  onComplete?: () => void;
}

export function AnalysisProgressBar({ progress: externalProgress, onComplete }: AnalysisProgressBarProps) {
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [ruleIndex, setRuleIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);

  const progress = externalProgress ?? simulatedProgress;

  // Asymptotic progress curve
  const updateProgress = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;

    // Find current phase based on cumulative duration
    let cumulativeDuration = 0;
    let currentPhase = 0;
    for (let i = 0; i < PHASES.length; i++) {
      cumulativeDuration += PHASES[i].duration;
      if (elapsed < cumulativeDuration) {
        currentPhase = i;
        break;
      }
      if (i === PHASES.length - 1) {
        currentPhase = PHASES.length - 1;
      }
    }

    setPhaseIndex(currentPhase);

    // Calculate progress within current phase using asymptotic curve
    const prevTarget = currentPhase > 0 ? PHASES[currentPhase - 1].target : 0;
    const currentTarget = PHASES[currentPhase].target;
    const phaseDuration = PHASES[currentPhase].duration;
    const phaseStartTime = PHASES.slice(0, currentPhase).reduce((sum, p) => sum + p.duration, 0);
    const phaseElapsed = elapsed - phaseStartTime;

    // Asymptotic approach: fast at first, slowing down
    const phaseRatio = Math.min(phaseElapsed / phaseDuration, 1);
    const easedRatio = 1 - Math.pow(1 - phaseRatio, 2.5);
    const phaseProgress = prevTarget + (currentTarget - prevTarget) * easedRatio;

    setSimulatedProgress(Math.min(phaseProgress, 90));

    rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  useEffect(() => {
    if (externalProgress !== undefined) return;
    rafRef.current = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(rafRef.current);
  }, [externalProgress, updateProgress]);

  // Cycle through Bluebook rules
  useEffect(() => {
    const interval = setInterval(() => {
      setRuleIndex(prev => (prev + 1) % BLUEBOOK_RULES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Handle completion
  useEffect(() => {
    if (externalProgress !== undefined && externalProgress >= 100) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [externalProgress, onComplete]);

  return (
    <div className="py-8 px-4 text-center">
      <div className="max-w-md mx-auto">
        {/* Spinner */}
        {!isComplete && (
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        )}

        {/* Phase description */}
        <p className="text-sm text-surface-600 font-medium mb-1 transition-opacity duration-500">
          {isComplete ? 'Analysis complete' : PHASES[phaseIndex].label}
        </p>

        {/* Bluebook rule ticker */}
        {!isComplete && phaseIndex >= 2 && (
          <p className="text-xs text-primary-500 font-mono mb-2 transition-opacity duration-300 h-4">
            {BLUEBOOK_RULES[ruleIndex]}
          </p>
        )}

        {/* Time estimate */}
        {!isComplete && (
          <p className="text-xs text-surface-400 mb-4">
            This may take a moment depending on document size
          </p>
        )}

        {/* Progress bar */}
        <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isComplete ? 'bg-green-500' : 'bg-primary-500'
            }`}
            style={{ width: `${isComplete ? 100 : Math.round(progress)}%` }}
          />
        </div>

        {/* Progress percentage */}
        <p className="text-xs text-surface-400 mt-2">
          {isComplete ? '100' : Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
