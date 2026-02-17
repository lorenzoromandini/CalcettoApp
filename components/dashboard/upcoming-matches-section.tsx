'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Users, Calendar } from 'lucide-react';
import { getUpcomingMatches } from '@/lib/db/matches';
import { getRSVPCounts } from '@/lib/db/rsvps';
import type { Match } from '@/lib/db/schema';

interface UpcomingMatch extends Match {
  teamName: string;
  rsvpIn: number;
}

interface UpcomingMatchesSectionProps {
  teams: { id: string; name: string }[];
}

export function UpcomingMatchesSection({ teams }: UpcomingMatchesSectionProps) {
  const t = useTranslations();
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUpcomingMatches() {
      setIsLoading(true);
      try {
        const allMatches: UpcomingMatch[] = [];

        for (const team of teams) {
          const matches = await getUpcomingMatches(team.id);
          
          for (const match of matches) {
            const counts = await getRSVPCounts(match.id);
            allMatches.push({
              ...match,
              teamName: team.name,
              rsvpIn: counts.in,
            });
          }
        }

        // Sort by date (soonest first) and take first 5
        allMatches.sort((a, b) => 
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        );
        
        setUpcomingMatches(allMatches.slice(0, 5));
      } catch (error) {
        console.error('Failed to load upcoming matches:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (teams.length > 0) {
      loadUpcomingMatches();
    } else {
      setIsLoading(false);
    }
  }, [teams]);

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
    return mode === '5vs5' ? '5 vs 5' : '8 vs 8';
  };

  const getNeededPlayers = (mode: Match['mode']) => {
    return mode === '5vs5' ? 10 : 16;
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
          const needed = getNeededPlayers(match.mode);
          const isFull = match.rsvpIn >= needed;
          const isPartial = match.rsvpIn >= needed / 2;
          
          return (
            <Link
              key={match.id}
              href={`/teams/${match.team_id}/matches/${match.id}`}
            >
              <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                {/* Date Box */}
                <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-primary/10 text-primary">
                  <span className="text-xs font-medium uppercase">
                    {new Date(match.scheduled_at).toLocaleDateString('it-IT', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold">
                    {new Date(match.scheduled_at).getDate()}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(match.scheduled_at)}
                  </p>
                  <p className="font-medium truncate">{match.teamName}</p>
                  {match.location && (
                    <p className="text-xs text-muted-foreground truncate">
                      {match.location}
                    </p>
                  )}
                </div>

                {/* RSVP Count */}
                <div className={`flex items-center gap-1.5 text-sm ${
                  isFull ? 'text-green-600' : isPartial ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{match.rsvpIn}</span>
                  <span className="text-muted-foreground">/{needed}</span>
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
