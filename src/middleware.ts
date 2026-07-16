import { NextRequest, NextResponse } from "next/server";
import { authorizeRole } from "@/lib/server-auth";
import type { Role } from "@/types/database";

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const expectedRole: Role = request.nextUrl.pathname.startsWith("/tutor")
    ? "tutor"
    : request.nextUrl.pathname.startsWith("/parent")
      ? "parent"
      : "admin";
  const auth = await authorizeRole({
    get: (name) => request.cookies.get(name)?.value,
    set: (name, value, maxAge) => {
      request.cookies.set(name, value);
      response.cookies.set(name, value, {
        httpOnly: false,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        path: "/",
        maxAge,
      });
    },
    remove: (name) => {
      request.cookies.delete(name);
      response.cookies.delete(name);
    },
  }, expectedRole);

  const isApi = request.nextUrl.pathname.startsWith("/api/");
  if (!auth.authorized) {
    if (isApi) {
      const status = auth.reason === "anonymous" ? 401 : 403;
      return NextResponse.json(
        { error: status === 401 ? "Authentication required." : `${expectedRole} access required.` },
        { status },
      );
    }
    if (auth.reason === "wrong-role" && auth.role) {
      return NextResponse.redirect(new URL(`/${auth.role}`, request.url));
    }
    return loginRedirect(request);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/tutor/:path*", "/parent/:path*"],
};
