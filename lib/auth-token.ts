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
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || 
    (typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null);
  
  if (!token) return null;
  
  const user = parseAuthToken(token);
  return user?.id || null;
}
