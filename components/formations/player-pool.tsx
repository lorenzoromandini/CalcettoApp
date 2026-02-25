'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Check, Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ClubMember {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    nickname: string | null;
    image: string | null;
  } | null;
  jerseyNumber: number;
  primaryRole: string;
}

interface PlayerPoolProps {
  members: ClubMember[];
  selectedMemberId: string | null;
  assignedMemberIds: string[];
  onSelectMember: (memberId: string) => void;
}

function DraggableMember({
  member,
  isSelected,
  isAssigned,
  onSelect,
}: {
  member: ClubMember;
  isSelected: boolean;
  isAssigned: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `member-${member.id}`,
    data: { type: 'member', memberId: member.id },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Get display name
  const displayName = member.user?.nickname || 
    `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.trim() || 
    'Unknown';
  
  // Get initials for avatar fallback
  const initials = displayName
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
        isAssigned && 'opacity-60'
      )}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0 text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={member.user?.image || undefined} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('font-medium truncate', isAssigned && 'line-through')}>
            {displayName}
          </p>
          {isAssigned && <Check className="h-4 w-4 text-green-500 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Shirt className="h-3 w-3" />
            {member.jerseyNumber}
          </Badge>
          <span className="text-xs text-muted-foreground">{member.primaryRole}</span>
        </div>
      </div>
    </div>
  );
}

export function PlayerPool({
  members,
  selectedMemberId,
  assignedMemberIds,
  onSelectMember,
}: PlayerPoolProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Giocatori Disponibili ({members.length})
      </h3>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nessun giocatore disponibile</p>
            <p className="text-xs mt-1">Aggiungi membri alla squadra</p>
          </div>
        ) : (
          members.map((member) => (
            <DraggableMember
              key={member.id}
              member={member}
              isSelected={selectedMemberId === member.id}
              isAssigned={assignedMemberIds.includes(member.id)}
              onSelect={() => onSelectMember(member.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
