import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

export type IntakeLinkStatus = "valid" | "invalid" | "submitted" | "expired";

export type IntakeInquiry = Database["public"]["Tables"]["aligned_insights_inquiries"]["Row"];

export type IntakeLink = {
  id: string;
  inquiry_id: string | null;
  token: string;
  contact_email: string | null;
  organization_name: string | null;
  status: string;
  expires_at: string | null;
  submitted_at: string | null;
  inquiry: IntakeInquiry | null;
};

async function findInquiryForLink(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  link: Omit<IntakeLink, "inquiry">,
) {
  if (link.inquiry_id) {
    const { data } = await supabase
      .from("aligned_insights_inquiries")
      .select("*")
      .eq("id", link.inquiry_id)
      .maybeSingle();

    return data || null;
  }

  if (!link.contact_email) {
    return null;
  }

  const { data } = await supabase
    .from("aligned_insights_inquiries")
    .select("*")
    .eq("email", link.contact_email)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!data?.length) {
    return null;
  }

  const organizationName = link.organization_name?.trim().toLowerCase();

  if (organizationName) {
    const organizationMatch = data.find(
      (inquiry) => inquiry.organization_name.trim().toLowerCase() === organizationName,
    );

    if (organizationMatch) {
      return organizationMatch;
    }
  }

  return data[0];
}

export async function getValidatedIntakeLink(token: string): Promise<{
  link: IntakeLink | null;
  status: IntakeLinkStatus;
}> {
  if (!token) {
    return { link: null, status: "invalid" };
  }

  let supabase: ReturnType<typeof getSupabaseAdminClient>;

  try {
    supabase = getSupabaseAdminClient();
  } catch {
    return { link: null, status: "invalid" };
  }
  const { data, error } = await supabase
    .from("financial_intake_links")
    .select("id, inquiry_id, token, contact_email, organization_name, status, expires_at, submitted_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return { link: null, status: "invalid" };
  }

  if (data.status === "submitted" || data.submitted_at) {
    return { link: { ...data, inquiry: await findInquiryForLink(supabase, data) }, status: "submitted" };
  }

  if (data.status !== "active") {
    return { link: { ...data, inquiry: await findInquiryForLink(supabase, data) }, status: "invalid" };
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return { link: { ...data, inquiry: await findInquiryForLink(supabase, data) }, status: "expired" };
  }

  return { link: { ...data, inquiry: await findInquiryForLink(supabase, data) }, status: "valid" };
}
