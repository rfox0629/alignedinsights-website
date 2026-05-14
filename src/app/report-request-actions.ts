"use server";

import { randomUUID } from "crypto";

import { sendReportRequestNotification } from "@/lib/email/report-request-notification";
import { annualRevenueOptions, lookingForOptions, organizationTypeOptions } from "@/lib/report-request/options";
import type { ReportRequestState } from "@/lib/report-request/state";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type InquiryInsert = Database["public"]["Tables"]["aligned_insights_inquiries"]["Insert"];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const duplicateSubmissionCode = "23505";

function textValue(formData: FormData, key: string, maxLength = 500) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function optionalTextValue(formData: FormData, key: string, maxLength = 1000) {
  const value = textValue(formData, key, maxLength);

  return value || null;
}

function arrayValue(formData: FormData, key: string, maxLength = 140) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().slice(0, maxLength))
    .filter(Boolean);
}

function isAllowedOption<T extends readonly string[]>(value: string, options: T) {
  return options.includes(value as T[number]);
}

function isDuplicateSubmissionError(error: { code?: string; message?: string } | null) {
  return Boolean(
    error?.code === duplicateSubmissionCode &&
      (error.message?.includes("submission_token") ||
        error.message?.includes("aligned_insights_inquiries_submission_token_idx")),
  );
}

export async function submitReportRequest(_: ReportRequestState, formData: FormData): Promise<ReportRequestState> {
  const submissionToken = textValue(formData, "submission_token", 120) || randomUUID();
  const inquiry: InquiryInsert = {
    first_name: textValue(formData, "first_name", 120),
    last_name: textValue(formData, "last_name", 120),
    email: textValue(formData, "email", 254).toLowerCase(),
    phone: textValue(formData, "phone", 80),
    organization_name: textValue(formData, "organization_name", 180),
    organization_type: textValue(formData, "organization_type", 80),
    annual_revenue: textValue(formData, "annual_revenue", 80),
    looking_for: arrayValue(formData, "looking_for", 140),
    message: optionalTextValue(formData, "message", 2000),
    source: textValue(formData, "source", 120) || "alignedinsights.tech",
    submission_token: submissionToken,
  };

  const fieldErrors: ReportRequestState["fieldErrors"] = {};

  if (!inquiry.first_name) fieldErrors.first_name = "First name is required.";
  if (!inquiry.last_name) fieldErrors.last_name = "Last name is required.";
  if (!inquiry.email || !emailPattern.test(inquiry.email)) fieldErrors.email = "Enter a valid email address.";
  if (!inquiry.phone) fieldErrors.phone = "Phone is required.";
  if (!inquiry.organization_name) fieldErrors.organization_name = "Organization name is required.";

  if (!inquiry.organization_type || !isAllowedOption(inquiry.organization_type, organizationTypeOptions)) {
    fieldErrors.organization_type = "Select an organization type.";
  }

  if (!inquiry.annual_revenue || !isAllowedOption(inquiry.annual_revenue, annualRevenueOptions)) {
    fieldErrors.annual_revenue = "Select an annual revenue range.";
  }

  if (!inquiry.looking_for.length) {
    fieldErrors.looking_for = "Select at least one area of help.";
  } else if (inquiry.looking_for.some((value) => !isAllowedOption(value, lookingForOptions))) {
    fieldErrors.looking_for = "Select valid options.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Please review the highlighted fields and try again.",
      fieldErrors,
      success: false,
    };
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("aligned_insights_inquiries")
      .insert(inquiry)
      .select(
        "id, first_name, last_name, email, phone, organization_name, organization_type, annual_revenue, looking_for, message, source, status, submission_token, intake_email_sent_at, intake_email_sent_by, created_at, updated_at",
      )
      .single();

    if (error || !data) {
      if (isDuplicateSubmissionError(error)) {
        console.info("Duplicate report request submission ignored.", { submissionToken });
        return { success: true };
      }

      console.error("Unable to save Aligned Insights inquiry.", error);

      return {
        error: "We could not save your request. Please try again.",
        success: false,
      };
    }

    try {
      await sendReportRequestNotification(data);
    } catch (notificationError) {
      console.error("Inquiry saved, but the email notification failed.", {
        error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        inquiryId: data.id,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Report request submission failed.", error);

    return {
      error: "We could not save your request. Please try again.",
      success: false,
    };
  }
}
