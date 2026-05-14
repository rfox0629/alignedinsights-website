"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { authenticateAdmin, getAdminInquiries, updateInquiryStatus } from "@/app/admin/actions";
import { inquiryStatuses, type AdminInquiry, type AdminIntakeSubmission, type InquiryStatus } from "@/lib/admin/inquiries";
import { intakeSections } from "@/lib/intake/config";
import type { Database, Json } from "@/lib/supabase/types";

type AdminPortalProps = {
  title?: string;
};

const sessionKey = "aligned-insights-admin-session";
const teamMemberKey = "aligned-insights-admin-team-member";

const quickStatuses: InquiryStatus[] = ["Intake Sent", "Reviewing", "Completed"];
type InquiryRow = Database["public"]["Tables"]["aligned_insights_inquiries"]["Row"];

const statusMeta: Record<
  InquiryStatus,
  {
    caption: string;
    icon: string;
    tone: string;
  }
> = {
  New: {
    caption: "Fresh requests",
    icon: "✨",
    tone: "new",
  },
  Contacted: {
    caption: "Conversation opened",
    icon: "📞",
    tone: "contacted",
  },
  "Intake Sent": {
    caption: "Waiting on intake",
    icon: "📄",
    tone: "intake-sent",
  },
  Reviewing: {
    caption: "Report in motion",
    icon: "👀",
    tone: "reviewing",
  },
  Completed: {
    caption: "Closed loop",
    icon: "✅",
    tone: "completed",
  },
};

