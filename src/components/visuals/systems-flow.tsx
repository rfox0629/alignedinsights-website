const nodes = ["Source", "Review", "Report", "Lead"];

export function SystemsFlow() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-foreground/10 bg-background p-6">
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 700 420"
      >
        <path
          className="animated-path"
          d="M70 110 C180 28 248 226 350 154 C454 82 488 290 632 206"
          stroke="rgb(32 217 255 / 0.72)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M58 306 C198 224 240 370 378 284 C488 216 540 326 648 266"
          stroke="rgb(7 21 38 / 0.14)"
          strokeLinecap="round"
          strokeWidth="1"
        />
      </svg>

      <div className="relative grid h-full min-h-[360px] grid-cols-2 content-between gap-4 sm:grid-cols-4 sm:items-center">
        {nodes.map((node, index) => (
          <div
            className="glass-line rounded-lg border p-4"
            key={node}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-xs text-foreground/48">
                0{index + 1}
              </span>
              <span className="size-2 rounded-full bg-accent shadow-[0_0_18px_rgb(32_217_255_/_0.8)]" />
            </div>
            <h3 className="text-lg font-semibold">{node}</h3>
            <p className="mt-2 text-sm leading-6 text-foreground/58">
              {[
                "Connected inputs from finance and operations.",
                "Clean checks before reports move forward.",
                "Simple views for monthly decisions.",
                "Visible signals for the next right action.",
              ][index]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
