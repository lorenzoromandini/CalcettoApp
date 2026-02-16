/**
 * Availability Counter Component
 * Shows confirmed players count with progress bar
 */

'use client';

import { Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { RSVPCounts } from '@/hooks/use-rsvps';
import type { MatchMode } from '@/lib/db/schema';

interface AvailabilityCounterProps {
  counts: RSVPCounts;
  mode: MatchMode;
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
  );
}
