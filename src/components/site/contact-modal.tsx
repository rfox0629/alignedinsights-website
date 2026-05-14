"use client";

import { createContext, type ReactNode, useActionState, useCallback, useContext, useEffect, useId, useState } from "react";
import { submitReportRequest } from "@/app/report-request-actions";
import { PremiumMultiSelect, PremiumSelect } from "@/components/site/premium-select";
import { annualRevenueOptions, lookingForOptions, organizationTypeOptions } from "@/lib/report-request/options";
import { initialReportRequestState, type ReportRequestField, type ReportRequestState } from "@/lib/report-request/state";

type ContactModalContextValue = {
  openModal: () => void;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

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
        <ContactModalDialog closeModal={closeModal} descriptionId={descriptionId} titleId={titleId} />
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

function ContactModalDialog({
  closeModal,
  descriptionId,
  titleId,
}: {
  closeModal: () => void;
  descriptionId: string;
  titleId: string;
}) {
  const [state, formAction, isPending] = useActionState(submitReportRequest, initialReportRequestState);

  return (
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
        {state.success ? (
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
            <form action={formAction} className="contact-form">
              <input name="source" type="hidden" value="alignedinsights.tech" />
              <div className="contact-form-grid">
                <FormField error={<FieldError field="first_name" state={state} />} label="First name">
                  <input autoComplete="given-name" name="first_name" required type="text" />
                </FormField>
                <FormField error={<FieldError field="last_name" state={state} />} label="Last name">
                  <input autoComplete="family-name" name="last_name" required type="text" />
                </FormField>
                <FormField error={<FieldError field="email" state={state} />} label="Email">
                  <input autoComplete="email" name="email" required type="email" />
                </FormField>
                <FormField error={<FieldError field="phone" state={state} />} label="Phone">
                  <input autoComplete="tel" name="phone" required type="tel" />
                </FormField>
                <FormField error={<FieldError field="organization_name" state={state} />} label="Organization name">
                  <input autoComplete="organization" name="organization_name" required type="text" />
                </FormField>
                <FormSelectField error={<FieldError field="organization_type" state={state} />} label="Organization type">
                  <PremiumSelect ariaLabel="Organization type" name="organization_type" options={organizationTypeOptions} placeholder="Select one" required />
                </FormSelectField>
                <FormSelectField error={<FieldError field="annual_revenue" state={state} />} label="Annual revenue">
                  <PremiumSelect ariaLabel="Annual revenue" name="annual_revenue" options={annualRevenueOptions} placeholder="Select range" required />
                </FormSelectField>
                <FormSelectField error={<FieldError field="looking_for" state={state} />} label="What do you need help with?">
                  <PremiumMultiSelect
                    ariaLabel="What do you need help with?"
                    name="looking_for"
                    options={lookingForOptions}
                    placeholder="Select one or more"
                    required
                  />
                </FormSelectField>
                <FormField className="contact-field-wide" error={<FieldError field="message" state={state} />} label="Message / notes">
                  <textarea name="message" rows={4} />
                </FormField>
              </div>
              {state.error ? <p className="contact-error contact-form-error">{state.error}</p> : null}
              <p className="contact-support-line">
                This report helps uncover opportunities for cleaner reporting, stronger operational visibility, and better financial decision making.
              </p>
              <button className="btn btn-accent contact-submit" disabled={isPending} type="submit">
                {isPending ? "Sending..." : "Request My Report"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
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

function FieldError({
  field,
  state,
}: {
  field: ReportRequestField;
  state: ReportRequestState;
}) {
  const message = state.fieldErrors?.[field];

  if (!message) {
    return null;
  }

  return <span className="contact-error">{message}</span>;
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
