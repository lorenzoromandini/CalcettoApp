'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Plus, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerCard } from '@/components/players/player-card';
import { usePlayers } from '@/hooks/use-players';
import { useTeam } from '@/hooks/use-teams';
import { Card, CardContent } from '@/components/ui/card';

interface PlayersPageClientProps {
  locale: string;
  teamId: string;
}

export function PlayersPageClient({ locale, teamId }: PlayersPageClientProps) {
  const t = useTranslations('players');
  const router = useRouter();
  const { players, isLoading, error, refetch } = usePlayers(teamId);
  const { team } = useTeam(teamId);

  const handleBack = () => {
    router.push(`/${locale}/teams`);
  };

  const handleCreatePlayer = () => {
    router.push(`/${locale}/teams/${teamId}/players/create`);
  };

  const handlePlayerClick = (playerId: string) => {
    router.push(`/${locale}/teams/${teamId}/players/${playerId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 mt-2 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-12 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{t('errorLoading')}</p>
            <Button onClick={refetch} variant="outline" className="mt-4">
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back')}
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {team ? `${team.name} - ${t('title')}` : t('title')}
          </h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreatePlayer} className="h-12">
          <Plus className="mr-2 h-4 w-4" />
          {t('create')}
        </Button>
      </div>

      {players.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('empty.description')}</p>
            <Button onClick={handleCreatePlayer}>
              <Plus className="mr-2 h-4 w-4" />
              {t('create')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => handlePlayerClick(player.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
