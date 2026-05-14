import type { Metadata } from "next";
import Link from "next/link";

import { BriefingOverlayProvider } from "@/components/site/briefing-overlay";
import { ContactModalProvider } from "@/components/site/contact-modal";
import { cpaBriefing } from "@/lib/briefing/cpa-briefing";

export const metadata: Metadata = {
  title: `${cpaBriefing.title} | Aligned Insights`,
  description: cpaBriefing.subtitle,
  alternates: {
    canonical: cpaBriefing.sharePath,
  },
};

export default function CpaBriefingPage() {
  return (
    <ContactModalProvider>
      <BriefingOverlayProvider closeHref="/" initialOpen>
        <main className="briefing-route-shell">
          <Link className="intake-logo" href="/">
            Aligned Insights
          </Link>
          <span className="section-label">Research briefing</span>
          <h1>{cpaBriefing.title}</h1>
          <p>{cpaBriefing.subtitle}</p>
        </main>
      </BriefingOverlayProvider>
    </ContactModalProvider>
  );
}
