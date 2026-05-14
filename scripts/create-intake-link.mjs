import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const [, , contactEmail, organizationName, expiresAt] = process.argv;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (!contactEmail || !organizationName) {
  console.error("Usage: node scripts/create-intake-link.mjs contact@example.com \"Organization Name\" [YYYY-MM-DD]");
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const token = crypto.randomBytes(24).toString("base64url");
const expires_at = expiresAt ? new Date(`${expiresAt}T23:59:59.999Z`).toISOString() : null;

const { data, error } = await supabase
  .from("financial_intake_links")
  .insert({
    contact_email: contactEmail,
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
