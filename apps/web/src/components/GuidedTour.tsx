import { useEffect, useState, useRef } from 'react';
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
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait a frame for DOM to settle, then find target
    const raf = requestAnimationFrame(() => {
      const target = document.querySelector(step.targetSelector);
      if (!target) {
        setTargetFound(false);
        // If target not found, auto-advance to next step after a short delay
        const timer = setTimeout(() => onNext(), 300);
        return () => clearTimeout(timer);
      }

      setTargetFound(true);
      const rect = target.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    return () => cancelAnimationFrame(raf);
  }, [step.targetSelector, onNext]);

  if (!targetFound) return null;

  const getTooltipStyle = (): React.CSSProperties => {
    const padding = 12;
    switch (step.placement) {
      case 'bottom':
        return {
          position: 'absolute',
          top: position.top + position.height + padding,
          left: Math.max(16, position.left + position.width / 2 - 160),
          maxWidth: 320,
        };
      case 'top':
        return {
          position: 'absolute',
          top: position.top - padding - 160,
          left: Math.max(16, position.left + position.width / 2 - 160),
          maxWidth: 320,
        };
      case 'left':
        return {
          position: 'absolute',
          top: position.top,
          left: Math.max(16, position.left - 336),
          maxWidth: 320,
        };
      case 'right':
        return {
          position: 'absolute',
          top: position.top,
          left: position.left + position.width + padding,
          maxWidth: 320,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Feature tour">
      {/* Overlay — blocks interaction but does NOT dismiss on click */}
      <div className="absolute inset-0 bg-black/40 transition-opacity" />

      {/* Highlight cutout */}
      <div
        className="absolute rounded-xl ring-4 ring-primary-400 ring-offset-4 z-10 pointer-events-none transition-all duration-300"
        style={{
          top: position.top - 4,
          left: position.left - 4,
          width: position.width + 8,
          height: position.height + 8,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="z-20 bg-white rounded-2xl shadow-modal p-5 animate-scale-in"
        style={getTooltipStyle()}
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
