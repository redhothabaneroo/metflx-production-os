import { NextRequest, NextResponse } from "next/server";

const STAGING_BASIC_AUTH_USERNAME = "staging";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function hasValidCredentials(authHeader: string | null, expectedPassword: string): boolean {
  if (!authHeader || !authHeader.toLowerCase().startsWith("basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(authHeader.slice(6));
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);
  return (
    timingSafeEqual(username, STAGING_BASIC_AUTH_USERNAME) &&
    timingSafeEqual(password, expectedPassword)
  );
}

// No-op unless STAGING_BASIC_AUTH_PASSWORD is set — production and local
// dev leave this var unset, so this proxy never gates them.
export function proxy(request: NextRequest) {
  const expectedPassword = process.env.STAGING_BASIC_AUTH_PASSWORD;
  if (!expectedPassword) {
    return NextResponse.next();
  }

  if (hasValidCredentials(request.headers.get("authorization"), expectedPassword)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Staging"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
