'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ClubPrivilege } from '@prisma/client';
import { useSession } from '@/components/providers/session-provider';
import { ArrowLeft, Users, Settings, UserCog, Trash2, Crown, Briefcase, Shield, User, AlertTriangle, Link2, Copy, Check, MessageCircle, Shirt, Activity, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authFetch } from '@/lib/auth-fetch';
import { updateMemberPrivilege, removeClubMember } from '@/lib/db/clubs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ClubRosterPage() {
  const t = useTranslations('roster');
  const params = useParams();
  const clubId = params.clubId as string;
  const locale = params.locale as string;



  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const { data: session } = useSession();
  
  const [memberToRemove, setMemberToRemove] = useState<any | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Stati per invito
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [membersRes, adminRes] = await Promise.all([
        authFetch(`/api/clubs/${clubId}/members`),
        authFetch(`/api/clubs/${clubId}/admin`),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        // I membri contengono già tutti i dati necessari (jerseyNumber, primaryRole, ecc.)
        setMembers(membersData);
      }

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setIsOwner(adminData.isOwner);
        setIsManager(adminData.isManager);
      }

      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    } catch (error) {
      console.error('Failed to load roster:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clubId, session?.user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrivilegeChange = async (memberId: string, newPrivilege: ClubPrivilege) => {
    if (!isOwner) return;

    try {
      const res = await authFetch(`/api/clubs/${clubId}/members/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privileges: newPrivilege }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update privilege');
      }

      loadData();
    } catch (error) {
      console.error('Failed to update privilege:', error);
      alert(t('privilegeUpdateError'));
    }
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      const res = await authFetch(`/api/clubs/${clubId}/members/${memberToRemove.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      setMemberToRemove(null);
      loadData();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert(t('removeError'));
    } finally {
      setIsRemoving(false);
    }
  };

  // Handler per invito
  const handleGenerateInvite = async () => {
    setIsGeneratingInvite(true);
    try {
      const res = await authFetch(`/api/clubs/${clubId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxUses: 50 }),
      });
      
      if (!res.ok) throw new Error('Failed to generate invite');
      
      const data = await res.json();
      setInviteLink(data.link);
    } catch (error) {
      console.error('Failed to generate invite:', error);
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!inviteLink) return;
    const text = encodeURIComponent(`Unisciti al mio club su Calcetto! ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const getPrivilegeIcon = (privilege: string) => {
    // Handle both uppercase (from DB) and lowercase (for compatibility)
    const normalizedPrivilege = privilege.toUpperCase();
    switch (normalizedPrivilege) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'MANAGER':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPrivilegeLabel = (privilege: string) => {
    // Handle both uppercase (from DB) and lowercase (for compatibility)
    const normalizedPrivilege = privilege.toUpperCase();
    switch (normalizedPrivilege) {
      case 'OWNER':
        return t('privileges.owner');
      case 'MANAGER':
        return t('privileges.manager');
      default:
        return t('privileges.member');
    }
  };

  const ROLE_ICONS: Record<string, string> = {
    // New English abbreviations
    GK: '/icons/roles/goalkeeper.png',
    DEF: '/icons/roles/defender.png',
    MID: '/icons/roles/midfielder.png',
    ST: '/icons/roles/attacker.png',
    // Old Italian (for backward compatibility until DB is migrated)
    POR: '/icons/roles/goalkeeper.png',
    DIF: '/icons/roles/defender.png',
    CEN: '/icons/roles/midfielder.png',
    ATT: '/icons/roles/attacker.png',
  };

  const getRoleIcon = (role: string) => {
    const iconPath = ROLE_ICONS[role];
    if (!iconPath) return null;
    return <img src={iconPath} alt={translatePlayerRole(role)} className="h-5 w-5 object-contain" />;
  };

  const translatePlayerRole = (role: string) => {
    switch (role) {
      case 'POR':
        return 'Portiere';
      case 'DIF':
        return 'Difensore';
      case 'CEN':
        return 'Centrocampista';
      case 'ATT':
        return 'Attaccante';
      case 'GOALKEEPER':
        return 'Portiere';
      case 'DEFENDER':
        return 'Difensore';
      case 'MIDFIELDER':
        return 'Centrocampista';
      case 'ATTACKER':
        return 'Attaccante';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/clubs/${clubId}`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span>Indietro</span>
        </Link>
        
        <h1 className="text-2xl font-bold">Rosa</h1>
        
        <div className="w-20" />
      </div>

      {/* Players Section - Shows all members with user accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Giocatori
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nessun membro trovato</p>
          ) : (
            <div className="space-y-3">
              {members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {/* Maglietta con numero */}
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <Shirt className="h-12 w-12 text-primary" />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                        {member.jerseyNumber || '?'}
                      </span>
                    </div>
                    {/* Nome, ruolo e privilegio */}
                    <div>
                      <p className="font-medium">
                        {member.user?.firstName && member.user?.lastName 
                          ? `${member.user.firstName} ${member.user.lastName}${member.user?.nickname ? ` | ${member.user.nickname}` : ''}`
                          : member.user?.email || 'Utente'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {getPrivilegeIcon(member.privileges)}
                        {member.primaryRole && getRoleIcon(member.primaryRole)}
                        {member.secondaryRoles?.length > 0 && member.secondaryRoles.map((role: string) => (
                          <span key={role}>{getRoleIcon(role)}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                  
                  {/* Management actions - Solo Owner può gestire privilegi ed espellere */}
                  {isOwner && member.userId !== currentUserId && member.privileges !== ClubPrivilege.OWNER && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Solo per membri normali: opzione per nominare Manager */}
                        {member.privileges === ClubPrivilege.MEMBER && (
                          <DropdownMenuItem onClick={() => handlePrivilegeChange(member.id, ClubPrivilege.MANAGER)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            {t('makeManager')}
                          </DropdownMenuItem>
                        )}
                        {/* Solo per Manager: opzione per rimuovere */}
                        {member.privileges === ClubPrivilege.MANAGER && (
                          <DropdownMenuItem onClick={() => handlePrivilegeChange(member.id, ClubPrivilege.MEMBER)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            {t('removeManager')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setMemberToRemove(member)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('kickPlayer')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottone Invita Giocatori - Owner e Manager possono invitare */}
      {(isOwner || isManager) && (
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={() => setShowInviteDialog(true)}
            className="h-12 px-8"
            variant="outline"
          >
            <Users className="mr-2 h-5 w-5" />
            Invita giocatori al club
          </Button>
        </div>
      )}

      {/* Dialog Invito */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Invita giocatori
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!inviteLink ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Genera un link di invito da condividere con i tuoi amici
                </p>
                <Button 
                  onClick={handleGenerateInvite}
                  disabled={isGeneratingInvite}
                  className="w-full h-12"
                >
                  {isGeneratingInvite ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Generazione...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Genera link
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Link di invito</Label>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="flex-1 h-12"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 shrink-0"
                      onClick={handleCopyInvite}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-sm text-green-600 text-center">Link copiato!</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="h-12"
                    onClick={handleShareWhatsApp}
                  >
                    <MessageCircle className="mr-2 h-5 w-5 text-green-600" />
                    Condividi su WhatsApp
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setInviteLink(null);
                    handleGenerateInvite();
                  }}
                >
                  Genera nuovo link
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t('remove.confirmTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('remove.confirmDescription')}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setMemberToRemove(null)}
                  disabled={isRemoving}
                >
                  {t('remove.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? t('remove.removing') : t('remove.confirm')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
