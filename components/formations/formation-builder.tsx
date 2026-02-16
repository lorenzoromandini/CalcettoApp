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
import { PlayerPool } from './player-pool';
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

interface FormationBuilderProps {
  matchId: string;
  teamId: string;
  mode: FormationMode;
  players: Array<{
    id: string;
    name: string;
    avatar?: string;
    rsvp: 'in' | 'out' | 'maybe';
  }>;
  isAdmin: boolean;
}

interface PositionAssignment {
  x: number;
  y: number;
  label: string;
  playerId?: string;
}

// Initial empty formation data
function createEmptyFormation(preset: FormationPreset): FormationData {
  return {
    formation: preset.id,
    positions: preset.positions.map((pos) => ({
      x: pos.x,
      y: pos.y,
      label: pos.label,
      playerId: undefined,
    })),
  };
}

export function FormationBuilder({
  matchId,
  teamId,
  mode,
  players,
  isAdmin,
}: FormationBuilderProps) {
  const t = useTranslations('formations');
  const { formation: savedFormation, isLoading, isSaving, updateFormation } = useFormation(matchId, mode);

  // Local state
  const [selectedFormation, setSelectedFormation] = useState<string>(
    savedFormation?.formation || (mode === '5vs5' ? '5-1-2-1' : '8-3-3-1')
  );
  const [positions, setPositions] = useState<PositionAssignment[]>(
    savedFormation?.positions || []
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Initialize from saved formation
  useState(() => {
    if (savedFormation) {
      setSelectedFormation(savedFormation.formation);
      setPositions(savedFormation.positions);
    } else {
      // Initialize with default formation
      const preset = getFormationPreset(mode, selectedFormation);
      if (preset) {
        setPositions(
          preset.positions.map((pos) => ({
            x: pos.x,
            y: pos.y,
            label: pos.label,
            playerId: undefined,
          }))
        );
      }
    }
  });

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
            playerId: existingPos?.playerId,
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

      // Handle player drop on position
      if (activeId.startsWith('player-') && overId.startsWith('position-')) {
        const playerId = activeId.replace('player-', '');
        const positionIndex = parseInt(overId.replace('position-', ''));
        
        // Remove player from any existing position first
        setPositions((prev) => {
          const newPositions = prev.map((pos) =>
            pos.playerId === playerId ? { ...pos, playerId: undefined } : pos
          );
          // Assign to new position
          if (newPositions[positionIndex]) {
            newPositions[positionIndex] = {
              ...newPositions[positionIndex],
              playerId,
            };
          }
          return newPositions;
        });
        setSelectedPlayerId(null);
      }
    },
    []
  );

  // Handle tap-to-place
  const handleTapPosition = useCallback(
    (positionIndex: number) => {
      if (!selectedPlayerId) return;

      setPositions((prev) => {
        // Remove from any existing position
        const newPositions = prev.map((pos) =>
          pos.playerId === selectedPlayerId
            ? { ...pos, playerId: undefined }
            : pos
        );
        // Assign to new position
        if (newPositions[positionIndex]) {
          newPositions[positionIndex] = {
            ...newPositions[positionIndex],
            playerId: selectedPlayerId,
          };
        }
        return newPositions;
      });
      setSelectedPlayerId(null);
    },
    [selectedPlayerId]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    const data: FormationData = {
      formation: selectedFormation,
      positions,
    };
    await updateFormation(data);
  }, [selectedFormation, positions, updateFormation]);

  // Handle clear
  const handleClear = useCallback(() => {
    setPositions((prev) =>
      prev.map((pos) => ({ ...pos, playerId: undefined }))
    );
    setSelectedPlayerId(null);
  }, []);

  // Get assigned player IDs
  const assignedPlayerIds = positions
    .map((p) => p.playerId)
    .filter((id): id is string => !!id);

  // Get active drag player
  const activeDragPlayer = activeDragId?.startsWith('player-')
    ? players.find((p) => p.id === activeDragId.replace('player-', ''))
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
        {selectedPlayerId && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-center">
            {t('tapPlayerThenPosition', {
              player: players.find((p) => p.id === selectedPlayerId)?.name || '',
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
                  players={players}
                  selectedPlayerId={selectedPlayerId}
                  onDrop={() => {}} // Handled by DndContext
                  onTapPosition={handleTapPosition}
                />
              </CardContent>
            </Card>
          </div>

          {/* Player Pool */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('playerPool')}</CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerPool
                  players={players}
                  selectedPlayerId={selectedPlayerId}
                  assignedPlayerIds={assignedPlayerIds}
                  onSelectPlayer={setSelectedPlayerId}
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
                {t('assignedCount', { count: assignedPlayerIds.length, total: positions.length })}
              </span>
              <span className={cn(
                'font-medium',
                assignedPlayerIds.length === positions.length
                  ? 'text-green-600'
                  : 'text-amber-600'
              )}>
                {assignedPlayerIds.length === positions.length
                  ? t('formationComplete')
                  : t('formationIncomplete')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragPlayer ? (
          <div className="bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold">
              {activeDragPlayer.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
