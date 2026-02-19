'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Settings, Share2, Calendar, TrendingUp, Link2, Copy, Check, Loader2 } from 'lucide-react';
import { MyTeamsSwitcher } from './my-teams-switcher';
import { generateInviteLink } from '@/lib/db/invites';
import type { Team } from '@/lib/db/schema';

interface TeamDashboardProps {
  team: Team;
  playerCount: number;
  memberCount: number;
  isAdmin: boolean;
}

export function TeamDashboard({
  team,
  playerCount,
  memberCount,
  isAdmin,
}: TeamDashboardProps) {
  const t = useTranslations('teamDashboard');
  const tInvites = useTranslations('invites');
  const params = useParams();
  const locale = params.locale as string;
  const { data: session } = useSession();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = async () => {
    if (!session?.user?.id) return;

    setIsGenerating(true);
    try {
      const { link } = await generateInviteLink(team.id, session.user.id, { maxUses: 50 });
      setInviteLink(link);
    } catch (error) {
      console.error('Failed to generate invite:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInviteDialog = () => {
    setInviteDialogOpen(true);
    if (!inviteLink) {
      handleGenerateInvite();
    }
  };

  return (
    <div className="space-y-6">
      {/* My Teams Switcher */}
      <div className="flex justify-start">
        <MyTeamsSwitcher currentTeamId={team.id} locale={locale} />
      </div>

      {/* Team Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Team Image */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
            {team.image_url ? (
              <img
                src={team.image_url}
                alt={team.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-3xl font-bold text-primary/40">
                  {team.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            {team.description && (
              <p className="text-muted-foreground mt-1">{team.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {team.sync_status === 'pending' && (
                <Badge variant="outline" className="text-yellow-600">
                  {t('syncing')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Link href={`/${locale}/teams/${team.id}/settings`}>
              <Button variant="outline" className="h-12">
                <Settings className="mr-2 h-4 w-4" />
                {t('settings')}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.players')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.registeredPlayers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.members')}
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.teamMembers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.matches')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.upcomingMatches')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t('actions.players.title')}
            </CardTitle>
            <CardDescription>{t('actions.players.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/teams/${team.id}/players`}>
              <Button className="w-full h-12">
                {t('actions.players.button')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                {t('actions.invite.title')}
              </CardTitle>
              <CardDescription>{t('actions.invite.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={openInviteDialog}
              >
                {t('actions.invite.button')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Placeholder for upcoming matches */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('matches.title')}
          </CardTitle>
          <CardDescription>{t('matches.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('matches.placeholder')}
          </p>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              {tInvites('generator.title')}
            </DialogTitle>
            <DialogDescription>
              {t('actions.invite.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : inviteLink ? (
              <>
                <div className="space-y-2">
                  <Label>{tInvites('generator.linkLabel')}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 text-center">
                    {t('inviteLinkCopied')}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGenerateInvite}
                >
                  {tInvites('generator.createNew')}
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  {t('clickToGenerate')}
                </p>
                <Button onClick={handleGenerateInvite}>
                  {tInvites('generator.button')}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
