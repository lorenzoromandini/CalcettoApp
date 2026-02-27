'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerCard } from '@/components/players/player-card';
import { useMembers } from '@/hooks/use-players';
import { useClub } from '@/hooks/use-clubs';
import { Card, CardContent } from '@/components/ui/card';

interface MembersPageClientProps {
  locale: string;
  clubId: string;
}

export function PlayersPageClient({ locale, clubId }: MembersPageClientProps) {
  const t = useTranslations('players');
  const router = useRouter();
  const { members, isLoading, error, refetch } = useMembers(clubId);
  const { club } = useClub(clubId);

  // Hide club ID from URL, show only section path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({ clubId }, '', `/${locale}/clubs/members`);
    }
  }, [clubId, locale]);

  const handleBack = () => {
    router.push(`/${locale}/clubs/${clubId}`);
  };

  const handleMemberClick = (memberId: string) => {
    router.push(`/${locale}/clubs/${clubId}/members/${memberId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 mt-2 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-muted rounded animate-pulse" />
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

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {club ? `${club.name} - ${t('title')}` : t('title')}
        </h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {members.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground">{t('empty.description')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((member) => (
            <PlayerCard
              key={member.id}
              member={member}
              clubId={clubId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
