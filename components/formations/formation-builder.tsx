'use client';

import { useState, useCallback } from 'react';
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
import { Loader2, Save, RotateCcw, LayoutGrid } from 'lucide-react';
import { FormationSelector } from './formation-selector';
import { PitchGrid } from './pitch-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormation } from '@/hooks/use-formation';
import {
  FormationMode,
  getFormationPreset,
  FormationPreset,
} from '@/lib/formations';
import type { FormationData } from '@/lib/db/formations';
import { cn } from '@/lib/utils';

interface FormationMember {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  image: string | null;
  primaryRole: string;
  secondaryRoles: string[];
  jerseyNumber: number;
}

interface FormationBuilderProps {
  matchId: string;
  clubId: string;
  mode: FormationMode;
  members: FormationMember[];
  isHome: boolean;
  isAdmin: boolean;
}

interface PositionAssignment {
  x: number;
  y: number;
  label: string;
  clubMemberId?: string;
}

// Initial empty formation data
function createEmptyFormation(preset: FormationPreset, isHome: boolean): FormationData {
  return {
    formation: preset.id,
    positions: preset.positions.map((pos) => ({
      x: pos.x,
      y: pos.y,
      label: pos.label,
      clubMemberId: undefined,
    })),
    isHome,
  };
}

export function FormationBuilder({
  matchId,
  clubId,
  mode,
  members,
  isHome,
  isAdmin,
}: FormationBuilderProps) {
  const t = useTranslations('formations');
  const { formation: savedFormation, isLoading, isSaving, updateFormation } = useFormation(matchId, mode, isHome);

  // Local state
  const [selectedFormation, setSelectedFormation] = useState<string>(
    savedFormation?.formation || (mode === 'FIVE_V_FIVE' ? '5-1-2-1' : '8-3-3-1')
  );
  const [positions, setPositions] = useState<PositionAssignment[]>(
    savedFormation?.positions || []
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

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
      }
    },
    [mode, positions]
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
        
        // Remove member from any existing position first
        setPositions((prev) => {
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
          return newPositions;
        });
        setSelectedMemberId(null);
      }
    },
    []
  );

  // Handle tap-to-place
  const handleTapPosition = useCallback(
    (positionIndex: number) => {
      if (!selectedMemberId) return;

      setPositions((prev) => {
        // Remove from any existing position
        const newPositions = prev.map((pos) =>
          pos.clubMemberId === selectedMemberId
            ? { ...pos, clubMemberId: undefined }
            : pos
        );
        // Assign to new position
        if (newPositions[positionIndex]) {
          newPositions[positionIndex] = {
            ...newPositions[positionIndex],
            clubMemberId: selectedMemberId,
          };
        }
        return newPositions;
      });
      setSelectedMemberId(null);
    },
    [selectedMemberId]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    const data: FormationData = {
      formation: selectedFormation,
      positions,
      isHome,
    };
    await updateFormation(data);
  }, [selectedFormation, positions, isHome, updateFormation]);

  // Handle clear
  const handleClear = useCallback(() => {
    setPositions((prev) =>
      prev.map((pos) => ({ ...pos, clubMemberId: undefined }))
    );
    setSelectedMemberId(null);
  }, []);

  // Get assigned member IDs
  const assignedMemberIds = positions
    .map((p) => p.clubMemberId)
    .filter((id): id is string => !!id);

  // Get active drag member
  const activeDragMember = activeDragId?.startsWith('member-')
    ? members.find((m) => m.id === activeDragId.replace('member-', ''))
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              {t('title')}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t('dragOrTap')}
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isSaving}
                className="h-11"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('clear')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-11"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t('save')}
              </Button>
            </div>
          )}
        </div>

        {/* Formation Selector */}
        <FormationSelector
          mode={mode}
          currentFormation={selectedFormation}
          onChange={handleFormationChange}
          disabled={!isAdmin}
        />

        {/* Tap-to-place hint */}
        {selectedMemberId && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-center">
            {t('tapMemberThenPosition', {
              member: members.find((m) => m.id === selectedMemberId)?.firstName || '',
            })}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pitch Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <PitchGrid
                  mode={mode}
                  positions={positions}
                  members={members.map(m => ({ id: m.id, name: `${m.firstName} ${m.lastName}`.trim(), avatar: m.image || undefined }))}
                  selectedMemberId={selectedMemberId}
                  onDrop={() => {}} // Handled by DndContext
                  onTapPosition={handleTapPosition}
                />
              </CardContent>
            </Card>
          </div>

          {/* Member Pool */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('playerPool')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMemberId === member.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted bg-muted/50 hover:bg-muted'
                      } ${assignedMemberIds.includes(member.id) ? 'opacity-50' : ''}`}
                      onClick={() => setSelectedMemberId(member.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            #{member.jerseyNumber} · {member.primaryRole}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('assignedCount', { count: assignedMemberIds.length, total: positions.length })}
              </span>
              <span className={cn(
                'font-medium',
                assignedMemberIds.length === positions.length
                  ? 'text-green-600'
                  : 'text-amber-600'
              )}>
                {assignedMemberIds.length === positions.length
                  ? t('formationComplete')
                  : t('formationIncomplete')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </DndContext>
  );
}
