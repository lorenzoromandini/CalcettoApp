import { redirect, notFound } from 'next/navigation';
import { getUserIdFromHeaders } from '@/lib/auth-headers';
import { prisma } from '@/lib/db';
import { Link } from '@/lib/i18n/navigation';
import { FormationBuilder } from '@/components/formations/formation-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { FormationMode } from '@/lib/formations';
import { ClubPrivilege } from '@prisma/client';

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

  // Check club membership
  const membership = await prisma.clubMember.findFirst({
    where: {
      clubId,
      userId,
    },
    select: {
      privileges: true,
    },
  });

  if (!membership) {
    redirect(`/clubs/${clubId}`);
  }

  const isOwner = membership.privileges === ClubPrivilege.OWNER || 
                  membership.privileges === ClubPrivilege.MANAGER;

  // Get club members who can play
  const members = await prisma.clubMember.findMany({
    where: { clubId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          nickname: true,
          image: true,
        },
      },
    },
    orderBy: {
      user: {
        firstName: 'asc',
      },
    },
  });

  // Get formation positions for this match (who played)
  const formationPositions = await prisma.formationPosition.findMany({
    where: {
      formation: {
        matchId,
      },
      played: true,
    },
    select: {
      clubMemberId: true,
    },
  });

  const playedMemberIds = new Set(formationPositions.map((fp) => fp.clubMemberId));

  // Combine members with played status
  const membersWithStatus = members.map((member) => ({
    id: member.id,
    firstName: member.user?.firstName || 'Unknown',
    lastName: member.user?.lastName || '',
    nickname: member.user?.nickname || null,
    image: member.user?.image || null,
    primaryRole: member.primaryRole,
    secondaryRoles: member.secondaryRoles,
    jerseyNumber: member.jerseyNumber,
  }));

  // Match mode is already in correct format
  const formationMode: FormationMode = match.mode as FormationMode;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link href={`/clubs/${clubId}/matches/${matchId}`}>
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
        members={membersWithStatus}
        isHome={true}
        isAdmin={isOwner}
      />
    </div>
  );
}
