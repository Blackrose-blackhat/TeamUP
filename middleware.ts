import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  console.log("Middleware - token:", token);
  console.log("Middleware - pathname:", pathname);

  // If no session → kick back to home
  if (!token && pathname.startsWith("/")) {
    console.log("No token, redirecting to home");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If user is authenticated but hasn't completed onboarding
  if (token && token.onboarded !== true && !pathname.startsWith("/onboarding")) {
    console.log("User not onboarded, redirecting to onboarding");
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // If user is onboarded but trying to access onboarding page, redirect to dashboard
  if (token && token.onboarded === true && pathname.startsWith("/onboarding")) {
    console.log("User already onboarded, redirecting to dashboard");
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/onbaording",
    "/onboarding/:path*"
  ],
};