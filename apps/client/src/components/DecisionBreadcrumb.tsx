interface DecisionBreadcrumbProps {
  steps: Array<{ label: string }>;
}

export const DecisionBreadcrumb: React.FC<DecisionBreadcrumbProps> = ({ steps }) => {
  return (
    <nav aria-label="Progress" className="mb-6">
      <ol className="flex flex-wrap gap-2 text-sm text-slate-500">
        {steps.map((step, index) => (
          <li key={`${step.label}-${index}`} className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 ${index === steps.length - 1 ? 'border-primary text-primary' : 'border-slate-300'}`}
            >
              {index + 1}. {step.label}
            </span>
            {index < steps.length - 1 && <span aria-hidden="true">→</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};
