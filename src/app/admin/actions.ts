"use server";

import { createHmac, timingSafeEqual } from "crypto";

import { isInquiryStatus, type AdminInquiry, type InquiryStatus } from "@/lib/admin/inquiries";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

const adminSessionVersion = "v1";
const adminSessionMaxAgeMs = 1000 * 60 * 60 * 12;

type AdminActionResult<T = unknown> = {
  data?: T;
  error?: string;
  success: boolean;
  warning?: string;
};

type InquiryUpdate = Database["public"]["Tables"]["aligned_insights_inquiries"]["Update"];

function getAdminPassword() {
  return process.env.ADMIN_PORTAL_PASSWORD?.trim() || "";
}

function logMissingEnv(context: string, names: string[]) {
  console.error(
    `[admin] Missing required environment variable(s) for ${context}: ${names.join(
      ", ",
    )}. Configure them in Vercel environment variables. Secret values were not logged.`,
  );
}

function getMissingSupabaseAdminEnvVars() {
  const missing: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  return missing;
}

function getSupabaseAdminSetupWarning() {
  const missing = getMissingSupabaseAdminEnvVars();

  if (!missing.length) {
    return "";
  }

  logMissingEnv("admin inquiry data loading", missing);

  return "Inquiry data is not configured yet. Add the Supabase URL and service role key in Vercel to load inquiries.";
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function signAdminPayload(payload: string) {
  const password = getAdminPassword();

  if (!password) {
    logMissingEnv("admin session signing", ["ADMIN_PORTAL_PASSWORD"]);
    throw new Error("Admin portal password is not configured.");
  }

  return createHmac("sha256", password).update(payload).digest("hex");
}

function createAdminSessionToken() {
  const issuedAt = Date.now().toString();
  const payload = `${adminSessionVersion}.${issuedAt}`;
  const signature = signAdminPayload(payload);

  return `${payload}.${signature}`;
}

function verifyAdminSessionToken(token: string) {
  const [version, issuedAt, signature] = token.split(".");

  if (version !== adminSessionVersion || !issuedAt || !signature) {
    return false;
  }

  const issuedAtMs = Number(issuedAt);

  if (!Number.isFinite(issuedAtMs) || Date.now() - issuedAtMs > adminSessionMaxAgeMs) {
    return false;
  }

  try {
    return safeCompare(signature, signAdminPayload(`${version}.${issuedAt}`));
  } catch {
    return false;
  }
}

function requireAdmin(token: string) {
  if (!verifyAdminSessionToken(token)) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }
}

export async function authenticateAdmin(password: string): Promise<AdminActionResult<{ token: string }>> {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    logMissingEnv("admin login", ["ADMIN_PORTAL_PASSWORD"]);
    return { error: "ADMIN_PORTAL_PASSWORD is not configured.", success: false };
  }

  if (!safeCompare(password.trim(), configuredPassword)) {
    return { error: "Incorrect password.", success: false };
  }

  return { data: { token: createAdminSessionToken() }, success: true };
}

export async function getAdminInquiries(token: string): Promise<AdminActionResult<AdminInquiry[]>> {
  try {
    requireAdmin(token);

    const setupWarning = getSupabaseAdminSetupWarning();

    if (setupWarning) {
      return { data: [], success: true, warning: setupWarning };
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("aligned_insights_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Unable to load Aligned Insights inquiries.", error);
      return {
        data: [],
        success: true,
        warning: "Unable to load inquiries. Check the Supabase table and service role configuration.",
      };
    }

    return { data: data || [], success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("admin session")) {
      return { error: error.message, success: false };
    }

    console.error("[admin] Unable to load inquiry data.", error);

    return { error: error instanceof Error ? error.message : "Unable to load inquiries.", success: false };
  }
}

export async function updateInquiryStatus({
  inquiryId,
  sentBy,
  status,
  token,
}: {
  inquiryId: string;
  sentBy?: string;
  status: InquiryStatus;
  token: string;
}): Promise<AdminActionResult<AdminInquiry>> {
  try {
    requireAdmin(token);

    if (!isInquiryStatus(status)) {
      return { error: "Invalid inquiry status.", success: false };
    }

    const setupWarning = getSupabaseAdminSetupWarning();

    if (setupWarning) {
      return { error: setupWarning, success: false };
    }

    const trimmedSentBy = sentBy?.trim() || null;
    const update: InquiryUpdate = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "Intake Sent") {
      if (!trimmedSentBy) {
        return { error: "Add the team member who sent the intake email.", success: false };
      }

      update.intake_email_sent_at = new Date().toISOString();
      update.intake_email_sent_by = trimmedSentBy;
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("aligned_insights_inquiries")
      .update(update)
      .eq("id", inquiryId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("Unable to update Aligned Insights inquiry.", error);
      return { error: "Unable to update inquiry.", success: false };
    }

    return { data, success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update inquiry.", success: false };
  }
}
