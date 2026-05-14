import { SiteEffects } from "@/components/site/site-effects";

const problems = [
  {
    title: "Disconnected systems",
    copy: "Giving, payroll, accounting, and reporting tools that do not speak the same language.",
  },
  {
    title: "Late or unclear reports",
    copy: "Numbers arrive after they are needed, or arrive in formats that require a second translation.",
  },
  {
    title: "Too much manual follow up",
    copy: "The same questions, chases, and fixes repeat every month.",
  },
  {
    title: "Leadership without clean visibility",
    copy: "Decisions get made with partial context because the full picture takes too long to assemble.",
  },
];

const handled = [
  ["Accounting rhythm", "A steady monthly close, run on a predictable cadence your team can plan around."],
  ["Payroll coordination", "Smooth payroll cycles with the infrastructure and support behind every run."],
  ["Monthly reporting", "Board-ready reporting packages formatted for the people who actually use them."],
  ["Financial visibility", "Live views of cash, giving, runway, budget health, and staffing signals."],
  ["Process cleanup", "The messy parts behind the scenes, fixed, documented, and quietly running."],
  ["Leadership summaries", "Short, clear briefs that make board and operator conversations easier to lead."],
];

const visibility = [
  ["Cash position", "Know where cash stands before decisions are on the table."],
  ["Giving trends", "See movement across the month, quarter, and year."],
  ["Payroll health", "Understand staffing commitments before they become surprises."],
  ["Runway", "Keep future capacity visible without a spreadsheet hunt."],
  ["Budget health", "Know where plan and reality are starting to drift."],
  ["Meeting readiness", "See what needs attention before the meeting starts."],
];

const stack = [
  ["Accounting Intelligence", "Digits", "Categorization, transaction context, and accounting visibility."],
  ["Payroll & HR", "Gusto", "Payroll infrastructure and people operations support."],
  ["Operational Reporting", "Aligned Insights", "Dashboards, board packets, and monthly clarity."],
  ["Advisory Layer", "Leadership Support", "Experienced operators translating signals into decisions."],
  ["Automation Layer", "AI Workflows", "Repetitive workflows assisted by intelligent automation."],
];

const traditionalCosts = [
  ["CPA / Controller", "$180K"],
  ["Bookkeeper", "$70K"],
  ["Payroll Admin", "$60K"],
  ["Finance Assistant", "$55K"],
  ["Software Stack", "$20K"],
  ["Audit / Tax Support", "$25K"],
];

