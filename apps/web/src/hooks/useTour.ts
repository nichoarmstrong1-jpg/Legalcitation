import { useState, useCallback } from 'react';

export interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="builder-input"]',
    title: 'Search for Cases',
    description: 'Type any case name, description, or legal topic to search. We\'ll find matching cases and build properly formatted Bluebook citations.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour="checker-tab"]',
    title: 'Check Citations',
    description: 'Paste your legal text to check all citations at once. Each citation is analyzed against Bluebook rules with inline highlighting.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour="upload-btn"]',
    title: 'Upload Documents',
    description: 'Upload PDFs from Westlaw or LexisNexis to extract and verify citations automatically.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour="format-toggle"]',
    title: 'Format Style',
    description: 'Toggle between italics and underline for your citations. When you copy, the formatting is preserved for Word and Google Docs.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour="tips-btn"]',
    title: 'Bluebook Quick Reference',
    description: 'Quick reference for Bluebook rules covering cases, statutes, constitutions, signals, and common mistakes.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour="history-btn"]',
    title: 'Citation History',
    description: 'View and restore your past citation checks. Your history is saved automatically.',
    placement: 'bottom',
  },
  {
    targetSelector: '[data-tour="sidebar"]',
    title: 'Analysis Results',
    description: 'Detailed results appear here with the corrected citation, short forms, component breakdown, verification status, and Bluebook rules consulted.',
    placement: 'left',
  },
];

const TOUR_STORAGE_KEY = 'legalcitation-tour-completed';
const TOUR_STEP_KEY = 'legalcitation-tour-step';

export function useTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(TOUR_STEP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      localStorage.setItem(TOUR_STEP_KEY, String(next));
    } else {
      completeTour();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      localStorage.setItem(TOUR_STEP_KEY, String(prev));
    }
  }, [currentStep]);

  const completeTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    localStorage.removeItem(TOUR_STEP_KEY);
  }, []);

  const exitTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    localStorage.removeItem(TOUR_STEP_KEY);
  }, []);

  return {
    isActive,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    step: TOUR_STEPS[currentStep],
    startTour,
    nextStep,
    prevStep,
    exitTour,
    hasCompletedTour: localStorage.getItem(TOUR_STORAGE_KEY) === 'true',
  };
}
