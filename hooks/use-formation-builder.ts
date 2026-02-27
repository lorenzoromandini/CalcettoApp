/**
 * React Hook for Formation Builder State Management
 * 
 * Manages the complex state of the formation builder including:
 * - Current step (module, team1, team2, recap)
 * - Selected module
 * - Player assignments for both teams
 * - Validation
 */

import { useState, useCallback, useMemo } from 'react';
import type { FormationStep, TeamFormation, PlayerAssignment } from '@/types/formations';
import type { MatchMode } from '@/lib/formations/formations-config';

interface UseFormationBuilderProps {
  matchId: string;
  clubId: string;
  mode: MatchMode;
}

interface UseFormationBuilderReturn {
  // State
  currentStep: FormationStep;
  selectedModuleId: string | null;
  team1Formation: TeamFormation | null;
  team2Formation: TeamFormation | null;
  isSaving: boolean;
  error: string | null;

  // Actions
  setStep: (step: FormationStep) => void;
  selectModule: (moduleId: string) => void;
  assignPlayerToTeam1: (positionIndex: number, clubMemberId: string) => void;
  assignPlayerToTeam2: (positionIndex: number, clubMemberId: string) => void;
  removePlayerFromTeam1: (positionIndex: number) => void;
  removePlayerFromTeam2: (positionIndex: number) => void;
  clearTeam1Formation: () => void;
  clearTeam2Formation: () => void;
  canProceed: boolean;
  nextStep: () => void;
  prevStep: () => void;
  setIsSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;

  // Getters
  getTeam1Assignments: PlayerAssignment[];
  getTeam2Assignments: PlayerAssignment[];
  getAssignedPlayerIds: string[];
  isTeam1Complete: boolean;
  isTeam2Complete: boolean;
  isFormationComplete: boolean;
}

export function useFormationBuilder({
  matchId,
  clubId,
  mode,
}: UseFormationBuilderProps): UseFormationBuilderReturn {
  const [currentStep, setCurrentStep] = useState<FormationStep>('module');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [team1Formation, setTeam1Formation] = useState<TeamFormation | null>(null);
  const [team2Formation, setTeam2Formation] = useState<TeamFormation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Select module
  const selectModule = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId);
    // Initialize empty formations when module is selected
    setTeam1Formation({
      moduleId,
      isHome: true,
      assignments: [],
    });
    setTeam2Formation({
      moduleId,
      isHome: false,
      assignments: [],
    });
  }, []);

  // Assign player to team 1
  const assignPlayerToTeam1 = useCallback((positionIndex: number, clubMemberId: string) => {
    setTeam1Formation((prev) => {
      if (!prev) return null;
      
      // Remove any existing assignment for this position
      const filtered = prev.assignments.filter(a => a.positionIndex !== positionIndex);
      // Remove any existing assignment for this player
      const withoutPlayer = filtered.filter(a => a.clubMemberId !== clubMemberId);
      
      return {
        ...prev,
        assignments: [...withoutPlayer, {
          positionIndex,
          clubMemberId,
          assignedAt: new Date().toISOString(),
        }],
      };
    });
  }, []);

  // Assign player to team 2
  const assignPlayerToTeam2 = useCallback((positionIndex: number, clubMemberId: string) => {
    setTeam2Formation((prev) => {
      if (!prev) return null;
      
      // Remove any existing assignment for this position
      const filtered = prev.assignments.filter(a => a.positionIndex !== positionIndex);
      // Remove any existing assignment for this player
      const withoutPlayer = filtered.filter(a => a.clubMemberId !== clubMemberId);
      
      return {
        ...prev,
        assignments: [...withoutPlayer, {
          positionIndex,
          clubMemberId,
          assignedAt: new Date().toISOString(),
        }],
      };
    });
  }, []);

  // Remove player from team 1
  const removePlayerFromTeam1 = useCallback((positionIndex: number) => {
    setTeam1Formation((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        assignments: prev.assignments.filter(a => a.positionIndex !== positionIndex),
      };
    });
  }, []);

  // Remove player from team 2
  const removePlayerFromTeam2 = useCallback((positionIndex: number) => {
    setTeam2Formation((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        assignments: prev.assignments.filter(a => a.positionIndex !== positionIndex),
      };
    });
  }, []);

  // Clear formations
  const clearTeam1Formation = useCallback(() => {
    setTeam1Formation((prev) => prev ? { ...prev, assignments: [] } : null);
  }, []);

  const clearTeam2Formation = useCallback(() => {
    setTeam2Formation((prev) => prev ? { ...prev, assignments: [] } : null);
  }, []);

  // Navigation
  const nextStep = useCallback(() => {
    setCurrentStep((current) => {
      switch (current) {
        case 'module': return 'team1';
        case 'team1': return 'team2';
        case 'team2': return 'recap';
        default: return current;
      }
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((current) => {
      switch (current) {
        case 'team1': return 'module';
        case 'team2': return 'team1';
        case 'recap': return 'team2';
        default: return current;
      }
    });
  }, []);

  // Computed values
  const getTeam1Assignments = useMemo(() => team1Formation?.assignments || [], [team1Formation]);
  const getTeam2Assignments = useMemo(() => team2Formation?.assignments || [], [team2Formation]);

  const getAssignedPlayerIds = useMemo(() => {
    const team1Ids = team1Formation?.assignments.map(a => a.clubMemberId) || [];
    const team2Ids = team2Formation?.assignments.map(a => a.clubMemberId) || [];
    return [...team1Ids, ...team2Ids];
  }, [team1Formation, team2Formation]);

  // Validation
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'module':
        return !!selectedModuleId;
      case 'team1':
        // Check if all positions are filled (need formation config to check)
        return !!(team1Formation && team1Formation.assignments.length > 0);
      case 'team2':
        return !!(team2Formation && team2Formation.assignments.length > 0);
      default:
        return false;
    }
  }, [currentStep, selectedModuleId, team1Formation, team2Formation]);

  const isTeam1Complete = useMemo(() => {
    // Would need formation config to check if all positions are filled
    return !!(team1Formation && team1Formation.assignments.length > 0);
  }, [team1Formation]);

  const isTeam2Complete = useMemo(() => {
    return !!(team2Formation && team2Formation.assignments.length > 0);
  }, [team2Formation]);

  const isFormationComplete = useMemo(() => {
    return !!(isTeam1Complete && isTeam2Complete);
  }, [isTeam1Complete, isTeam2Complete]);

  return {
    currentStep,
    selectedModuleId,
    team1Formation,
    team2Formation,
    isSaving,
    error,
    setStep: setCurrentStep,
    selectModule,
    assignPlayerToTeam1,
    assignPlayerToTeam2,
    removePlayerFromTeam1,
    removePlayerFromTeam2,
    clearTeam1Formation,
    clearTeam2Formation,
    canProceed,
    nextStep,
    prevStep,
    setIsSaving,
    setError,
    getTeam1Assignments,
    getTeam2Assignments,
    getAssignedPlayerIds,
    isTeam1Complete,
    isTeam2Complete,
    isFormationComplete,
  };
}
