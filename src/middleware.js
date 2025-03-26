import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/signin",
    "/signup",
    "/admin",
    "/super-admin-login", // Updated super admin login page
    "/unauthorized",
    "/check-auth",  // Authentication check page
    "/debug-session", // Session debug page
    "/favicon.ico",
  ];

  // Allow public routes and static assets
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/assests")
  ) {
    return NextResponse.next();
  }

  // Check for authentication
  const sessionToken = request.cookies.get("next-auth.session-token");
  if (!sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  const userRole = token?.role || "";

  // Root path redirects based on user role
  if (pathname === "/") {
    if (userRole === "user") {
      return NextResponse.next();
    } else if (userRole === "admin") {
      return NextResponse.redirect(new URL("/ad/ad-home", request.url));
    } else if (userRole === "super-admin") {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    } else if (["engg", "sig", "trd"].includes(userRole)) {
      return NextResponse.redirect(new URL(`/manager/${userRole}`, request.url));
    } else {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // Super admin routes protection
  if (pathname.startsWith("/super-admin")) {
    // Don't block /super-admin-login
    if (pathname === "/super-admin-login") {
      return NextResponse.next();
    }
    
    // Temporarily allow any authenticated user to access super admin routes
    if (sessionToken) {
      return NextResponse.next();
    }
  }

  // Admin routes protection
  if (pathname.startsWith("/ad/")) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
