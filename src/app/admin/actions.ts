"use server";

import { createHash, createHmac, timingSafeEqual } from "crypto";

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
type InquiryRow = Database["public"]["Tables"]["aligned_insights_inquiries"]["Row"];
type IntakeLinkRow = Database["public"]["Tables"]["financial_intake_links"]["Row"];
type IntakeSubmissionRow = Database["public"]["Tables"]["financial_intake_submissions"]["Row"];
type IntakeFileRow = Database["public"]["Tables"]["financial_intake_files"]["Row"];

function getAdminPassword() {
  return process.env.ADMIN_PORTAL_PASSWORD?.trim() || "";
}

function getRawAdminPassword() {
  return process.env.ADMIN_PORTAL_PASSWORD;
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
  const aDigest = createHash("sha256").update(a.trim()).digest();
  const bDigest = createHash("sha256").update(b.trim()).digest();

  return timingSafeEqual(aDigest, bDigest);
}

function logAdminPasswordComparison(submittedPassword: string, rawEnvPassword: string | undefined) {
  const envPassword = rawEnvPassword ?? "";
  const trimmedSubmitted = submittedPassword.trim();
  const trimmedEnv = envPassword.trim();

  console.info("[admin] Password comparison debug", {
    envPasswordExists: Boolean(rawEnvPassword),
    envPasswordLength: envPassword.length,
    nodeEnv: process.env.NODE_ENV || null,
    submittedPasswordLength: submittedPassword.length,
    targetEnvironment: process.env.VERCEL_ENV || "local",
    trimmedLengthsMatch: trimmedSubmitted.length === trimmedEnv.length,
    trimmedEnvPasswordLength: trimmedEnv.length,
    trimmedSubmittedPasswordLength: trimmedSubmitted.length,
    vercelUrlExists: Boolean(process.env.VERCEL_URL),
  });
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

async function loadIntakeLinksForInquiries(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  inquiries: InquiryRow[],
) {
  const inquiryIds = inquiries.map((inquiry) => inquiry.id);
  const emails = Array.from(new Set(inquiries.map((inquiry) => inquiry.email).filter(Boolean)));
  const linksById = new Map<string, IntakeLinkRow>();

  if (inquiryIds.length) {
    const { data, error } = await supabase
      .from("financial_intake_links")
      .select("*")
      .in("inquiry_id", inquiryIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    data?.forEach((link) => linksById.set(link.id, link));
  }

  if (emails.length) {
    const { data, error } = await supabase
      .from("financial_intake_links")
      .select("*")
      .in("contact_email", emails)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    data?.forEach((link) => linksById.set(link.id, link));
  }

  const links = Array.from(linksById.values());
  const linkIds = links.map((link) => link.id);
  const submissionsByLinkId = new Map<string, (IntakeSubmissionRow & { files: IntakeFileRow[] })[]>();

  if (linkIds.length) {
    const { data: submissions, error: submissionError } = await supabase
      .from("financial_intake_submissions")
      .select("*")
      .in("link_id", linkIds)
      .order("created_at", { ascending: false });

    if (submissionError) {
      throw submissionError;
    }

    const submissionIds = (submissions || []).map((submission) => submission.id);
    const filesBySubmissionId = new Map<string, IntakeFileRow[]>();

    if (submissionIds.length) {
      const { data: files, error: fileError } = await supabase
        .from("financial_intake_files")
        .select("*")
        .in("submission_id", submissionIds)
        .order("created_at", { ascending: false });

      if (fileError) {
        throw fileError;
      }

      for (const file of files || []) {
        if (!file.submission_id) continue;

        filesBySubmissionId.set(file.submission_id, [...(filesBySubmissionId.get(file.submission_id) || []), file]);
      }
    }

    for (const submission of submissions || []) {
      if (!submission.link_id) continue;

      submissionsByLinkId.set(submission.link_id, [
        ...(submissionsByLinkId.get(submission.link_id) || []),
        { ...submission, files: filesBySubmissionId.get(submission.id) || [] },
      ]);
    }
  }

  return inquiries.map((inquiry) => ({
    ...inquiry,
    intake_links: links
      .filter((link) => link.inquiry_id === inquiry.id || (!link.inquiry_id && link.contact_email === inquiry.email))
      .map((link) => ({
        ...link,
        submissions: submissionsByLinkId.get(link.id) || [],
      })),
  }));
}

export async function authenticateAdmin(password: string): Promise<AdminActionResult<{ token: string }>> {
  const rawConfiguredPassword = getRawAdminPassword();
  const configuredPassword = rawConfiguredPassword?.trim() || "";
  const submittedPassword = password.trim();

  logAdminPasswordComparison(password, rawConfiguredPassword);

  if (!configuredPassword) {
    logMissingEnv("admin login", ["ADMIN_PORTAL_PASSWORD"]);
    return { error: "ADMIN_PORTAL_PASSWORD is not configured.", success: false };
  }

  if (!safeCompare(submittedPassword, configuredPassword)) {
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

    return { data: await loadIntakeLinksForInquiries(supabase, data || []), success: true };
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
}): Promise<AdminActionResult<InquiryRow>> {
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
