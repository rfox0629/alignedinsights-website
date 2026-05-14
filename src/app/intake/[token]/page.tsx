import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IntakeForm } from "@/app/intake/[token]/intake-form";
import { getValidatedIntakeLink } from "@/lib/intake/server";

export const metadata: Metadata = {
  title: "Financial Insights Intake | Aligned Insights",
  robots: {
    follow: false,
    index: false,
  },
};

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
};

export default async function IntakePage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { submitted } = await searchParams;
  const { link, status } = await getValidatedIntakeLink(token);

  if (submitted === "1" || status === "submitted") {
    return (
      <IntakeShell eyebrow="Intake received" title="Thank you. We received your intake.">
        <p>Our team will review the information and prepare the next step for your Financial Insights Report.</p>
      </IntakeShell>
    );
  }

  if (!link || status === "invalid") {
    return (
      <IntakeShell eyebrow="Link unavailable" title="This intake link is not available.">
        <p>The link may be incorrect, disabled, or already closed. Please contact Aligned Insights for a fresh intake link.</p>
        <Link className="btn btn-accent" href="/">Return home</Link>
      </IntakeShell>
    );
  }

  if (status === "expired") {
    return (
      <IntakeShell eyebrow="Link expired" title="This intake link has expired.">
        <p>Please contact Aligned Insights and we will send a new private intake link.</p>
        <Link className="btn btn-accent" href="/">Return home</Link>
      </IntakeShell>
    );
  }

  const contextOrganization = link.inquiry?.organization_name || link.organization_name || "Organization intake";
  const contextEmail = link.inquiry?.email || link.contact_email;

  return (
    <main className="intake-page">
      <div className="intake-container">
        <header className="intake-hero">
          <Link className="intake-logo" href="/">Aligned Insights</Link>
          <span className="section-label">Private Intake</span>
          <h1>Financial Insights Intake</h1>
          <p>
            This private form gives us the context needed to prepare a simple Financial Insights Report for your team.
          </p>
          <div className="intake-context">
            <span>{contextOrganization}</span>
            {contextEmail ? <span>{contextEmail}</span> : null}
          </div>
        </header>
        <IntakeForm token={token} />
      </div>
    </main>
  );
}

function IntakeShell({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="intake-page intake-state-page">
      <section className="intake-state-card">
        <Link className="intake-logo" href="/">Aligned Insights</Link>
        <span className="section-label">{eyebrow}</span>
        <h1>{title}</h1>
        <div>{children}</div>
      </section>
    </main>
  );
}
