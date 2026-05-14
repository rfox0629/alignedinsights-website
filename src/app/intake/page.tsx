import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Financial Insights Intake | Aligned Insights",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IntakeIndexPage() {
  return (
    <main className="intake-page intake-state-page">
      <section className="intake-state-card">
        <Link className="intake-logo" href="/">
          Aligned Insights
        </Link>
        <span className="section-label">Private intake</span>
        <h1>Intake link required.</h1>
        <p>This page is used for private Financial Insights intake links sent by the Aligned Insights team.</p>
        <Link className="btn btn-accent" href="/">
          Return home
        </Link>
      </section>
    </main>
  );
}
