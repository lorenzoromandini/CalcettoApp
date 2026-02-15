import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Trophy, TrendingUp, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Get user's teams
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id, role, teams:team_id(id, name, description, team_mode)')
    .eq('user_id', session.user.id);

  const teams = memberships?.map((m: any) => ({
    id: m.team_id,
    name: m.teams?.name || '',
    description: m.teams?.description || '',
    team_mode: m.teams?.team_mode || '5-a-side',
    role: m.role,
  })) || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {t('common.welcome')}, {session.user.name || session.user.email}
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
