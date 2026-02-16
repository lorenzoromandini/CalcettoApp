'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getInviteByToken, redeemInvite } from '@/lib/db/invites';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type InviteState = 'loading' | 'valid' | 'invalid' | 'expired' | 'maxed';

export default function InvitePage() {
  const t = useTranslations('invites');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [inviteState, setInviteState] = useState<InviteState>('loading');
  const [teamName, setTeamName] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinResult, setJoinResult] = useState<'success' | 'already_member' | 'error' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    checkAuthAndInvite();
  }, [token, session?.user?.id]);

  async function checkAuthAndInvite() {
    setIsAuthenticated(!!session?.user);

    if (!token) {
      setInviteState('invalid');
      return;
    }

    const invite = await getInviteByToken(token);
    if (!invite) {
      setInviteState('invalid');
      return;
    }

    // Get team name
    const teamName = invite.team?.name || t('unknownTeam');

    setTeamName(teamName);
    setInviteState('valid');
  }

  const handleJoin = async () => {
    if (!token) return;

    if (!session?.user?.id) {
      // Should not happen due to auth check, but handle gracefully
      setJoinResult('error');
      return;
    }

    setIsJoining(true);
    const result = await redeemInvite(token, session.user.id);
    setIsJoining(false);

    if (result) {
      setJoinResult('success');
      // Redirect to team page after delay
      setTimeout(() => {
        router.push(`/teams`);
      }, 2000);
    } else {
      setJoinResult('error');
    }
  };

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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('join.title', { teamName })}
            </CardTitle>
            <CardDescription>{t('join.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('join.loginRequired')}</p>
            <Link href={`/auth/login?redirect=/teams/invite?token=${token}`}>
              <Button className="w-full h-12">{t('join.loginButton')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joinResult === 'success') {
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

  if (joinResult === 'already_member') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <CardTitle className="mb-2">{t('alreadyMember.title')}</CardTitle>
            <CardDescription>{t('alreadyMember.description', { teamName })}</CardDescription>
            <Link href={`/teams`} className="mt-6 block">
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('join.title', { teamName })}
          </CardTitle>
          <CardDescription>{t('join.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {joinResult === 'error' && (
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
          <Link href="/teams">
            <Button variant="ghost" className="w-full">
              {t('join.cancel')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
