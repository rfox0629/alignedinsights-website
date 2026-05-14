import type { Database } from "@/lib/supabase/types";

export const inquiryStatuses = ["New", "Contacted", "Intake Sent", "Reviewing", "Completed"] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];

export type AdminIntakeFile = Database["public"]["Tables"]["financial_intake_files"]["Row"];

export type AdminIntakeSubmission = Database["public"]["Tables"]["financial_intake_submissions"]["Row"] & {
  files: AdminIntakeFile[];
};

export type AdminIntakeLink = Database["public"]["Tables"]["financial_intake_links"]["Row"] & {
  submissions: AdminIntakeSubmission[];
};

export type AdminInquiry = Database["public"]["Tables"]["aligned_insights_inquiries"]["Row"] & {
  intake_links: AdminIntakeLink[];
};

export function isInquiryStatus(value: string): value is InquiryStatus {
  return inquiryStatuses.includes(value as InquiryStatus);
}
