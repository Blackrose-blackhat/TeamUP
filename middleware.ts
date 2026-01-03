import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  console.log("Middleware - token:", token);
  console.log("Middleware - pathname:", pathname);

  // If user is not authenticated and trying to access dashboard → redirect to home
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If user is authenticated and trying to access home → redirect to dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If user is authenticated but hasn't completed onboarding
  // if (token && token.onboarded !== true && !pathname.startsWith("/onboarding")) {
  //   return NextResponse.redirect(new URL("/onboarding", req.url));
  // }

  // If user is onboarded but trying to access onboarding page → redirect to dashboard
  if (token && token.onboarded === true && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/" 
  ],
};
