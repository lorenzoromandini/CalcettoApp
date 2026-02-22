import { redirect, notFound } from 'next/navigation';
import { getUserIdFromHeaders } from '@/lib/auth-headers';
import { prisma } from '@/lib/db';
import { Link } from '@/lib/i18n/navigation';
import { FormationBuilder } from '@/components/formations/formation-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { FormationMode } from '@/lib/formations';

interface FormationPageProps {
  params: Promise<{
    locale: string;
    clubId: string;
    matchId: string;
  }>;
}

export default async function FormationPage({ params }: FormationPageProps) {
  const { locale, clubId, matchId } = await params;
  const t = await getTranslations('formations');

  // Check auth
  const userId = await getUserIdFromHeaders();
  if (!userId) {
    redirect('/auth/login');
  }

  // Get match
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      clubId,
    },
  });

  if (!match) {
    notFound();
  }

  // Check team membership
  const membership = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId,
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    redirect(`/teams/${clubId}`);
  }

  const isAdmin = membership.role === 'admin' || membership.role === 'co-admin';

  // Get players in team with their details
  const playerClubs = await prisma.playerClub.findMany({
    where: { clubId },
    include: {
      player: true,
    },
    orderBy: {
      player: {
        name: 'asc',
      },
    },
  });

  // Get RSVPs for this match
  const rsvps = await prisma.matchPlayer.findMany({
    where: { matchId },
    select: {
      playerId: true,
      rsvpStatus: true,
    },
  });

  // Combine players with RSVPs
  const players = playerClubs.map((pt) => {
    const rsvp = rsvps.find((r) => r.playerId === pt.playerId);
    return {
      id: pt.player.id,
      name: pt.player.name,
      avatar: pt.player.avatarUrl || undefined,
      rsvp: (rsvp?.rsvpStatus as 'in' | 'out' | 'maybe') || 'out',
    };
  });

  // Match mode is already in correct format
  const formationMode: FormationMode = match.mode as FormationMode;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link href={`/teams/${clubId}/matches/${matchId}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToMatch')}
          </Button>
        </Link>
      </div>

      {/* Formation Builder */}
      <FormationBuilder
        matchId={matchId}
        clubId={clubId}
        mode={formationMode}
        players={players}
        isAdmin={isAdmin}
      />
    </div>
  );
}
