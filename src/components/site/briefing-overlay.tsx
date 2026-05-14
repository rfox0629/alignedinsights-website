"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useId, useState } from "react";

import { cpaBriefing } from "@/lib/briefing/cpa-briefing";
import { ContactTrigger } from "@/components/site/contact-modal";

type BriefingContextValue = {
  openBriefing: () => void;
};

const BriefingContext = createContext<BriefingContextValue | null>(null);

export function BriefingOverlayProvider({
  children,
  closeHref,
  initialOpen = false,
}: {
  children: ReactNode;
  closeHref?: string;
  initialOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const titleId = useId();

  const closeBriefing = useCallback(() => {
    if (closeHref) {
      window.location.assign(closeHref);
      return;
    }

    setIsOpen(false);
  }, [closeHref]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBriefing();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeBriefing, isOpen]);

  return (
    <BriefingContext.Provider value={{ openBriefing: () => setIsOpen(true) }}>
      {children}
      {isOpen ? <BriefingOverlay closeBriefing={closeBriefing} titleId={titleId} /> : null}
    </BriefingContext.Provider>
  );
}

export function BriefingTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(BriefingContext);

  if (!context) {
    throw new Error("BriefingTrigger must be used within BriefingOverlayProvider");
  }

  return (
    <button className={className} onClick={context.openBriefing} type="button">
      {children}
    </button>
  );
}

function BriefingOverlay({ closeBriefing, titleId }: { closeBriefing: () => void; titleId: string }) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");

  const copyShareLink = async () => {
    const shareUrl = `${window.location.origin}${cpaBriefing.sharePath}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1800);
    } catch {
      setShareState("failed");
    }
  };

  return (
    <div aria-labelledby={titleId} aria-modal="true" className="briefing-overlay" role="dialog">
      <div className="briefing-topbar">
        <button aria-label="Close briefing" className="briefing-close" onClick={closeBriefing} type="button">
          <span aria-hidden="true">×</span>
        </button>
        <div className="briefing-topbar-title">
          <span>Aligned Insights</span>
          <strong>Research Briefing</strong>
        </div>
        <div className="briefing-actions">
          <a className="briefing-action" download href={cpaBriefing.pdfPath}>
            Download PDF
          </a>
          <button className="briefing-action" onClick={copyShareLink} type="button">
            {shareState === "copied" ? "Link Copied" : shareState === "failed" ? "Copy Failed" : "Copy Share Link"}
          </button>
        </div>
      </div>

      <article className="briefing-reader">
        <header className="briefing-hero-panel">
          <span className="section-label">{cpaBriefing.eyebrow}</span>
          <h1 id={titleId}>{cpaBriefing.title}</h1>
          <p className="briefing-dek">{cpaBriefing.dek}</p>
          <p className="briefing-subtitle">{cpaBriefing.subtitle}</p>
          <div className="briefing-meta">
            <span>3 minute read</span>
            <span>PDF available</span>
            <span>Shareable briefing</span>
          </div>
        </header>

        <section className="briefing-stat-grid" aria-label="Research signals">
          {cpaBriefing.stats.map((stat) => (
            <div className="briefing-stat-card" key={stat.value}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <p>{stat.copy}</p>
            </div>
          ))}
        </section>

        {cpaBriefing.sections.map((section) => (
          <section className="briefing-section" key={section.number}>
            <div className="briefing-section-kicker">
              <span>{section.number}</span>
              <p>{section.eyebrow}</p>
            </div>
            <div className="briefing-section-body">
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {"quote" in section && section.quote ? (
                <blockquote>{section.quote}</blockquote>
              ) : null}
              {"callouts" in section && section.callouts ? (
                <div className="briefing-callouts">
                  {section.callouts.map((callout) => (
                    <span key={callout}>{callout}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ))}

        <section className="briefing-closing">
          <span className="section-label">Final thought</span>
          <h2>{cpaBriefing.close.title}</h2>
          <p>{cpaBriefing.close.body}</p>
          <div className="briefing-final-actions">
            <ContactTrigger className="btn btn-accent">
              {cpaBriefing.close.cta}
            </ContactTrigger>
            <p>{cpaBriefing.close.subtext}</p>
          </div>
        </section>

        <section className="briefing-reference-panel">
          <div>
            <span className="section-label">References</span>
            <h2>Research signals behind the briefing.</h2>
          </div>
          <div className="briefing-reference-list">
            {cpaBriefing.references.map((reference) => (
              <a href={reference.url} key={reference.title} rel="noreferrer" target="_blank">
                <span>{reference.label}</span>
                <strong>{reference.title}</strong>
              </a>
            ))}
          </div>
        </section>

        <footer className="briefing-reader-footer">
          <a className="briefing-action" download href={cpaBriefing.pdfPath}>
            Download PDF
          </a>
          <button className="briefing-action" onClick={copyShareLink} type="button">
            {shareState === "copied" ? "Link Copied" : "Copy Share Link"}
          </button>
        </footer>
      </article>
    </div>
  );
}
