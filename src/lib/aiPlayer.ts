// AI decision-making for Risk Lite
// Two tiers: 'easy' (mostly random) and 'hard' (strategic)

import type { GameState, TerritoryId, PlayerId, Difficulty } from '@/types/game';
import { TERRITORIES, CONTINENTS } from './mapData';
import {
  canAttack,
  getPlayerTerritories,
} from './gameEngine';
import { MIN_ATTACK_TROOPS } from './constants';

// ─── Helpers ──────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Get enemy territories adjacent to a given territory */
function enemyNeighbors(state: GameState, tid: TerritoryId): TerritoryId[] {
  const def = TERRITORIES.find((t) => t.id === tid);
  if (!def) return [];
  return def.adjacencies.filter(
    (adj) => state.territories[adj]?.owner !== state.currentPlayer
  );
}

/** Get friendly territories adjacent to a given territory */
function friendlyNeighbors(state: GameState, tid: TerritoryId): TerritoryId[] {
  const def = TERRITORIES.find((t) => t.id === tid);
  if (!def) return [];
  return def.adjacencies.filter(
    (adj) => state.territories[adj]?.owner === state.currentPlayer
  );
}

/** Score a territory for strategic importance (used in hard mode) */
function territoryScore(state: GameState, tid: TerritoryId): number {
  let score = 0;
  const ts = state.territories[tid];
  if (!ts) return 0;

  // Bonus for being in a continent we're close to completing
  for (const cont of CONTINENTS) {
    if (!cont.territories.includes(tid)) continue;
    const owned = cont.territories.filter(
      (t) => state.territories[t]?.owner === state.currentPlayer
    ).length;
    const fraction = owned / cont.territories.length;
    score += fraction * cont.bonus * 3;
  }

  // Bonus for having many enemy neighbors (chokepoint)
  score += enemyNeighbors(state, tid).length;

  return score;
}

// ─── Placement ────────────────────────────────────────────────────────────

/**
 * Decide where to place one troop.
 * Returns the territory ID to reinforce.
 */
export function aiChoosePlacement(
  state: GameState,
  difficulty: Difficulty
): TerritoryId {
  const myTerritories = getPlayerTerritories(state, state.currentPlayer);

  if (difficulty === 'easy') {
    // Random border territory, or just random territory
    const borders = myTerritories.filter(
      (tid) => enemyNeighbors(state, tid).length > 0
    );
    const pool = borders.length > 0 ? borders : myTerritories;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Hard: reinforce the most threatened border territory in a strategic continent
  const scored = myTerritories
    .filter((tid) => enemyNeighbors(state, tid).length > 0)
    .map((tid) => ({
      id: tid,
      score: territoryScore(state, tid) - state.territories[tid].troops * 0.5,
    }))
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) return scored[0].id;
  return myTerritories[Math.floor(Math.random() * myTerritories.length)];
}

// ─── Attack decisions ─────────────────────────────────────────────────────

export interface AIAttack {
  from: TerritoryId;
  to: TerritoryId;
}

/**
 * Decide whether and where to attack this turn.
 * Returns null if the AI decides not to attack.
 */
export function aiChooseAttack(
  state: GameState,
  difficulty: Difficulty
): AIAttack | null {
  const myTerritories = getPlayerTerritories(state, state.currentPlayer);

  const validAttacks: AIAttack[] = [];
  for (const from of myTerritories) {
    const ts = state.territories[from];
    if (ts.troops < MIN_ATTACK_TROOPS) continue;
    for (const to of enemyNeighbors(state, from)) {
      if (canAttack(state, from, to)) {
        validAttacks.push({ from, to });
      }
    }
  }

  if (validAttacks.length === 0) return null;

  if (difficulty === 'easy') {
    // Attack 40% of the time when possible; pick random target
    if (Math.random() > 0.4) return null;
    return validAttacks[Math.floor(Math.random() * validAttacks.length)];
  }

  // Hard: attack when we have a clear advantage
  const advantageous = validAttacks.filter(({ from, to }) => {
    const myTroops = state.territories[from].troops;
    const theirTroops = state.territories[to].troops;
    return myTroops > theirTroops * 1.5;
  });

  // Prefer completing a continent
  const continentTargets = advantageous.filter(({ to }) => {
    return CONTINENTS.some((c) => {
      if (!c.territories.includes(to)) return false;
      const ownedByMe = c.territories.filter(
        (t) => state.territories[t]?.owner === state.currentPlayer
      ).length;
      return ownedByMe >= c.territories.length - 2;
    });
  });

  const pool =
    continentTargets.length > 0
      ? continentTargets
      : advantageous.length > 0
      ? advantageous
      : null;

  if (!pool) return null;

  // Pick the attack with best ratio
  pool.sort((a, b) => {
    const ratioA =
      state.territories[a.from].troops / (state.territories[a.to].troops + 1);
    const ratioB =
      state.territories[b.from].troops / (state.territories[b.to].troops + 1);
    return ratioB - ratioA;
  });

  return pool[0];
}

// ─── Fortify ──────────────────────────────────────────────────────────────

export interface AIFortify {
  from: TerritoryId;
  to: TerritoryId;
  troops: number;
}

/**
 * Decide whether and how to fortify.
 */
export function aiChooseFortify(
  state: GameState,
  difficulty: Difficulty
): AIFortify | null {
  const myTerritories = getPlayerTerritories(state, state.currentPlayer);

  if (difficulty === 'easy') {
    if (Math.random() > 0.3) return null;
    const withExtras = myTerritories.filter(
      (tid) =>
        state.territories[tid].troops > 2 &&
        friendlyNeighbors(state, tid).length > 0
    );
    if (withExtras.length === 0) return null;
    const from = withExtras[Math.floor(Math.random() * withExtras.length)];
    const neighbors = friendlyNeighbors(state, from);
    const to = neighbors[Math.floor(Math.random() * neighbors.length)];
    const troops = Math.floor((state.territories[from].troops - 1) / 2);
    return troops > 0 ? { from, to, troops } : null;
  }

  // Hard: move excess troops from safe interior to dangerous borders
  const safeTerritories = myTerritories.filter(
    (tid) =>
      enemyNeighbors(state, tid).length === 0 &&
      state.territories[tid].troops > 1 &&
      friendlyNeighbors(state, tid).length > 0
  );

  const dangerBorders = myTerritories
    .filter((tid) => enemyNeighbors(state, tid).length > 0)
    .sort(
      (a, b) =>
        enemyNeighbors(state, b).length - enemyNeighbors(state, a).length
    );

  for (const from of safeTerritories) {
    for (const to of dangerBorders) {
      const def = TERRITORIES.find((t) => t.id === from);
      if (!def?.adjacencies.includes(to)) continue;
      const troops = state.territories[from].troops - 1;
      if (troops > 0) return { from, to, troops };
    }
  }

  return null;
}

// ─── Dice count choice ────────────────────────────────────────────────────

export function aiChooseDiceCount(
  state: GameState,
  fromId: TerritoryId,
  difficulty: Difficulty
): number {
  const from = state.territories[fromId];
  if (!from) return 1;
  const max = Math.min(from.troops - 1, 3);
  if (difficulty === 'easy') {
    return Math.max(1, Math.floor(Math.random() * max) + 1);
  }
  // Hard: always use max dice
  return max;
}
