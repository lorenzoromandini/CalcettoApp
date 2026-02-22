'use client';

/**
 * Recent Results Section Component
 * 
 * Shows the last 3 completed matches across all teams.
 * Displays score, date, result indicator (W/L/D), and link to history.
 */

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Trophy, Calendar } from 'lucide-react';
import { getClubMatches } from '@/lib/db/matches';
import type { Match } from '@/lib/db/schema';

// ============================================================================
// Types
// ============================================================================

interface CompletedMatch extends Match {
  teamName: string;
  clubId: string;
}

interface RecentResultsSectionProps {
  clubs: { id: string; name: string }[];
  locale: string;
}

// ============================================================================
// Component
// ============================================================================

export function RecentResultsSection({ clubs, locale }: RecentResultsSectionProps) {
  const t = useTranslations('history');
  const [recentMatches, setRecentMatches] = useState<CompletedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecentResults() {
      setIsLoading(true);
      try {
        const allMatches: CompletedMatch[] = [];

        for (const club of clubs) {
          const matches = await getClubMatches(club.id);
          
          const completedMatches = matches.filter(m => m.status === 'COMPLETED');
          
          for (const match of completedMatches) {
            allMatches.push({
              ...match,
              teamName: club.name,
              clubId: club.id,
            });
          }
        }

        allMatches.sort((a, b) => 
          new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
        );

        setRecentMatches(allMatches.slice(0, 3));
      } catch (error) {
        console.error('Failed to load recent results:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (clubs.length > 0) {
      loadRecentResults();
    } else {
      setIsLoading(false);
    }
  }, [clubs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const getResult = (match: Match): 'win' | 'loss' | 'draw' => {
    const homeScore = match.home_score ?? 0;
    const awayScore = match.away_score ?? 0;

    if (homeScore > awayScore) return 'win';
    if (homeScore < awayScore) return 'loss';
    return 'draw';
  };

  const getResultStyle = (result: 'win' | 'loss' | 'draw') => {
    switch (result) {
      case 'win':
        return { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950/30', label: 'W' };
      case 'loss':
        return { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-950/30', label: 'L' };
      case 'draw':
        return { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-950/30', label: 'D' };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {t('recentResults')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
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

  if (recentMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {t('recentResults')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('noMatches')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {t('recentResults')}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/dashboard`}>
              {t('viewAll')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentMatches.map((match) => {
          const result = getResult(match);
          const style = getResultStyle(result);
          const homeScore = match.home_score ?? 0;
          const awayScore = match.away_score ?? 0;

          return (
            <Link
              key={match.id}
              href={`/${locale}/clubs/${match.clubId}/matches/${match.id}`}
            >
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                {/* Result Badge */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${style.bg} ${style.color}`}>
                  {style.label}
                </div>

                {/* Match Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{match.teamName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(match.scheduled_at)}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-lg font-bold">{homeScore} - {awayScore}</span>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
