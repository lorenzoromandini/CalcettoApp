"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { ArrowLeft, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchForm } from "@/components/matches/match-form";
import { useCreateMatch } from "@/hooks/use-matches";
import { useClub } from "@/hooks/use-clubs";
import { useNotifications } from "@/hooks/use-notifications";
import { authFetch } from "@/lib/auth-fetch";
import type { CreateMatchInput } from "@/lib/validations/match";
import { useState, useEffect } from "react";

interface CreateMatchPageClientProps {
  locale: string;
  clubId: string;
}

export function CreateMatchPageClient({ locale, clubId }: CreateMatchPageClientProps) {
  const t = useTranslations("matches");
  const router = useRouter();
  const { data: session } = useSession();
  const { createMatch, isPending } = useCreateMatch();
  const { club } = useClub(clubId);
  const [isOwner, setIsOwner] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isFirstMatch, setIsFirstMatch] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [createdMatchId, setCreatedMatchId] = useState<string | null>(null);
  
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    isLoading: isNotificationLoading 
  } = useNotifications();

  // Hide club ID from URL, show only section path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({ clubId }, '', `/clubs/matches`);
    }
  }, [clubId, locale]);

  useEffect(() => {
    async function checkAdmin() {
      if (session?.user?.id) {
        try {
          const res = await authFetch(`/api/clubs/${clubId}/admin`);
          if (res.ok) {
            const data = await res.json();
            setIsOwner(data.isOwner || data.isManager);
          }
        } catch (err) {
          console.error("Failed to check admin:", err);
        }
      }
      setIsCheckingAdmin(false);
    }
    checkAdmin();
  }, [clubId, session?.user?.id]);

  // Check if this is the user's first match
  useEffect(() => {
    async function checkFirstMatch() {
      if (session?.user?.id && isSupported && permission === 'default') {
        try {
          // Get user's clubs
          const clubsRes = await authFetch("/api/clubs");
          if (!clubsRes.ok) return;
          
          const clubs = await clubsRes.json();
          let totalMatches = 0;
          
          // Count matches in each club
          for (const club of clubs) {
            const matchesRes = await authFetch(`/api/clubs/${club.id}/matches`);
            if (matchesRes.ok) {
              const matches = await matchesRes.json();
              totalMatches += matches.length;
            }
          }
          
          // If no matches exist yet, this will be the first
          setIsFirstMatch(totalMatches === 0);
        } catch (err) {
          console.error("Failed to check first match:", err);
        }
      }
    }
    checkFirstMatch();
  }, [session?.user?.id, isSupported, permission]);

  // Redirect if not admin
  useEffect(() => {
    if (!isCheckingAdmin && !isOwner) {
      router.push(`/clubs/${clubId}/matches`);
    }
  }, [isCheckingAdmin, isOwner, router, locale, clubId]);

  const handleBack = () => {
    router.push(`/dashboard`);
  };

  const handleSubmit = async (data: CreateMatchInput) => {
    const matchId = await createMatch(data, clubId);
    setCreatedMatchId(matchId);
    
    // Show notification request if this is first match and permission not yet decided
    if (isFirstMatch && isSupported && permission === 'default') {
      setShowNotificationModal(true);
    } else {
      // Navigate directly if not showing modal
      router.push(`/clubs/${clubId}/matches/${matchId}`);
    }
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
    setShowNotificationModal(false);
    if (createdMatchId) {
      router.push(`/${locale}/clubs/${clubId}/matches/${createdMatchId}`);
    }
  };

  const handleSkipNotifications = () => {
    setShowNotificationModal(false);
    if (createdMatchId) {
      router.push(`/${locale}/clubs/${clubId}/matches/${createdMatchId}`);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return null; // Will redirect
  }

  return (
    <>
      <div className={`container mx-auto px-4 py-6 max-w-2xl ${showNotificationModal ? 'opacity-50 pointer-events-none' : ''}`}>
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Dashboard
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{t("create")}</CardTitle>
            {club && (
              <p className="text-base text-muted-foreground">{club.name}</p>
            )}
          </CardHeader>
          <CardContent>
            <MatchForm
              clubId={clubId}
              onSubmit={handleSubmit}
              isLoading={isPending}
              submitLabel={t("form.submit")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Notification Permission Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t('notificationModal.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                {t('notificationModal.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleEnableNotifications}
                  disabled={isNotificationLoading}
                  className="flex-1"
                >
                  {isNotificationLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t('notificationModal.enable')
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSkipNotifications}
                  className="flex-1"
                >
                  {t('notificationModal.skip')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
