export type FormationMode = '5vs5' | '8vs8';
export type PositionRole = 'GK' | 'DEF' | 'MID' | 'FWD';

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

// 5vs5 formations (5 players = 1 GK + 4 outfield)
export const FORMATION_PRESETS_5VS5: FormationPreset[] = [
  {
    id: '5-1-2-1',
    name: '1-2-1 (Diamante)',
    mode: '5vs5',
    positions: [
      { x: 4, y: 6, label: 'GK', role: 'GK' },
      { x: 4, y: 4, label: 'DEF', role: 'DEF' },
      { x: 2, y: 3, label: 'MID', role: 'MID' },
      { x: 6, y: 3, label: 'MID', role: 'MID' },
      { x: 4, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '5-2-1-1',
    name: '2-1-1 (Piramide)',
    mode: '5vs5',
    positions: [
      { x: 4, y: 6, label: 'GK', role: 'GK' },
      { x: 2, y: 5, label: 'DEF', role: 'DEF' },
      { x: 6, y: 5, label: 'DEF', role: 'DEF' },
      { x: 4, y: 3, label: 'MID', role: 'MID' },
      { x: 4, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '5-1-1-2',
    name: '1-1-2 (Attacco)',
    mode: '5vs5',
    positions: [
      { x: 4, y: 6, label: 'GK', role: 'GK' },
      { x: 4, y: 5, label: 'DEF', role: 'DEF' },
      { x: 4, y: 3, label: 'MID', role: 'MID' },
      { x: 2, y: 1, label: 'FWD', role: 'FWD' },
      { x: 6, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
];

// 8vs8 formations (8 players = 1 GK + 7 outfield)
export const FORMATION_PRESETS_8VS8: FormationPreset[] = [
  {
    id: '8-3-3-1',
    name: '3-3-1 (Bilanciato)',
    mode: '8vs8',
    positions: [
      { x: 4, y: 6, label: 'GK', role: 'GK' },
      { x: 2, y: 5, label: 'DEF', role: 'DEF' },
      { x: 4, y: 5, label: 'DEF', role: 'DEF' },
      { x: 6, y: 5, label: 'DEF', role: 'DEF' },
      { x: 2, y: 3, label: 'MID', role: 'MID' },
      { x: 4, y: 3, label: 'MID', role: 'MID' },
      { x: 6, y: 3, label: 'MID', role: 'MID' },
      { x: 4, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '8-2-3-2',
    name: '2-3-2 (Offensivo)',
    mode: '8vs8',
    positions: [
      { x: 4, y: 6, label: 'GK', role: 'GK' },
      { x: 3, y: 5, label: 'DEF', role: 'DEF' },
      { x: 5, y: 5, label: 'DEF', role: 'DEF' },
      { x: 2, y: 3, label: 'MID', role: 'MID' },
      { x: 4, y: 3, label: 'MID', role: 'MID' },
      { x: 6, y: 3, label: 'MID', role: 'MID' },
      { x: 3, y: 1, label: 'FWD', role: 'FWD' },
      { x: 5, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
  {
    id: '8-3-2-2',
    name: '3-2-2 (Difensivo)',
    mode: '8vs8',
    positions: [
      { x: 4, y: 6, label: 'GK', role: 'GK' },
      { x: 2, y: 5, label: 'DEF', role: 'DEF' },
      { x: 4, y: 5, label: 'DEF', role: 'DEF' },
      { x: 6, y: 5, label: 'DEF', role: 'DEF' },
      { x: 3, y: 3, label: 'MID', role: 'MID' },
      { x: 5, y: 3, label: 'MID', role: 'MID' },
      { x: 3, y: 1, label: 'FWD', role: 'FWD' },
      { x: 5, y: 1, label: 'FWD', role: 'FWD' },
    ],
  },
];

export function getFormationPresets(mode: FormationMode): FormationPreset[] {
  return mode === '5vs5' ? FORMATION_PRESETS_5VS5 : FORMATION_PRESETS_8VS8;
}

export function getFormationPreset(mode: FormationMode, presetId: string): FormationPreset | undefined {
  return getFormationPresets(mode).find(p => p.id === presetId);
}

// Grid system: 9 columns (x: 0-8), 7 rows (y: 0-6)
// Pitch is 100% width, aspect ratio ~3:4 (portrait for mobile)
export const GRID_COLS = 9;
export const GRID_ROWS = 7;

export function positionToStyle(x: number, y: number): React.CSSProperties {
  return {
    left: `${(x / (GRID_COLS - 1)) * 100}%`,
    top: `${(y / (GRID_ROWS - 1)) * 100}%`,
    transform: 'translate(-50%, -50%)',
  };
}

// Get role color for visual distinction
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

// Get role label in Italian
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
