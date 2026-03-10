// Game constants

export const PLAYER_COLORS = [
  { bg: '#00f5ff', glow: '#00f5ff' }, // cyan – human
  { bg: '#ff4757', glow: '#ff6b81' }, // red
  { bg: '#2ed573', glow: '#7bed9f' }, // green
  { bg: '#ffa502', glow: '#eccc68' }, // orange
];

export const AI_NAMES = ['Commander Rex', 'Admiral Nova', 'General Vex'];

/** Starting troops based on total player count */
export const INITIAL_TROOPS: Record<number, number> = {
  2: 40,
  3: 35,
  4: 30,
};

/** Minimum troops required to initiate an attack */
export const MIN_ATTACK_TROOPS = 2;

export const MAX_ATTACK_DICE = 3;
export const MAX_DEFEND_DICE = 2;

/** Reinforcements gained per N territories owned (rounded down) */
export const TROOPS_PER_TERRITORIES = 3;
export const MIN_REINFORCEMENTS = 3;

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 580;
export const TERRITORY_RADIUS = 22;
