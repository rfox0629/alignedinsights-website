export function getSupabaseConfig() {
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";

  return {
    publishableKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "",
  };
}

export function hasSupabaseConfig() {
  const config = getSupabaseConfig();

  return Boolean(config.url && config.publishableKey);
}
