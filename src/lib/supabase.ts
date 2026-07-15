import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { AUTH_STORAGE_KEY, browserAuthStorage } from "@/lib/supabase-auth-storage";

// NEXT_PUBLIC_ vars are embedded into the client bundle at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: AUTH_STORAGE_KEY,
    storage: browserAuthStorage,
  },
});
