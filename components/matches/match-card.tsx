"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/db/schema";

interface MatchCardProps {
  match: Match;
  teamId: string;
  onClick?: () => void;
}

export function MatchCard({ match, teamId, onClick }: MatchCardProps) {
  const t = useTranslations("matches");
  const common = useTranslations("common");

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98] min-h-[72px]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Date Box */}
          <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-primary/10 text-primary">
            <span className="text-xs font-medium uppercase">
              {new Date(match.scheduled_at).toLocaleDateString('it-IT', { month: 'short' })}
            </span>
            <span className="text-lg font-bold">
              {new Date(match.scheduled_at).getDate()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Date & Time */}
            <p className="text-sm text-muted-foreground">
              {formatDateFull(match.scheduled_at)}
            </p>
            
            {/* Location */}
            {match.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{match.location}</span>
              </p>
            )}
            
            {/* Badges */}
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(match.status)}
              <Badge variant="outline" className="text-xs">
                {getModeLabel(match.mode)}
              </Badge>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
        </div>
      </CardContent>
    </Card>
  );
}
