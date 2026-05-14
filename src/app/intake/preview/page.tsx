import Link from "next/link";

import { IntakeForm } from "@/app/intake/[token]/intake-form";

export const metadata = {
  title: "Financial Insights Intake Preview | Aligned Insights",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IntakePreviewPage() {
  return (
    <main className="intake-page">
      <div className="intake-container">
        <header className="intake-hero">
          <Link className="intake-logo" href="/">
            Aligned Insights
          </Link>
          <span className="section-label">Preview intake</span>
          <h1>Financial Insights Intake</h1>
          <p>
            This private form gathers the financial and operational context needed
            to prepare a Financial Insights Report for your leadership team.
          </p>
          <div className="intake-context">
            <span>Aligned Insights Review</span>
            <span>Preview mode</span>
          </div>
        </header>
        <IntakeForm token="preview" />
      </div>
    </main>
  );
}
