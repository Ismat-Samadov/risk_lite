// Central game state management hook

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameConfig, GameState, PlayerId, TerritoryId } from '@/types/game';
import { TERRITORIES } from '@/lib/mapData';
import {
  calculateReinforcements,
  canAttack,
  canFortify,
  checkWinner,
  distributeInitialTerritories,
  getEliminatedPlayers,
  nextActivePlayers,
  resolveCombat,
} from '@/lib/gameEngine';
import {
  aiChooseAttack,
  aiChooseDiceCount,
  aiChooseFortify,
  aiChoosePlacement,
} from '@/lib/aiPlayer';
import { INITIAL_TROOPS, PLAYER_COLORS, AI_NAMES } from '@/lib/constants';

const AI_DELAY_MS = 700; // ms between AI actions

// ─── Initial state factory ────────────────────────────────────────────────

function buildInitialState(config: GameConfig): GameState {
  const { numPlayers, difficulty, playerName } = config;
  const initialTroops = INITIAL_TROOPS[numPlayers] ?? 30;

  const players = Array.from({ length: numPlayers }, (_, i) => ({
    id: i as PlayerId,
    name: i === 0 ? playerName : AI_NAMES[i - 1],
    color: PLAYER_COLORS[i].bg,
    glowColor: PLAYER_COLORS[i].glow,
    isAI: i !== 0,
    difficulty,
    eliminated: false,
  }));

  const emptyTerritories = Object.fromEntries(
    TERRITORIES.map((t) => [t.id, { owner: null as PlayerId | null, troops: 0 }])
  );

  const partialState: GameState = {
    status: 'playing',
    phase: 'setup',
    currentPlayer: 0,
    players,
    territories: emptyTerritories,
    round: 1,
    selectedTerritory: null,
    attackingFrom: null,
    lastCombat: null,
    winner: null,
    troopsToPlace: 0,
    difficulty,
    numPlayers,
    setupTroopsLeft: Array(numPlayers).fill(0),
    fortifyFrom: null,
    message: 'Setting up the board…',
    attackDiceCount: 3,
    showDice: false,
  };

  // Distribute territories
  const territories = distributeInitialTerritories(partialState);

  // Each player starts with (initialTroops - territoriesOwned) left to place
  const setupTroopsLeft = players.map((p) => {
    const owned = Object.values(territories).filter((t) => t.owner === p.id).length;
    return initialTroops - owned;
  });

  return {
    ...partialState,
    territories,
    setupTroopsLeft,
    phase: 'setup',
    troopsToPlace: setupTroopsLeft[0],
    message: setupTroopsLeft[0] > 0 ? 'Place your troops on the map' : '',
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Public actions ──────────────────────────────────────────────────────

  const startGame = useCallback((config: GameConfig) => {
    setState(buildInitialState(config));
  }, []);

  const resetGame = useCallback(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setState(null);
  }, []);

  const pauseGame = useCallback(() => {
    setState((prev) =>
      prev ? { ...prev, status: prev.status === 'paused' ? 'playing' : 'paused' } : prev
    );
  }, []);

  /** Player clicks a territory */
  const selectTerritory = useCallback((tid: TerritoryId) => {
    setState((prev) => {
      if (!prev || prev.status !== 'playing') return prev;
      if (prev.currentPlayer !== 0) return prev; // block human interaction during AI

      const ts = prev.territories[tid];
      if (!ts) return prev;

      // ── Setup phase ────────────────────────────────────────────────────
      if (prev.phase === 'setup') {
        if (ts.owner !== prev.currentPlayer || prev.troopsToPlace <= 0) return prev;
        return applySetupPlacement(prev, tid);
      }

      // ── Place phase ────────────────────────────────────────────────────
      if (prev.phase === 'place') {
        if (ts.owner !== prev.currentPlayer || prev.troopsToPlace <= 0) return prev;
        const newTerritories = { ...prev.territories };
        newTerritories[tid] = { ...ts, troops: ts.troops + 1 };
        const remaining = prev.troopsToPlace - 1;
        return {
          ...prev,
          territories: newTerritories,
          troopsToPlace: remaining,
          message:
            remaining > 0
              ? `Place ${remaining} more troop${remaining !== 1 ? 's' : ''}`
              : 'Now attack or end your turn',
          phase: remaining === 0 ? 'attack' : 'place',
        };
      }

      // ── Attack phase ───────────────────────────────────────────────────
      if (prev.phase === 'attack') {
        // If no attacker chosen yet
        if (!prev.attackingFrom) {
          if (ts.owner !== prev.currentPlayer || ts.troops < 2) return prev;
          return {
            ...prev,
            attackingFrom: tid,
            selectedTerritory: tid,
            message: 'Select an enemy territory to attack',
          };
        }

        // Deselect if clicking the same territory
        if (prev.attackingFrom === tid) {
          return {
            ...prev,
            attackingFrom: null,
            selectedTerritory: null,
            message: 'Select your territory to attack from',
          };
        }

        // Attack!
        if (canAttack(prev, prev.attackingFrom, tid)) {
          return executeAttack(prev, prev.attackingFrom, tid);
        }

        // Switch attacker to a different own territory
        if (ts.owner === prev.currentPlayer && ts.troops >= 2) {
          return {
            ...prev,
            attackingFrom: tid,
            selectedTerritory: tid,
            message: 'Select an enemy territory to attack',
          };
        }

        return prev;
      }

      // ── Fortify phase ──────────────────────────────────────────────────
      if (prev.phase === 'fortify') {
        if (!prev.fortifyFrom) {
          if (ts.owner !== prev.currentPlayer || ts.troops < 2) return prev;
          return {
            ...prev,
            fortifyFrom: tid,
            selectedTerritory: tid,
            message: 'Select a friendly territory to move troops to',
          };
        }
        if (prev.fortifyFrom === tid) {
          return {
            ...prev,
            fortifyFrom: null,
            selectedTerritory: null,
            message: 'Select a territory to move troops from',
          };
        }
        if (canFortify(prev, prev.fortifyFrom, tid)) {
          return executeFortify(prev, prev.fortifyFrom, tid);
        }
        // Switch fortify source
        if (ts.owner === prev.currentPlayer && ts.troops > 1) {
          return { ...prev, fortifyFrom: tid, selectedTerritory: tid };
        }
      }

      return prev;
    });
  }, []);

  const endAttackPhase = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.phase !== 'attack') return prev;
      return {
        ...prev,
        phase: 'fortify',
        attackingFrom: null,
        selectedTerritory: null,
        message: 'Move troops to fortify, or end your turn',
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      if (prev.phase !== 'attack' && prev.phase !== 'fortify') return prev;
      return advanceTurn(prev);
    });
  }, []);

  const setAttackDice = useCallback((count: number) => {
    setState((prev) => (prev ? { ...prev, attackDiceCount: count } : prev));
  }, []);

  const dismissDice = useCallback(() => {
    setState((prev) => (prev ? { ...prev, showDice: false } : prev));
  }, []);

  // ── AI turn runner ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!state) return;
    if (state.status !== 'playing') return;
    if (state.phase === 'end') return;

    const currentPlayer = state.players[state.currentPlayer];
    if (!currentPlayer?.isAI) return;

    const difficulty = currentPlayer.difficulty ?? 'easy';

    const run = () => {
      setState((prev) => {
        if (!prev || prev.status !== 'playing') return prev;
        if (!prev.players[prev.currentPlayer]?.isAI) return prev;

        // ── AI: Setup ────────────────────────────────────────────────────
        // Place ALL consecutive AI setup troops in one state update so setup
        // doesn't take 30+ seconds at 700 ms per troop.
        if (prev.phase === 'setup') {
          let s = prev;
          while (
            s.phase === 'setup' &&
            s.players[s.currentPlayer]?.isAI &&
            s.setupTroopsLeft[s.currentPlayer] > 0
          ) {
            const tid = aiChoosePlacement(s, s.players[s.currentPlayer].difficulty ?? difficulty);
            s = applySetupPlacement(s, tid);
          }
          return s;
        }

        // ── AI: Place ────────────────────────────────────────────────────
        if (prev.phase === 'place') {
          if (prev.troopsToPlace <= 0) {
            return { ...prev, phase: 'attack', message: 'AI is planning attacks…' };
          }
          const tid = aiChoosePlacement(prev, difficulty);
          const ts = prev.territories[tid];
          const newTerritories = { ...prev.territories };
          newTerritories[tid] = { ...ts, troops: ts.troops + 1 };
          const remaining = prev.troopsToPlace - 1;
          return {
            ...prev,
            territories: newTerritories,
            troopsToPlace: remaining,
            phase: remaining === 0 ? 'attack' : 'place',
          };
        }

        // ── AI: Attack ───────────────────────────────────────────────────
        if (prev.phase === 'attack') {
          const attack = aiChooseAttack(prev, difficulty);
          if (!attack) {
            return { ...prev, phase: 'fortify' };
          }
          const diceCount = aiChooseDiceCount(prev, attack.from, difficulty);
          return executeAttack(prev, attack.from, attack.to, diceCount);
        }

        // ── AI: Fortify ───────────────────────────────────────────────────
        if (prev.phase === 'fortify') {
          const fortify = aiChooseFortify(prev, difficulty);
          if (!fortify) return advanceTurn(prev);
          return executeFortify(prev, fortify.from, fortify.to, fortify.troops);
        }

        return prev;
      });
    };

    aiTimerRef.current = setTimeout(run, AI_DELAY_MS);
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [state]);

  return {
    state,
    startGame,
    resetGame,
    pauseGame,
    selectTerritory,
    endAttackPhase,
    endTurn,
    setAttackDice,
    dismissDice,
  };
}

