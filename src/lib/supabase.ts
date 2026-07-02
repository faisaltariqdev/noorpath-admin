import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required");
  }
  return createClient<Database>(url, key);
}

let _client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (!_client) _client = createSupabaseClient();
  return _client;
}

// Keep backward compat — use getSupabase() in client components
export const supabase = {
  get auth() { return getSupabase().auth; },
  from: (...args: Parameters<ReturnType<typeof createClient>["from"]>) => getSupabase().from(...args),
  storage: { from: (...args: any[]) => (getSupabase() as any).storage.from(...args) },
};
