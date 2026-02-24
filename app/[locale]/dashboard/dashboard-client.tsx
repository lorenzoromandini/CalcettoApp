'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Trophy, TrendingUp, Plus } from 'lucide-react';
import { UpcomingMatchesSection } from '@/components/dashboard/upcoming-matches-section';
import type { Club } from '@/lib/db/schema';

interface DashboardClientProps {
  clubs: Club[];
  userName: string;
}

export function DashboardClient({ clubs, userName }: DashboardClientProps) {
  const t = useTranslations();

  const clubList = clubs.map((club) => ({
    id: club.id,
    name: club.name,
    description: club.description || '',
    privilege: 'member' as const, // Will be determined by actual membership
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
                {t('dashboard.stats.clubs')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clubs.length}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.stats.clubsDescription')}
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
          {/* Left Column - Clubs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('navigation.clubs')}</h2>
              <Link href="/clubs/create">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('clubs.create')}
                </Button>
              </Link>
            </div>

            {clubList.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('clubs.empty.title')}</h3>
                  <p className="text-muted-foreground mb-6">{t('clubs.empty.description')}</p>
                  <Link href="/clubs/create">
                    <Button size="lg">
                      {t('clubs.create')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {clubList.map((club) => (
                  <Link key={club.id} href={`/clubs/${club.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{club.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {club.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {club.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {club.privilege}
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
          <UpcomingMatchesSection clubs={clubList.map(c => ({ id: c.id, name: c.name }))} />
        </div>
      </main>
    </div>
  );
}
