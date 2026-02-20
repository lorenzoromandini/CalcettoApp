'use client';
'use no memo';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SetupPlayerForm } from '@/components/teams/setup-player-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type InviteState = 'loading' | 'valid' | 'invalid' | 'expired' | 'maxed';

interface InviteData {
  id: string;
  team: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  expiresAt: string;
  useCount: number;
  maxUses: number;
}

export default function InvitePage() {
  const t = useTranslations('invites');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [inviteState, setInviteState] = useState<InviteState>('loading');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinResult, setJoinResult] = useState<{ 
    status: 'success' | 'already_member' | 'error' | null; 
    needsSetup?: boolean;
    teamId?: string;
  }>({ status: null });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const { data: session } = useSession();

  const checkAuthAndInvite = useCallback(async () => {
    setIsAuthenticated(!!session?.user);

    if (!token) {
      setInviteState('invalid');
      return;
    }

    try {
      const res = await fetch(`/api/invites/${token}`);
      
      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'Expired') {
          setInviteState('expired');
        } else if (data.error === 'Max uses reached') {
          setInviteState('maxed');
        } else {
          setInviteState('invalid');
        }
        return;
      }

      const data: InviteData = await res.json();
      setInviteData(data);
      setInviteState('valid');
    } catch {
      setInviteState('invalid');
    }
  }, [token, session?.user]);

  useEffect(() => {
    checkAuthAndInvite();
  }, [checkAuthAndInvite]);

  const handleJoin = async () => {
    if (!token) return;

    if (!session?.user?.id) {
      setJoinResult({ status: 'error' });
      return;
    }

    setIsJoining(true);
    
    try {
      const res = await fetch(`/api/invites/${token}/redeem`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setJoinResult({ 
          status: 'success', 
          needsSetup: data.needsSetup,
          teamId: data.teamId 
        });
        
        if (data.needsSetup) {
          setShowSetupForm(true);
        } else {
          setTimeout(() => {
            router.push(`/teams/${data.teamId}`);
          }, 2000);
        }
      } else if (data.error === 'Already a member') {
        setJoinResult({ 
          status: 'already_member',
          needsSetup: data.needsSetup,
          teamId: data.teamId
        });
        
        if (data.needsSetup) {
          setShowSetupForm(true);
        }
      } else {
        setJoinResult({ status: 'error' });
      }
    } catch {
      setJoinResult({ status: 'error' });
    }
    
    setIsJoining(false);
  };

  const handleSetupComplete = () => {
    setShowSetupForm(false);
    router.push(`/teams/${joinResult.teamId}`);
  };

  const teamName = inviteData?.team?.name || t('unknownTeam');
  const teamImage = inviteData?.team?.imageUrl;

  if (inviteState === 'loading') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (inviteState === 'invalid') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="mb-2">{t('invalid.title')}</CardTitle>
            <CardDescription>{t('invalid.description')}</CardDescription>
            <Link href="/teams" className="mt-6 block">
              <Button className="w-full h-12">{t('invalid.backToTeams')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardHeader className="text-center">
            {teamImage && (
              <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={teamImage}
                  alt={teamName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {!teamImage && (
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
            )}
            <CardTitle className="flex items-center gap-2 justify-center">
              {t('join.title', { teamName })}
            </CardTitle>
            <CardDescription className="text-center">
              {t('join.authRequired')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={`/auth/register?redirect=/teams/invite?token=${token}`}>
              <Button className="w-full h-12">{t('join.registerButton')}</Button>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t('join.or')}
                </span>
              </div>
            </div>
            <Link href={`/auth/login?redirect=/teams/invite?token=${token}`}>
              <Button variant="outline" className="w-full h-12">
                {t('join.loginButton')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSetupForm && joinResult.teamId) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <SetupPlayerForm
          teamId={joinResult.teamId}
          teamName={teamName}
          onSuccess={handleSetupComplete}
          onCancel={() => router.push(`/teams/${joinResult.teamId}`)}
        />
      </div>
    );
  }

  if (joinResult.status === 'success' && !joinResult.needsSetup) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="mb-2">{t('success.title')}</CardTitle>
            <CardDescription>{t('success.description', { teamName })}</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joinResult.status === 'already_member' && !joinResult.needsSetup) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <CardTitle className="mb-2">{t('alreadyMember.title')}</CardTitle>
            <CardDescription>{t('alreadyMember.description', { teamName })}</CardDescription>
            <Link href={`/teams/${joinResult.teamId || ''}`} className="mt-6 block">
              <Button className="w-full h-12">{t('alreadyMember.viewTeam')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader className="text-center">
          {teamImage && (
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src={teamImage}
                alt={teamName}
                fill
                className="object-cover"
              />
            </div>
          )}
          {!teamImage && (
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-12 w-12 text-primary" />
            </div>
          )}
          <CardTitle className="flex items-center gap-2 justify-center">
            {t('join.title', { teamName })}
          </CardTitle>
          <CardDescription className="text-center">
            {t('join.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {joinResult.status === 'error' && (
            <p className="text-sm text-destructive">{t('join.error')}</p>
          )}
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full h-12"
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('join.joining')}
              </>
            ) : (
              t('join.button')
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowDeclineConfirm(true)}
          >
            {t('join.cancel')}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeclineConfirm} onOpenChange={setShowDeclineConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('join.declineConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('join.declineConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('join.declineCancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/teams')}>
              {t('join.declineConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
