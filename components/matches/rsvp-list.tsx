/**
 * RSVP List Component
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
    </div>
  );
}

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
    </div>
  );
}

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
  );
}
