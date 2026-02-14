import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { auth } from '@/lib/auth';
import { routing } from '@/lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  
  if (intlResponse.status !== 200 || intlResponse.headers.get('location')) {
    return intlResponse;
  }
  
  const session = await auth();
  
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
