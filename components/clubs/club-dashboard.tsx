'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from '@/components/providers/session-provider';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Settings, Share2, Calendar, Link2, Copy, Check, Loader2, MessageCircle, Plus } from 'lucide-react';
import { generateInviteLink } from '@/lib/actions/invites';
import type { Team } from '@/lib/db/schema';

interface ClubDashboardProps {
  club: Team;
  playerCount: number;
  isOwner: boolean;
}

export function ClubDashboard({
  club,
  playerCount,
  isOwner,
}: ClubDashboardProps) {
  const t = useTranslations('teamDashboard');
  const tInvites = useTranslations('invites');
  const params = useParams();
  const locale = params.locale as string;
  const { data: session } = useSession();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (inviteDialogOpen && !inviteLink && !isGenerating && session?.user?.id) {
      handleGenerateInvite();
    }
  }, [inviteDialogOpen, inviteLink, isGenerating, session?.user?.id]);

  const handleGenerateInvite = async () => {
    if (!session?.user?.id) return;

    setIsGenerating(true);
    try {
      const { link } = await generateInviteLink(club.id, { maxUses: 50 });
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

  const handleShareWhatsApp = () => {
    if (!inviteLink) return;
    const text = `Unisciti alla mia squadra su Calcetto Manager! ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const openInviteDialog = () => {
    setInviteDialogOpen(true);
    if (!inviteLink) {
      handleGenerateInvite();
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Team Image */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
            {club.imageUrl ? (
              <img
                src={club.imageUrl}
                alt={club.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-3xl font-bold text-primary/40">
                  {club.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold">{club.name}</h1>
            {club.description && (
              <p className="text-muted-foreground mt-1">{club.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {/* sync_status field not in current schema - offline sync not implemented
              {club.sync_status === 'pending' && (
                <Badge variant="outline" className="text-yellow-600">
                  {t('syncing')}
                </Badge>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = `/${locale}/clubs/${club.id}/roster`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Rosa
            </CardTitle>
            <CardDescription>Gestisci i giocatori e i membri della squadra</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerCount}</div>
            <p className="text-xs text-muted-foreground">Giocatori</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = `/${locale}/clubs/${club.id}/matches`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Partite
            </CardTitle>
            <CardDescription>Visualizza e gestisci le partite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Prossime partite</p>
          </CardContent>
        </Card>
      </div>

      {/* Invite Members - Only for admin */}
      {isOwner && (
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
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleShareWhatsApp}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t('shareOnWhatsApp')}
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
