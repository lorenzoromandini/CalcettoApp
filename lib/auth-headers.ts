import { headers } from 'next/headers';
import { parseAuthToken } from './auth-token';

export async function getUserIdFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const user = parseAuthToken(token);
  
  return user?.id || null;
}
