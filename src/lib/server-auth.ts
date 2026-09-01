import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Database, Role } from "@/types/database";
import {
  AUTH_COOKIE_CHUNK_SIZE,
  AUTH_MAX_COOKIE_CHUNKS,
  parseRole,
  readAuthSession,
  withTimeout,
} from "@/lib/auth-session";
import { AUTH_STORAGE_KEY } from "@/lib/supabase-auth-storage";

type CookieAdapter = {
  get: (name: string) => string | undefined;
  set?: (name: string, value: string, maxAge: number) => void;
  remove?: (name: string) => void;
};

export type AuthorizationResult =
  | { authorized: true; user: User; role: Role; fullName: string }
  | { authorized: false; reason: "anonymous" | "inactive" | "wrong-role" | "configuration"; role?: Role };

function readStoredSession(cookies: CookieAdapter): string | null {
  const direct = cookies.get(AUTH_STORAGE_KEY);
  if (direct) return direct;
  const count = Number(cookies.get(`${AUTH_STORAGE_KEY}.chunks`));
  if (!Number.isInteger(count) || count < 1 || count > AUTH_MAX_COOKIE_CHUNKS) return null;
  const chunks = Array.from({ length: count }, (_, index) => cookies.get(`${AUTH_STORAGE_KEY}.${index}`));
  return chunks.every((chunk): chunk is string => chunk !== undefined) ? chunks.join("") : null;
}

export function createServerSupabase(cookies: CookieAdapter) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const read = (key: string) => {
    const direct = cookies.get(key);
    if (direct) return direct;
    const count = Number(cookies.get(`${key}.chunks`));
    if (!Number.isInteger(count) || count < 1 || count > AUTH_MAX_COOKIE_CHUNKS) return null;
    const chunks = Array.from({ length: count }, (_, index) => cookies.get(`${key}.${index}`));
    return chunks.every((chunk): chunk is string => chunk !== undefined) ? chunks.join("") : null;
  };
  const clear = (key: string) => {
    cookies.remove?.(key);
    cookies.remove?.(`${key}.chunks`);
    for (let index = 0; index < AUTH_MAX_COOKIE_CHUNKS; index += 1) cookies.remove?.(`${key}.${index}`);
  };
  const write = (key: string, value: string) => {
    if (!cookies.set) return;
    clear(key);
    const maxAge = 60 * 60 * 24 * 365;
    if (value.length <= AUTH_COOKIE_CHUNK_SIZE) {
      cookies.set(key, value, maxAge);
      return;
    }
    const chunks = value.match(new RegExp(`.{1,${AUTH_COOKIE_CHUNK_SIZE}}`, "g")) ?? [];
    if (chunks.length > AUTH_MAX_COOKIE_CHUNKS) return;
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

function createBearerClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function authorizeRole(
  cookies: CookieAdapter,
  expectedRole: Role,
): Promise<AuthorizationResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { authorized: false, reason: "configuration" };

  let session = readAuthSession(readStoredSession(cookies));
  if (session?.expired && session.refreshToken) {
    const refreshClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    const refreshed = await withTimeout(refreshClient.auth.refreshSession({ refresh_token: session.refreshToken }), 4000);
    const next = refreshed?.data.session;
    if (next?.access_token && next.user) {
      session = {
        user: next.user,
        accessToken: next.access_token,
        refreshToken: next.refresh_token,
        expired: false,
      };
    } else {
      session = null;
    }
  }

  if (!session || session.expired) return { authorized: false, reason: "anonymous" };

  const client = createBearerClient(session.accessToken);
  const profileResult = client
    ? await withTimeout(
        client.from("profiles").select("role, full_name, is_active").eq("id", session.user.id).single(),
        4000,
      )
    : null;
  const profile = profileResult?.data;
  const role = parseRole(profile?.role) ?? parseRole(session.user.user_metadata?.role);

  if (profile && profile.is_active === false) {
    return { authorized: false, reason: "inactive" };
  }
  if (!role) return { authorized: false, reason: "anonymous" };
  if (role !== expectedRole) {
    return { authorized: false, reason: "wrong-role", role };
  }

  return {
    authorized: true,
    user: session.user,
    role,
    fullName:
      profile?.full_name
      || (typeof session.user.user_metadata?.full_name === "string" ? session.user.user_metadata.full_name : "")
      || session.user.email
      || "User",
  };
}

export function authorizeAdmin(cookies: CookieAdapter): Promise<AuthorizationResult> {
  return authorizeRole(cookies, "admin");
}
