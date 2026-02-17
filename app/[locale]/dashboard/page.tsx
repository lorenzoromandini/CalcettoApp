import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserTeams } from '@/lib/db/teams';
import { DashboardClient } from './dashboard-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return {
    title: t('stats.teams'),
    description: t('subtitle'),
  };
}

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Get user's teams
  const teams = await getUserTeams(session.user.id);

  return <DashboardClient teams={teams} userName={session.user.name || session.user.email || ''} />;
}
