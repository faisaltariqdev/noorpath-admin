import type { SupportedStorage } from "@supabase/supabase-js";

export const AUTH_STORAGE_KEY = "noorpath-admin-auth-v1";
const COOKIE_CHUNK_SIZE = 3000;
const MAX_COOKIE_CHUNKS = 8;

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
  if (!Number.isInteger(count) || count < 1 || count > MAX_COOKIE_CHUNKS) return null;
  const chunks = Array.from({ length: count }, (_, index) => readCookie(`${name}.${index}`));
  return chunks.every((chunk): chunk is string => chunk !== null) ? chunks.join("") : null;
}

function clearSessionCookie(name: string): void {
  writeRawCookie(name, "", 0);
  writeRawCookie(`${name}.chunks`, "", 0);
  for (let index = 0; index < MAX_COOKIE_CHUNKS; index += 1) {
    writeRawCookie(`${name}.${index}`, "", 0);
  }
}

function writeSessionCookie(name: string, value: string): void {
  clearSessionCookie(name);
  if (value.length <= COOKIE_CHUNK_SIZE) {
    writeRawCookie(name, value);
    return;
  }
  const chunks = value.match(new RegExp(`.{1,${COOKIE_CHUNK_SIZE}}`, "g")) ?? [];
  if (chunks.length > MAX_COOKIE_CHUNKS) return;
  writeRawCookie(`${name}.chunks`, String(chunks.length));
  chunks.forEach((chunk, index) => writeRawCookie(`${name}.${index}`, chunk));
}

/**
 * Supabase's browser client remains the session owner, while mirroring its
 * session into a same-site cookie so Next middleware/server components can
 * enforce authorization. The one-time fallback preserves existing sessions
 * created by the previous localStorage-only client.
 */
export const browserAuthStorage: SupportedStorage = {
  getItem(key) {
    const cookieValue = readSessionCookie(key);
    if (cookieValue) return cookieValue;

    try {
      const legacyKey = legacyStorageKey();
      const migrated = legacyKey ? window.localStorage.getItem(legacyKey) : null;
      if (migrated) {
        window.localStorage.setItem(key, migrated);
        writeSessionCookie(key, migrated);
        return migrated;
      }
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
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
