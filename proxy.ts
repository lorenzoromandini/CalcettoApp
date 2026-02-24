import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const intlResponse = intlMiddleware(request);
  
  if (intlResponse.status !== 200 || intlResponse.headers.get('location')) {
    return intlResponse;
  }
  
  // Authentication is now handled client-side via localStorage
  // Removed server-side auth check

  const response = NextResponse.next({
    request,
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
