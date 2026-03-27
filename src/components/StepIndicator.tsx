import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={`mt-2 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                  isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
