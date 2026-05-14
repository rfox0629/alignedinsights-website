"use server";

import { redirect } from "next/navigation";
import {
  allowedUploadTypes,
  intakeSections,
  intakeStorageBucket,
  isIntakeFieldRequired,
  maxUploadSizeBytes,
  uploadFields,
  type IntakeSection,
} from "@/lib/intake/config";
import { getValidatedIntakeLink } from "@/lib/intake/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type IntakeActionState = {
  error?: string;
};

function fieldName(sectionId: string, name: string) {
  return `${sectionId}.${name}`;
}

function readSection(formData: FormData, section: IntakeSection) {
  const data: Record<string, string | string[]> = {};

  for (const field of section.fields) {
    const name = fieldName(section.id, field.name);

    if (field.type === "checkbox") {
      const values = formData.getAll(name).map(String).filter(Boolean);
      data[field.name] = values;
      continue;
    }

    const value = formData.get(name);
    data[field.name] = value ? String(value) : "";
  }

  return data;
}

function validateSection(data: Record<string, string | string[]>, section: IntakeSection) {
  for (const field of section.fields) {
    const value = data[field.name];

    if (isIntakeFieldRequired(field)) {
      if (field.type === "checkbox" && (!Array.isArray(value) || !value.length)) {
        return `Please complete ${section.title}.`;
      }

      if (field.type !== "checkbox" && !String(value ?? "").trim()) {
        return `Please complete ${section.title}.`;
      }
    }

    if ((field.type === "select" || field.type === "checkbox") && value) {
      const values = Array.isArray(value) ? value : [String(value)];
      const invalid = values.some((item) => !field.options.some((option) => option === item));

      if (invalid) {
        return `Please use valid options in ${section.title}.`;
      }
    }
  }

  return "";
}

function buildInquirySnapshot(link: NonNullable<Awaited<ReturnType<typeof getValidatedIntakeLink>>["link"]>) {
  if (!link.inquiry) {
    return {
      contactEmail: link.contact_email,
      organizationName: link.organization_name,
    };
  }

  return {
    annualRevenueRange: link.inquiry.annual_revenue,
    contactEmail: link.inquiry.email,
    contactName: `${link.inquiry.first_name} ${link.inquiry.last_name}`.trim(),
    mainAreas: link.inquiry.looking_for,
    organizationName: link.inquiry.organization_name,
    organizationType: link.inquiry.organization_type,
    phone: link.inquiry.phone,
  };
}

function safeFileName(name: string) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return cleaned || `upload-${Date.now()}`;
}

function uploadName(index: number) {
  return `upload_${index}`;
}

export async function submitIntake(_: IntakeActionState, formData: FormData): Promise<IntakeActionState> {
  const token = String(formData.get("token") ?? "");
  const { link, status } = await getValidatedIntakeLink(token);

  if (!link || status !== "valid") {
    return { error: "This intake link is no longer available." };
  }

  const sectionData = intakeSections.map((section) => readSection(formData, section));

  for (let index = 0; index < intakeSections.length; index += 1) {
    const validationError = validateSection(sectionData[index], intakeSections[index]);

    if (validationError) {
      return { error: validationError };
    }
  }

  for (let index = 0; index < uploadFields.length; index += 1) {
    const file = formData.get(uploadName(index));

    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    if (file.size > maxUploadSizeBytes) {
      return { error: `${uploadFields[index]} is larger than the 10MB limit.` };
    }

    if (!allowedUploadTypes.includes(file.type)) {
      return { error: `${uploadFields[index]} must be a PDF, PNG, JPG, CSV, or XLSX file.` };
    }
  }

  const supabase = getSupabaseAdminClient();
  const inquiryId = link.inquiry_id || link.inquiry?.id || null;

  if (inquiryId && !link.inquiry_id) {
    await supabase.from("financial_intake_links").update({ inquiry_id: inquiryId }).eq("id", link.id);
  }

  const submissionPayload = {
    inquiry_id: inquiryId,
    link_id: link.id,
    token,
    organization_profile: {
      inquiry: buildInquirySnapshot(link),
      ...sectionData[0],
    },
    financial_systems: sectionData[1],
    reporting_visibility: sectionData[2],
    payroll_staffing: sectionData[3],
    giving_funds: sectionData[4],
    banking_cash_debt: sectionData[5],
    internal_controls: sectionData[6],
    pain_points_goals: sectionData[7],
    uploads: {},
  };

  const { data: submission, error: submissionError } = await supabase
    .from("financial_intake_submissions")
    .insert(submissionPayload)
    .select("id")
    .single();

  if (submissionError || !submission) {
    return { error: "We could not save the intake right now. Please try again." };
  }

  const uploadedFiles = [];

  for (let index = 0; index < uploadFields.length; index += 1) {
    const file = formData.get(uploadName(index));

    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    const path = `financial-intake/${submission.id}/${Date.now()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(intakeStorageBucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: `We could not upload ${uploadFields[index]}. Please try again.` };
    }

    const fileRecord = {
      submission_id: submission.id,
      file_label: uploadFields[index],
      file_name: file.name,
      file_path: path,
      file_type: file.type,
      file_size: file.size,
    };

    const { error: fileError } = await supabase.from("financial_intake_files").insert(fileRecord);

    if (fileError) {
      return { error: `We uploaded ${uploadFields[index]}, but could not save its metadata.` };
    }

    uploadedFiles.push(fileRecord);
  }

  const { error: updateSubmissionError } = await supabase
    .from("financial_intake_submissions")
    .update({ uploads: { files: uploadedFiles } })
    .eq("id", submission.id);

  if (updateSubmissionError) {
    return { error: "We saved the intake, but could not finalize the upload summary." };
  }

  const { error: linkUpdateError } = await supabase
    .from("financial_intake_links")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", link.id);

  if (linkUpdateError) {
    return { error: "We saved the intake, but could not mark the link as submitted." };
  }

  redirect(`/intake/${token}?submitted=1`);
}
