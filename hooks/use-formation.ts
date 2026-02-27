'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFormationAction, saveFormationAction } from '@/lib/actions/formations';
import type { FormationData, FormationPosition } from '@/lib/db/formations';
import type { FormationMode } from '@/lib/formations';

interface UseFormationReturn {
  formation: FormationData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  updateFormation: (data: FormationData) => Promise<void>;
  updatePosition: (index: number, clubMemberId: string | undefined) => Promise<void>;
  reload: () => Promise<void>;
}

export function useFormation(matchId: string, mode: FormationMode, isHome: boolean = true): UseFormationReturn {
  const [formation, setFormation] = useState<FormationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load formation on mount
  useEffect(() => {
    loadFormation();
  }, [matchId, isHome]);

  const loadFormation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFormationAction(matchId, isHome);
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
      await saveFormation(matchId, { ...data, isHome });
      setFormation(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save formation'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [matchId, isHome]);

  const updatePosition = useCallback(async (index: number, clubMemberId: string | undefined) => {
    if (!formation) return;
    
    const newPositions = [...formation.positions];
    // Remove clubMember from any other position first (prevent duplicates)
    if (clubMemberId) {
      const existingIndex = newPositions.findIndex(p => p.clubMemberId === clubMemberId);
      if (existingIndex !== -1 && existingIndex !== index) {
        newPositions[existingIndex] = { ...newPositions[existingIndex], clubMemberId: undefined };
      }
    }
    // Assign to new position
    newPositions[index] = { ...newPositions[index], clubMemberId };
    
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
