import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}

export function GuidedTour({ step, currentStep, totalSteps, onNext, onPrev, onExit }: GuidedTourProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [targetFound, setTargetFound] = useState(false);
  const missingStepTimerRef = useRef<number | null>(null);

  const updateTargetPosition = useCallback(() => {
    const target = document.querySelector<HTMLElement>(step.targetSelector);
    if (!target) {
      setTargetFound(false);
      return false;
    }

    const rect = target.getBoundingClientRect();
    setTargetFound(true);
    setPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    return true;
  }, [step.targetSelector]);

  useEffect(() => {
    let attempts = 0;
    let cancelled = false;
    const maxAttempts = 10;

    const locateTarget = () => {
      if (cancelled) return;
      const found = updateTargetPosition();
      if (found) {
        const target = document.querySelector<HTMLElement>(step.targetSelector);
        target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        return;
      }

      if (attempts < maxAttempts) {
        attempts += 1;
        window.setTimeout(locateTarget, 120);
      } else if (!missingStepTimerRef.current) {
        // Keep users from getting stuck if an element is unavailable in this viewport/mode.
        missingStepTimerRef.current = window.setTimeout(() => {
          onNext();
          missingStepTimerRef.current = null;
        }, 1200);
      }
    };

    const raf = requestAnimationFrame(locateTarget);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (missingStepTimerRef.current) {
        window.clearTimeout(missingStepTimerRef.current);
        missingStepTimerRef.current = null;
      }
    };
  }, [step.targetSelector, onNext, updateTargetPosition]);

  useEffect(() => {
    if (!targetFound) return;
    const handleReposition = () => {
      updateTargetPosition();
    };
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [targetFound, updateTargetPosition]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onExit();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onExit]);

  const getTooltipStyle = (): React.CSSProperties => {
    const padding = 12;
    const maxWidth = 320;
    const viewportPadding = 16;
    const approxTooltipHeight = 220;
    const clampHorizontal = (value: number) => {
      const maxLeft = Math.max(viewportPadding, window.innerWidth - maxWidth - viewportPadding);
      return Math.min(Math.max(viewportPadding, value), maxLeft);
    };
    const clampVertical = (value: number) => {
      const maxTop = Math.max(viewportPadding, window.innerHeight - approxTooltipHeight - viewportPadding);
      return Math.min(Math.max(viewportPadding, value), maxTop);
    };

    switch (step.placement) {
      case 'bottom':
        return {
          position: 'fixed',
          top: clampVertical(position.top + position.height + padding),
          left: clampHorizontal(position.left + position.width / 2 - 160),
          maxWidth,
        };
      case 'top':
        return {
          position: 'fixed',
          top: clampVertical(position.top - padding - approxTooltipHeight),
          left: clampHorizontal(position.left + position.width / 2 - 160),
          maxWidth,
        };
      case 'left':
        return {
          position: 'fixed',
          top: clampVertical(position.top),
          left: clampHorizontal(position.left - 336),
          maxWidth,
        };
      case 'right':
        return {
          position: 'fixed',
          top: clampVertical(position.top),
          left: clampHorizontal(position.left + position.width + padding),
          maxWidth,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Feature tour">
      {/* Overlay — blocks interaction but does NOT dismiss on click */}
      <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onExit} />

      {/* Highlight cutout */}
      {targetFound && (
        <div
          className="fixed rounded-xl ring-4 ring-primary-400 ring-offset-4 z-10 pointer-events-none transition-all duration-300"
          style={{
            top: position.top - 4,
            left: position.left - 4,
            width: position.width + 8,
            height: position.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="z-20 bg-white rounded-2xl shadow-modal p-5 animate-scale-in"
        style={targetFound ? getTooltipStyle() : { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: 320 }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button
            onClick={onExit}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
            aria-label="Exit tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <h3 className="text-sm font-bold text-primary-900 mb-1.5">{step.title}</h3>
        <p className="text-xs text-surface-500 leading-relaxed">{step.description}</p>
        {!targetFound && (
          <p className="text-[11px] text-warning-700 bg-warning-50 border border-warning-100 rounded-lg px-2 py-1.5 mt-2">
            This feature is not visible right now. Continuing will skip to the next step.
          </p>
        )}

        {/* Progress bar */}
        <div className="flex gap-1 mt-4 mb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                i <= currentStep ? 'bg-primary-500' : 'bg-surface-200'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="text-xs text-surface-400 hover:text-surface-600 transition-colors"
          >
            Exit Tour
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={onPrev}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            )}
            <button
              onClick={onNext}
              className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1"
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