// ─── Pure state helpers ────────────────────────────────────────────────────

function applySetupPlacement(prev: GameState, tid: TerritoryId): GameState {
  const ts = prev.territories[tid];
  const newTerritories = {
    ...prev.territories,
    [tid]: { ...ts, troops: ts.troops + 1 },
  };
  const newSetupLeft = [...prev.setupTroopsLeft];
  newSetupLeft[prev.currentPlayer] = newSetupLeft[prev.currentPlayer] - 1;

  // Check if all setup done
  const allDone = newSetupLeft.every((n) => n <= 0);
  if (allDone) {
    const next = nextActivePlayers({ ...prev, territories: newTerritories }, prev.currentPlayer);
    const reinforcements = calculateReinforcements(
      { ...prev, territories: newTerritories },
      next === 0 ? 0 : next
    );
    return {
      ...prev,
      territories: newTerritories,
      setupTroopsLeft: newSetupLeft,
      phase: 'place',
      currentPlayer: 0,
      round: 1,
      troopsToPlace: calculateReinforcements({ ...prev, territories: newTerritories }, 0),
      message: `Your turn! Place ${calculateReinforcements({ ...prev, territories: newTerritories }, 0)} troops`,
    };
  }

  return advanceSetupTurn({ ...prev, territories: newTerritories, setupTroopsLeft: newSetupLeft });
}

