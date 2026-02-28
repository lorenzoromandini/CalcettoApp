import { MatchMode } from '@prisma/client';
export type FormationMode = MatchMode;
export type PositionRole = 'GK' | 'DEF' | 'MID' | 'FWD';

// Re-export dal nuovo sistema di formazioni
export type { 
  FormationRole, 
  MatchMode as FormationMatchMode
} from './formations-config';
export { 
  getFormationsByMode,
  getFormationById,
  getFormationPositionsCount,
  getRoleDisplayName,
  getRoleShortName,
  ROLE_COLORS,
  ALL_FORMATIONS,
  FORMATIONS_5V5,
  FORMATIONS_8V8,
  FORMATIONS_11V11
} from './formations-config';

export interface Position {
  x: number;
  y: number;
  label: string;
  role: PositionRole;
}

export interface FormationPreset {
  id: string;
  name: string;
  mode: FormationMode;
  positions: Position[];
}

// COORDINATE CORRETTE PER CENTRATURA SUL CAMPO
// Grid: 9 colonne (0-8), centro a x=4
// Per centrare: uso x=1, 3, 5, 7 per la difesa a 4 (simmetriche rispetto a 4)
// x=2, 4, 6 per difesa a 3 (centro a x=4)

// 5vs5 formations
export const FORMATION_PRESETS_5VS5: FormationPreset[] = [
  {
    id: '2-2',
    name: '2-2',
    mode: MatchMode.FIVE_V_FIVE,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      { x: 3.2, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 6.2, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 3.7, y: 1.2, label: 'FWD', role: 'FWD' },
      { x: 5.7, y: 1.2, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '2-1-1',
    name: '2-1-1',
    mode: MatchMode.FIVE_V_FIVE,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      { x: 3.2, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 6.2, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 4.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.7, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '3-1',
    name: '3-1',
    mode: MatchMode.FIVE_V_FIVE,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      { x: 2.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 4.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 6.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 4.7, y: 1.2, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '1-2-1',
    name: '1-2-1',
    mode: MatchMode.FIVE_V_FIVE,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      { x: 4.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 3.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 5.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.7, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
];

// 8vs8 formations
export const FORMATION_PRESETS_8VS8: FormationPreset[] = [
  {
    id: '3-3-1',
    name: '3-3-1',
    mode: MatchMode.EIGHT_V_EIGHT,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      { x: 2.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 4.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 6.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 2.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 6.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.7, y: 1.2, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '3-2-2',
    name: '3-2-2',
    mode: MatchMode.EIGHT_V_EIGHT,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      { x: 2.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 4.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 6.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 3.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 5.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.2, y: 1.2, label: 'FWD', role: 'FWD' },
      { x: 5.2, y: 1.2, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '2-4-1',
    name: '2-4-1',
    mode: MatchMode.EIGHT_V_EIGHT,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      { x: 3.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 5.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 1.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 3.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 5.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 7.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.7, y: 1.2, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '2-3-2',
    name: '2-3-2',
    mode: MatchMode.EIGHT_V_EIGHT,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      { x: 3.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 5.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 2.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 6.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.2, y: 1.2, label: 'FWD', role: 'FWD' },
      { x: 5.2, y: 1.2, label: 'FWD', role: 'FWD' },
    ],
  },
];

// 11vs11 formations - COORDINATE CORRETTE PER CENTRATURA
export const FORMATION_PRESETS_11VS11: FormationPreset[] = [
  {
    id: '4-3-3',
    name: '4-3-3',
    mode: MatchMode.ELEVEN_V_ELEVEN,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      // Difesa a 4: distribuiti su tutta la larghezza
      { x: 1.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 3.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 5.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 7.7, y: 4.7, label: 'DEF', role: 'DEF' },
      // Centrocampo a 3
      { x: 2.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 6.7, y: 3.4, label: 'MID', role: 'MID' },
      // Attacco a 3
      { x: 3.7, y: 1.5, label: 'FWD', role: 'FWD' },
      { x: 4.7, y: 1.5, label: 'FWD', role: 'FWD' },
      { x: 5.7, y: 1.5, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '4-4-2',
    name: '4-4-2',
    mode: MatchMode.ELEVEN_V_ELEVEN,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      // Difesa a 4
      { x: 1.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 3.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 5.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 7.7, y: 4.7, label: 'DEF', role: 'DEF' },
      // Centrocampo a 4
      { x: 1.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 3.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 5.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 7.7, y: 3.4, label: 'MID', role: 'MID' },
      // Attacco a 2
      { x: 4.2, y: 1.5, label: 'FWD', role: 'FWD' },
      { x: 5.2, y: 1.5, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1',
    mode: MatchMode.ELEVEN_V_ELEVEN,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      // Difesa a 4
      { x: 1.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 3.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 5.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 7.7, y: 4.7, label: 'DEF', role: 'DEF' },
      // Mediani a 2
      { x: 3.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 5.7, y: 3.4, label: 'MID', role: 'MID' },
      // Trequartisti a 3
      { x: 3.7, y: 2.2, label: 'FWD', role: 'FWD' },
      { x: 4.7, y: 2.2, label: 'FWD', role: 'FWD' },
      { x: 5.7, y: 2.2, label: 'FWD', role: 'FWD' },
      // Punta solitaria
      { x: 4.7, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '4-3-1-2',
    name: '4-3-1-2',
    mode: MatchMode.ELEVEN_V_ELEVEN,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      // Difesa a 4
      { x: 1.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 3.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 5.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 7.7, y: 4.7, label: 'DEF', role: 'DEF' },
      // Centrocampo a 3
      { x: 2.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 6.7, y: 3.4, label: 'MID', role: 'MID' },
      // Trequartista
      { x: 4.7, y: 2, label: 'FWD', role: 'FWD' },
      // Attacco a 2
      { x: 4.2, y: 1, label: 'FWD', role: 'FWD' },
      { x: 5.2, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '3-4-3',
    name: '3-4-3',
    mode: MatchMode.ELEVEN_V_ELEVEN,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      // Difesa a 3
      { x: 2.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 4.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 6.7, y: 4.7, label: 'DEF', role: 'DEF' },
      // Centrocampo a 4
      { x: 1.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 3.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 5.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 7.7, y: 3.4, label: 'MID', role: 'MID' },
      // Attacco a 3
      { x: 3.7, y: 1.5, label: 'FWD', role: 'FWD' },
      { x: 4.7, y: 1.5, label: 'FWD', role: 'FWD' },
      { x: 5.7, y: 1.5, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '3-5-2',
    name: '3-5-2',
    mode: MatchMode.ELEVEN_V_ELEVEN,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      // Difesa a 3
      { x: 2.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 4.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 6.7, y: 4.7, label: 'DEF', role: 'DEF' },
      // Centrocampo a 5
      { x: 1.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 3.2, y: 3.4, label: 'MID', role: 'MID' },
      { x: 4.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 6.2, y: 3.4, label: 'MID', role: 'MID' },
      { x: 7.7, y: 3.4, label: 'MID', role: 'MID' },
      // Attacco a 2
      { x: 4.2, y: 1.5, label: 'FWD', role: 'FWD' },
      { x: 5.2, y: 1.5, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '3-4-1-2',
    name: '3-4-1-2',
    mode: MatchMode.ELEVEN_V_ELEVEN,
    positions: [
      { x: 4.7, y: 6, label: 'GK', role: 'GK' },
      // Difesa a 3
      { x: 2.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 4.7, y: 4.7, label: 'DEF', role: 'DEF' },
      { x: 6.7, y: 4.7, label: 'DEF', role: 'DEF' },
      // Centrocampo a 4
      { x: 1.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 3.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 5.7, y: 3.4, label: 'MID', role: 'MID' },
      { x: 7.7, y: 3.4, label: 'MID', role: 'MID' },
      // Trequartista
      { x: 4.7, y: 2, label: 'FWD', role: 'FWD' },
      // Attacco a 2
      { x: 4.2, y: 1, label: 'FWD', role: 'FWD' },
      { x: 5.2, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
];

export function getFormationPresets(mode: FormationMode): FormationPreset[] {
  switch (mode) {
    case MatchMode.FIVE_V_FIVE:
      return FORMATION_PRESETS_5VS5;
    case MatchMode.EIGHT_V_EIGHT:
      return FORMATION_PRESETS_8VS8;
    case MatchMode.ELEVEN_V_ELEVEN:
      return FORMATION_PRESETS_11VS11;
    default:
      return [];
  }
}

export function getFormationPreset(mode: FormationMode, presetId: string): FormationPreset | undefined {
  return getFormationPresets(mode).find(p => p.id === presetId);
}

// Grid system: 9 columns (x: 0-8), 7 rows (y: 0-6)
export const GRID_COLS = 9;
export const GRID_ROWS = 7;

export function positionToStyle(x: number, y: number): React.CSSProperties {
  const clampedX = Math.max(0, Math.min(x, GRID_COLS - 1));
  const clampedY = Math.max(0, Math.min(y, GRID_ROWS - 1));
  
  return {
    left: `${(clampedX / (GRID_COLS - 1)) * 100}%`,
    top: `${(clampedY / (GRID_ROWS - 1)) * 100}%`,
    transform: 'translate(-50%, -50%)',
  };
}

export function getRoleColor(role: PositionRole): string {
  switch (role) {
    case 'GK':
      return 'bg-yellow-500';
    case 'DEF':
      return 'bg-blue-500';
    case 'MID':
      return 'bg-green-500';
    case 'FWD':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getRoleLabel(role: PositionRole): string {
  switch (role) {
    case 'GK':
      return 'Portiere';
    case 'DEF':
      return 'Difensore';
    case 'MID':
      return 'Centrocampista';
    case 'FWD':
      return 'Attaccante';
    default:
      return role;
  }
}
