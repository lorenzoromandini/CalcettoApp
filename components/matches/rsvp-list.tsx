/**
 * RSVP List Component
<<<<<<< HEAD
 * Shows all players grouped by their RSVP status
 */

'use client';

import { useMemo } from 'react';
import { Check, X, HelpCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { PlayerRSVP, RSVPStatus } from '@/hooks/use-rsvps';

interface RSVPListProps {
  rsvps: PlayerRSVP[];
  currentPlayerId?: string;
  isAdmin?: boolean;
  className?: string;
}

const statusConfig: Record<RSVPStatus, { label: string; color: string; icon: React.ReactNode }> = {
  in: { 
    label: 'Ci sono', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <Check className="h-3 w-3" />
  },
  out: { 
    label: 'Non posso', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <X className="h-3 w-3" />
  },
  maybe: { 
    label: 'Forse', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <HelpCircle className="h-3 w-3" />
  }
};

export function RSVPList({ rsvps, currentPlayerId, isAdmin, className }: RSVPListProps) {
  // Group RSVPs by status
  const grouped = useMemo(() => {
    const groups: Record<RSVPStatus | 'none', PlayerRSVP[]> = {
      in: [],
      maybe: [],
      out: [],
      none: []
    };

    rsvps.forEach(rsvp => {
      groups[rsvp.rsvp_status].push(rsvp);
    });

    return groups;
  }, [rsvps]);

  const sections: { status: RSVPStatus; title: string; emptyText: string }[] = [
    { status: 'in', title: 'Ci sono', emptyText: 'Nessuno confermato' },
    { status: 'maybe', title: 'Forse', emptyText: 'Nessun forse' },
    { status: 'out', title: 'Non possono', emptyText: 'Nessun rifiuto' }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {sections.map(({ status, title, emptyText }) => (
        <div key={status}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              {statusConfig[status].icon}
              {title}
              <Badge variant="secondary" className="ml-1">
                {grouped[status].length}
              </Badge>
            </h4>
          </div>

          {grouped[status].length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">
              {emptyText}
            </p>
          ) : (
            <div className="space-y-2">
              {grouped[status].map((rsvp) => (
                <RSVPCard 
                  key={rsvp.player_id} 
                  rsvp={rsvp} 
                  isCurrentUser={rsvp.player_id === currentPlayerId}
                />
              ))}
            </div>
          )}

          <Separator className="mt-4" />
        </div>
      ))}
=======
 * 
 * Displays all players and their RSVP status, grouped by response.
 * Shows player avatars, names, and status badges.
 */

"use client";

import { useTranslations } from "next-intl";
import { Check, X, HelpCircle, Minus, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MatchRSVP } from "@/lib/db/rsvps";
import type { RSVPStatus } from "@/lib/db/schema";

interface RSVPListProps {
  rsvps: MatchRSVP[];
  currentPlayerId?: string;
  isLoading?: boolean;
}

interface RSVPGroupProps {
  title: string;
  status: RSVPStatus;
  rsvps: MatchRSVP[];
  currentPlayerId?: string;
  icon: React.ReactNode;
  badgeColor: string;
}

function RSVPGroup({
  title,
  status,
  rsvps,
  currentPlayerId,
  icon,
  badgeColor,
}: RSVPGroupProps) {
  const t = useTranslations("matches");

  if (rsvps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
          <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", badgeColor)}>
            {rsvps.length}
          </span>
        </h4>
      </div>
      <div className="space-y-2">
        {rsvps.map((rsvp) => (
          <RSVPCard
            key={rsvp.id}
            rsvp={rsvp}
            isCurrentPlayer={rsvp.player_id === currentPlayerId}
            status={status}
          />
        ))}
      </div>
>>>>>>> origin/main
    </div>
  );
}

<<<<<<< HEAD
/**
 * Individual RSVP Card
 */
interface RSVPCardProps {
  rsvp: PlayerRSVP;
  isCurrentUser?: boolean;
}

function RSVPCard({ rsvp, isCurrentUser }: RSVPCardProps) {
  const config = statusConfig[rsvp.rsvp_status];
  const initials = `${rsvp.player_name.charAt(0)}${rsvp.player_surname?.charAt(0) || ''}`;
  
  // Format relative time
  const rsvpTime = new Date(rsvp.rsvp_at);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - rsvpTime.getTime()) / (1000 * 60 * 60));
  const timeText = diffHours < 1 
    ? 'Poco fa' 
    : diffHours < 24 
    ? `${diffHours}h fa` 
    : rsvpTime.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

  return (
    <div 
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg transition-colors',
        isCurrentUser && 'bg-muted/50 border border-muted'
      )}
    >
      <Avatar className="h-10 w-10">
        {rsvp.player_avatar && (
          <AvatarImage src={rsvp.player_avatar} alt={rsvp.player_name} />
        )}
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          {initials || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {rsvp.player_name} {rsvp.player_surname}
          </p>
          {isCurrentUser && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              Tu
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {timeText}
        </p>
      </div>

      <Badge 
        variant="secondary" 
        className={cn('text-xs flex items-center gap-1', config.color)}
      >
        {config.icon}
        <span className="hidden sm:inline">{config.label}</span>
      </Badge>
=======
interface RSVPCardProps {
  rsvp: MatchRSVP;
  isCurrentPlayer: boolean;
  status: RSVPStatus;
}

function RSVPCard({ rsvp, isCurrentPlayer, status }: RSVPCardProps) {
  const t = useTranslations("matches");

  const getStatusIcon = () => {
    switch (status) {
      case "in":
        return <Check className="h-3 w-3" />;
      case "out":
        return <X className="h-3 w-3" />;
      case "maybe":
        return <HelpCircle className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "in":
        return "bg-green-100 text-green-700 border-green-200";
      case "out":
        return "bg-red-100 text-red-700 border-red-200";
      case "maybe":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("rsvpList.justNow");
    if (diffMins < 60) return t("rsvpList.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("rsvpList.hoursAgo", { count: diffHours });
    if (diffDays < 7) return t("rsvpList.daysAgo", { count: diffDays });
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
        isCurrentPlayer
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border hover:bg-accent/50"
      )}
    >
      {/* Avatar placeholder */}
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        {rsvp.player_avatar ? (
          <img
            src={rsvp.player_avatar}
            alt={rsvp.player_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{rsvp.player_name}</p>
          {isCurrentPlayer && (
            <span className="text-xs px-2 py-0.5 rounded border border-border shrink-0">
              {t("rsvpList.you")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t("rsvpList.responded")} {formatTimeAgo(rsvp.rsvp_at)}
        </p>
      </div>

      <div
        className={cn(
          "shrink-0 flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium",
          getStatusColor()
        )}
      >
        {getStatusIcon()}
        <span className="hidden sm:inline">
          {status === "in" && t("rsvp.in")}
          {status === "out" && t("rsvp.out")}
          {status === "maybe" && t("rsvp.maybe")}
        </span>
      </div>
>>>>>>> origin/main
    </div>
  );
}

<<<<<<< HEAD
/**
 * Skeleton loader for RSVP list
 */
export function RSVPListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-3 p-2">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
=======
export function RSVPList({
  rsvps,
  currentPlayerId,
  isLoading = false,
}: RSVPListProps) {
  const t = useTranslations("matches");

  // Group RSVPs by status
  const inRSVPs = rsvps.filter((r) => r.rsvp_status === "in");
  const maybeRSVPs = rsvps.filter((r) => r.rsvp_status === "maybe");
  const outRSVPs = rsvps.filter((r) => r.rsvp_status === "out");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("rsvpList.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t("rsvpList.title")}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({rsvps.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* IN Group */}
        <RSVPGroup
          title={t("rsvpList.groups.in")}
          status="in"
          rsvps={inRSVPs}
          currentPlayerId={currentPlayerId}
          icon={<Check className="h-4 w-4 text-green-500" />}
          badgeColor="bg-green-100 text-green-700"
        />

        {inRSVPs.length > 0 && (maybeRSVPs.length > 0 || outRSVPs.length > 0) && (
          <div className="h-px bg-border" />
        )}

        {/* MAYBE Group */}
        <RSVPGroup
          title={t("rsvpList.groups.maybe")}
          status="maybe"
          rsvps={maybeRSVPs}
          currentPlayerId={currentPlayerId}
          icon={<HelpCircle className="h-4 w-4 text-yellow-500" />}
          badgeColor="bg-yellow-100 text-yellow-700"
        />

        {maybeRSVPs.length > 0 && outRSVPs.length > 0 && <div className="h-px bg-border" />}

        {/* OUT Group */}
        <RSVPGroup
          title={t("rsvpList.groups.out")}
          status="out"
          rsvps={outRSVPs}
          currentPlayerId={currentPlayerId}
          icon={<X className="h-4 w-4 text-red-500" />}
          badgeColor="bg-red-100 text-red-700"
        />

        {/* Empty State */}
        {rsvps.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("rsvpList.empty.title")}</p>
            <p className="text-sm">{t("rsvpList.empty.description")}</p>
          </div>
        )}
      </CardContent>
    </Card>
>>>>>>> origin/main
  );
}
