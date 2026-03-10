// Core game logic: combat, reinforcements, win detection

import type { GameState, TerritoryId, PlayerId, CombatResult } from '@/types/game';
import { TERRITORIES, CONTINENTS } from './mapData';
import {
  MAX_ATTACK_DICE,
  MAX_DEFEND_DICE,
  TROOPS_PER_TERRITORIES,
  MIN_REINFORCEMENTS,
  MIN_ATTACK_TROOPS,
} from './constants';

// ─── Dice ─────────────────────────────────────────────────────────────────

export function rollDice(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
}

// ─── Combat ───────────────────────────────────────────────────────────────

/**
 * Resolve one round of combat.
 * Attacker may use up to min(attackTroops-1, MAX_ATTACK_DICE) dice.
 * Defender uses min(defenderTroops, MAX_DEFEND_DICE) dice.
 */
export function resolveCombat(
  attackerTroops: number,
  defenderTroops: number,
  attackDiceCount?: number
): CombatResult {
  const maxAttackDice = Math.min(attackerTroops - 1, MAX_ATTACK_DICE);
  const numAttack = Math.max(1, Math.min(attackDiceCount ?? maxAttackDice, maxAttackDice));
  const numDefend = Math.min(defenderTroops, MAX_DEFEND_DICE);

  const attackerDice = rollDice(numAttack).sort((a, b) => b - a);
  const defenderDice = rollDice(numDefend).sort((a, b) => b - a);

  const comparisons = Math.min(numAttack, numDefend);
  let attackerLosses = 0;
  let defenderLosses = 0;

  for (let i = 0; i < comparisons; i++) {
    if (attackerDice[i] > defenderDice[i]) {
      defenderLosses++;
    } else {
      attackerLosses++;
    }
  }

  return {
    attackerDice,
    defenderDice,
    attackerLosses,
    defenderLosses,
    conquered: defenderTroops - defenderLosses <= 0,
  };
}

// ─── Reinforcements ───────────────────────────────────────────────────────

/**
 * Calculate how many troops a player receives at the start of their turn.
 */
export function calculateReinforcements(
  state: GameState,
  playerId: PlayerId
): number {
  const owned = Object.values(state.territories).filter(
    (t) => t.owner === playerId
  ).length;

  let troops = Math.max(MIN_REINFORCEMENTS, Math.floor(owned / TROOPS_PER_TERRITORIES));

  // Continent bonuses
  for (const continent of CONTINENTS) {
    const allOwned = continent.territories.every(
      (tid) => state.territories[tid]?.owner === playerId
    );
    if (allOwned) troops += continent.bonus;
  }

  return troops;
}

// ─── Win / elimination detection ─────────────────────────────────────────

export function getEliminatedPlayers(state: GameState): PlayerId[] {
  return state.players
    .filter((p) => !p.eliminated)
    .filter((p) =>
      !Object.values(state.territories).some((t) => t.owner === p.id)
    )
    .map((p) => p.id);
}

export function checkWinner(state: GameState): PlayerId | null {
  const activePlayers = state.players.filter((p) => !p.eliminated);
  if (activePlayers.length === 1) return activePlayers[0].id;

  // A single player owns all territories
  const owners = new Set(
    Object.values(state.territories).map((t) => t.owner)
  );
  if (owners.size === 1) {
    const [sole] = owners;
    return sole;
  }

  return null;
}

// ─── Setup ────────────────────────────────────────────────────────────────

/**
 * Randomly distribute territories among players at game start.
 */
export function distributeInitialTerritories(
  state: GameState
): GameState['territories'] {
  const ids = TERRITORIES.map((t) => t.id);
  // Fisher-Yates shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  const territories: GameState['territories'] = {};
  ids.forEach((id, idx) => {
    territories[id] = {
      owner: idx % state.numPlayers,
      troops: 1,
    };
  });
  return territories;
}

// ─── Next player ──────────────────────────────────────────────────────────

export function nextActivePlayers(state: GameState, current: PlayerId): PlayerId {
  const active = state.players.filter((p) => !p.eliminated);
  const idx = active.findIndex((p) => p.id === current);
  return active[(idx + 1) % active.length].id;
}

// ─── Continent ownership helpers ─────────────────────────────────────────

export function getPlayerContinents(
  state: GameState,
  playerId: PlayerId
): string[] {
  return CONTINENTS.filter((c) =>
    c.territories.every((tid) => state.territories[tid]?.owner === playerId)
  ).map((c) => c.name);
}

export function getPlayerTerritories(
  state: GameState,
  playerId: PlayerId
): TerritoryId[] {
  return Object.entries(state.territories)
    .filter(([, ts]) => ts.owner === playerId)
    .map(([id]) => id);
}

export function canAttack(
  state: GameState,
  fromId: TerritoryId,
  toId: TerritoryId
): boolean {
  const from = state.territories[fromId];
  const to = state.territories[toId];
  const fromDef = TERRITORIES.find((t) => t.id === fromId);
  if (!from || !to || !fromDef) return false;
  return (
    from.owner === state.currentPlayer &&
    to.owner !== state.currentPlayer &&
    from.troops >= MIN_ATTACK_TROOPS &&
    fromDef.adjacencies.includes(toId)
  );
}

export function canFortify(
  state: GameState,
  fromId: TerritoryId,
  toId: TerritoryId
): boolean {
  const from = state.territories[fromId];
  const to = state.territories[toId];
  const fromDef = TERRITORIES.find((t) => t.id === fromId);
  if (!from || !to || !fromDef) return false;
  return (
    from.owner === state.currentPlayer &&
    to.owner === state.currentPlayer &&
    from.troops > 1 &&
    fromDef.adjacencies.includes(toId)
  );
}

/** BFS to check if two friendly territories are connected */
export function areConnected(
  state: GameState,
  startId: TerritoryId,
  endId: TerritoryId,
  playerId: PlayerId
): boolean {
  if (startId === endId) return false;
  const visited = new Set<TerritoryId>();
  const queue = [startId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === endId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const def = TERRITORIES.find((t) => t.id === current);
    if (!def) continue;
    for (const adj of def.adjacencies) {
      if (!visited.has(adj) && state.territories[adj]?.owner === playerId) {
        queue.push(adj);
      }
    }
  }
  return false;
}
