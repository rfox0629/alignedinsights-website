import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdminClient() {
  const { serviceRoleKey, url } = getSupabaseConfig();

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin configuration is missing.");
  }

  adminClient ??= createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  return adminClient;
}
