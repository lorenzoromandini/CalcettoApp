import { redirect, notFound } from 'next/navigation';
import { getUserIdFromHeaders } from '@/lib/auth-headers';
import { prisma } from '@/lib/db';
import { FormationPageClient } from './formation-page-client';
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

  // Match mode is already in correct format
  const formationMode: FormationMode = match.mode as FormationMode;

  return (
    <FormationPageClient
      matchId={matchId}
      clubId={clubId}
      mode={formationMode}
      isAdmin={isOwner}
    />
  );
}
