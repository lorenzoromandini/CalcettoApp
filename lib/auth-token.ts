export function parseAuthToken(token: string): {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  image: string | null;
} | null {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return {
      id: decoded,
      email: '',
      firstName: null,
      lastName: null,
      nickname: null,
      image: null,
    };
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(request: Request): string | null {
  // Try Authorization header first (from authFetch)
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.replace('Bearer ', '');
  
  if (bearerToken) {
    const user = parseAuthToken(bearerToken);
    return user?.id || null;
  }
  
  // Fallback to cookies (for SSR/server actions)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const appSessionMatch = cookieHeader.match(/app-session=([^;]+)/);
    if (appSessionMatch) {
      try {
        const sessionData = JSON.parse(
          Buffer.from(appSessionMatch[1], 'base64').toString('utf-8')
        );
        return sessionData?.id || null;
      } catch {
        // Invalid cookie format
      }
    }
  }
  
  return null;
}
