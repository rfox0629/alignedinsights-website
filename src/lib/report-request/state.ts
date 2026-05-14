import type { Database } from "@/lib/supabase/types";

export type ReportRequestField = keyof Database["public"]["Tables"]["aligned_insights_inquiries"]["Insert"];

export type ReportRequestState = {
  error?: string;
  fieldErrors?: Partial<Record<ReportRequestField, string>>;
  success?: boolean;
};

export const initialReportRequestState: ReportRequestState = {
  success: false,
};
