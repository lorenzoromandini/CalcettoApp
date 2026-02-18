import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import HomePageClient from './home-page-client';

export default async function HomePage() {
  const session = await auth();
  
  if (session) {
    redirect('/dashboard');
  }
  
  return <HomePageClient />;
}