function Logo() {
  return (
    <span className="logo">
      <svg
        aria-hidden="true"
        className="logo-mark"
        fill="none"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="logoGradient" x1="0" x2="40" y1="0" y2="40">
            <stop offset="0" stopColor="#1e6bff" />
            <stop offset="1" stopColor="#6ec6ff" />
          </linearGradient>
        </defs>
        <rect fill="white" height="37" rx="10" stroke="#0b1b34" strokeOpacity="0.10" width="37" x="1.5" y="1.5" />
        <path d="M11 9 V20 a4 4 0 0 0 4 4 H20" fill="none" stroke="url(#logoGradient)" strokeLinecap="round" strokeWidth="2.4" />
        <path d="M29 31 V20 a4 4 0 0 0 -4 -4 H20" fill="none" stroke="#0b1b34" strokeLinecap="round" strokeWidth="2.4" />
        <circle cx="20" cy="20" fill="#1e6bff" r="2.4" />
      </svg>
      Aligned Insights
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg className="arrow" fill="none" height="15" viewBox="0 0 24 24" width="15">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg fill="none" height="11" viewBox="0 0 24 24" width="11">
      <path d="M5 12l4 4L19 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}

function HeroPreview() {
  return (
    <div className="hero-preview">
      <div className="hero-preview-frame">
        <div className="dash-wrap" style={{ margin: 0, maxWidth: "none" }}>
          <div className="dash-header">
            <div className="dash-title">
              <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
                <rect height="9" rx="2" stroke="currentColor" strokeWidth="1.6" width="7" x="3" y="3" />
                <rect height="5" rx="2" stroke="currentColor" strokeWidth="1.6" width="7" x="14" y="3" />
                <rect height="9" rx="2" stroke="currentColor" strokeWidth="1.6" width="7" x="14" y="12" />
                <rect height="5" rx="2" stroke="currentColor" strokeWidth="1.6" width="7" x="3" y="16" />
              </svg>
              Overview / November
            </div>
            <div className="dash-tabs">
              <span className="dash-tab active">Month</span>
              <span className="dash-tab">Quarter</span>
              <span className="dash-tab">Year</span>
            </div>
          </div>
          <DashboardGrid />
        </div>
      </div>
    </div>
  );
}

function DashboardGrid() {
  return (
    <div className="dash-grid">
      <div className="dash-card">
        <div className="dash-card-head">
          <div className="dash-card-label">Monthly giving</div>
          <span className="dash-card-trend">+4.2%</span>
        </div>
        <div className="dash-card-value">$248,910</div>
        <div aria-hidden="true" className="bars">
          {[40, 55, 48, 70, 62, 85, 76, 95].map((height) => (
            <span key={height} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="dash-card-meta">Tracking ahead of prior cycle</div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <div className="dash-card-label">Payroll summary</div>
          <span className="dash-card-trend flat">on schedule</span>
        </div>
        <div className="dash-card-value">$62,480</div>
        <svg aria-hidden="true" className="spark" preserveAspectRatio="none" viewBox="0 0 200 40">
          <path d="M0 25 L25 22 L50 26 L75 18 L100 20 L125 14 L150 17 L175 12 L200 16" fill="none" stroke="#1e6bff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <circle cx="200" cy="16" fill="#1e6bff" r="3" />
        </svg>
        <div className="dash-card-meta">24 team members · next run Nov 30</div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <div className="dash-card-label">Cash position</div>
          <span className="dash-card-trend">stable</span>
        </div>
        <div className="dash-card-value">$1.42M</div>
        <svg aria-hidden="true" className="spark" preserveAspectRatio="none" viewBox="0 0 200 40">
          <path d="M0 28 L30 24 L60 26 L90 18 L120 22 L150 15 L180 18 L200 14" fill="none" stroke="#1e6bff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
        <div className="dash-card-meta">7 accounts reconciled</div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <div className="dash-card-label">Budget health</div>
          <span className="dash-card-trend">92%</span>
        </div>
        <div className="dash-card-value">Healthy</div>
        <div aria-hidden="true" className="progress">
          <i style={{ width: "92%" }} />
        </div>
        <div className="dash-card-meta">3 categories above plan · 1 below</div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <div className="dash-card-label">Open tasks</div>
          <span className="dash-card-trend">4 active</span>
        </div>
        <div className="dash-card-value" style={{ fontSize: 26 }}>Month-end</div>
        <div className="status-list">
          <div className="status-row"><span className="lbl">Reconciliation</span><span className="pill done">done</span></div>
          <div className="status-row"><span className="lbl">Payroll review</span><span className="pill done">done</span></div>
          <div className="status-row"><span className="lbl">Reporting package</span><span className="pill">soon</span></div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <div className="dash-card-label">Reporting status</div>
          <span className="pill live">live</span>
        </div>
        <div className="dash-card-value" style={{ fontSize: 26 }}>Board packet</div>
        <svg aria-hidden="true" className="spark" preserveAspectRatio="none" viewBox="0 0 200 40">
          <path d="M0 30 L40 26 L80 22 L120 18 L160 14 L200 8" fill="none" stroke="#1e6bff" strokeLinecap="round" strokeWidth="2" />
        </svg>
        <div className="dash-card-meta">Delivers Dec 5 · auto compiled</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteEffects />
      <div id="top" />

      <div className="nav-wrap" id="navWrap">
        <div className="container">
          <nav>
            <a aria-label="Aligned Insights home" href="#top">
              <Logo />
            </a>
            <div className="nav-links">
              <a href="#solution">Platform</a>
              <a href="#handle">What we handle</a>
              <a href="#why">Why this exists</a>
              <a href="#dashboard">Dashboard</a>
            </div>
            <div className="nav-cta">
              <a className="btn btn-accent btn-sm" href="#cta">
                Schedule a Conversation
                <ArrowIcon />
              </a>
            </div>
          </nav>
        </div>
      </div>

      <main>
        <section className="hero">
          <div className="hero-bg">
            <div className="grid-overlay" />
          </div>
          <div className="container">
            <div className="hero-inner">
              <div className="eyebrow">
                <span className="dot"><CheckIcon /></span>
                Financial operations for churches, nonprofits, and mission-driven teams
              </div>
              <h1 className="hero-headline">
                Financial clarity<br />for teams carrying <em>important work.</em>
              </h1>
              <p className="hero-sub">
                Aligned Insights brings accounting, payroll infrastructure, dashboards,
                board-ready reporting, and operational insight into one clear rhythm.
              </p>
              <div className="hero-ctas">
                <a className="btn btn-accent" href="#cta">
                  Schedule a Conversation
                  <ArrowIcon />
                </a>
                <a className="btn btn-ghost" href="#solution">See How It Works</a>
              </div>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section className="problems section-padded">
          <div className="container">
            <div className="section-head reveal">
              <span className="section-label">The current state</span>
              <h2>The work should not<br />feel <em>this complicated.</em></h2>
              <p className="section-sub">
                Growing organizations often stitch together software, spreadsheets,
                outside support, and internal follow up that quietly slows everything down.
              </p>
            </div>
            <div className="problems-grid">
              {problems.map((problem, index) => (
                <article className="problem-card reveal" key={problem.title}>
                  <div className="problem-num">0{index + 1}</div>
                  <h3>{problem.title}</h3>
                  <p>{problem.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="why section-padded" id="why">
          <div className="container">
            <div className="why-grid">
              <div className="why-left reveal">
                <span className="section-label">Why this exists</span>
                <h2>Most teams do not need to build a full finance department.</h2>
                <p className="section-sub" style={{ margin: "18px 0 0", textAlign: "left" }}>
                  Many churches and nonprofits need the outcomes of a mature finance team
                  without hiring every role internally. They need clean systems, financial
                  clarity, payroll infrastructure, dashboards, board-ready reporting, and
                  operational insight.
                </p>
                <ul className="why-list">
                  {["Cleaner systems behind the scenes", "Reliable monthly rhythm", "Board-ready reporting", "Operational dashboards", "Fewer financial surprises"].map((item) => (
                    <li key={item}>
                      <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span className="why-check"><CheckIcon /></span>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div aria-hidden="true" className="why-visual reveal">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <div className="dash-card-label">Operational confidence</div>
                    <span className="dash-card-trend">live</span>
                  </div>
                  <div className="dash-card-value">92</div>
                  <div className="progress"><i style={{ width: "92%" }} /></div>
                  <div className="status-list">
                    <div className="status-row"><span className="lbl">Reporting timeliness</span><span className="pill done">clear</span></div>
                    <div className="status-row"><span className="lbl">Systems connected</span><span className="pill done">ready</span></div>
                    <div className="status-row"><span className="lbl">Leadership visibility</span><span className="pill live">current</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="solution" id="solution">
          <div className="container">
            <div className="section-head reveal">
              <span className="section-label">The platform</span>
              <h2>One clear system<br />for <em>financial operations.</em></h2>
              <p className="section-sub">
                Every source of financial activity, organized into a single rhythm and
                surfaced as decisions your leadership can act on.
              </p>
            </div>
            <div className="flow-stage reveal">
              <div className="flow-layout">
                <div className="flow-column">
                  {["Giving", "Payroll", "Bills", "Reporting"].map((item) => (
                    <div className="flow-node" key={item}>
                      <strong>{item}</strong>
                      <span>Source signal</span>
                    </div>
                  ))}
                </div>
                <div className="flow-hub">
                  <div className="flow-hub-icon">+</div>
                  <strong>Aligned Insights</strong>
                  <span>OPERATIONS LAYER</span>
                </div>
                <div className="flow-column">
                  {["Leadership view", "Clear decisions", "Confident team"].map((item) => (
                    <div className="flow-outcome" key={item}>
                      <strong>{item}</strong>
                      <span>Always current</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="comparison section-padded">
          <div className="container">
            <div className="section-head reveal">
              <span className="section-label">Enterprise finance team comparison</span>
              <h2>Enterprise-level finance operations, without building the entire department.</h2>
              <p className="section-sub">
                This is not positioned as cheap. It is a cleaner operating model for
                growing leadership teams that need mature financial visibility.
              </p>
            </div>
            <div className="comparison-grid">
              <article className="compare-card reveal">
                <h3>Traditional internal finance team</h3>
                <ul className="cost-list">
                  {traditionalCosts.map(([role, cost]) => (
                    <li key={role}><span>{role}</span><strong>{cost}</strong></li>
                  ))}
                </ul>
                <div className="cost-total">$410K+</div>
              </article>
              <article className="compare-card featured reveal">
                <h3>Aligned Insights</h3>
                <ul className="aligned-list">
                  {["Accounting", "Payroll", "Dashboards", "Board reporting", "Financial visibility", "AI enabled workflows", "Strategic insight"].map((item) => (
                    <li key={item}>
                      <span className="why-check"><CheckIcon /></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="fraction-note">
                  A mature financial operations layer at a fraction of the internal
                  department cost, designed to feel capable, calm, and board-ready.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="human">
          <div className="container">
            <div className="human-grid">
              <div className="human-copy reveal">
                <span className="section-label">AI + human layer</span>
                <h2>Technology handles the repetition. Experienced operators handle the decisions.</h2>
                <p className="section-sub" style={{ margin: "18px 0 0", textAlign: "left" }}>
                  Digits, Gusto, automation workflows, AI assisted categorization,
                  real-time dashboards, and experienced operational oversight work together
                  as one calm finance operating layer.
                </p>
              </div>
              <div className="human-card reveal">
                <div className="human-card-grid">
                  {["AI assisted categorization", "Automation workflows", "Real-time dashboards", "Experienced operational oversight"].map((item, index) => (
                    <div className="human-row" key={item}>
                      <span>0{index + 1}</span>
                      <div>
                        <strong>{item}</strong>
                        <p>Built to reduce repetitive work while keeping judgment in the right hands.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section section-padded" id="dashboard">
          <div className="container">
            <div className="section-head reveal">
              <span className="section-label">Executive visibility</span>
              <h2>Know what needs attention before the meeting starts.</h2>
              <p className="section-sub">
                The dashboard is built for leadership decision making, not accounting clutter.
              </p>
            </div>
            <div className="visibility-grid">
              {visibility.map(([title, copy]) => (
                <article className="visibility-card reveal" key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <strong>Clear</strong>
                </article>
              ))}
            </div>
            <div className="dash-wrap reveal" style={{ marginTop: 34 }}>
              <div className="dash-header">
                <div className="dash-title">Executive Overview / Current Cycle</div>
                <div className="dash-tabs">
                  <span className="dash-tab active">Live</span>
                  <span className="dash-tab">Board</span>
                  <span className="dash-tab">Export</span>
                </div>
              </div>
              <DashboardGrid />
            </div>
          </div>
        </section>

        <section className="section-padded" id="handle">
          <div className="container">
            <div className="section-head reveal">
              <span className="section-label">Operational backbone</span>
              <h2>The operational<br />backbone, <em>organized.</em></h2>
              <p className="section-sub">
                Software-led service across the financial rhythms your team needs every month.
              </p>
            </div>
            <div className="handle-grid">
              {handled.map(([title, copy]) => (
                <article className="handle-card reveal" key={title}>
                  <div className="handle-icon">◎</div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="stack-section section-padded">
          <div className="container">
            <div className="section-head reveal">
              <span className="section-label">Modern finance stack</span>
              <h2>A connected stack for growing organizations.</h2>
              <p className="section-sub">
                Churches, nonprofits, operators, boards, and mission-driven leadership teams
                get one organized view across the systems that matter.
              </p>
            </div>
            <div className="stack-grid">
              {stack.map(([layer, tool, copy]) => (
                <article className="stack-card reveal" key={layer}>
                  <span className="tag">{layer}</span>
                  <h3>{tool}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
            <p className="future-line reveal">Financial operations is just the beginning.</p>
          </div>
        </section>

        <section className="final-cta" id="cta">
          <div className="container">
            <div className="final-cta-inner">
              <span className="section-label reveal">Let&apos;s begin</span>
              <h2 className="reveal">Let your team <em>breathe again.</em></h2>
              <p className="reveal">
                Aligned Insights helps churches, nonprofits, and mission-driven organizations
                build a cleaner financial foundation without adding more work to the people
                already carrying the load.
              </p>
              <a className="btn btn-accent reveal" href="mailto:hello@alignedinsights.tech" style={{ fontSize: 15.5, padding: "16px 28px" }}>
                Start the Conversation
                <ArrowIcon />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="foot">
            <Logo />
            <div className="foot-links">
              <a href="#solution">Platform</a>
              <a href="#handle">What we handle</a>
              <a href="#why">Why this exists</a>
              <a href="#cta">Contact</a>
            </div>
            <div className="foot-meta">alignedinsights.tech · © 2026</div>
          </div>
        </div>
      </footer>
    </>
  );
}
