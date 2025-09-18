interface ModeSummaryProps {
  title: string;
  description: string;
  highlights: string[];
}

export const ModeSummary: React.FC<ModeSummaryProps> = ({ title, description, highlights }) => {
  return (
    <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </header>
      <ul className="grid gap-3 md:grid-cols-3">
        {highlights.map((item) => (
          <li key={item} className="rounded border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
};
