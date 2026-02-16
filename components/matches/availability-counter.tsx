/**
 * Availability Counter Component
<<<<<<< HEAD
 * Shows confirmed players count with progress bar
 */

'use client';

import { Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { RSVPCounts } from '@/hooks/use-rsvps';
import type { MatchMode } from '@/lib/db/schema';
=======
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
>>>>>>> origin/main

interface AvailabilityCounterProps {
  counts: RSVPCounts;
  mode: MatchMode;
<<<<<<< HEAD
  className?: string;
}

const PLAYERS_NEEDED: Record<MatchMode, number> = {
  '5vs5': 10,
  '8vs8': 16
};

export function AvailabilityCounter({ counts, mode, className }: AvailabilityCounterProps) {
  const needed = PLAYERS_NEEDED[mode] || 10;
  const confirmed = counts.in;
  const percentage = Math.min((confirmed / needed) * 100, 100);
  
  // Determine status color
  let statusColor = 'text-red-600';
  let progressColor = 'bg-red-600';
  let statusText = 'Bassa partecipazione';
  
  if (confirmed >= needed) {
    statusColor = 'text-green-600';
    progressColor = 'bg-green-600';
    statusText = 'Squadra completa!';
  } else if (confirmed >= needed / 2) {
    statusColor = 'text-yellow-600';
    progressColor = 'bg-yellow-600';
    statusText = 'In corso...';
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center justify-center w-12 h-12 rounded-full bg-muted', statusColor)}>
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{confirmed}</span>
              <span className="text-muted-foreground">/ {needed}</span>
            </div>
            <p className="text-sm text-muted-foreground">giocatori confermati</p>
          </div>
        </div>
        <div className={cn('text-sm font-medium', statusColor)}>
          {statusText}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress 
          value={percentage} 
          className="h-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>{Math.round(percentage)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-600" />
          <span className="text-muted-foreground">
            <strong className="text-foreground">{counts.in}</strong> ci sono
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">
            <strong className="text-foreground">{counts.maybe}</strong> forse
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span className="text-muted-foreground">
            <strong className="text-foreground">{counts.out}</strong> non possono
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Mini Availability Counter for cards
 */
interface MiniAvailabilityCounterProps {
  in: number;
  needed: number;
  showIcon?: boolean;
  className?: string;
}

export function MiniAvailabilityCounter({ 
  in: confirmed, 
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
=======
  isLoading?: boolean;
}

export function AvailabilityCounter({
  counts,
  mode,
  isLoading = false,
}: AvailabilityCounterProps) {
  const t = useTranslations("matches");

  // Calculate needed players based on mode
  const neededPlayers = mode === "5vs5" ? 10 : 16;
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
>>>>>>> origin/main
  );
}
