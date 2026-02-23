'use client';
'use no memo';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from '@/components/providers/session-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { SetupPlayerForm } from '@/components/clubs/setup-player-form';

type InviteState = 'loading' | 'valid' | 'invalid' | 'expired' | 'maxed';

interface InviteData {
  id: string;
  club: {
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
    clubId?: string;
  }>({ status: null });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSetupForm, setShowSetupForm] = useState(false);
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
          clubId: data.clubId 
        });
        
        if (data.needsSetup) {
          setShowSetupForm(true);
        } else {
          setTimeout(() => {
            router.push(`/clubs/${data.clubId}`);
          }, 2000);
        }
      } else if (data.error === 'Already a member') {
        setJoinResult({ 
          status: 'already_member',
          needsSetup: data.needsSetup,
          clubId: data.clubId
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
    router.push(`/clubs/${joinResult.clubId}`);
  };

  const clubName = inviteData?.club?.name || t('unknownClub');

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
            <Link href="/clubs" className="mt-6 block">
              <Button className="w-full h-12">{t('invalid.backToClubs')}</Button>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('join.title', { clubName })}
            </CardTitle>
            <CardDescription>{t('join.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('join.loginRequired')}</p>
            <Link href={`/auth/login?redirect=/clubs/invite?token=${token}`}>
              <Button className="w-full h-12">{t('join.loginButton')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSetupForm && joinResult.clubId) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <SetupPlayerForm
          clubId={joinResult.clubId}
          clubName={clubName}
          onSuccess={handleSetupComplete}
          onCancel={() => router.push(`/clubs/${joinResult.clubId}`)}
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
            <CardDescription>{t('success.description', { clubName })}</CardDescription>
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
            <CardDescription>{t('alreadyMember.description', { clubName })}</CardDescription>
            <Link href={`/clubs/${joinResult.clubId || ''}`} className="mt-6 block">
              <Button className="w-full h-12">{t('alreadyMember.viewClub')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('join.title', { clubName })}
          </CardTitle>
          <CardDescription>{t('join.description')}</CardDescription>
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
          <Link href="/clubs">
            <Button variant="ghost" className="w-full">
              {t('join.cancel')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
