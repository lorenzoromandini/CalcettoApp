'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { FormationMode, Position, positionToStyle, getRoleColor } from '@/lib/formations';
import type { ClubMember } from '@/types/database';

interface PitchMember {
  id: string;
  name: string;
  avatar?: string;
}

interface PositionWithMember {
  x: number;
  y: number;
  label: string;
  clubMemberId?: string;
}

interface PitchGridProps {
  mode: FormationMode;
  positions: PositionWithMember[];
  members: PitchMember[];
  selectedMemberId: string | null;
  onDrop: (positionIndex: number, memberId: string) => void;
  onTapPosition: (positionIndex: number) => void;
}

function PositionMarker({
  position,
  index,
  member,
  isSelected,
  isHighlighted,
  onTap,
}: {
  position: PositionWithMember;
  index: number;
  member?: PitchMember;
  isSelected: boolean;
  isHighlighted: boolean;
  onTap: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `position-${index}`,
    data: { type: 'position', index },
  });

  const style = positionToStyle(position.x, position.y);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute transform -translate-x-1/2 -translate-y-1/2',
        'w-14 h-14 sm:w-16 sm:h-16 md:w-14 md:h-14',
        'flex flex-col items-center justify-center',
        'cursor-pointer touch-manipulation',
        'transition-all duration-200',
        isOver && 'scale-110',
        isHighlighted && 'ring-4 ring-primary ring-opacity-50 rounded-full'
      )}
      style={style}
      onClick={onTap}
    >
      {/* Position Circle */}
      <div
        className={cn(
          'w-12 h-12 sm:w-14 sm:h-14 rounded-full',
          'flex items-center justify-center',
          'border-2 border-white shadow-lg',
          'transition-colors duration-200',
          member
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/80 text-muted-foreground border-dashed',
          isOver && 'bg-primary/20 border-primary',
          isSelected && 'ring-2 ring-primary'
        )}
      >
        {member ? (
          <span className="text-xs font-bold text-center px-1 truncate max-w-full">
            {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        ) : (
          <span className="text-xs font-medium">{position.label}</span>
        )}
      </div>

      {/* Member Name Tooltip */}
      {member && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs font-medium text-foreground bg-background/90 px-2 py-0.5 rounded shadow-sm">
            {member.name.split(' ')[0]}
          </span>
        </div>
      )}
    </div>
  );
}

export function PitchGrid({
  mode,
  positions,
  members,
  selectedMemberId,
  onDrop,
  onTapPosition,
}: PitchGridProps) {
  const handleTap = (index: number) => {
    onTapPosition(index);
  };

  // Get member by ID
  const getMember = (memberId?: string) => {
    if (!memberId) return undefined;
    return members.find((m) => m.id === memberId);
  };

  return (
    <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-emerald-600 to-emerald-700 rounded-lg overflow-hidden shadow-inner">
      {/* Field Lines */}
      <div className="absolute inset-2 border-2 border-white/30 rounded">
        {/* Center Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 transform -translate-y-1/2" />
        
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2" />

        {/* Goal Areas (Top) */}
        <div className="absolute top-0 left-1/4 right-1/4 h-12 border-b-2 border-l-2 border-r-2 border-white/30" />
        
        {/* Goal Areas (Bottom) */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-12 border-t-2 border-l-2 border-r-2 border-white/30" />
      </div>

      {/* Corner Arcs */}
      <div className="absolute top-2 left-2 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-full" />
      <div className="absolute top-2 right-2 w-6 h-6 border-l-2 border-b-2 border-white/30 rounded-full" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-r-2 border-t-2 border-white/30 rounded-full" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-full" />

      {/* Position Markers */}
      {positions.map((position, index) => (
        <PositionMarker
          key={index}
          position={position}
          index={index}
          member={getMember(position.clubMemberId)}
          isSelected={false}
          isHighlighted={!!selectedMemberId && !position.clubMemberId}
          onTap={() => handleTap(index)}
        />
      ))}

      {/* Mode Indicator */}
      <div className="absolute top-3 right-3 bg-black/30 text-white text-xs px-2 py-1 rounded-full">
        {mode === 'FIVE_V_FIVE' ? '5 vs 5' : mode === 'EIGHT_V_EIGHT' ? '8 vs 8' : '11 vs 11'}
      </div>
    </div>
  );
}
