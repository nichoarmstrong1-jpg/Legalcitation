import { useState } from 'react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Welcome to LegalCitation',
    subtitle: 'Your AI-powered Bluebook citation checker',
    description: 'Verify, format, and build perfect legal citations in seconds. Powered by AI verification against real case law databases.',
    icon: '\u2696',
  },
  {
    title: 'Try It Out',
    subtitle: 'Paste any citation to see it in action',
    description: 'Try a classic: Brown v. Board of Education, 347 U.S. 483 (1954). We\'ll check the formatting, verify it against case law databases, and show you exactly what\'s right (or wrong).',
    icon: '\u2713',
  },
  {
    title: 'Unlimited Checks',
    subtitle: 'Full verification, completely free',
    description: 'Every citation check includes full AI verification, formatting corrections, and detailed analysis. No limits, no sign-up required.',
    icon: '\u2605',
  },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('legalcitation-onboarded', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('legalcitation-onboarded', 'true');
    onComplete();
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="bg-white rounded-3xl shadow-modal max-w-md w-full p-5 sm:p-8 animate-scale-in">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-primary-600' : i < step ? 'w-1.5 bg-primary-300' : 'w-1.5 bg-surface-200'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary-800 flex items-center justify-center text-white text-3xl mx-auto mb-5 shadow-soft animate-fade-in">
          {current.icon}
        </div>

        {/* Content */}
        <div className="text-center animate-fade-in" key={step}>
          <h2 id="onboarding-title" className="text-xl font-bold text-primary-900">{current.title}</h2>
          <p className="text-sm font-medium text-primary-600 mt-1">{current.subtitle}</p>
          <p className="text-sm text-surface-500 mt-3 leading-relaxed">{current.description}</p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleSkip}
            className="text-sm text-surface-400 hover:text-surface-600 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="btn-primary px-6"
          >
            {step === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
