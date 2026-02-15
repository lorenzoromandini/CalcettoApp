"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Team } from "@/lib/db/schema";

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
  memberCount?: number;
}

export function TeamCard({ team, onClick, memberCount }: TeamCardProps) {
  const t = useTranslations("teams");

  const getTeamModeLabel = (mode: string) => {
    switch (mode) {
      case "5-a-side":
        return t("teamMode.5a-side");
      case "8-a-side":
        return t("teamMode.8a-side");
      case "11-a-side":
        return t("teamMode.11a-side");
      default:
        return mode;
    }
  };

  const getTeamModeIcon = (mode: string) => {
    switch (mode) {
      case "5-a-side":
        return "5";
      case "8-a-side":
        return "8";
      case "11-a-side":
        return "11";
      default:
        return "?";
    }
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {getTeamModeIcon(team.team_mode)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{team.name}</h3>
            
            {team.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {team.description}
              </p>
            )}
            
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {memberCount ?? 0}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                {getTeamModeLabel(team.team_mode)}
              </span>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
        </div>
      </CardContent>
    </Card>
  );
}
