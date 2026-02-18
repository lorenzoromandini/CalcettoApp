import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getUserTeams } from '@/lib/db/teams';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Trophy, TrendingUp, Plus, MapPin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { MatchStatus } from '@prisma/client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return {
    title: t('stats.teams'),
    description: t('subtitle'),
  };
}

export default async function DashboardPage() {
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
    team_mode: m.team?.teamMode || '5-a-side',
    role: m.role,
  }));

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {t('common.welcome')}, {session.user.firstName || session.user.email}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.teams')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.stats.teamsDescription')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.matches')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.stats.matchesDescription')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.victories')}
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.stats.victoriesDescription')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.rating')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.stats.ratingDescription')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions.title')}</CardTitle>
              <CardDescription>{t('dashboard.quickActions.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                {t('dashboard.comingSoon')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentActivity.title')}</CardTitle>
              <CardDescription>{t('dashboard.recentActivity.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.noActivity')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Matches Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('dashboard.upcomingMatches')}</h2>
          </div>

          {upcomingMatches.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{t('dashboard.noUpcomingMatches')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingMatches.map((match) => (
                <Link key={match.id} href={`/teams/${match.teamId}/matches/${match.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Date Box */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-primary/10 text-primary">
                          <span className="text-xs font-medium uppercase">
                            {match.scheduledAt.toLocaleDateString('it-IT', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold">
                            {match.scheduledAt.getDate()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Team Name */}
                          <p className="font-medium truncate">{match.team?.name}</p>

                          {/* Date & Time */}
                          <p className="text-sm text-muted-foreground">
                            {match.scheduledAt.toLocaleDateString('it-IT', {
                              weekday: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>

                          {/* Location */}
                          {match.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{match.location}</span>
                            </p>
                          )}

                          {/* Badges */}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {getModeLabel(match.mode)}
                            </Badge>
                            {/* RSVP Count */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>
                                {match._count.players}/{getPlayersNeeded(match.mode)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Teams Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('navigation.teams')}</h2>
            <Link href="/teams/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('teams.create')}
              </Button>
            </Link>
          </div>

          {teams.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('teams.empty.title')}</h3>
                <p className="text-muted-foreground mb-6">{t('teams.empty.description')}</p>
                <Link href="/teams/create">
                  <Button size="lg">
                    {t('teams.create')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Link key={team.id} href={`/teams/${team.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle>{team.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {team.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {team.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {team.team_mode === '5-a-side' ? '5 vs 5' : team.team_mode === '8-a-side' ? '8 vs 8' : '11 vs 11'}
                        </span>
                        <span className="text-muted-foreground capitalize">
                          {team.role}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
