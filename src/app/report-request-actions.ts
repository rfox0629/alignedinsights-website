"use server";

import { sendReportRequestNotification } from "@/lib/email/report-request-notification";
import { annualRevenueOptions, lookingForOptions, organizationTypeOptions } from "@/lib/report-request/options";
import type { ReportRequestState } from "@/lib/report-request/state";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type InquiryInsert = Database["public"]["Tables"]["aligned_insights_inquiries"]["Insert"];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function isAllowedOption<T extends readonly string[]>(value: string, options: T) {
  return options.includes(value as T[number]);
}

export async function submitReportRequest(_: ReportRequestState, formData: FormData): Promise<ReportRequestState> {
  const inquiry: InquiryInsert = {
    first_name: textValue(formData, "first_name", 120),
    last_name: textValue(formData, "last_name", 120),
    email: textValue(formData, "email", 254).toLowerCase(),
    phone: optionalTextValue(formData, "phone", 80),
    organization_name: textValue(formData, "organization_name", 180),
    organization_type: textValue(formData, "organization_type", 80),
    annual_revenue: textValue(formData, "annual_revenue", 80),
    looking_for: optionalTextValue(formData, "looking_for", 140),
    message: optionalTextValue(formData, "message", 2000),
    source: textValue(formData, "source", 120) || "alignedinsights.tech",
  };

  const fieldErrors: ReportRequestState["fieldErrors"] = {};

  if (!inquiry.first_name) fieldErrors.first_name = "First name is required.";
  if (!inquiry.last_name) fieldErrors.last_name = "Last name is required.";
  if (!inquiry.email || !emailPattern.test(inquiry.email)) fieldErrors.email = "Enter a valid email address.";
  if (!inquiry.organization_name) fieldErrors.organization_name = "Organization name is required.";

  if (!inquiry.organization_type || !isAllowedOption(inquiry.organization_type, organizationTypeOptions)) {
    fieldErrors.organization_type = "Select an organization type.";
  }

  if (!inquiry.annual_revenue || !isAllowedOption(inquiry.annual_revenue, annualRevenueOptions)) {
    fieldErrors.annual_revenue = "Select an annual revenue range.";
  }

  if (inquiry.looking_for && !isAllowedOption(inquiry.looking_for, lookingForOptions)) {
    fieldErrors.looking_for = "Select a valid option.";
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
        "id, first_name, last_name, email, phone, organization_name, organization_type, annual_revenue, looking_for, message, source, status, intake_email_sent_at, intake_email_sent_by, created_at, updated_at",
      )
      .single();

    if (error || !data) {
      console.error("Unable to save Aligned Insights inquiry.", error);

      return {
        error: "We could not save your request. Please try again.",
        success: false,
      };
    }

    try {
      await sendReportRequestNotification(data);
    } catch (notificationError) {
      console.error("Inquiry saved, but the email notification failed.", notificationError);
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
