"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { authenticateAdmin, getAdminInquiries, updateInquiryStatus } from "@/app/admin/actions";
import { inquiryStatuses, type AdminInquiry, type InquiryStatus } from "@/lib/admin/inquiries";

type AdminPortalProps = {
  title?: string;
};

const sessionKey = "aligned-insights-admin-session";
const teamMemberKey = "aligned-insights-admin-team-member";

const quickStatuses: InquiryStatus[] = ["Intake Sent", "Reviewing", "Completed"];

export function AdminPortal({ title = "Inquiries" }: AdminPortalProps) {
  const [authError, setAuthError] = useState("");
  const [copyState, setCopyState] = useState("");
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      inquiryStatuses.map((status) => ({
        status,
        total: inquiries.filter((inquiry) => inquiry.status === status).length,
      })),
    [inquiries],
  );

  const loadInquiries = useCallback((adminToken: string) => {
    setIsLoading(true);
    setAuthError("");

    startTransition(async () => {
      const result = await getAdminInquiries(adminToken);
      setIsLoading(false);

      if (!result.success || !result.data) {
        setAuthError(result.error || "Unable to load inquiries.");
        setIsAuthenticated(false);
        sessionStorage.removeItem(sessionKey);
        return;
      }

      setInquiries(result.data);
      setIsAuthenticated(true);
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

    startTransition(async () => {
      const result = await authenticateAdmin(submittedPassword);

      if (!result.success || !result.data?.token) {
        setAuthError(result.error || "Unable to sign in.");
        return;
      }

      sessionStorage.setItem(sessionKey, result.data.token);
      setToken(result.data.token);
      setPassword("");
    });
  }

  function handleSignOut() {
    sessionStorage.removeItem(sessionKey);
    setToken("");
    setIsAuthenticated(false);
    setInquiries([]);
    setSelectedId(null);
  }

  function applyInquiryUpdate(updatedInquiry: AdminInquiry) {
    setInquiries((current) =>
      current.map((inquiry) => (inquiry.id === updatedInquiry.id ? updatedInquiry : inquiry)),
    );
    setSelectedId(updatedInquiry.id);
  }

  function markStatus(inquiry: AdminInquiry, status: InquiryStatus) {
    setAuthError("");
    setCopyState("");

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
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
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

      <section className="admin-stats" aria-label="Inquiry status totals">
        {statusCounts.map(({ status, total }) => (
          <article className="admin-stat" key={status}>
            <span>{status}</span>
            <strong>{total}</strong>
          </article>
        ))}
      </section>

      {authError ? <p className="admin-error admin-page-error">{authError}</p> : null}

      <section className="admin-table-card">
        <div className="admin-table-head">
          <div>
            <h2>Inquiry inbox</h2>
            <p>{isLoading ? "Loading inquiries..." : `${inquiries.length} active records`}</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Contact Name</th>
                <th>Email</th>
                <th>Phone</th>
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
                    <td>{inquiry.phone || "Not provided"}</td>
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
                  <td colSpan={7}>
                    <div className="admin-empty">No inquiries yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
          <DetailItem label="Phone" value={inquiry.phone || "Not provided"} />
          <DetailItem label="Organization type" value={inquiry.organization_type} />
          <DetailItem label="Annual revenue" value={inquiry.annual_revenue} />
          <DetailItem label="Looking for" value={inquiry.looking_for || "Not provided"} />
          <DetailItem label="Submitted" value={formatDateTime(inquiry.created_at)} />
          <DetailItem label="Source" value={inquiry.source} />
        </section>

        {inquiry.message ? (
          <section className="admin-note">
            <span>Message</span>
            <p>{inquiry.message}</p>
          </section>
        ) : null}

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

function StatusBadge({ status }: { status: string }) {
  return <span className={`admin-status-badge admin-status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}

function buildIntakeEmail(inquiry: AdminInquiry) {
  return `Hi ${inquiry.first_name || "{{Contact first name}}"},

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
