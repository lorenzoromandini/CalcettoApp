"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, FileText, Edit, X, RotateCcw, Users, LayoutGrid, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMatch, useCancelMatch } from "@/hooks/use-matches";
import { useTeam } from "@/hooks/use-teams";
import { usePlayers } from "@/hooks/use-players";
import { useRSVPData, useUpdateRSVP } from "@/hooks/use-rsvps";
import { RSVPButton } from "@/components/matches/rsvp-button";
import { RSVPList } from "@/components/matches/rsvp-list";
import { AvailabilityCounter } from "@/components/matches/availability-counter";
import { isTeamAdmin } from "@/lib/db/teams";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Match, RSVPStatus } from "@/lib/db/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MatchDetailPageClientProps {
  locale: string;
  teamId: string;
  matchId: string;
}

export function MatchDetailPageClient({
  locale,
  teamId,
  matchId,
}: MatchDetailPageClientProps) {
  const t = useTranslations("matches");
  const router = useRouter();
  const { match, isLoading: isMatchLoading, error, refetch } = useMatch(matchId);
  const { team } = useTeam(teamId);
  const { players: teamPlayers } = usePlayers(teamId);
  const { cancelMatch, uncancelMatch, isPending: isActionPending } = useCancelMatch();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get RSVP data
  const {
    rsvps,
    counts,
    myRSVP,
    isLoading: isRSVPLoading,
    refetch: refetchRSVPs,
  } = useRSVPData(matchId, currentPlayerId);

  // RSVP mutation
  const { updateRSVP, isPending: isRSVPPending } = useUpdateRSVP(matchId, () => {
    refetchRSVPs();
  });

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUserId(user.id);
        
        // Check admin status
        const admin = await isTeamAdmin(teamId, user.id);
        setIsAdmin(admin);
        
        // Find current player's ID from team players
        // Player with matching user_id
        const currentPlayer = teamPlayers.find(p => p.user_id === user.id);
        if (currentPlayer) {
          setCurrentPlayerId(currentPlayer.id);
        }
      }
    }
    
    if (teamPlayers.length > 0) {
      loadUserData();
    }
  }, [teamId, teamPlayers]);

  const handleBack = () => {
    router.push(`/${locale}/teams/${teamId}/matches`);
  };

  const handleEdit = () => {
    // Edit functionality to be implemented in future
    console.log("Edit match:", matchId);
  };

  const handleCancel = async () => {
    try {
      await cancelMatch(matchId);
      refetch();
    } catch (err) {
      console.error("Failed to cancel match:", err);
    }
  };

  const handleUncancel = async () => {
    try {
      await uncancelMatch(matchId);
      refetch();
    } catch (err) {
      console.error("Failed to uncancel match:", err);
    }
  };

  const handleRSVPChange = async (status: RSVPStatus) => {
    if (!currentPlayerId) return;
    
    try {
      await updateRSVP(currentPlayerId, status);
    } catch (err) {
      console.error("Failed to update RSVP:", err);
    }
  };

  const getStatusBadge = (status: Match['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            {t("status.scheduled")}
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            {t("status.inProgress")}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary">
            {t("status.completed")}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            {t("status.cancelled")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getModeLabel = (mode: Match['mode']) => {
    switch (mode) {
      case '5vs5':
        return t("mode.5vs5");
      case '8vs8':
        return t("mode.8vs8");
      default:
        return mode;
    }
  };

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'it' ? 'it-IT' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isLoading = isMatchLoading || isRSVPLoading;
  const canShowRSVP = match?.status === 'scheduled' && currentPlayerId;
  const canEdit = isAdmin && match?.status === 'scheduled';
  const canCancel = isAdmin && match?.status === 'scheduled';
  const canUncancel = isAdmin && match?.status === 'cancelled';

  if (isMatchLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-8 w-64 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error?.message || "Match not found"}</p>
            <Button onClick={refetch} variant="outline" className="mt-4">
              {t("retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </Button>

      {/* Match Header Card */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getStatusBadge(match.status)}
                <Badge variant="outline">{getModeLabel(match.mode)}</Badge>
              </div>
              <CardTitle className="text-2xl">
                {formatDateFull(match.scheduled_at)}
              </CardTitle>
              {team && (
                <p className="text-sm text-muted-foreground mt-1">{team.name}</p>
              )}
            </div>
            
            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("detail.edit")}
                  </Button>
                )}
                
                {canCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <X className="mr-2 h-4 w-4" />
                        {t("detail.cancel")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("detail.cancel")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("detail.cancelConfirm")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleCancel}
                          disabled={isActionPending}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isActionPending ? "..." : t("detail.cancel")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {canUncancel && (
                  <Button variant="outline" size="sm" onClick={handleUncancel} disabled={isActionPending}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t("detail.uncancel")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {match.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{match.location}</span>
            </div>
          )}
          
          {match.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{t("form.notes")}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{match.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Availability Counter - Always visible */}
      <div className="mb-6">
        <AvailabilityCounter 
          counts={counts} 
          mode={match.mode} 
          isLoading={isRSVPLoading}
        />
      </div>

      {/* RSVP Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* My RSVP Section */}
        {canShowRSVP && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("detail.sections.rvp")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RSVPButton
                currentStatus={myRSVP}
                onChange={handleRSVPChange}
                disabled={!currentPlayerId}
                isPending={isRSVPPending}
              />
              {!currentPlayerId && (
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Unisciti alla squadra come giocatore per rispondere
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* RSVP List */}
        <div className={canShowRSVP ? "" : "md:col-span-2"}>
          <RSVPList
            rsvps={rsvps}
            currentPlayerId={currentPlayerId}
            isLoading={isRSVPLoading}
          />
        </div>
      </div>

      {/* Formation Section Placeholder */}
      <Card className="mt-6 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            {t("detail.sections.formation")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Formation builder coming in a future phase.
          </p>
        </CardContent>
      </Card>

      {/* Stats Section Placeholder */}
      {match.status === 'completed' && (
        <Card className="mt-6 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("detail.sections.stats")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Match statistics coming in a future phase.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
