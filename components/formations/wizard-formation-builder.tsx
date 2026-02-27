'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { ArrowLeft, ArrowRight, Users, LayoutGrid } from 'lucide-react';
import { FormationSelector } from './formation-selector';
import { PitchGrid } from './pitch-grid';
import { PlayerPool } from './player-pool';
import { PlayerSelectionModal } from './player-selection-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormationMode, getFormationPreset } from '@/lib/formations';
import type { FormationData, FormationPosition } from '@/lib/db/formations';
import type { ClubMemberWithRolePriority } from '@/types/formations';
import { cn } from '@/lib/utils';

interface FormationMember {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  image: string | null;
  jerseyNumber: number;
  primaryRole: string;
  secondaryRoles: string[];
}

interface WizardFormationBuilderProps {
  clubId: string;
  matchId: string;
  mode: FormationMode;
  members: FormationMember[];
  isHome: boolean;
  initialFormation?: FormationData | null;
  onChange: (formation: FormationData) => void;
  onComplete: () => void;
  onBack: () => void;
}

// Convert members to ClubMemberWithRolePriority format for PlayerSelectionModal
function convertToPriorityMembers(
  members: FormationMember[],
  targetRole?: string
): ClubMemberWithRolePriority[] {
  return members.map((member) => {
    const isPrimary = member.primaryRole === targetRole;
    const isSecondary = member.secondaryRoles.includes(targetRole || '');
    const rolePriority = isPrimary ? 0 : isSecondary ? 1 : 2;

    return {
      id: member.id,
      userId: member.id, // Using member id as userId
      firstName: member.firstName,
      lastName: member.lastName,
      nickname: member.nickname || undefined,
      jerseyNumber: member.jerseyNumber,
      primaryRole: member.primaryRole as any,
      secondaryRoles: member.secondaryRoles as any[],
      rolePriority,
      isAssigned: false,
      isAssignedToOtherTeam: false,
    };
  });
}

// Create initial formation data from preset
function createEmptyFormation(presetId: string, mode: FormationMode, isHome: boolean): FormationData {
  const preset = getFormationPreset(mode, presetId);
  if (!preset) {
    return {
      formation: presetId,
      positions: [],
      isHome,
    };
  }

  return {
    formation: presetId,
    positions: preset.positions.map((pos) => ({
      x: pos.x,
      y: pos.y,
      label: pos.label,
      clubMemberId: undefined,
    })),
    isHome,
  };
}

