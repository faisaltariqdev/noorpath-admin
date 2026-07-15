import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Database, Role } from "@/types/database";
import { AUTH_STORAGE_KEY } from "@/lib/supabase-auth-storage";

type CookieAdapter = {
  get: (name: string) => string | undefined;
  set?: (name: string, value: string, maxAge: number) => void;
  remove?: (name: string) => void;
};
const COOKIE_CHUNK_SIZE = 3000;
const MAX_COOKIE_CHUNKS = 8;

export type AuthorizationResult =
  | { authorized: true; user: User; role: "admin"; fullName: string }
  | { authorized: false; reason: "anonymous" | "inactive" | "wrong-role" | "configuration"; role?: Role };

export function createServerSupabase(cookies: CookieAdapter) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const read = (key: string) => {
    const direct = cookies.get(key);
    if (direct) return direct;
    const count = Number(cookies.get(`${key}.chunks`));
    if (!Number.isInteger(count) || count < 1 || count > MAX_COOKIE_CHUNKS) return null;
    const chunks = Array.from({ length: count }, (_, index) => cookies.get(`${key}.${index}`));
    return chunks.every((chunk): chunk is string => chunk !== undefined) ? chunks.join("") : null;
  };
  const clear = (key: string) => {
    cookies.remove?.(key);
    cookies.remove?.(`${key}.chunks`);
    for (let index = 0; index < MAX_COOKIE_CHUNKS; index += 1) cookies.remove?.(`${key}.${index}`);
  };
  const write = (key: string, value: string) => {
    if (!cookies.set) return;
    clear(key);
    const maxAge = 60 * 60 * 24 * 365;
    if (value.length <= COOKIE_CHUNK_SIZE) {
      cookies.set(key, value, maxAge);
      return;
    }
    const chunks = value.match(new RegExp(`.{1,${COOKIE_CHUNK_SIZE}}`, "g")) ?? [];
    if (chunks.length > MAX_COOKIE_CHUNKS) return;
    cookies.set(`${key}.chunks`, String(chunks.length), maxAge);
    chunks.forEach((chunk, index) => cookies.set?.(`${key}.${index}`, chunk, maxAge));
  };

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: AUTH_STORAGE_KEY,
      storage: {
        getItem: read,
        setItem: write,
        removeItem: clear,
      },
    },
  });
}

export async function authorizeAdmin(cookies: CookieAdapter): Promise<AuthorizationResult> {
  const client = createServerSupabase(cookies);
  if (!client) return { authorized: false, reason: "configuration" };

  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) return { authorized: false, reason: "anonymous" };

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role, full_name, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    return { authorized: false, reason: "inactive" };
  }
  if (profile.role !== "admin") {
    return { authorized: false, reason: "wrong-role", role: profile.role };
  }
  return {
    authorized: true,
    user,
    role: "admin",
    fullName: profile.full_name,
  };
}
