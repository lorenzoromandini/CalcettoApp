"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Users, ChevronRight, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Team } from "@/lib/db/schema";

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
  memberCount?: number;
  userRole?: 'admin' | 'co-admin' | 'member';
}

export function TeamCard({ team, onClick, memberCount, userRole }: TeamCardProps) {
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
      className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98] overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Team Image or Initials */}
          <div className="relative w-24 h-24 shrink-0 bg-muted">
            {team.image_url ? (
              <img
                src={team.image_url}
                alt={team.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-3xl font-bold text-primary/40">
                  {team.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">{team.name}</h3>
                
                {team.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {team.description}
                  </p>
                )}
              </div>
              
              {userRole && userRole !== 'member' && (
                <Shield className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            
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

          <div className="flex items-center pr-4">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
