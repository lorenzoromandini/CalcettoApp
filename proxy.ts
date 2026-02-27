import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  
  if (intlResponse.status !== 200 || intlResponse.headers.get('location')) {
    return intlResponse;
  }

  return NextResponse.next({
    request,
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
