// Core game types for Risk Lite

export type TerritoryId = string;
export type PlayerId = number;
export type Phase = 'setup' | 'place' | 'attack' | 'fortify' | 'end';
export type Difficulty = 'easy' | 'hard';
export type GameStatus = 'menu' | 'playing' | 'paused' | 'ended';

export interface Territory {
  id: TerritoryId;
  name: string;
  continent: string;
  position: { x: number; y: number };
  adjacencies: TerritoryId[];
}

export interface TerritoryState {
  owner: PlayerId | null;
  troops: number;
}

export interface Player {
  id: PlayerId;
  name: string;
  color: string;
  glowColor: string;
  isAI: boolean;
  difficulty?: Difficulty;
  eliminated: boolean;
}

export interface CombatResult {
  attackerLosses: number;
  defenderLosses: number;
  attackerDice: number[];
  defenderDice: number[];
  conquered: boolean;
}

export interface AttackAction {
  from: TerritoryId;
  to: TerritoryId;
  attackerTroops: number;
}

export interface GameState {
  status: GameStatus;
  phase: Phase;
  currentPlayer: PlayerId;
  players: Player[];
  territories: Record<TerritoryId, TerritoryState>;
  round: number;
  selectedTerritory: TerritoryId | null;
  attackingFrom: TerritoryId | null;
  lastCombat: CombatResult | null;
  winner: PlayerId | null;
  troopsToPlace: number;
  difficulty: Difficulty;
  numPlayers: number;
  setupTroopsLeft: number[]; // per player index
  fortifyFrom: TerritoryId | null;
  message: string;
  attackDiceCount: number;
  showDice: boolean;
}

export interface GameConfig {
  numPlayers: number;
  difficulty: Difficulty;
  playerName: string;
}

export interface ContinentDef {
  name: string;
  bonus: number;
  color: string;
  territories: TerritoryId[];
}
