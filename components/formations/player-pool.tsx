'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  rsvp: 'in' | 'out' | 'maybe';
}

interface PlayerPoolProps {
  players: Player[];
  selectedPlayerId: string | null;
  assignedPlayerIds: string[];
  onSelectPlayer: (playerId: string) => void;
}

function DraggablePlayer({
  player,
  isSelected,
  isAssigned,
  onSelect,
}: {
  player: Player;
  isSelected: boolean;
  isAssigned: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
    data: { type: 'player', playerId: player.id },
    disabled: player.rsvp !== 'in',
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Get initials for avatar fallback
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2',
        'transition-all duration-200 cursor-pointer touch-manipulation',
        'min-h-[72px]',
        isDragging && 'opacity-50 scale-105 z-50',
        isSelected && 'border-primary bg-primary/5',
        !isSelected && 'border-transparent bg-muted/50 hover:bg-muted',
        isAssigned && 'opacity-60',
        player.rsvp !== 'in' && 'opacity-40 cursor-not-allowed'
      )}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      {/* Drag Handle */}
      <div
        className={cn(
          'flex-shrink-0 text-muted-foreground',
          player.rsvp !== 'in' && 'opacity-0'
        )}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={player.avatar} alt={player.name} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('font-medium truncate', isAssigned && 'line-through')}>{player.name}</p>
          {isAssigned && <Check className="h-4 w-4 text-green-500 flex-shrink-0" />}
        </div>
        <Badge
          variant={player.rsvp === 'in' ? 'default' : player.rsvp === 'maybe' ? 'secondary' : 'destructive'}
          className="mt-1 text-xs"
        >
          {player.rsvp === 'in' ? 'In' : player.rsvp === 'maybe' ? 'Forse' : 'Out'}
        </Badge>
      </div>
    </div>
  );
}

export function PlayerPool({
  players,
  selectedPlayerId,
  assignedPlayerIds,
  onSelectPlayer,
}: PlayerPoolProps) {
  // Filter to only show players who are IN (admin can override this)
  const availablePlayers = players.filter((p) => p.rsvp === 'in');

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Giocatori Disponibili ({availablePlayers.length})
      </h3>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {availablePlayers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nessun giocatore disponibile</p>
            <p className="text-xs mt-1">I giocatori devono confermare la presenza</p>
          </div>
        ) : (
          availablePlayers.map((player) => (
            <DraggablePlayer
              key={player.id}
              player={player}
              isSelected={selectedPlayerId === player.id}
              isAssigned={assignedPlayerIds.includes(player.id)}
              onSelect={() => onSelectPlayer(player.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
