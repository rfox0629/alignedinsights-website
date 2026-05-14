import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type IntakeLinkStatus = "valid" | "invalid" | "submitted" | "expired";

export type IntakeLink = {
  id: string;
  token: string;
  contact_email: string | null;
  organization_name: string | null;
  status: string;
  expires_at: string | null;
  submitted_at: string | null;
};

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
    .select("id, token, contact_email, organization_name, status, expires_at, submitted_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return { link: null, status: "invalid" };
  }

  if (data.status === "submitted" || data.submitted_at) {
    return { link: data, status: "submitted" };
  }

  if (data.status !== "active") {
    return { link: data, status: "invalid" };
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return { link: data, status: "expired" };
  }

  return { link: data, status: "valid" };
}