function advanceSetupTurn(prev: GameState): GameState {
  const nextId = nextActivePlayers(prev, prev.currentPlayer);
  const troopsLeft = prev.setupTroopsLeft[nextId];
  return {
    ...prev,
    currentPlayer: nextId,
    troopsToPlace: troopsLeft,
    selectedTerritory: null,
    message:
      prev.players[nextId]?.isAI
        ? `${prev.players[nextId].name} is placing troops…`
        : `Place ${troopsLeft} troop${troopsLeft !== 1 ? 's' : ''} on the map`,
  };
}

function executeAttack(
  prev: GameState,
  fromId: TerritoryId,
  toId: TerritoryId,
  diceCount?: number
): GameState {
  const from = prev.territories[fromId];
  const to = prev.territories[toId];

  const combat = resolveCombat(from.troops, to.troops, diceCount ?? prev.attackDiceCount);

  const newFrom = { ...from, troops: from.troops - combat.attackerLosses };
  let newTo = { ...to, troops: to.troops - combat.defenderLosses };

  let newPlayers = prev.players;
  let winner: PlayerId | null = null;
  let message = '';

  if (combat.conquered) {
    // newFrom.troops already has attackerLosses subtracted above.
    // Move the number of dice used into the conquered territory (minimum 1),
    // but keep at least 1 troop in the source so it never empties.
    const remaining = newFrom.troops; // = from.troops - attackerLosses
    const diceUsed = diceCount ?? prev.attackDiceCount;
    const moved = Math.max(1, Math.min(diceUsed, Math.max(1, remaining - 1)));
    newFrom.troops = Math.max(1, remaining - moved);
    // Use the actual difference so troops are perfectly conserved.
    newTo = { owner: prev.currentPlayer, troops: remaining - newFrom.troops };
    message = `Conquered! ${prev.players[prev.currentPlayer].name} took the territory!`;
  } else {
    message = `Battle: attacker lost ${combat.attackerLosses}, defender lost ${combat.defenderLosses}`;
  }

  const newTerritories = {
    ...prev.territories,
    [fromId]: newFrom,
    [toId]: newTo,
  };

  const tempState = { ...prev, territories: newTerritories };

  // Check eliminations
  const eliminated = getEliminatedPlayers(tempState);
  if (eliminated.length > 0) {
    newPlayers = prev.players.map((p) =>
      eliminated.includes(p.id) ? { ...p, eliminated: true } : p
    );
  }

  const finalState = { ...tempState, players: newPlayers };
  winner = checkWinner(finalState);

  return {
    ...finalState,
    attackingFrom: combat.conquered ? null : fromId,
    selectedTerritory: combat.conquered ? null : fromId,
    lastCombat: combat,
    showDice: true,
    winner,
    phase: winner !== null ? 'end' : prev.phase,
    status: winner !== null ? 'ended' : prev.status,
    message: winner !== null ? `${prev.players[winner].name} wins the world!` : message,
  };
}

