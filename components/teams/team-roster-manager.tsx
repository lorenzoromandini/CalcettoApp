'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { updateMemberRole, removeTeamMember } from '@/lib/db/teams';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, UserCog, Trash2, AlertTriangle } from 'lucide-react';
import type { TeamMember } from '@/lib/db/schema';

interface TeamRosterManagerProps {
  teamId: string;
  members: TeamMember[];
  currentUserId: string;
  isAdmin: boolean;
  onMembersChange: () => void;
}

export function TeamRosterManager({
  teamId,
  members,
  currentUserId,
  isAdmin,
  onMembersChange,
}: TeamRosterManagerProps) {
  const t = useTranslations('roster');
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'co-admin' | 'member') => {
    if (!isAdmin) return;

    try {
      await updateMemberRole(teamId, memberId, newRole);
      setEditingMember(null);
      onMembersChange();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert(t('roleUpdateError'));
    }
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      await removeTeamMember(teamId, memberToRemove.id);
      setMemberToRemove(null);
      onMembersChange();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert(t('removeError'));
    } finally {
      setIsRemoving(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'co-admin':
        return <UserCog className="h-4 w-4 text-muted-foreground" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return t('roles.admin');
      case 'co-admin':
        return t('roles.coAdmin');
      default:
        return t('roles.member');
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
                {getRoleIcon(member.role)}
                <div>
                  <p className="font-medium">
                    {member.user_id === currentUserId ? t('you') : member.user_id?.slice(0, 8)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getRoleLabel(member.role)}
                  </p>
                </div>
              </div>

              {isAdmin && member.user_id !== currentUserId && (
                <div className="flex items-center gap-2">
                  {editingMember === member.id ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant={member.role === 'member' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRoleChange(member.id, 'member')}
                      >
                        {t('roles.member')}
                      </Button>
                      <Button
                        variant={member.role === 'co-admin' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRoleChange(member.id, 'co-admin')}
                      >
                        {t('roles.coAdmin')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMember(null)}
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMember(member.id)}
                      >
                        {t('changeRole')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive"
                        onClick={() => setMemberToRemove(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              )}

              {!isAdmin && (
                <span className="text-sm text-muted-foreground">
                  {getRoleLabel(member.role)}
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
