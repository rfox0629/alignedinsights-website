import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const [, , contactEmail, organizationName, expiresAt, providedInquiryId] = process.argv;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (!contactEmail || !organizationName) {
  console.error("Usage: node scripts/create-intake-link.mjs contact@example.com \"Organization Name\" [YYYY-MM-DD] [inquiry-id]");
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const token = crypto.randomBytes(24).toString("base64url");
const expires_at = expiresAt ? new Date(`${expiresAt}T23:59:59.999Z`).toISOString() : null;
let inquiry_id = providedInquiryId || null;

if (!inquiry_id) {
  const { data: matchingInquiries } = await supabase
    .from("aligned_insights_inquiries")
    .select("id, organization_name")
    .eq("email", contactEmail)
    .order("created_at", { ascending: false })
    .limit(5);

  if (matchingInquiries?.length) {
    const normalizedOrganization = organizationName.trim().toLowerCase();
    const exactMatch = matchingInquiries.find(
      (inquiry) => inquiry.organization_name.trim().toLowerCase() === normalizedOrganization,
    );

    inquiry_id = exactMatch?.id || matchingInquiries[0].id;
  }
}

const { data, error } = await supabase
  .from("financial_intake_links")
  .insert({
    contact_email: contactEmail,
    inquiry_id,
    organization_name: organizationName,
    expires_at,
    token,
  })
  .select("token")
  .single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

// TODO: Replace this script with an authenticated internal admin screen once admin auth exists.
console.log(`https://alignedinsights.tech/intake/${data.token}`);
