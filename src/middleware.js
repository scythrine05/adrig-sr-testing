import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/assests") ||
    pathname.startsWith("/admin")
  ) {
    return NextResponse.next();
  }

  const adminRoutes = ["/ad/ad-home", "/ad/ad-form", "/ad/ad-optimised-table"];
  const userRoutes = ["/"];


  if (!request.cookies.get("__Secure-next-auth.session-token")) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  const userRole = token ? token.role : "";

  if (pathname === "/") {
    if (userRole === "user") {
      return NextResponse.next();
    } else if (userRole === "admin") {
      return NextResponse.redirect(new URL("/ad/ad-home", request.url));
    } else if (userRole === "engg") {
      return NextResponse.redirect(
        new URL(`/manager/${userRole}`, request.url)
      );
    } else if (userRole === "sig") {
      return NextResponse.redirect(
        new URL(`/manager/${userRole}`, request.url)
      );
    } else if (userRole === "trd") {
      return NextResponse.redirect(
        new URL(`/manager/${userRole}`, request.url)
      );
    } else {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  if (adminRoutes.includes(pathname)) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (userRoutes.includes(pathname)) {
    if (userRole !== "user") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
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
