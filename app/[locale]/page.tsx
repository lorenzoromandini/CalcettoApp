import { redirect } from 'next/navigation';
import { getUserIdFromHeaders } from '@/lib/auth-headers';
import HomePageClient from './home-page-client';

export default async function HomePage() {
  const userId = await getUserIdFromHeaders();
  
  if (userId) {
    redirect('/dashboard');
  }
  
  return <HomePageClient />;
}
