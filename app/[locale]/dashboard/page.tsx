import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getUserTeams } from '@/lib/db/teams';
import { getPlayerDashboardData, getTeamPlayersDashboardData } from '@/lib/db/player-ratings';
import { Header } from '@/components/navigation/header';
import { DashboardPlayerCard, DashboardPlayerCardSkeleton } from '@/components/dashboard/dashboard-player-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, TrendingUp, Plus, MapPin, User } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { MatchStatus } from '@prisma/client';
import { DashboardCards } from '@/components/dashboard/dashboard-cards';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return {
    title: t('stats.teams'),
    description: t('subtitle'),
  };
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Get user's teams with memberships
  const memberships = await prisma.teamMember.findMany({
    where: {
      userId: session.user.id,
      team: {
        deletedAt: null,
      },
    },
    include: {
      team: true,
    },
    orderBy: {
      team: {
        createdAt: 'desc',
      },
    },
  });
  
  const teams = memberships.map((m) => ({
    id: m.teamId,
    name: m.team?.name || '',
    description: m.team?.description || '',
    role: m.role,
  }));

  const playerDashboardData = await getPlayerDashboardData(session.user.id);
  
  const firstTeamId = teams[0]?.id;
  const teamPlayersData = firstTeamId 
    ? await getTeamPlayersDashboardData(firstTeamId)
    : [];

  const displayName = session.user.nickname
    || playerDashboardData?.player.nickname
    || `${playerDashboardData?.player.name || ''} ${playerDashboardData?.player.surname || ''}`.trim()
    || session.user.email;

  // Get upcoming matches for all teams
  const now = new Date();
  const upcomingMatches = await prisma.match.findMany({
    where: {
      teamId: {
        in: teams.map(t => t.id),
      },
      scheduledAt: {
        gte: now,
      },
      status: MatchStatus.SCHEDULED,
    },
    orderBy: {
      scheduledAt: 'asc',
    },
    take: 5,
    include: {
      team: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          players: {
            where: {
              rsvpStatus: 'in',
            },
          },
        },
      },
    },
  });

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case '5vs5':
        return '5 vs 5';
      case '8vs8':
        return '8 vs 8';
      default:
        return mode;
    }
  };

  const getPlayersNeeded = (mode: string) => {
    return mode === '5vs5' ? 10 : 16;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Mobile Dashboard - 1 big card + 2 rectangles */}
        <div className="grid gap-4 md:hidden">
          {/* La mia carta - Big card */}
          <Card className="min-h-[200px]">
            <CardHeader>
              <CardTitle>{t('dashboard.yourCard') || 'La mia carta'}</CardTitle>
            </CardHeader>
            <CardContent>
              {playerDashboardData ? (
                <DashboardPlayerCard data={playerDashboardData} locale={locale} />
              ) : (
                <p className="text-sm text-muted-foreground">{t('common.loading') || 'Caricamento...'}</p>
              )}
            </CardContent>
          </Card>

          {/* Club - First rectangle */}
          <Link href="/teams">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {t('navigation.clubs') || 'Club'}
                </CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.stats.teamsDescription') || 'Club disponibili'}
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Partite - Second rectangle */}
          <DashboardCards teams={teams} />
        </div>

        {/* Desktop Dashboard - Hidden on mobile */}
        <div className="hidden md:block">
          {/* Desktop content here if needed */}
        </div>
      </main>
    </div>
  );
}
