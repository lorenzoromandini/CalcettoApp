'use client';
'use no memo';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { InviteGenerator } from '@/components/teams/invite-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default function TeamSettingsPage() {
  const t = useTranslations('settings');
  const params = useParams();
  const teamId = params.teamId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const checkAdminStatus = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    setUserId(session.user.id);

    // Check if user is admin
    const membership = await prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: session.user.id,
      },
    });

    setIsAdmin(membership?.role === 'admin' || membership?.role === 'co-admin');
    setIsLoading(false);
  }, [teamId, session]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAdminStatus();
  }, [checkAdminStatus]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">{t('notAdmin')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/teams/${teamId}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToTeam')}
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          {t('title')}
        </h1>

        {/* Invite Section */}
        {userId && <InviteGenerator teamId={teamId} userId={userId} />}

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {t('dangerZone.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('dangerZone.description')}
            </p>
            <Button variant="destructive" className="h-12">
              {t('dangerZone.deleteTeam')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
