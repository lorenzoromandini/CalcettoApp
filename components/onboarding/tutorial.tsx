'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Users, 
  Calendar, 
  WifiOff, 
  Trophy,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    id: 'welcome',
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    id: 'team',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'matches',
    icon: Calendar,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'offline',
    icon: WifiOff,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
] as const;

export function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const t = useTranslations('onboarding');
  const commonT = useTranslations('common');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const stepKey = `step${currentStep + 1}` as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={commonT('skip')}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-primary'
                  : index < currentStep
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div
          className={`flex flex-col items-center text-center transition-all duration-150 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Icon */}
          <div
            className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${step.bgColor} ${step.color}`}
          >
            <Icon className="h-10 w-10" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h2 className="mb-3 text-2xl font-bold tracking-tight">
            {t(`${stepKey}.title`)}
          </h2>

          {/* Description */}
          <p className="mb-8 text-muted-foreground">
            {t(`${stepKey}.description`)}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentStep === 0
                ? 'invisible'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            {commonT('back')}
          </button>

          <span className="text-sm text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {currentStep === steps.length - 1 ? commonT('done') : commonT('next')}
            {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Skip button at bottom */}
        {currentStep < steps.length - 1 && (
          <button
            onClick={handleSkip}
            className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {commonT('skip')}
          </button>
        )}
      </div>
    </div>
  );
}
