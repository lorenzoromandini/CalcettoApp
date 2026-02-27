/**
 * Tipi TypeScript per il Sistema Formazioni
 * 
 * Definisce i tipi necessari per il builder di formazioni multi-team
 */

import type { FormationModule, FormationPosition, MatchMode, FormationRole } from '@/lib/formations/formations-config';

// ============================================================================
// Tipi per il Builder
// ============================================================================

export type FormationStep = 'module' | 'team1' | 'team2' | 'recap';

export interface PlayerAssignment {
  positionIndex: number;    // Indice della posizione nel modulo
  clubMemberId: string;     // ID del membro del club assegnato
  assignedAt: string;       // Timestamp ISO
}

export interface TeamFormation {
  moduleId: string;                     // ID del modulo selezionato
  isHome: boolean;                      // true = Team 1 (casa), false = Team 2 (trasferta)
  assignments: PlayerAssignment[];      // Giocatori assegnati
  completedAt?: string;                 // Timestamp completamento
}

export interface FormationBuilderState {
  currentStep: FormationStep;
  selectedModuleId: string | null;
  team1Formation: TeamFormation | null;
  team2Formation: TeamFormation | null;
  matchId: string;
  clubId: string;
  mode: MatchMode;
  isSaving: boolean;
  error: string | null;
}

// ============================================================================
// Tipi per la Selezione Giocatori
// ============================================================================

export interface ClubMemberWithRolePriority {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  jerseyNumber: number;
  primaryRole: FormationRole;
  secondaryRoles: FormationRole[];
  rolePriority: number;     // 0 = primario, 1 = secondario, 2 = altro
  isAssigned: boolean;      // Già assegnato in altra posizione?
  isAssignedToOtherTeam: boolean; // Assegnato all'altro team?
}

export interface PlayerSearchFilters {
  query: string;
  targetRole?: FormationRole;
  excludeIds: string[];    // ID da escludere (già assegnati)
}

export interface PlayerSearchResult {
  members: ClubMemberWithRolePriority[];
  hasMore: boolean;
  totalCount: number;
}

// ============================================================================
// Tipi per il Campo Formazione
// ============================================================================

export interface FieldPosition {
  index: number;
  x: number;                // 0-8
  y: number;                // 0-6
  role: FormationRole;
  label: string;
  isOccupied: boolean;
  player?: {
    id: string;
    name: string;
    jerseyNumber: number;
    avatarUrl?: string;
  };
}

export interface FormationFieldData {
  module: FormationModule;
  positions: FieldPosition[];
}

// ============================================================================
// Tipi per il Recap
// ============================================================================

export interface FormationSummaryData {
  teamLabel: string;
  module: FormationModule;
  positions: FieldPosition[];
  isComplete: boolean;
  playerCount: number;
}

export interface FormationRecapState {
  team1Summary: FormationSummaryData;
  team2Summary: FormationSummaryData;
  canConfirm: boolean;
}

// ============================================================================
// Tipi per le API/Server Actions
// ============================================================================

export interface SaveFormationPayload {
  matchId: string;
  isHome: boolean;
  moduleId: string;
  assignments: {
    positionIndex: number;
    clubMemberId: string;
    positionX: number;
    positionY: number;
    positionLabel: string;
  }[];
}

export interface SaveMatchFormationsPayload {
  matchId: string;
  clubId: string;
  team1: SaveFormationPayload;
  team2: SaveFormationPayload;
}

export interface SaveFormationResponse {
  success: boolean;
  formationId?: string;
  error?: string;
}

export interface GetClubMembersResponse {
  members: ClubMemberWithRolePriority[];
}

// ============================================================================
// Tipi per la Persistenza Temporanea
// ============================================================================

export interface FormationBuilderStorage {
  version: number;
  matchId: string;
  state: FormationBuilderState;
  savedAt: string;
}

// ============================================================================
// Tipi per gli Eventi
// ============================================================================

export type FormationBuilderEvent =
  | { type: 'MODULE_SELECTED'; moduleId: string }
  | { type: 'PLAYER_ASSIGNED'; team: 'team1' | 'team2'; positionIndex: number; clubMemberId: string }
  | { type: 'PLAYER_REMOVED'; team: 'team1' | 'team2'; positionIndex: number }
  | { type: 'STEP_CHANGED'; step: FormationStep }
  | { type: 'FORMATION_CLEARED'; team: 'team1' | 'team2' }
  | { type: 'ERROR_OCCURRED'; error: string }
  | { type: 'SAVING_STARTED' }
  | { type: 'SAVING_COMPLETED'; success: boolean };

// ============================================================================
// Utility Types
// ============================================================================

export type TeamType = 'team1' | 'team2';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormationValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// ============================================================================
// Props dei Componenti
// ============================================================================

export interface FormationModuleSelectorProps {
  mode: MatchMode;
  selectedModuleId: string | null;
  onSelect: (moduleId: string) => void;
  disabled?: boolean;
}

export interface FormationFieldProps {
  module: FormationModule;
  assignments: PlayerAssignment[];
  onPositionClick: (positionIndex: number) => void;
  selectedPositionIndex?: number | null;
  readOnly?: boolean;
}

export interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  targetRole?: FormationRole;
  selectedPlayerId: string | null;
  excludeIds: string[];
  onSelect: (clubMemberId: string) => void;
  onRemove: () => void;
}

export interface FormationSummaryProps {
  summary: FormationSummaryData;
  onEdit: () => void;
  isEditable: boolean;
}

export interface FormationRecapProps {
  team1Summary: FormationSummaryData;
  team2Summary: FormationSummaryData;
  onEditTeam1: () => void;
  onEditTeam2: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
  error: string | null;
}

export interface FormationBuilderProviderProps {
  matchId: string;
  clubId: string;
  mode: MatchMode;
  children: React.ReactNode;
}
