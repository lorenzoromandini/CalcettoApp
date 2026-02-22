"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Users, ChevronRight, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Club } from "@/lib/db/schema";

interface ClubCardProps {
  club: Club;
  onClick?: () => void;
  memberCount?: number;
  userRole?: 'admin' | 'co-admin' | 'member';
  isDefault?: boolean;
}

export function ClubCard({ club, onClick, memberCount, userRole, isDefault }: ClubCardProps) {
  const t = useTranslations("clubs");

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98] overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Team Image or Initials */}
          <div className="relative w-24 h-24 shrink-0 bg-muted">
            {club.image_url ? (
              <img
                src={club.image_url}
                alt={club.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-3xl font-bold text-primary/40">
                  {club.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">{club.name}</h3>
                
                {club.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {club.description}
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
                {memberCount ?? 0} {t("members")}
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
