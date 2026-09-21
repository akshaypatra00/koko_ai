import React from 'react';

export function OnboardingProgress({ currentStep, totalSteps = 7, stepTitles = [] }) {
  const currentTitle = stepTitles[currentStep - 1] || '';

  return (
    <div className="w-full space-y-4">
      {/* Sleek Segmented Indicator Bar */}
      <div className="grid grid-cols-7 gap-1.5 w-full">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepIndex = i + 1;
          const isCompleted = stepIndex < currentStep;
          const isCurrent = stepIndex === currentStep;

          return (
            <div
              key={i}
              className="h-1 rounded-full overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: isCompleted
                  ? 'rgba(255, 255, 255, 0.7)'
                  : isCurrent
                  ? '#ffffff'
                  : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isCurrent ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Meta Line: Step Counter & Title */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-white/40 tracking-wider">
            {String(currentStep).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
          </span>
          <span className="text-white/20">&bull;</span>
          <span className="text-white/90 font-medium tracking-tight">
            {currentTitle}
          </span>
        </div>
        <span className="text-white/40 text-[11px]">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
    </div>
  );
}

export default OnboardingProgress;
