'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { updateMemberPrivilege, removeClubMember } from '@/lib/db/clubs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Shield, User, UserCog, Trash2, AlertTriangle, Settings } from 'lucide-react';
import type { ClubMember } from '@/lib/db/schema';

interface ClubRosterManagerProps {
  clubId: string;
  members: ClubMember[];
  currentUserId: string;
  isAdmin: boolean;
  onMembersChange: () => void;
}

export function ClubRosterManager({
  clubId,
  members,
  currentUserId,
  isAdmin,
  onMembersChange,
}: ClubRosterManagerProps) {
  const t = useTranslations('roster');
  const [memberToRemove, setMemberToRemove] = useState<ClubMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handlePrivilegeChange = async (memberId: string, newPrivilege: 'owner' | 'manager' | 'member') => {
    if (!isAdmin) return;

    try {
      await updateMemberPrivilege(clubId, memberId, newPrivilege);
      onMembersChange();
    } catch (error) {
      console.error('Failed to update privilege:', error);
      alert(t('privilegeUpdateError'));
    }
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      await removeClubMember(clubId, memberToRemove.id);
      setMemberToRemove(null);
      onMembersChange();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert(t('removeError'));
    } finally {
      setIsRemoving(false);
    }
  };

  const getPrivilegeIcon = (privilege: string) => {
    switch (privilege) {
      case 'owner':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'manager':
        return <UserCog className="h-4 w-4 text-muted-foreground" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPrivilegeLabel = (privilege: string) => {
    switch (privilege) {
      case 'owner':
        return t('privileges.owner');
      case 'manager':
        return t('privileges.manager');
      default:
        return t('privileges.member');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getPrivilegeIcon(member.privilege)}
                <div>
                  <p className="font-medium">
                    {member.user_id === currentUserId ? t('you') : member.user_id?.slice(0, 8)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getPrivilegeLabel(member.privilege)}
                  </p>
                </div>
              </div>

              {isAdmin && member.user_id !== currentUserId ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePrivilegeChange(member.id, member.privilege === 'manager' ? 'member' : 'manager')}>
                        <UserCog className="mr-2 h-4 w-4" />
                        {member.privilege === 'manager' ? t('removeManager') : t('makeManager')}
                      </DropdownMenuItem>
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
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {getPrivilegeLabel(member.privilege)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Simple confirmation dialog */}
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
      </CardContent>
    </Card>
  );
}
