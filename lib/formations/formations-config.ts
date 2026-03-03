/**
 * Configurazione Moduli Formazione
 *
 * Definisce tutti i moduli tattici disponibili per ogni modalità di gioco.
 * Coordinate: sistema grid con decimali (x: 0-8, y: 0-6)
 * Ruoli: POR (portiere), DIF (difensore), CEN (centrocampista), ATT (attaccante)
 */

export type FormationRole = 'POR' | 'DIF' | 'CEN' | 'ATT';
export type MatchMode = 'FIVE_V_FIVE' | 'EIGHT_V_EIGHT' | 'ELEVEN_V_ELEVEN';

export interface FormationPosition {
  x: number;        // 0-8 (colonne, con decimali per precisione)
  y: number;        // 0-6 (righe, 6 = fondo campo)
  role: FormationRole;
  label: string;    // Etichetta visiva (POR, DIF, CEN, ATT)
}

export interface FormationModule {
  id: string;               // Es: "2-2", "4-3-3"
  name: string;             // Nome leggibile
  mode: MatchMode;
  description: string;      // Breve descrizione tattica
  positions: FormationPosition[];
}

// ============================================================================
// MODULI 5v5 (5 posizioni totali: 1 POR + 4 giocatori)
// ============================================================================

export const FORMATIONS_5V5: FormationModule[] = [
  {
    id: '2-2',
    name: '2-2',
    mode: 'FIVE_V_FIVE',
    description: 'Modulo bilanciato con difesa a 2 e attacco a 2',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      { x: 3.2, y: 4.4, role: 'DIF', label: 'DIF' },
      { x: 6.2, y: 4.4, role: 'DIF', label: 'DIF' },
      { x: 3.7, y: 1.8, role: 'ATT', label: 'ATT' },
      { x: 5.7, y: 1.8, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '2-1-1',
    name: '2-1-1',
    mode: 'FIVE_V_FIVE',
    description: 'Modulo a rombo con centrocampista centrale',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      { x: 3.0, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 6.4, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 4.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 4.7, y: 1.5, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '3-1',
    name: '3-1',
    mode: 'FIVE_V_FIVE',
    description: 'Modulo difensivo con 3 difensori e 1 attaccante',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      { x: 2.7, y: 4.2, role: 'DIF', label: 'DIF' },
      { x: 4.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 6.7, y: 4.2, role: 'DIF', label: 'DIF' },
      { x: 4.7, y: 1.8, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '1-2-1',
    name: '1-2-1',
    mode: 'FIVE_V_FIVE',
    description: 'Modulo offensivo con difesa a 1 e centrocampo a 2',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      { x: 4.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 3.2, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 6.2, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 4.7, y: 2, role: 'ATT', label: 'ATT' },
    ],
  },
];

// ============================================================================
// MODULI 8v8 (8 posizioni totali: 1 POR + 7 giocatori)
// ============================================================================

export const FORMATIONS_8V8: FormationModule[] = [
  {
    id: '3-3-1',
    name: '3-3-1',
    mode: 'EIGHT_V_EIGHT',
    description: 'Modulo bilanciato con linee equilibrate',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      { x: 2.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 4.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 6.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 2.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 4.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 6.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 4.7, y: 2.0, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '3-2-2',
    name: '3-2-2',
    mode: 'EIGHT_V_EIGHT',
    description: 'Modulo offensivo con 2 attaccanti',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      { x: 2.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 4.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 6.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 3.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 5.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 3.7, y: 2.0, role: 'ATT', label: 'ATT' },
      { x: 5.7, y: 2.0, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '2-4-1',
    name: '2-4-1',
    mode: 'EIGHT_V_EIGHT',
    description: 'Modulo con centrocampo forte a 4',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      { x: 3.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 5.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 1.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 3.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 5.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 7.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 4.7, y: 2.0, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '2-3-2',
    name: '2-3-2',
    mode: 'EIGHT_V_EIGHT',
    description: 'Modulo offensivo con difesa a 2 e doppia punta',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      { x: 3.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 5.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 2.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 4.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 6.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 3.7, y: 2.0, role: 'ATT', label: 'ATT' },
      { x: 5.7, y: 2.0, role: 'ATT', label: 'ATT' },
    ],
  },
];

// ============================================================================
// MODULI 11v11 (11 posizioni totali: 1 POR + 10 giocatori)
// ============================================================================

export const FORMATIONS_11V11: FormationModule[] = [
  {
    id: '4-3-3',
    name: '4-3-3',
    mode: 'ELEVEN_V_ELEVEN',
    description: 'Il classico modulo offensivo con 3 attaccanti',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      // Difesa a 4: distribuiti su tutta la larghezza
      { x: 1.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 3.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 5.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 7.7, y: 4.7, role: 'DIF', label: 'DIF' },
      // Centrocampo a 3
      { x: 2.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 4.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 6.7, y: 3.4, role: 'CEN', label: 'CEN' },
      // Attacco a 3
      { x: 2.7, y: 2.0, role: 'ATT', label: 'ATT' },
      { x: 4.7, y: 2.0, role: 'ATT', label: 'ATT' },
      { x: 6.7, y: 2.0, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '4-4-2',
    name: '4-4-2',
    mode: 'ELEVEN_V_ELEVEN',
    description: 'Modulo bilanciato con doppia punta',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      // Difesa a 4
      { x: 1.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 3.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 5.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 7.7, y: 4.7, role: 'DIF', label: 'DIF' },
      // Centrocampo a 4
      { x: 1.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 3.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 5.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 7.7, y: 3.4, role: 'CEN', label: 'CEN' },
      // Attacco a 2
      { x: 3.7, y: 2.0, role: 'ATT', label: 'ATT' },
      { x: 5.7, y: 2.0, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1',
    mode: 'ELEVEN_V_ELEVEN',
    description: 'Modulo moderno con trequartisti dietro la punta',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      // Difesa a 4
      { x: 1.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 3.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 5.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 7.7, y: 4.7, role: 'DIF', label: 'DIF' },
      // Mediani a 2
      { x: 3.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 5.7, y: 3.4, role: 'CEN', label: 'CEN' },
      // Trequartisti a 3
      { x: 2.7, y: 2.2, role: 'ATT', label: 'ATT' },
      { x: 4.7, y: 2.2, role: 'ATT', label: 'ATT' },
      { x: 6.7, y: 2.2, role: 'ATT', label: 'ATT' },
      // Punta solitaria
      { x: 4.7, y: 1, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '4-3-1-2',
    name: '4-3-1-2',
    mode: 'ELEVEN_V_ELEVEN',
    description: 'Modulo con trequartista centrale e doppia punta',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      // Difesa a 4
      { x: 1.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 3.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 5.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 7.7, y: 4.7, role: 'DIF', label: 'DIF' },
      // Centrocampo a 3
      { x: 2.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 4.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 6.7, y: 3.4, role: 'CEN', label: 'CEN' },
      // Trequartista
      { x: 4.7, y: 2, role: 'ATT', label: 'ATT' },
      // Attacco a 2
      { x: 3.7, y: 1, role: 'ATT', label: 'ATT' },
      { x: 5.7, y: 1, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '3-4-3',
    name: '3-4-3',
    mode: 'ELEVEN_V_ELEVEN',
    description: 'Modulo offensivo con 3 difensori e 3 attaccanti',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      // Difesa a 3
      { x: 2.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 4.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 6.7, y: 4.7, role: 'DIF', label: 'DIF' },
      // Centrocampo a 4
      { x: 1.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 3.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 5.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 7.7, y: 3.4, role: 'CEN', label: 'CEN' },
      // Attacco a 3
      { x: 2.7, y: 2.0, role: 'ATT', label: 'ATT' },
      { x: 4.7, y: 2.0, role: 'ATT', label: 'ATT' },
      { x: 6.7, y: 2.0, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '3-5-2',
    name: '3-5-2',
    mode: 'ELEVEN_V_ELEVEN',
    description: 'Modulo con centrocampo a 5 e difesa a 3',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      // Difesa a 3
      { x: 2.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 4.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 6.7, y: 4.7, role: 'DIF', label: 'DIF' },
      // Centrocampo a 5
      { x: 1.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 3.2, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 4.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 6.2, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 7.7, y: 3.4, role: 'CEN', label: 'CEN' },
      // Attacco a 2
      { x: 3.7, y: 2.0, role: 'ATT', label: 'ATT' },
      { x: 5.7, y: 2.0, role: 'ATT', label: 'ATT' },
    ],
  },
  {
    id: '3-4-1-2',
    name: '3-4-1-2',
    mode: 'ELEVEN_V_ELEVEN',
    description: 'Modulo con trequartista e doppia punta, difesa a 3',
    positions: [
      { x: 4.7, y: 6, role: 'POR', label: 'POR' },
      // Difesa a 3
      { x: 2.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 4.7, y: 4.7, role: 'DIF', label: 'DIF' },
      { x: 6.7, y: 4.7, role: 'DIF', label: 'DIF' },
      // Centrocampo a 4
      { x: 1.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 3.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 5.7, y: 3.4, role: 'CEN', label: 'CEN' },
      { x: 7.7, y: 3.4, role: 'CEN', label: 'CEN' },
      // Trequartista
      { x: 4.7, y: 2, role: 'ATT', label: 'ATT' },
      // Attacco a 2
      { x: 3.7, y: 1, role: 'ATT', label: 'ATT' },
      { x: 5.7, y: 1, role: 'ATT', label: 'ATT' },
    ],
  },
];

// ============================================================================
// UTILITÀ
// ============================================================================

export const ALL_FORMATIONS: FormationModule[] = [
  ...FORMATIONS_5V5,
  ...FORMATIONS_8V8,
  ...FORMATIONS_11V11,
];

export function getFormationsByMode(mode: MatchMode): FormationModule[] {
  switch (mode) {
    case 'FIVE_V_FIVE':
      return FORMATIONS_5V5;
    case 'EIGHT_V_EIGHT':
      return FORMATIONS_8V8;
    case 'ELEVEN_V_ELEVEN':
      return FORMATIONS_11V11;
    default:
      return [];
  }
}

export function getFormationById(id: string): FormationModule | undefined {
  return ALL_FORMATIONS.find((f) => f.id === id);
}

export function getFormationPositionsCount(moduleId: string): number {
  const formation = getFormationById(moduleId);
  return formation?.positions.length ?? 0;
}

export function getRoleDisplayName(role: FormationRole): string {
  switch (role) {
    case 'POR':
      return 'Portiere';
    case 'DIF':
      return 'Difensore';
    case 'CEN':
      return 'Centrocampista';
    case 'ATT':
      return 'Attaccante';
    default:
      return role;
  }
}

export function getRoleShortName(role: FormationRole): string {
  switch (role) {
    case 'POR':
      return 'POR';
    case 'DIF':
      return 'DIF';
    case 'CEN':
      return 'CEN';
    case 'ATT':
      return 'ATT';
    default:
      return role;
  }
}

// Mappa colori per ruoli (per UI)
export const ROLE_COLORS: Record<
  FormationRole,
  { bg: string; border: string; text: string }
> = {
  POR: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-700' },
  DIF: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-700' },
  CEN: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-700' },
  ATT: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-700' },
};

// Verifica validità coordinate
export function isValidPosition(x: number, y: number): boolean {
  return x >= 0 && x <= 8 && y >= 0 && y <= 6;
}

// Calcola distanza tra due posizioni sul campo (utile per verifiche)
export function getPositionDistance(
  pos1: FormationPosition,
  pos2: FormationPosition
): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}
