import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/navigation/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { ProfileForm } from './profile-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t('auth.profile'),
  };
}

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userWithTeams = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        include: {
          team: true,
          player: true,
        },
      },
    },
  });

  const teams = userWithTeams?.memberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    jerseyNumber: m.player?.id 
      ? (prisma.playerTeam.findFirst({
          where: { playerId: m.player.id, teamId: m.team.id },
          select: { jerseyNumber: true },
        }).then((pt) => pt?.jerseyNumber ?? null))
      : null,
    playerId: m.player?.id ?? null,
  })) || [];

  const teamsWithJersey = await Promise.all(
    teams.map(async (t) => ({
      ...t,
      jerseyNumber: await t.jerseyNumber,
    }))
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-6 w-6" />
                <CardTitle>Profilo</CardTitle>
              </div>
              <CardDescription>
                Gestisci le informazioni del tuo profilo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                user={{
                  id: session.user.id,
                  firstName: session.user.firstName || '',
                  lastName: session.user.lastName || '',
                  nickname: session.user.nickname || '',
                  image: userWithTeams?.image || null,
                }}
                teams={teamsWithJersey}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