function executeFortify(
  prev: GameState,
  fromId: TerritoryId,
  toId: TerritoryId,
  troops?: number
): GameState {
  const from = prev.territories[fromId];
  const to = prev.territories[toId];
  const moveTroops = troops ?? from.troops - 1;
  const newTerritories = {
    ...prev.territories,
    [fromId]: { ...from, troops: from.troops - moveTroops },
    [toId]: { ...to, troops: to.troops + moveTroops },
  };
  return advanceTurn({
    ...prev,
    territories: newTerritories,
    fortifyFrom: null,
    selectedTerritory: null,
  });
}

function advanceTurn(prev: GameState): GameState {
  const nextId = nextActivePlayers(prev, prev.currentPlayer);
  const isNewRound = nextId <= prev.currentPlayer;
  const reinforcements = calculateReinforcements(prev, nextId);

  return {
    ...prev,
    currentPlayer: nextId,
    phase: 'place',
    round: isNewRound ? prev.round + 1 : prev.round,
    troopsToPlace: reinforcements,
    attackingFrom: null,
    fortifyFrom: null,
    selectedTerritory: null,
    lastCombat: null,
    showDice: false,
    message: prev.players[nextId]?.isAI
      ? `${prev.players[nextId].name} is taking their turn…`
      : `Your turn! Place ${reinforcements} troop${reinforcements !== 1 ? 's' : ''}`,
  };
}
