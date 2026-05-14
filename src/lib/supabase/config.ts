export function getSupabaseConfig() {
  return {
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export function hasSupabaseConfig() {
  const config = getSupabaseConfig();

  return Boolean(config.url && config.publishableKey);
}