export function AdminPortal({ title = "Inquiries" }: AdminPortalProps) {
  const [authError, setAuthError] = useState("");
  const [copyState, setCopyState] = useState("");
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadWarning, setLoadWarning] = useState("");
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [teamMember, setTeamMember] = useState(() =>
    typeof window === "undefined" ? "" : sessionStorage.getItem(teamMemberKey) || "",
  );
  const [token, setToken] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem(sessionKey) || ""));

  const selectedInquiry = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === selectedId) || null,
    [inquiries, selectedId],
  );

  const statusCounts = useMemo(
    () =>
      inquiryStatuses.map((status) => {
        const total = inquiries.filter((inquiry) => inquiry.status === status).length;
        const percent = inquiries.length ? Math.max(8, Math.round((total / inquiries.length) * 100)) : 8;

        return {
          ...statusMeta[status],
          percent,
          status,
          total,
        };
      }),
    [inquiries],
  );

  const loadInquiries = useCallback((adminToken: string) => {
    setIsLoading(true);
    setAuthError("");
    setLoadWarning("");

    startTransition(async () => {
      const result = await getAdminInquiries(adminToken);
      setIsLoading(false);

      if (!result.success || !result.data) {
        const message = result.error || "Unable to load inquiries.";

        if (message.toLowerCase().includes("admin session")) {
          setAuthError(message);
          setIsAuthenticated(false);
          setToken("");
          sessionStorage.removeItem(sessionKey);
          return;
        }

        setInquiries([]);
        setIsAuthenticated(true);
        setLoadWarning(message);
        return;
      }

      setInquiries(result.data);
      setIsAuthenticated(true);
      setLoadWarning(result.warning || "");
    });
  }, []);

  useEffect(() => {
    if (token) {
      const timeout = window.setTimeout(() => loadInquiries(token), 0);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [loadInquiries, token]);

  useEffect(() => {
    if (teamMember) {
      sessionStorage.setItem(teamMemberKey, teamMember);
    }
  }, [teamMember]);

  function handleLogin(formData: FormData) {
    const submittedPassword = String(formData.get("password") || "");
    setAuthError("");
    setLoadWarning("");

    startTransition(async () => {
      const result = await authenticateAdmin(submittedPassword);

      if (!result.success || !result.data?.token) {
        setAuthError(result.error || "Unable to sign in.");
        return;
      }

      sessionStorage.setItem(sessionKey, result.data.token);
      setToken(result.data.token);
      setIsAuthenticated(true);
      setPassword("");
    });
  }

  function handleSignOut() {
    sessionStorage.removeItem(sessionKey);
    setAuthError("");
    setLoadWarning("");
    setToken("");
    setIsAuthenticated(false);
    setInquiries([]);
    setSelectedId(null);
  }

  function applyInquiryUpdate(updatedInquiry: InquiryRow) {
    setInquiries((current) =>
      current.map((inquiry) => (inquiry.id === updatedInquiry.id ? { ...inquiry, ...updatedInquiry } : inquiry)),
    );
    setSelectedId(updatedInquiry.id);
  }

  function markStatus(inquiry: AdminInquiry, status: InquiryStatus) {
    setAuthError("");
    setCopyState("");
    setLoadWarning("");

    startTransition(async () => {
      const result = await updateInquiryStatus({
        inquiryId: inquiry.id,
        sentBy: teamMember,
        status,
        token,
      });

      if (!result.success || !result.data) {
        setAuthError(result.error || "Unable to update inquiry.");
        return;
      }

      applyInquiryUpdate(result.data);
    });
  }

  async function copyEmail(inquiry: AdminInquiry) {
    setCopyState("");
    await navigator.clipboard.writeText(buildIntakeEmail(inquiry));
    setCopyState("Email copied.");
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-shell admin-login-shell">
        <section className="admin-login-card">
          <div>
            <span className="admin-kicker">Aligned Insights Admin</span>
            <h1>Sign in</h1>
            <p>Enter the admin portal password to review inquiries.</p>
          </div>
          <form action={handleLogin} className="admin-login-form">
            <label>
              <span>Password</span>
              <div className="admin-password-field">
                <input
                  autoComplete="current-password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? "Hide password" : "Show password"}
                </button>
              </div>
            </label>
            {authError ? <p className="admin-error">{authError}</p> : null}
            <button className="admin-button admin-button-primary" disabled={isPending} type="submit">
              {isPending ? "Checking..." : "Open admin"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="admin-kicker">Aligned Insights Admin</span>
          <h1>{title}</h1>
          <p>Review report requests and move each inquiry through intake.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-button" disabled={isLoading || isPending} onClick={() => loadInquiries(token)} type="button">
            Refresh
          </button>
          <button className="admin-button" onClick={handleSignOut} type="button">
            Sign out
          </button>
        </div>
      </header>

      {authError ? <p className="admin-error admin-page-error">{authError}</p> : null}
      {loadWarning ? <p className="admin-warning admin-page-warning">{loadWarning}</p> : null}

      <section className="admin-dashboard-frame" aria-label="Report request dashboard">
        <div className="admin-dashboard-head">
          <div>
            <span className="admin-dashboard-eyebrow">Overview / Requests</span>
            <h2>Report request pipeline</h2>
            <p>Track every inquiry from first request through intake review.</p>
          </div>
          <div className="admin-dashboard-tabs" aria-label="Dashboard timeframe">
            <span className="is-active">Live</span>
            <span>Month</span>
            <span>Year</span>
          </div>
        </div>

        <section className="admin-stats" aria-label="Inquiry status totals">
          {statusCounts.map(({ caption, icon, percent, status, tone, total }) => (
            <article className={`admin-stat admin-stat-${tone}`} key={status}>
              <div className="admin-stat-top">
                <span className="admin-stat-icon" aria-hidden="true">
                  {icon}
                </span>
                <span className="admin-stat-label">{status}</span>
              </div>
              <strong>{total}</strong>
              <div className="admin-stat-meter" aria-hidden="true">
                <span style={{ width: `${percent}%` }} />
              </div>
              <p>{caption}</p>
            </article>
          ))}
        </section>

        <section className="admin-table-card">
          <div className="admin-table-head">
            <div className="admin-table-title">
              <span className="admin-section-mark" aria-hidden="true">
                ▦
              </span>
              <div>
                <h2>Inquiry inbox</h2>
                <p>{isLoading ? "Loading inquiries..." : `${inquiries.length} active records`}</p>
              </div>
            </div>
            <span className={`admin-live-pill${loadWarning ? " is-warning" : ""}`}>
              {loadWarning ? "Setup needed" : "Live"}
            </span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Contact Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Help Needed</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {inquiries.length ? (
                  inquiries.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td>
                        <strong>{inquiry.organization_name}</strong>
                        <span>{inquiry.organization_type}</span>
                      </td>
                      <td>{fullName(inquiry)}</td>
                      <td>
                        <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                      </td>
                      <td>{inquiry.phone}</td>
                      <td>
                        <HelpPills values={inquiry.looking_for} />
                      </td>
                      <td>{formatDate(inquiry.created_at)}</td>
                      <td>
                        <StatusBadge status={inquiry.status} />
                      </td>
                      <td>
                        <button className="admin-link-button" onClick={() => setSelectedId(inquiry.id)} type="button">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <AdminEmptyState hasSetupWarning={Boolean(loadWarning)} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {selectedInquiry ? (
        <InquiryDrawer
          copyEmail={copyEmail}
          copyState={copyState}
          inquiry={selectedInquiry}
          isPending={isPending}
          markStatus={markStatus}
          onClose={() => {
            setSelectedId(null);
            setCopyState("");
          }}
          teamMember={teamMember}
          setTeamMember={setTeamMember}
        />
      ) : null}
    </main>
  );
}

function AdminEmptyState({ hasSetupWarning }: { hasSetupWarning: boolean }) {
  return (
    <div className="admin-empty">
      <span className="admin-empty-icon" aria-hidden="true">
        {hasSetupWarning ? "⚙️" : "✨"}
      </span>
      <h3>{hasSetupWarning ? "Connect inquiry data" : "No report requests yet"}</h3>
      <p>
        {hasSetupWarning
          ? "Supabase configuration is needed before the dashboard can load inquiry records."
          : "New Financial Insights Report requests will appear here as soon as they arrive."}
      </p>
    </div>
  );
}

function InquiryDrawer({
  copyEmail,
  copyState,
  inquiry,
  isPending,
  markStatus,
  onClose,
  setTeamMember,
  teamMember,
}: {
  copyEmail: (inquiry: AdminInquiry) => Promise<void>;
  copyState: string;
  inquiry: AdminInquiry;
  isPending: boolean;
  markStatus: (inquiry: AdminInquiry, status: InquiryStatus) => void;
  onClose: () => void;
  setTeamMember: (value: string) => void;
  teamMember: string;
}) {
  const emailTemplate = buildIntakeEmail(inquiry);
  const mailtoHref = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(
    "Your Financial Insights Report intake",
  )}&body=${encodeURIComponent(emailTemplate)}`;

  return (
    <div className="admin-drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside aria-label="Inquiry detail" className="admin-drawer">
        <header className="admin-drawer-head">
          <div>
            <span className="admin-kicker">Inquiry detail</span>
            <h2>{inquiry.organization_name}</h2>
            <p>{fullName(inquiry)} - {inquiry.email}</p>
          </div>
          <button aria-label="Close inquiry detail" className="admin-icon-button" onClick={onClose} type="button">
            x
          </button>
        </header>

        <section className="admin-detail-grid">
          <DetailItem label="Phone" value={inquiry.phone} />
          <DetailItem label="Organization type" value={inquiry.organization_type} />
          <DetailItem label="Annual revenue" value={inquiry.annual_revenue} />
          <div className="admin-detail-item">
            <span>Help needed</span>
            <HelpPills values={inquiry.looking_for} />
          </div>
          <DetailItem label="Submitted" value={formatDateTime(inquiry.created_at)} />
          <DetailItem label="Source" value={inquiry.source} />
        </section>

        {inquiry.message ? (
          <section className="admin-note">
            <span>Message</span>
            <p>{inquiry.message}</p>
          </section>
        ) : null}

        <IntakeSummary inquiry={inquiry} />

        <section className="admin-status-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Status</h3>
              <p>Current: {inquiry.status}</p>
            </div>
            <StatusBadge status={inquiry.status} />
          </div>
          <div className="admin-status-actions">
            <button className="admin-button" disabled={isPending} onClick={() => markStatus(inquiry, "Contacted")} type="button">
              Mark Contacted
            </button>
            {quickStatuses.map((status) => (
              <button className="admin-button" disabled={isPending} key={status} onClick={() => markStatus(inquiry, status)} type="button">
                Mark {status}
              </button>
            ))}
          </div>
        </section>

        <section className="admin-email-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Intake email</h3>
              <p>Use the intake form link placeholder before sending.</p>
            </div>
          </div>
          <label className="admin-sent-by">
            <span>Sent by team member</span>
            <input
              onChange={(event) => setTeamMember(event.target.value)}
              placeholder="Team member name"
              type="text"
              value={teamMember}
            />
          </label>
          <pre className="admin-email-template">{emailTemplate}</pre>
          <div className="admin-email-actions">
            <button className="admin-button admin-button-primary" onClick={() => copyEmail(inquiry)} type="button">
              Copy Email
            </button>
            <a className="admin-button" href={mailtoHref}>
              Open in Gmail
            </a>
          </div>
          <div className="admin-email-meta">
            <span>Sent date: {inquiry.intake_email_sent_at ? formatDateTime(inquiry.intake_email_sent_at) : "Not marked"}</span>
            <span>Sent by: {inquiry.intake_email_sent_by || "Not recorded"}</span>
          </div>
          {copyState ? <p className="admin-success">{copyState}</p> : null}
        </section>
      </aside>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HelpPills({ values }: { values: string[] }) {
  return (
    <div className="admin-help-pills">
      {values.length ? (
        values.map((value) => (
          <span className="admin-help-pill" key={value}>
            {value}
          </span>
        ))
      ) : (
        <span className="admin-help-pill is-empty">Not provided</span>
      )}
    </div>
  );
}

function IntakeSummary({ inquiry }: { inquiry: AdminInquiry }) {
  const latestSubmission = getLatestIntakeSubmission(inquiry);
  const latestLink = inquiry.intake_links[0];

  return (
    <section className="admin-intake-panel">
      <div className="admin-panel-head">
        <div>
          <h3>Financial intake</h3>
          <p>
            {latestSubmission
              ? `Submitted ${formatDateTime(latestSubmission.created_at)}`
              : latestLink
                ? `Link ${latestLink.status}`
                : "No private intake submitted yet."}
          </p>
        </div>
        {latestSubmission ? <StatusBadge status="Completed" /> : null}
      </div>

      {!latestSubmission ? (
        <div className="admin-empty admin-empty-compact">
          The original request is saved above. Deeper intake answers will appear here after the private form is submitted.
        </div>
      ) : (
        <div className="admin-intake-sections">
          {intakeSections.map((section) => (
            <IntakeSectionSummary
              data={getSubmissionSectionData(latestSubmission, section.id)}
              fields={section.fields}
              key={section.id}
              title={section.title}
            />
          ))}
          <UploadsSummary submission={latestSubmission} />
        </div>
      )}
    </section>
  );
}

function IntakeSectionSummary({
  data,
  fields,
  title,
}: {
  data: Record<string, Json | undefined>;
  fields: (typeof intakeSections)[number]["fields"];
  title: string;
}) {
  return (
    <section className="admin-intake-section">
      <h4>{title}</h4>
      <div className="admin-intake-grid">
        {fields.map((field) => (
          <DetailItem key={field.name} label={field.label} value={formatJsonValue(data[field.name])} />
        ))}
      </div>
    </section>
  );
}

function UploadsSummary({ submission }: { submission: AdminIntakeSubmission }) {
  if (!submission.files.length) {
    return (
      <section className="admin-intake-section">
        <h4>Uploads</h4>
        <div className="admin-empty admin-empty-compact">No files uploaded.</div>
      </section>
    );
  }

  return (
    <section className="admin-intake-section">
      <h4>Uploads</h4>
      <div className="admin-intake-grid">
        {submission.files.map((file) => (
          <DetailItem
            key={file.id}
            label={file.file_label || "Document"}
            value={file.file_name || "Uploaded file"}
          />
        ))}
      </div>
    </section>
  );
}

function getLatestIntakeSubmission(inquiry: AdminInquiry) {
  return inquiry.intake_links
    .flatMap((link) => link.submissions)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
}

function getSubmissionSectionData(submission: AdminIntakeSubmission, sectionId: (typeof intakeSections)[number]["id"]) {
  const value = submission[sectionId];

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json | undefined>;
  }

  return {};
}

function formatJsonValue(value: Json | undefined) {
  if (Array.isArray(value)) {
    return value.length ? value.map(String).join(", ") : "Not provided";
  }

  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (typeof value === "object") {
    return "Saved with inquiry record";
  }

  return String(value);
}

function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status as InquiryStatus];

  return (
    <span className={`admin-status-badge admin-status-${status.toLowerCase().replaceAll(" ", "-")}`}>
      {meta ? (
        <span className="admin-status-icon" aria-hidden="true">
          {meta.icon}
        </span>
      ) : null}
      {status}
    </span>
  );
}

function buildIntakeEmail(inquiry: AdminInquiry) {
  return `Hi {{Contact first name}},

Thank you for requesting a Financial Insights Report for ${inquiry.organization_name}. The next step is a short private intake form so we can understand your current financial reporting structure.

Intake form link:
{{Intake form link}}

Once we receive it, our team will review the information and prepare the next step.

Aligned Insights`;
}

function fullName(inquiry: AdminInquiry) {
  return `${inquiry.first_name} ${inquiry.last_name}`.trim();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