export function WizardFormationBuilder({
  clubId,
  matchId,
  mode,
  members,
  isHome,
  initialFormation,
  onChange,
  onComplete,
  onBack,
}: WizardFormationBuilderProps) {
  const t = useTranslations('formations');

  // State
  const [selectedFormation, setSelectedFormation] = useState<string>(
    initialFormation?.formation || (mode === 'FIVE_V_FIVE' ? '5-1-2-1' : '8-3-3-1')
  );
  const [positions, setPositions] = useState<FormationPosition[]>(
    initialFormation?.positions || []
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number | null>(null);

  // Initialize positions if empty
  if (positions.length === 0) {
    const initialData = createEmptyFormation(selectedFormation, mode, isHome);
    setPositions(initialData.positions);
  }

  // Sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Get assigned member IDs
  const assignedMemberIds = useMemo(() => {
    return positions
      .map((p) => p.clubMemberId)
      .filter((id): id is string => !!id);
  }, [positions]);

  // Check if at least one player is assigned
  const hasPlayersAssigned = assignedMemberIds.length > 0;

  // Notify parent of changes
  const notifyChange = useCallback((newPositions: FormationPosition[], formationId: string) => {
    const data: FormationData = {
      formation: formationId,
      positions: newPositions,
      isHome,
    };
    onChange(data);
  }, [isHome, onChange]);

  // Handle formation preset change
  const handleFormationChange = useCallback(
    (presetId: string) => {
      setSelectedFormation(presetId);
      const preset = getFormationPreset(mode, presetId);
      if (preset) {
        // Preserve existing assignments where positions match
        const newPositions = preset.positions.map((pos) => {
          const existingPos = positions.find(
            (p) => p.x === pos.x && p.y === pos.y && p.label === pos.label
          );
          return {
            x: pos.x,
            y: pos.y,
            label: pos.label,
            clubMemberId: existingPos?.clubMemberId,
          };
        });
        setPositions(newPositions);
        notifyChange(newPositions, presetId);
      }
    },
    [mode, positions, notifyChange]
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle member drop on position
      if (activeId.startsWith('member-') && overId.startsWith('position-')) {
        const memberId = activeId.replace('member-', '');
        const positionIndex = parseInt(overId.replace('position-', ''));
        
        setPositions((prev) => {
          // Remove member from any existing position first
          const newPositions = prev.map((pos) =>
            pos.clubMemberId === memberId ? { ...pos, clubMemberId: undefined } : pos
          );
          // Assign to new position
          if (newPositions[positionIndex]) {
            newPositions[positionIndex] = {
              ...newPositions[positionIndex],
              clubMemberId: memberId,
            };
          }
          notifyChange(newPositions, selectedFormation);
          return newPositions;
        });
        setSelectedMemberId(null);
      }
    },
    [notifyChange, selectedFormation]
  );

  // Handle tap on position (open modal)
  const handleTapPosition = useCallback(
    (positionIndex: number) => {
      setSelectedPositionIndex(positionIndex);
      setIsModalOpen(true);
    },
    []
  );

  // Handle player selection from modal
  const handlePlayerSelect = useCallback(
    (memberId: string) => {
      if (selectedPositionIndex === null) return;

      setPositions((prev) => {
        // Remove from any existing position
        const newPositions = prev.map((pos) =>
          pos.clubMemberId === memberId
            ? { ...pos, clubMemberId: undefined }
            : pos
        );
        // Assign to selected position
        if (newPositions[selectedPositionIndex]) {
          newPositions[selectedPositionIndex] = {
            ...newPositions[selectedPositionIndex],
            clubMemberId: memberId,
          };
        }
        notifyChange(newPositions, selectedFormation);
        return newPositions;
      });
      setIsModalOpen(false);
      setSelectedPositionIndex(null);
    },
    [selectedPositionIndex, notifyChange, selectedFormation]
  );

  // Handle player removal from modal
  const handlePlayerRemove = useCallback(() => {
    if (selectedPositionIndex === null) return;

    setPositions((prev) => {
      const newPositions = [...prev];
      if (newPositions[selectedPositionIndex]) {
        newPositions[selectedPositionIndex] = {
          ...newPositions[selectedPositionIndex],
          clubMemberId: undefined,
        };
      }
      notifyChange(newPositions, selectedFormation);
      return newPositions;
    });
    setIsModalOpen(false);
    setSelectedPositionIndex(null);
  }, [selectedPositionIndex, notifyChange, selectedFormation]);

  // Get current player ID for modal
  const currentSelectedPlayerId = selectedPositionIndex !== null
    ? positions[selectedPositionIndex]?.clubMemberId || null
    : null;

  // Get target role for selected position
  const targetRole = selectedPositionIndex !== null
    ? positions[selectedPositionIndex]?.label
    : undefined;

  // Convert members for modal
  const priorityMembers = useMemo(() => {
    return convertToPriorityMembers(members, targetRole);
  }, [members, targetRole]);

  // Get active drag member
  const activeDragMember = activeDragId?.startsWith('member-')
    ? members.find((m) => m.id === activeDragId.replace('member-', ''))
    : null;

  // Convert members for PlayerPool (needs different format)
  const poolMembers = useMemo(() => {
    return members.map((m) => ({
      id: m.id,
      user: {
        firstName: m.firstName,
        lastName: m.lastName,
        nickname: m.nickname,
        image: m.image,
      },
      jerseyNumber: m.jerseyNumber,
      primaryRole: m.primaryRole,
    }));
  }, [members]);

  // Convert members for PitchGrid
  const pitchMembers = useMemo(() => {
    return members.map((m) => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`.trim(),
      avatar: m.image || undefined,
    }));
  }, [members]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LayoutGrid className="h-6 w-6" />
              {isHome ? 'Formazione Casa' : 'Formazione Trasferta'}
            </h2>
            <p className="text-muted-foreground mt-1">
              Seleziona il modulo e assegna i giocatori
            </p>
          </div>
        </div>

        {/* Formation Selector */}
        <FormationSelector
          mode={mode}
          currentFormation={selectedFormation}
          onChange={handleFormationChange}
          disabled={false}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pitch Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <PitchGrid
                  mode={mode}
                  positions={positions}
                  members={pitchMembers}
                  selectedMemberId={selectedMemberId}
                  onDrop={() => {}} // Handled by DndContext
                  onTapPosition={handleTapPosition}
                />
              </CardContent>
            </Card>
            
            {/* Helper text */}
            <p className="text-sm text-muted-foreground text-center mt-2">
              Clicca su una posizione per assegnare un giocatore
            </p>
          </div>

          {/* Player Pool */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Giocatori Disponibili
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerPool
                  members={poolMembers}
                  selectedMemberId={selectedMemberId}
                  assignedMemberIds={assignedMemberIds}
                  onSelectMember={setSelectedMemberId}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {assignedMemberIds.length} di {positions.length} giocatori assegnati
              </span>
              <span className={cn(
                'font-medium',
                assignedMemberIds.length === positions.length && positions.length > 0
                  ? 'text-green-600'
                  : 'text-amber-600'
              )}>
                {assignedMemberIds.length === positions.length && positions.length > 0
                  ? 'Formazione completa'
                  : 'Formazione incompleta'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-11"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <Button
            onClick={onComplete}
            disabled={!hasPlayersAssigned}
            className="h-11"
          >
            Avanti
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Player Selection Modal */}
        <PlayerSelectionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPositionIndex(null);
          }}
          members={priorityMembers}
          targetRole={targetRole as any}
          selectedPlayerId={currentSelectedPlayerId}
          excludeIds={assignedMemberIds.filter(id => id !== currentSelectedPlayerId)}
          onSelect={handlePlayerSelect}
          onRemove={handlePlayerRemove}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragMember ? (
            <div className="bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold">
                {activeDragMember.firstName.charAt(0)}{activeDragMember.lastName.charAt(0)}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
