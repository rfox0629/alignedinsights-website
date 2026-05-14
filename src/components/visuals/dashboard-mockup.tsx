const rows = [
  ["Monthly close", "Ready", "99%"],
  ["Payroll handoff", "Reviewed", "2.4h"],
  ["Report packet", "Queued", "Fri"],
  ["Workflow health", "Clear", "12"],
];

export function DashboardMockup() {
  return (
    <div className="glass-line animate-float-panel relative overflow-hidden rounded-xl border p-4 sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-accent" />
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-foreground/46 uppercase">
              Operations view
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Leadership packet</h3>
          </div>
          <div className="rounded-full border border-accent/50 px-3 py-1 text-xs font-semibold text-foreground">
            Live rhythm
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["Clarity", "Reports", "Handoffs"].map((item, index) => (
            <div
              className="rounded-lg border border-foreground/10 bg-background/80 p-4"
              key={item}
            >
              <p className="text-xs font-medium text-foreground/50">{item}</p>
              <p className="mt-4 font-mono text-2xl font-semibold">
                {["96", "18", "04"][index]}
              </p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-foreground/10 bg-background/72">
          {rows.map((row) => (
            <div
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-foreground/8 px-4 py-3 last:border-b-0"
              key={row[0]}
            >
              <span className="text-sm font-medium">{row[0]}</span>
              <span className="rounded-full bg-accent/12 px-2.5 py-1 text-xs font-semibold">
                {row[1]}
              </span>
              <span className="font-mono text-sm text-foreground/58">{row[2]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
