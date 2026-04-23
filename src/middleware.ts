import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "crymad_session";

/** Routes requiring authentication. */
const PROTECTED = [
  "/dashboard",
  "/e-wallet",
  "/crypto",
  "/cards",
  "/orders",
  "/transactions",
  "/subscriptions",
  "/reports",
  "/banking",
  "/help",
  "/notifications",
  "/ecosystem",
  "/payouts",
  "/recurring-payments",
  "/rewards",
  "/settings",
];

/** Routes that should bounce to dashboard if already logged in. */
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

/** Sub-paths of AUTH_ROUTES that ARE accessible while logged in (onboarding steps). */
const AUTH_ALLOW_WHEN_LOGGED_IN = ["/register/kyc", "/register/verify-email"];

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuthAllowed = AUTH_ALLOW_WHEN_LOGGED_IN.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuth = !isAuthAllowed && AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!isProtected && !isAuth) return NextResponse.next();

  const authed = await isAuthed(req);

  if (isProtected && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuth && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /* Skip Next internals and static files */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
