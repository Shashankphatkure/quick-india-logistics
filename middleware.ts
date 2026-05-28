import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'qil_sid';

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/api/health'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const loginUrl = new URL('/login', req.url);
    if (pathname !== '/dashboard') loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pass the path to the layout so it can run role-based gating.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/).*)'],
};
