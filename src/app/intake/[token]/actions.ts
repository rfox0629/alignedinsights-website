"use server";

import { redirect } from "next/navigation";
import { allowedUploadTypes, intakeSections, intakeStorageBucket, maxUploadSizeBytes, uploadFields } from "@/lib/intake/config";
import { getValidatedIntakeLink } from "@/lib/intake/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type IntakeActionState = {
  error?: string;
};

function fieldName(sectionId: string, name: string) {
  return `${sectionId}.${name}`;
}

function readSection(formData: FormData, section: (typeof intakeSections)[number]) {
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

  const organizationProfile = readSection(formData, intakeSections[0]);

  for (const field of intakeSections[0].fields) {
    if ("required" in field && field.required && !String(organizationProfile[field.name] ?? "").trim()) {
      return { error: "Please complete the required organization profile fields." };
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
  const submissionPayload = {
    link_id: link.id,
    token,
    organization_profile: organizationProfile,
    financial_systems: readSection(formData, intakeSections[1]),
    reporting_visibility: readSection(formData, intakeSections[2]),
    payroll_staffing: readSection(formData, intakeSections[3]),
    giving_funds: readSection(formData, intakeSections[4]),
    banking_cash_debt: readSection(formData, intakeSections[5]),
    internal_controls: readSection(formData, intakeSections[6]),
    pain_points_goals: readSection(formData, intakeSections[7]),
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
