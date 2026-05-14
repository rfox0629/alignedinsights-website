"use client";

import { useActionState } from "react";
import { submitIntake } from "@/app/intake/[token]/actions";
import { PremiumSelect } from "@/components/site/premium-select";
import { intakeSections, isIntakeFieldRequired, maxUploadSizeBytes, uploadFields } from "@/lib/intake/config";

function fieldName(sectionId: string, name: string) {
  return `${sectionId}.${name}`;
}

export function IntakeForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(submitIntake, {});

  return (
    <form action={formAction} className="intake-form">
      <input name="token" type="hidden" value={token} />
      <div className="intake-progress" aria-label="Intake sections">
        {intakeSections.map((section, index) => (
          <a href={`#${section.id}`} key={section.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {section.title}
          </a>
        ))}
        <a href="#uploads">
          <span>09</span>
          Uploads
        </a>
      </div>

      <div className="intake-section-stack">
        {intakeSections.map((section, index) => (
          <section className="intake-card" id={section.id} key={section.id}>
            <div className="intake-card-head">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.intro}</p>
              </div>
            </div>
            <div className="intake-grid">
              {section.fields.map((field) => (
                <FieldRenderer field={field} key={field.name} sectionId={section.id} />
              ))}
            </div>
          </section>
        ))}

        <section className="intake-card" id="uploads">
          <div className="intake-card-head">
            <span>09</span>
            <div>
              <h2>Uploads</h2>
              <p>Please remove sensitive personal information where possible. We only need enough information to understand your current financial reporting structure.</p>
            </div>
          </div>
          <div className="upload-grid">
            {uploadFields.map((label, index) => (
              <label className="upload-field" key={label}>
                <span>{label}</span>
                <input
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,application/pdf,image/png,image/jpeg,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  name={`upload_${index}`}
                  type="file"
                />
              </label>
            ))}
          </div>
          <p className="intake-helper">Accepted: PDF, PNG, JPG, CSV, XLSX. Maximum file size: {Math.round(maxUploadSizeBytes / 1024 / 1024)}MB each.</p>
        </section>
      </div>

      {state.error ? <p className="intake-error">{state.error}</p> : null}
      <div className="intake-submit-bar">
        <p>Review your answers, then submit once. The private link will close after submission.</p>
        <button className="btn btn-accent" disabled={isPending} type="submit">
          {isPending ? "Submitting..." : "Submit Intake"}
        </button>
      </div>
    </form>
  );
}

function FieldRenderer({
  field,
  sectionId,
}: {
  field: (typeof intakeSections)[number]["fields"][number];
  sectionId: string;
}) {
  const name = fieldName(sectionId, field.name);
  const isWide = field.type === "textarea" || field.type === "checkbox";
  const required = isIntakeFieldRequired(field);

  if (field.type === "textarea") {
    return (
      <label className="intake-field intake-field-wide">
        <span>{field.label}{required ? " *" : ""}</span>
        <textarea name={name} required={required} rows={4} />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div className="intake-field">
        <span>{field.label}{required ? " *" : ""}</span>
        <PremiumSelect
          ariaLabel={field.label}
          name={name}
          options={field.options}
          placeholder={required ? "Select one" : "Optional"}
          required={required}
        />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <fieldset className="intake-field intake-field-wide intake-checks">
        <legend>{field.label}{required ? " *" : ""}</legend>
        <div>
          {field.options.map((option) => (
            <label key={option}>
              <input name={name} type="checkbox" value={option} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className={`intake-field${isWide ? " intake-field-wide" : ""}`}>
      <span>{field.label}{required ? " *" : ""}</span>
      <input name={name} required={required} type={field.type} />
    </label>
  );
}
