import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

let serverClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServerClient() {
  const { publishableKey, url } = getSupabaseConfig();

  if (!url || !publishableKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  serverClient ??= createClient(url, publishableKey, {
    auth: {
      persistSession: false,
    },
  });

  return serverClient;
}
