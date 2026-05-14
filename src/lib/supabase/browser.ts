"use client";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  const { publishableKey, url } = getSupabaseConfig();

  if (!url || !publishableKey) {
    throw new Error("Supabase browser configuration is missing.");
  }

  browserClient ??= createClient(url, publishableKey);

  return browserClient;
}
