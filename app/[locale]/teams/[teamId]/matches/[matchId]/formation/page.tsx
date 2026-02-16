import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/navigation';
import { FormationBuilder } from '@/components/formations/formation-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { FormationMode } from '@/lib/formations';

interface FormationPageProps {
  params: Promise<{
    locale: string;
    teamId: string;
    matchId: string;
  }>;
}

export default async function FormationPage({ params }: FormationPageProps) {
  const { locale, teamId, matchId } = await params;
  const t = await getTranslations('formations');
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Get match
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .eq('team_id', teamId)
    .single();

  if (!match) {
    notFound();
  }

  // Check team membership
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    redirect(`/teams/${teamId}`);
  }

  const isAdmin = membership.role === 'admin' || membership.role === 'co-admin';

  // Get players with RSVPs
  const { data: teamPlayers } = await supabase
    .from('players')
    .select('id, name, avatar_url')
    .eq('team_id', teamId)
    .is('deleted_at', null)
    .order('name');

  // Get RSVPs for this match
  const { data: rsvps } = await supabase
    .from('match_players')
    .select('player_id, rsvp_status')
    .eq('match_id', matchId);

  // Combine players with RSVPs
  const players = (teamPlayers || []).map((player) => {
    const rsvp = rsvps?.find((r) => r.player_id === player.id);
    return {
      id: player.id,
      name: player.name,
      avatar: player.avatar_url || undefined,
      rsvp: (rsvp?.rsvp_status as 'in' | 'out' | 'maybe') || 'out',
    };
  });

  // Match mode is already in correct format
  const formationMode: FormationMode = match.mode as FormationMode;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link href={`/teams/${teamId}/matches/${matchId}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToMatch')}
          </Button>
        </Link>
      </div>

      {/* Formation Builder */}
      <FormationBuilder
        matchId={matchId}
        teamId={teamId}
        mode={formationMode}
        players={players}
        isAdmin={isAdmin}
      />
    </div>
  );
}
