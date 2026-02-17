import { useState, type ComponentType } from 'react';
import { Scale, Search, Infinity as InfinityIcon } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const steps: { title: string; subtitle: string; description: string; icon: ComponentType<{ className?: string }> }[] = [
  {
    title: 'Welcome to LegalCitation',
    subtitle: 'Your AI-powered Bluebook citation checker',
    description: 'Verify, format, and build perfect legal citations in seconds. Powered by AI verification against real case law databases.',
    icon: Scale,
  },
  {
    title: 'Try It Out',
    subtitle: 'Paste any citation to see it in action',
    description: 'Search for any case and we\'ll build a properly formatted Bluebook citation for you. Upload a brief or paste your legal text to check all citations at once.',
    icon: Search,
  },
  {
    title: 'Free to Use, More with an Account',
    subtitle: 'Sign up to unlock powerful features',
    description: 'Citation checking and building are always free — no account needed. Create a free account to unlock your citation history, case document library, and journal spading. Sign in with Google, Apple, or Microsoft for one-click access.',
    icon: InfinityIcon,
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
        <div className="w-16 h-16 rounded-2xl bg-primary-800 flex items-center justify-center text-white mx-auto mb-5 shadow-soft animate-fade-in">
          {(() => { const Icon = current.icon; return <Icon className="w-8 h-8" />; })()}
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
