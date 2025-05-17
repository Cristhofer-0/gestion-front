import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const loggedUser = request.cookies.get("loggedUser");

  // Si NO hay cookie, redirige a la página de login
  if (!loggedUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si hay cookie, permite el acceso
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};