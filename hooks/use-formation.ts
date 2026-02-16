'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFormation, saveFormation, type FormationData, type FormationPosition } from '@/lib/db/formations';
import type { FormationMode } from '@/lib/formations';

interface UseFormationReturn {
  formation: FormationData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  updateFormation: (data: FormationData) => Promise<void>;
  updatePosition: (index: number, playerId: string | undefined) => Promise<void>;
  reload: () => Promise<void>;
}

export function useFormation(matchId: string, mode: FormationMode): UseFormationReturn {
  const [formation, setFormation] = useState<FormationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load formation on mount
  useEffect(() => {
    loadFormation();
  }, [matchId]);

  const loadFormation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFormation(matchId);
      setFormation(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load formation'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormation = useCallback(async (data: FormationData) => {
    setIsSaving(true);
    setError(null);
    try {
      await saveFormation(matchId, data);
      setFormation(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save formation'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [matchId]);

  const updatePosition = useCallback(async (index: number, playerId: string | undefined) => {
    if (!formation) return;
    
    const newPositions = [...formation.positions];
    // Remove player from any other position first (prevent duplicates)
    if (playerId) {
      const existingIndex = newPositions.findIndex(p => p.playerId === playerId);
      if (existingIndex !== -1 && existingIndex !== index) {
        newPositions[existingIndex] = { ...newPositions[existingIndex], playerId: undefined };
      }
    }
    // Assign to new position
    newPositions[index] = { ...newPositions[index], playerId };
    
    const newData = { ...formation, positions: newPositions };
    await updateFormation(newData);
  }, [formation, updateFormation]);

  return {
    formation,
    isLoading,
    isSaving,
    error,
    updateFormation,
    updatePosition,
    reload: loadFormation,
  };
}
