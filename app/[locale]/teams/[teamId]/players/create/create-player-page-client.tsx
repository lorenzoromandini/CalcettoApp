'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerForm } from '@/components/players/player-form';
import { useCreatePlayer } from '@/hooks/use-players';
import type { CreatePlayerInput } from '@/lib/validations/player';

interface CreatePlayerPageClientProps {
  locale: string;
  teamId: string;
}

export function CreatePlayerPageClient({ locale, teamId }: CreatePlayerPageClientProps) {
  const t = useTranslations('players');
  const router = useRouter();
  const { createPlayer, isPending } = useCreatePlayer(teamId);

  const handleBack = () => {
    router.push(`/${locale}/teams/${teamId}/players`);
  };

  const handleSubmit = async (data: CreatePlayerInput, avatarBlob?: Blob) => {
    await createPlayer(data, avatarBlob);
    router.push(`/${locale}/teams/${teamId}/players`);
  };

  const handleCancel = () => {
    router.push(`/${locale}/teams/${teamId}/players`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('create')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerForm
            teamId={teamId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
