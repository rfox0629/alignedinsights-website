const metrics = [
  ["Close confidence", "97"],
  ["Open handoffs", "04"],
  ["Report drift", "Low"],
];

export function MetricStack() {
  return (
    <div className="grid gap-3">
      {metrics.map(([label, value], index) => (
        <div
          className="glass-line animate-soft-reveal grid grid-cols-[1fr_auto] items-end rounded-lg border p-5"
          key={label}
          style={{ animationDelay: `${index * 140}ms` }}
        >
          <div>
            <p className="text-sm font-medium text-foreground/56">{label}</p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-foreground/8">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: ["86%", "34%", "18%"][index] }}
              />
            </div>
          </div>
          <p className="font-mono text-3xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}
