interface StepTabsProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  fieldsMode?: string;
}

export const StepTabs = ({ currentStep, onStepChange, fieldsMode = "full" }: StepTabsProps) => {
  const steps = fieldsMode === "full" 
    ? ["Dados", "Entrega", "Pagamento"]
    : ["Dados", "Pagamento"];

  return (
    <div className="flex border-b border-border">
      {steps.map((step, index) => (
        <button
          key={step}
          onClick={() => onStepChange(index)}
          className={`flex-1 py-4 text-sm font-medium transition-all relative ${
            currentStep === index
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {step}
          {currentStep === index && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all" />
          )}
        </button>
      ))}
    </div>
  );
};
