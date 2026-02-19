'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Trophy, TrendingUp, Plus } from 'lucide-react';
import { UpcomingMatchesSection } from '@/components/dashboard/upcoming-matches-section';
import type { Team } from '@/lib/db/schema';

interface DashboardClientProps {
  teams: Team[];
  userName: string;
}

export function DashboardClient({ teams, userName }: DashboardClientProps) {
  const t = useTranslations();

  const teamList = teams.map((team) => ({
    id: team.id,
    name: team.name,
    description: team.description || '',
    role: 'member' as const, // Will be determined by actual membership
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {t('common.welcome')}, {userName}
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

        {/* Two Column Layout */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column - Teams */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('navigation.teams')}</h2>
              <Link href="/teams/create">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('teams.create')}
                </Button>
              </Link>
            </div>

            {teamList.length === 0 ? (
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
              <div className="grid gap-4">
                {teamList.map((team) => (
                  <Link key={team.id} href={`/teams/${team.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {team.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {team.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
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

          {/* Right Column - Upcoming Matches */}
          <UpcomingMatchesSection teams={teamList.map(t => ({ id: t.id, name: t.name }))} />
        </div>
      </main>
    </div>
  );
}
