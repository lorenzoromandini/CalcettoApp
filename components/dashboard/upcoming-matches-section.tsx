'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar } from 'lucide-react';
import { getUpcomingMatchesAction } from '@/lib/actions/matches';
import type { Match } from '@/lib/db/schema';

interface UpcomingMatch extends Match {
  teamName: string;
}

interface UpcomingMatchesSectionProps {
  clubs: { id: string; name: string }[];
}

export function UpcomingMatchesSection({ clubs }: UpcomingMatchesSectionProps) {
  const t = useTranslations();
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUpcomingMatches() {
      setIsLoading(true);
      try {
        const allMatches: UpcomingMatch[] = [];

        for (const club of clubs) {
          const matches = await getUpcomingMatchesAction(club.id);
          
          for (const match of matches) {
            allMatches.push({
              ...match,
              teamName: club.name,
            });
          }
        }

        allMatches.sort((a, b) => 
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );
        
        setUpcomingMatches(allMatches.slice(0, 5));
      } catch (error) {
        console.error('Failed to load upcoming matches:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (clubs.length > 0) {
      loadUpcomingMatches();
    } else {
      setIsLoading(false);
    }
  }, [clubs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getModeLabel = (mode: Match['mode']) => {
    return mode === 'FIVE_V_FIVE' ? '5 vs 5' : '8 vs 8';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('dashboard.upcomingMatches')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
              <div className="h-14 w-14 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (upcomingMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('dashboard.upcomingMatches')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('dashboard.noUpcomingMatches')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t('dashboard.upcomingMatches')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingMatches.map((match) => {
          
          return (
            <Link
              key={match.id}
              href={`/clubs/${match.clubId}/matches/${match.id}`}
            >
              <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                {/* Date Box */}
                <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-primary/10 text-primary">
                  <span className="text-xs font-medium uppercase">
                    {new Date(match.scheduledAt).toLocaleDateString('it-IT', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold">
                    {new Date(match.scheduledAt).getDate()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(match.scheduledAt)}
                  </p>
                  <p className="font-medium truncate">{match.teamName}</p>
                  {match.location && (
                    <p className="text-xs text-muted-foreground truncate">
                      {match.location}
                    </p>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
