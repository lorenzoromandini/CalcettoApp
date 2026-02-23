'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { PlayerForm } from '@/components/players/player-form';
import { useCreatePlayer } from '@/hooks/use-players';
import type { CreatePlayerInput } from '@/lib/validations/player';

interface CreatePlayerPageClientProps {
  locale: string;
  clubId: string;
}

export function CreatePlayerPageClient({ locale, clubId }: CreatePlayerPageClientProps) {
  const t = useTranslations('players');
  const router = useRouter();
  const { createPlayer, isPending } = useCreatePlayer(clubId);

  const handleBack = () => {
    router.push(`/${locale}/clubs/${clubId}/players`);
  };

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreatePlayerInput) => {
    try {
      await createPlayer(data);
      router.push(`/${locale}/clubs/${clubId}/players`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create player');
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/clubs/${clubId}/players`);
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
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <CardContent>
          <PlayerForm
            clubId={clubId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
