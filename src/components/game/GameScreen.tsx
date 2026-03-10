// Main game screen – assembles all game components

'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GameState, TerritoryId } from '@/types/game';
import { GameMap } from './GameMap';
import { PhaseBar } from './PhaseBar';
import { PlayerPanel } from './PlayerPanel';
import { DiceRoll } from './DiceRoll';
import { EndScreen } from './EndScreen';
import { ContinentLegend } from './ContinentLegend';
import { Button } from '@/components/ui/Button';
import { useSounds } from '@/hooks/useSounds';
import { TERRITORY_MAP } from '@/lib/mapData';

interface GameScreenProps {
  state: GameState;
  onSelectTerritory: (id: TerritoryId) => void;
  onEndAttack: () => void;
  onEndTurn: () => void;
  onPause: () => void;
  onRestart: () => void;
  onDismissDice: () => void;
}

const HIGH_SCORE_KEY = 'risklite_highscore';

function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(HIGH_SCORE_KEY) ?? '0', 10);
}
function saveHighScore(territories: number) {
  if (typeof window === 'undefined') return;
  const current = getHighScore();
  if (territories > current) localStorage.setItem(HIGH_SCORE_KEY, String(territories));
}

export function GameScreen({
  state,
  onSelectTerritory,
  onEndAttack,
  onEndTurn,
  onPause,
  onRestart,
  onDismissDice,
}: GameScreenProps) {
  const { play, soundEnabled, toggleSound } = useSounds();
  const [highScore, setHighScore] = useState(0);
  const [prevPhase, setPrevPhase] = useState(state.phase);
  const [prevCombat, setPrevCombat] = useState(state.lastCombat);

  // Load high score
  useEffect(() => {
    setHighScore(getHighScore());
  }, []);

  // Sound effects on state changes
  useEffect(() => {
    if (state.lastCombat !== prevCombat && state.lastCombat) {
      play('dice');
      if (state.lastCombat.conquered) play('conquer');
      else play('attack');
      setPrevCombat(state.lastCombat);
    }
  }, [state.lastCombat, prevCombat, play]);

  useEffect(() => {
    if (state.phase !== prevPhase) {
      if (state.phase === 'place') play('click');
      setPrevPhase(state.phase);
    }
  }, [state.phase, prevPhase, play]);

  // Save high score on game end
  useEffect(() => {
    if (state.status === 'ended') {
      const owned = Object.values(state.territories).filter((t) => t.owner === 0).length;
      saveHighScore(owned);
      setHighScore(getHighScore());
      if (state.winner === 0) play('win');
      else play('lose');
    }
  }, [state.status, state.winner, state.territories, play]);

  const isPaused = state.status === 'paused';
  const currentPlayerData = state.players[state.currentPlayer];

  // Determine attacker/defender names for dice popup
  const attackerName = currentPlayerData?.name ?? 'Attacker';
  const defenderName = state.attackingFrom
    ? (state.players[
        state.territories[
          TERRITORY_MAP[state.attackingFrom]?.adjacencies.find(
            (adj) => state.territories[adj]?.owner !== state.currentPlayer
          ) ?? ''
        ]?.owner ?? -1
      ]?.name ?? 'Defender')
    : 'Defender';

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,245,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <h1 className="text-sm font-black tracking-tight text-white">
            RISK <span className="text-cyan-400">LITE</span>
          </h1>
        </div>

        <div className="flex-1" />

        {/* Sound toggle */}
        <button
          onClick={() => { toggleSound(); play('click'); }}
          className="text-lg hover:scale-110 transition-transform"
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* High score */}
        <div className="text-xs text-white/40 hidden sm:block">
          🏅 Best: <span className="text-yellow-400 font-bold">{highScore}</span>
        </div>

        <Button onClick={onRestart} size="sm" variant="ghost">
          ✕ Menu
        </Button>
      </header>

      {/* Phase bar */}
      <div className="relative z-10 px-3 pt-2">
        <PhaseBar
          state={state}
          onEndAttack={onEndAttack}
          onEndTurn={onEndTurn}
          onPause={onPause}
        />
      </div>

      {/* Mobile message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.message}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="px-3 py-1 text-xs text-white/50 md:hidden"
        >
          {state.message}
        </motion.div>
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 min-h-0 overflow-hidden relative z-10">
        {/* Map area */}
        <div className="flex-1 rounded-2xl border border-white/8 bg-slate-900/50 overflow-hidden relative min-h-0">
          <div className="h-full overflow-auto p-2">
            <GameMap state={state} onSelectTerritory={onSelectTerritory} />
          </div>

          {/* Pause overlay */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">⏸</div>
                  <h2 className="text-2xl font-black text-white mb-4">Paused</h2>
                  <Button onClick={onPause} size="lg">
                    ▶ Resume
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dice popup (floating over map) */}
          <AnimatePresence>
            {state.showDice && state.lastCombat && (
              <div className="absolute bottom-4 right-4 z-30">
                <DiceRoll
                  combat={state.lastCombat}
                  attackerName={attackerName}
                  defenderName={defenderName}
                  onClose={onDismissDice}
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-56 flex flex-col gap-3">
          {/* Current turn indicator */}
          <div
            className="rounded-xl border p-3 text-center"
            style={{
              borderColor: currentPlayerData?.color + '40',
              background: currentPlayerData?.color + '0d',
            }}
          >
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Current Turn</p>
            <p
              className="font-bold text-sm truncate"
              style={{ color: currentPlayerData?.color }}
            >
              {currentPlayerData?.name}
            </p>
            {currentPlayerData?.isAI && (
              <p className="text-xs text-white/30 mt-0.5">AI is thinking…</p>
            )}
          </div>

          <PlayerPanel state={state} />
          <ContinentLegend state={state} />

          {/* Mobile action buttons */}
          <div className="flex gap-2 lg:hidden">
            {!state.players[state.currentPlayer]?.isAI && state.phase === 'attack' && (
              <Button onClick={onEndAttack} size="sm" variant="secondary" className="flex-1">
                Skip Attack
              </Button>
            )}
            {!state.players[state.currentPlayer]?.isAI &&
              (state.phase === 'attack' || state.phase === 'fortify') && (
                <Button onClick={onEndTurn} size="sm" variant="primary" className="flex-1">
                  End Turn
                </Button>
              )}
          </div>
        </aside>
      </div>

      {/* End screen */}
      <AnimatePresence>
        {state.status === 'ended' && (
          <EndScreen state={state} onRestart={onRestart} highScore={highScore} />
        )}
      </AnimatePresence>
    </div>
  );
}
