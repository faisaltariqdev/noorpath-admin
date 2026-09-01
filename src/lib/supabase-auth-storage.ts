import type { SupportedStorage } from "@supabase/supabase-js";
import {
  AUTH_COOKIE_CHUNK_SIZE,
  AUTH_MAX_COOKIE_CHUNKS,
  compactAuthSession,
} from "@/lib/auth-session";

export const AUTH_STORAGE_KEY = "noorpath-admin-auth-v1";

function legacyStorageKey(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const value = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : null;
}

function writeRawCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 365): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function readSessionCookie(name: string): string | null {
  const direct = readCookie(name);
  if (direct) return direct;
  const count = Number(readCookie(`${name}.chunks`));
  if (!Number.isInteger(count) || count < 1 || count > AUTH_MAX_COOKIE_CHUNKS) return null;
  const chunks = Array.from({ length: count }, (_, index) => readCookie(`${name}.${index}`));
  return chunks.every((chunk): chunk is string => chunk !== null) ? chunks.join("") : null;
}

function clearSessionCookie(name: string): void {
  writeRawCookie(name, "", 0);
  writeRawCookie(`${name}.chunks`, "", 0);
  for (let index = 0; index < AUTH_MAX_COOKIE_CHUNKS; index += 1) {
    writeRawCookie(`${name}.${index}`, "", 0);
  }
}

function writeSessionCookie(name: string, value: string): void {
  clearSessionCookie(name);
  const compact = compactAuthSession(value);
  if (compact.length <= AUTH_COOKIE_CHUNK_SIZE) {
    writeRawCookie(name, compact);
    return;
  }
  const chunks = compact.match(new RegExp(`.{1,${AUTH_COOKIE_CHUNK_SIZE}}`, "g")) ?? [];
  if (chunks.length > AUTH_MAX_COOKIE_CHUNKS) return;
  writeRawCookie(`${name}.chunks`, String(chunks.length));
  chunks.forEach((chunk, index) => writeRawCookie(`${name}.${index}`, chunk));
}

/**
 * Supabase's browser client remains the session owner, while mirroring a
 * compact same-site cookie so Next middleware/server components can
 * authorize without waiting on Auth API. Prefer localStorage on the client
 * so a dropped/oversized cookie cannot hide a valid session.
 */
export const browserAuthStorage: SupportedStorage = {
  getItem(key) {
    try {
      const local = window.localStorage.getItem(key);
      if (local) return local;

      const legacyKey = legacyStorageKey();
      const migrated = legacyKey ? window.localStorage.getItem(legacyKey) : null;
      if (migrated) {
        window.localStorage.setItem(key, migrated);
        writeSessionCookie(key, migrated);
        return migrated;
      }
    } catch {
      // Fall through to the cookie copy.
    }
    return readSessionCookie(key);
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Cookies still keep the session persistent if storage is unavailable.
    }
    writeSessionCookie(key, value);
  },
  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
      const legacyKey = legacyStorageKey();
      if (legacyKey) window.localStorage.removeItem(legacyKey);
    } catch {
      // Continue clearing the cookie.
    }
    clearSessionCookie(key);
  },
};
