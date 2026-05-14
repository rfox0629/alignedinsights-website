import { Logo } from "@/components/brand/logo";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionShell } from "@/components/layout/section-shell";
import { DashboardMockup } from "@/components/visuals/dashboard-mockup";
import { MetricStack } from "@/components/visuals/metric-stack";
import { SystemsFlow } from "@/components/visuals/systems-flow";

const pillars = [
  "Operational clarity",
  "Financial systems",
  "Simplified reporting",
  "Cleaner workflows",
  "Connected systems",
  "Reliable monthly rhythm",
];

const operatingModel = [
  {
    title: "Capture",
    copy: "Bring key finance and operations inputs into a dependable intake path.",
  },
  {
    title: "Clarify",
    copy: "Turn scattered activity into clean review points and simple summaries.",
  },
  {
    title: "Coordinate",
    copy: "Keep payroll, reporting, and handoffs moving through one shared rhythm.",
  },
  {
    title: "Lead",
    copy: "Give leadership the visibility needed to act without extra digging.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="relative px-5 pt-32 pb-20 sm:px-8 lg:px-10 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(7_21_38_/_0.06)_1px,transparent_1px),linear-gradient(180deg,rgb(7_21_38_/_0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="animate-soft-reveal">
            <p className="mb-5 text-xs font-semibold tracking-[0.24em] text-accent uppercase">
              alignedinsights.tech
            </p>
            <h1 className="max-w-5xl text-5xl leading-[0.92] font-semibold tracking-normal text-foreground sm:text-7xl lg:text-8xl">
              Clarity for the systems behind important work.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-foreground/68 sm:text-xl sm:leading-9">
              Aligned Insights creates the operating layer for cleaner financial
              workflows, simpler reporting, reliable monthly rhythm, and
              leadership visibility.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                className="rounded-md bg-foreground px-5 py-3 text-center text-sm font-semibold text-background transition hover:bg-foreground/90"
                href="mailto:hello@alignedinsights.tech"
              >
                Connect the foundation
              </a>
              <a
                className="rounded-md border border-foreground/12 px-5 py-3 text-center text-sm font-semibold transition hover:border-accent/70"
                href="#systems"
              >
                View the system
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-full bg-accent/10 blur-3xl" />
            <DashboardMockup />
          </div>
        </div>
      </section>

      <section className="border-y border-foreground/10 px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {pillars.map((pillar) => (
            <div
              className="rounded-md border border-foreground/10 bg-background/76 px-4 py-3 text-sm font-semibold text-foreground/74"
              key={pillar}
            >
              {pillar}
            </div>
          ))}
        </div>
      </section>

      <SectionShell
        copy="The foundation is designed around source systems, review points, reporting flow, and leadership decisions. Each layer is clean enough to support future forms, auth, CRM functionality, and operational dashboards."
        eyebrow="System architecture"
        id="systems"
        title="A connected operating model from intake to insight."
      >
        <SystemsFlow />
      </SectionShell>

      <SectionShell
        copy="The experience is built for calm review, not clutter. Teams get a sharper monthly view of what is complete, what needs attention, and what should move next."
        eyebrow="Leadership visibility"
        id="visibility"
        title="Know what matters without searching across disconnected tools."
      >
        <MetricStack />
      </SectionShell>

      <section
        className="px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
        id="rhythm"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-accent uppercase">
              Reliable monthly rhythm
            </p>
            <h2 className="text-4xl leading-[0.96] font-semibold tracking-normal sm:text-5xl lg:text-6xl">
              A professional structure for the work that keeps everything moving.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {operatingModel.map((item, index) => (
              <article
                className="glass-line min-h-64 rounded-xl border p-6"
                key={item.title}
              >
                <span className="font-mono text-sm text-accent">
                  0{index + 1}
                </span>
                <h3 className="mt-12 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-foreground/62">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-foreground/10 px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="max-w-md text-sm leading-6 text-foreground/58">
            Built for operational clarity, connected systems, cleaner workflows,
            and dependable reporting.
          </p>
        </div>
      </footer>
    </main>
  );
}
