"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useId, useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { PremiumSelect } from "@/components/site/premium-select";

type ContactModalContextValue = {
  openModal: () => void;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

const organizationTypes = ["Church", "Ministry", "Nonprofit", "School", "Service Business", "Other"];
const annualRevenue = ["Under $250K", "$250K-$500K", "$500K-$1M", "$1M-$3M", "$3M-$10M", "$10M+"];
const lookingFor = [
  "Accounting and bookkeeping",
  "Payroll support",
  "Financial reporting",
  "Board or leadership dashboards",
  "Fractional finance team",
  "Not sure yet",
];

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, handleSubmit, reset] = useForm("mojroqpe");
  const titleId = useId();
  const descriptionId = useId();

  const closeModal = useCallback(() => {
    setIsOpen(false);
    window.setTimeout(reset, 200);
  }, [reset]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeModal, isOpen]);

  return (
    <ContactModalContext.Provider value={{ openModal: () => setIsOpen(true) }}>
      {children}
      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          aria-modal="true"
          className="contact-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
          role="dialog"
        >
          <div className="contact-modal">
            <button aria-label="Close contact form" className="contact-close" onClick={closeModal} type="button">
              ×
            </button>
            {state.succeeded ? (
              <div className="contact-success">
                <span className="contact-success-icon">✓</span>
                <h2 id={titleId}>Thanks.</h2>
                <p id={descriptionId}>We received your request and will follow up with the next step for your free Financial Insights Report.</p>
                <button className="btn btn-accent" onClick={closeModal} type="button">
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="contact-modal-head">
                  <span className="section-label">Free Financial Insights Report</span>
                  <h2 id={titleId}>Get a Free Financial Insights Report</h2>
                  <p id={descriptionId}>
                    Tell us a little about your organization. We&apos;ll follow up with a private intake form so we can prepare a simple Financial Insights Report for your leadership team.
                  </p>
                </div>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <input name="_subject" type="hidden" value="New Aligned Insights Website Inquiry" />
                  <input name="source" type="hidden" value="alignedinsights.tech" />
                  <div className="contact-form-grid">
                    <FormField error={<ValidationError errors={state.errors} field="firstName" prefix="First name" />} label="First name">
                      <input autoComplete="given-name" name="firstName" required type="text" />
                    </FormField>
                    <FormField error={<ValidationError errors={state.errors} field="lastName" prefix="Last name" />} label="Last name">
                      <input autoComplete="family-name" name="lastName" required type="text" />
                    </FormField>
                    <FormField error={<ValidationError errors={state.errors} field="email" prefix="Email" />} label="Email">
                      <input autoComplete="email" name="email" required type="email" />
                    </FormField>
                    <FormField error={<ValidationError errors={state.errors} field="phone" prefix="Phone" />} label="Phone">
                      <input autoComplete="tel" name="phone" type="tel" />
                    </FormField>
                    <FormField
                      error={<ValidationError errors={state.errors} field="organizationName" prefix="Organization name" />}
                      label="Organization name"
                    >
                      <input autoComplete="organization" name="organizationName" required type="text" />
                    </FormField>
                    <FormSelectField
                      error={<ValidationError errors={state.errors} field="organizationType" prefix="Organization type" />}
                      label="Organization type"
                    >
                      <PremiumSelect ariaLabel="Organization type" name="organizationType" options={organizationTypes} placeholder="Select one" required />
                    </FormSelectField>
                    <FormSelectField
                      error={<ValidationError errors={state.errors} field="annualRevenue" prefix="Annual revenue" />}
                      label="Annual revenue"
                    >
                      <PremiumSelect ariaLabel="Annual revenue" name="annualRevenue" options={annualRevenue} placeholder="Select range" required />
                    </FormSelectField>
                    <FormSelectField
                      error={<ValidationError errors={state.errors} field="lookingFor" prefix="What are you looking for?" />}
                      label="What are you looking for?"
                    >
                      <PremiumSelect ariaLabel="What are you looking for?" name="lookingFor" options={lookingFor} placeholder="Select one" />
                    </FormSelectField>
                    <FormField
                      className="contact-field-wide"
                      error={<ValidationError errors={state.errors} field="message" prefix="Message" />}
                      label="Message"
                    >
                      <textarea name="message" rows={4} />
                    </FormField>
                  </div>
                  <ValidationError className="contact-error contact-form-error" errors={state.errors} />
                  <p className="contact-support-line">
                    This report helps uncover opportunities for cleaner reporting, stronger operational visibility, and better financial decision making.
                  </p>
                  <button className="btn btn-accent contact-submit" disabled={state.submitting} type="submit">
                    {state.submitting ? "Sending..." : "Request My Report"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}
    </ContactModalContext.Provider>
  );
}

export function ContactTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useContext(ContactModalContext);

  if (!context) {
    throw new Error("ContactTrigger must be used within ContactModalProvider");
  }

  return (
    <button className={className} onClick={context.openModal} type="button">
      {children}
    </button>
  );
}

function FormField({
  children,
  className,
  error,
  label,
}: {
  children: ReactNode;
  className?: string;
  error: ReactNode;
  label: string;
}) {
  return (
    <label className={`contact-field${className ? ` ${className}` : ""}`}>
      <span>{label}</span>
      {children}
      {error}
    </label>
  );
}

function FormSelectField({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error: ReactNode;
  label: string;
}) {
  return (
    <div className="contact-field">
      <span>{label}</span>
      {children}
      {error}
    </div>
  );
}
