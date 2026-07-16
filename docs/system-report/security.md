# 17. Security Review

> Scope: authentication, authorization, data exposure and operational risk for the admin platform.
> This is a code-level review, not a penetration test. Severity uses **🔴 High / 🟠 Medium / 🟡 Low**.

## 17.1 Summary posture

The platform has a **solid admin perimeter** (server-enforced, double-gated) and relies on Supabase
**RLS** as the ultimate data boundary. The main risks come from **asymmetric enforcement** (tutor/parent
routes are client-gated only), **JS-readable session cookies**, and **service-role API routes** that
trust middleware without a second check.

## 17.2 Authentication

| Aspect | Finding | Severity |
|--------|---------|----------|
| Password auth | Supabase-managed; industry standard | ✅ |
| Session storage | localStorage + **non-HttpOnly** mirrored cookies | 🟠 XSS could exfiltrate tokens |
| Cookie flags | `SameSite=Lax`, `Secure` on HTTPS, `Path=/` | ✅ (except HttpOnly) |
| Legacy migration | One-time read of old key | ✅ |
| Login `next` param | Set by middleware, ignored by login page | 🟡 UX only |
| Role picker | UI selection not validated (actual role from metadata/profile) | 🟡 no privilege gain |

## 17.3 Authorization

| Aspect | Finding | Severity |
|--------|---------|----------|
| Admin routes | Middleware **and** `admin/layout` both call `authorizeAdmin` | ✅ strong |
| Tutor/parent routes | **No server gate**; client `getUser()` + RLS only | 🟠 |
| Data scoping | RLS + `is_admin()`/`current_profile_role()` helpers | ✅ (when RLS enabled on every table) |
| Unauthenticated portal load | Tutor/parent shells render empty rather than redirect | 🟡 info-light, but confusing |

**Recommendation:** add `tutor/layout.tsx` and `parent/layout.tsx` server auth mirroring
`admin/layout.tsx`, or extend the middleware matcher to `/tutor/*` and `/parent/*`.

## 17.4 Admin API routes

- `create-user` / `update-user` use `SUPABASE_SERVICE_ROLE_KEY`, which **bypasses RLS**.
- They perform **no in-handler auth check**, trusting the middleware matcher.

| Risk | Severity | Mitigation |
|------|----------|------------|
| Matcher regression could expose service-role endpoints | 🔴 | Add explicit `authorizeAdmin` call at the top of each handler (defence in depth) |
| Service key in server env | ✅ (correct) | Ensure never referenced in client bundle; keep out of `NEXT_PUBLIC_*` |

## 17.5 Public preview

- `/qaida-preview` is intentionally public and outside the matcher.
- It exposes **no PII and no admin controls** — only static curriculum + device-local progress.
- `robots: noindex` prevents indexing.
- **Verdict:** low risk and correctly scoped. Keep the `preview` prop authoritative so no locked
  module can be reached from this route.

## 17.6 Protected data & exposure

| Vector | Finding | Severity |
|--------|---------|----------|
| Client Supabase queries | Anon key is public by design; **RLS must be enabled on every table** | 🔴 if any table lacks RLS |
| `chat_messages` | Used by app but **no `CREATE TABLE`/RLS in repo SQL** | 🟠 verify RLS in prod |
| Realtime channels | `postgres_changes` respects RLS | ✅ (assuming policies present) |
| Qaida progress | Device-local; no server PII | ✅ |
| Audio storage | `audio-notes` bucket public-read | 🟡 confirm no sensitive content is world-readable |

## 17.7 Secrets management

| Item | Status |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | Public by design (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; used in admin API routes |
| No secrets committed in repo | ✅ (env-driven) |

**Action:** audit `next.config.mjs` `env` block and ensure the service role key is **not** exposed to
the client.

## 17.8 Potential risks (prioritised)

1. 🔴 **Confirm RLS is enabled on all production tables**, especially `chat_messages` (missing from
   repo SQL). Without RLS, the public anon key permits broad reads.
2. 🟠 **Add server-side auth for tutor/parent portals** to remove reliance on client checks.
3. 🟠 **Make session cookies HttpOnly** where feasible, or minimise XSS surface (strict CSP, escape
   all rendered user content).
4. 🟠 **Add in-handler authorization** to admin API routes.
5. 🟡 **Reconcile schema drift** so RLS policies apply to the canonical table shapes
   (see [database.md](./database.md)).
6. 🟡 **Content Security Policy / headers** — none configured in `next.config.mjs`; add CSP,
   `X-Frame-Options`, HSTS.

## 17.9 Future recommendations

- Centralise authorization in a shared server util used by every portal layout.
- Add audit logging for admin mutations (user create/update, fee changes, payouts).
- Introduce rate limiting on API routes.
- Add automated RLS policy tests to CI alongside `qaida-contract-tests`.
- Consider migrating session handling to `@supabase/ssr` for first-class HttpOnly cookie support.

> Related: [authentication.md](./authentication.md) · [database.md](./database.md)
