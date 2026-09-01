import type { User } from "@supabase/supabase-js";
import type { Role } from "@/types/database";

export const AUTH_COOKIE_CHUNK_SIZE = 1800;
export const AUTH_MAX_COOKIE_CHUNKS = 8;

export function parseRole(value: unknown): Role | undefined {
  if (value === "admin" || value === "tutor" || value === "parent") return value;
}

export function compactAuthSession(value: string): string {
  try {
    const parsed = JSON.parse(value);
    const session = parsed?.currentSession ?? parsed;
    if (!session?.access_token || !session?.user) return value;
    return JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type || "bearer",
      user: {
        id: session.user.id,
        email: session.user.email,
        aud: session.user.aud,
        role: session.user.role,
        user_metadata: session.user.user_metadata,
        app_metadata: session.user.app_metadata,
      },
    });
  } catch {
    return value;
  }
}

export function readAuthSession(raw: string | null | undefined): {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expired: boolean;
} | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const session = parsed?.currentSession ?? parsed;
    const accessToken = session?.access_token as string | undefined;
    const user = session?.user as User | undefined;
    if (!accessToken || !user?.id) return null;
    const payload = decodeJwtPayload(accessToken);
    const expired = typeof payload?.exp === "number" && payload.exp * 1000 < Date.now() - 15_000;
    return {
      user,
      accessToken,
      refreshToken: typeof session.refresh_token === "string" ? session.refresh_token : undefined,
      expired,
    };
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise.then((value) => value, () => null),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
