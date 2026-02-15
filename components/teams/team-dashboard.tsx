'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Settings, Share2, Calendar, TrendingUp } from 'lucide-react';
import type { Team } from '@/lib/db/schema';

interface TeamDashboardProps {
  team: Team;
  playerCount: number;
  memberCount: number;
  isAdmin: boolean;
}

export function TeamDashboard({
  team,
  playerCount,
  memberCount,
  isAdmin,
}: TeamDashboardProps) {
  const t = useTranslations('teamDashboard');

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          {team.description && (
            <p className="text-muted-foreground mt-1">{team.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={team.team_mode === '5-a-side' ? 'default' : 'secondary'}>
              {team.team_mode === '5-a-side' ? '5 vs 5' : '8 vs 8'}
            </Badge>
            {team.sync_status === 'pending' && (
              <Badge variant="outline" className="text-yellow-600">
                {t('syncing')}
              </Badge>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Link href={`/teams/${team.id}/settings`}>
              <Button variant="outline" className="h-12">
                <Settings className="mr-2 h-4 w-4" />
                {t('settings')}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.players')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.registeredPlayers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.members')}
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.teamMembers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.matches')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.upcomingMatches')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t('actions.players.title')}
            </CardTitle>
            <CardDescription>{t('actions.players.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/teams/${team.id}/players`}>
              <Button className="w-full h-12">
                {t('actions.players.button')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                {t('actions.invite.title')}
              </CardTitle>
              <CardDescription>{t('actions.invite.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/teams/${team.id}/settings`}>
                <Button variant="outline" className="w-full h-12">
                  {t('actions.invite.button')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Placeholder for upcoming matches */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('matches.title')}
          </CardTitle>
          <CardDescription>{t('matches.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('matches.placeholder')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
