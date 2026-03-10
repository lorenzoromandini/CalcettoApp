'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { FormationMode, Position, positionToStyle, getRoleColor } from '@/lib/formations';
import type { ClubMember } from '@/types/database';
import { PlayerCard } from '@/components/players/fut-player-card';

interface PitchMember {
  id: string;
  name: string;
  avatar?: string;
  jerseyNumber?: number;
  primaryRole?: string;
  secondaryRoles?: string[];
  firstName?: string;
  lastName?: string;
  nickname?: string | null;
  image?: string | null;
  clubImage?: string | null;
}

interface PositionWithMember {
  x: number;
  y: number;
  label: string;
  clubMemberId?: string;
  isGuest?: boolean;
}

interface PitchGridProps {
  mode: FormationMode;
  positions: PositionWithMember[];
  members: PitchMember[];
  selectedMemberId: string | null;
  onDrop: (positionIndex: number, memberId: string) => void;
  onTapPosition: (positionIndex: number) => void;
  clubId: string;
}

function PositionMarker({
  position,
  index,
  member,
  isSelected,
  isHighlighted,
  onTap,
  clubId,
  isGuest,
}: {
  position: PositionWithMember;
  index: number;
  member?: PitchMember;
  isSelected: boolean;
  isHighlighted: boolean;
  onTap: () => void;
  clubId: string;
  isGuest?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `position-${index}`,
    data: { type: 'position', index },
  });

  const style = positionToStyle(position.x, position.y);

  // Se è un ospite, mostra la stessa card dei membri con nome "OSPITE"
  if (isGuest) {
    const guestMemberData: ClubMember = {
      id: 'guest',
      clubId: clubId,
      userId: 'guest',
      privileges: 'MEMBER',
      joinedAt: new Date().toISOString(),
      primaryRole: 'CEN',
      secondaryRoles: [],
      jerseyNumber: 0,
      symbol: null,
      user: {
        firstName: 'OSPITE',
        lastName: '',
        nickname: null,
        image: null,
      },
      club: {
        image: null,
      },
    } as ClubMember;

    return (
      <div
        ref={setNodeRef}
        className={cn(
          'absolute transform -translate-x-1/2 -translate-y-1/2',
          'cursor-pointer touch-manipulation',
          'transition-all duration-200',
          'w-16 sm:w-20 md:w-24',
          isOver && 'scale-105',
          isHighlighted && 'ring-4 ring-primary ring-opacity-50'
        )}
        style={style}
        onClick={onTap}
      >
        <PlayerCard
          member={guestMemberData}
          clubId={clubId}
          isGuest={true}
          className={cn(
            isOver && 'ring-2 ring-primary'
          )}
        />
      </div>
    );
  }

  // Se c'è un membro assegnato, mostra la card
  if (member) {
    const memberData: ClubMember = {
      id: member.id,
      clubId: clubId,
      userId: member.id,
      privileges: 'MEMBER',
      joinedAt: new Date().toISOString(),
      primaryRole: (member.primaryRole as any) || 'CEN',
      secondaryRoles: (member.secondaryRoles as any[]) || [],
      jerseyNumber: member.jerseyNumber || 0,
      symbol: null,
      user: {
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        nickname: member.nickname || null,
        image: member.image || null,
      },
      club: {
        image: member.clubImage || null,
      },
    } as ClubMember;

    return (
      <div
        ref={setNodeRef}
        className={cn(
          'absolute transform -translate-x-1/2 -translate-y-1/2',
          'cursor-pointer touch-manipulation',
          'transition-all duration-200',
          'w-16 sm:w-20 md:w-24',
          isOver && 'scale-105',
          isHighlighted && 'ring-4 ring-primary ring-opacity-50'
        )}
        style={style}
        onClick={onTap}
      >
        <PlayerCard
          member={memberData}
          clubId={clubId}
          className={cn(
            isOver && 'ring-2 ring-primary'
          )}
        />
      </div>
    );
  }

  // Se non c'è membro, mostra il pallino vuoto
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
          'bg-background/80 text-muted-foreground border-dashed',
          isOver && 'bg-primary/20 border-primary',
          isSelected && 'ring-2 ring-primary'
        )}
      >
        <span className="text-xs font-medium">{position.label}</span>
      </div>
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
  clubId,
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
          clubId={clubId}
          isGuest={position.isGuest}
        />
      ))}
    </div>
  );
}
