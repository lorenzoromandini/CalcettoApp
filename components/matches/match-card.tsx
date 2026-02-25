"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Match } from "@/types/database";
import { MatchMode, MatchStatus } from "@prisma/client";

interface MatchCardProps {
  match: Match;
  clubId: string;
  onClick?: () => void;
}

export function MatchCard({ match, clubId, onClick }: MatchCardProps) {
  const t = useTranslations("matches");

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.SCHEDULED:
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            {t("status.scheduled")}
          </Badge>
        );
      case MatchStatus.IN_PROGRESS:
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            {t("status.inProgress")}
          </Badge>
        );
      case MatchStatus.FINISHED:
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            {t("status.finished")}
          </Badge>
        );
      case MatchStatus.COMPLETED:
        return (
          <Badge variant="secondary">
            {t("status.completed")}
          </Badge>
        );
      case MatchStatus.CANCELLED:
        return (
          <Badge variant="destructive">
            {t("status.cancelled")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getModeLabel = (mode: MatchMode) => {
    switch (mode) {
      case MatchMode.FIVE_V_FIVE:
        return t("mode.5vs5");
      case MatchMode.EIGHT_V_EIGHT:
        return t("mode.8vs8");
      case MatchMode.ELEVEN_V_ELEVEN:
        return t("mode.11vs11");
      default:
        return mode;
    }
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
              {new Date(match.scheduledAt).toLocaleDateString('it-IT', { month: 'short' })}
            </span>
            <span className="text-lg font-bold">
              {new Date(match.scheduledAt).getDate()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Date & Time */}
            <p className="text-sm text-muted-foreground">
              {formatDateFull(match.scheduledAt)}
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

          <div className="flex flex-col items-end gap-2">
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
