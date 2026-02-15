import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { auth } from '@/lib/auth';
import { routing } from '@/lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Protected route patterns that require authentication
const protectedRoutes = [
  '/teams',
  '/dashboard',
];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => 
    pathname.startsWith(route) || pathname.startsWith(`/it${route}`) || pathname.startsWith(`/en${route}`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const intlResponse = intlMiddleware(request);
  
  if (intlResponse.status !== 200 || intlResponse.headers.get('location')) {
    return intlResponse;
  }
  
  // Check authentication for protected routes
  if (isProtectedRoute(pathname)) {
    const session = await auth();
    
    if (!session) {
      // Redirect to login with return URL
      const locale = pathname.startsWith('/en') ? 'en' : 'it';
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  const response = NextResponse.next({
    request,
  });
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|sw\\.js|workbox-.*\\.js).*)',
  ],
};
