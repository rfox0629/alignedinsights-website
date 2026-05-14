import type { Database } from "@/lib/supabase/types";

export const inquiryStatuses = ["New", "Contacted", "Intake Sent", "Reviewing", "Completed"] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];

export type AdminInquiry = Database["public"]["Tables"]["aligned_insights_inquiries"]["Row"];

export function isInquiryStatus(value: string): value is InquiryStatus {
  return inquiryStatuses.includes(value as InquiryStatus);
}
