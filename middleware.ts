import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { routing } from '@/lib/i18n/routing';

// Create i18n middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First, handle i18n routing
  const intlResponse = intlMiddleware(request);
  
  // If i18n middleware redirects, return that response
  if (intlResponse.status !== 200 || intlResponse.headers.get('location')) {
    return intlResponse;
  }
  
  // Otherwise, chain with auth session update
  const authResponse = await updateSession(request);
  
  // Return auth response
  return authResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .*\.(?:svg|png|jpg|jpeg|gif|webp)$ (static images)
     * - sw.js, workbox-*.js (service worker files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|sw\\.js|workbox-.*\\.js).*)',
  ],
};
