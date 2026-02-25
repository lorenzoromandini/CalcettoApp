/**
 * Availability Counter Component
 * 
 * Displays "Who's coming" with a progress bar and count breakdown.
 * Shows confirmed players vs needed players based on match mode.
 */

"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RSVPCounts } from "@/lib/db/rsvps";
import type { MatchMode } from "@/lib/db/schema";

interface AvailabilityCounterProps {
  counts: RSVPCounts;
  mode: MatchMode;
  isLoading?: boolean;
}

export function AvailabilityCounter({
  counts,
  mode,
  isLoading = false,
}: AvailabilityCounterProps) {
  const t = useTranslations("matches");

  // Calculate needed players based on mode
  const neededPlayers = mode === "FIVE_V_FIVE" ? 10 : 16;
  const confirmedCount = counts.in;
  const fillPercentage = Math.min((confirmedCount / neededPlayers) * 100, 100);

  // Determine status color
  const getStatusColor = () => {
    if (confirmedCount >= neededPlayers) return "bg-green-500";
    if (confirmedCount >= neededPlayers / 2) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Determine text color
  const getTextColor = () => {
    if (confirmedCount >= neededPlayers) return "text-green-600";
    if (confirmedCount >= neededPlayers / 2) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("availability.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-center gap-2 py-4">
            <div className="h-12 w-16 bg-muted rounded animate-pulse" />
            <span className="text-muted-foreground">/</span>
            <div className="h-8 w-12 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 mx-auto bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("availability.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Counter */}
        <div className="text-center py-2">
          <div className="flex items-baseline justify-center gap-2">
            <span className={cn("text-5xl font-bold", getTextColor())}>
              {confirmedCount}
            </span>
            <span className="text-2xl text-muted-foreground">/</span>
            <span className="text-3xl text-muted-foreground">
              {neededPlayers}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("availability.confirmed")}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500", getStatusColor())}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {fillPercentage.toFixed(0)}% {t("availability.full")}
          </p>
        </div>

        {/* Breakdown */}
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span>
              {counts.in} {t("availability.in")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>
              {counts.maybe} {t("availability.maybe")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>
              {counts.out} {t("availability.out")}
            </span>
          </div>
        </div>

        {/* Status Message */}
        {confirmedCount >= neededPlayers && (
          <p className="text-center text-sm font-medium text-green-600">
            {t("availability.complete")}
          </p>
        )}
        {confirmedCount < neededPlayers && confirmedCount >= neededPlayers / 2 && (
          <p className="text-center text-sm font-medium text-yellow-600">
            {t("availability.halfway")}
          </p>
        )}
        {confirmedCount < neededPlayers / 2 && (
          <p className="text-center text-sm font-medium text-red-600">
            {t("availability.needMore")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Mini Availability Counter for cards
 * Shows compact RSVP count for list items
 */
interface MiniAvailabilityCounterProps {
  confirmed: number;
  needed: number;
  showIcon?: boolean;
  className?: string;
}

export function MiniAvailabilityCounter({ 
  confirmed, 
  needed, 
  showIcon = true,
  className 
}: MiniAvailabilityCounterProps) {
  const isComplete = confirmed >= needed;
  const isPartial = confirmed >= needed / 2;
  
  const colorClass = isComplete 
    ? 'text-green-600' 
    : isPartial 
    ? 'text-yellow-600' 
    : 'text-red-600';

  return (
    <div className={cn('flex items-center gap-1.5 text-sm', colorClass, className)}>
      {showIcon && <Users className="h-4 w-4" />}
      <span className="font-medium">{confirmed}</span>
      <span className="text-muted-foreground">/ {needed}</span>
    </div>
  );
}
