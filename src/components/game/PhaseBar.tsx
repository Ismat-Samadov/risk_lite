// Phase indicator + action buttons for the current turn

'use client';

import { motion } from 'framer-motion';
import type { GameState } from '@/types/game';
import { Button } from '@/components/ui/Button';

interface PhaseBarProps {
  state: GameState;
  onEndAttack: () => void;
  onEndTurn: () => void;
  onPause: () => void;
}

const PHASE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  setup: { label: 'Setup', color: 'text-yellow-400', icon: '🏗️' },
  place: { label: 'Deploy', color: 'text-cyan-400', icon: '🪖' },
  attack: { label: 'Attack', color: 'text-red-400', icon: '⚔️' },
  fortify: { label: 'Fortify', color: 'text-green-400', icon: '🛡️' },
  end: { label: 'Game Over', color: 'text-yellow-400', icon: '🏆' },
};

export function PhaseBar({ state, onEndAttack, onEndTurn, onPause }: PhaseBarProps) {
  const { phase, currentPlayer, players, troopsToPlace, round, message, status } = state;
  const phaseInfo = PHASE_LABELS[phase] ?? PHASE_LABELS.place;
  const isHumanTurn = !players[currentPlayer]?.isAI;
  const isPaused = status === 'paused';

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      {/* Round */}
      <div className="text-xs text-white/40 font-mono">
        Round <span className="text-white/70 font-bold">{round}</span>
      </div>

      <div className="w-px h-4 bg-white/10 hidden sm:block" />

      {/* Phase badge */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-1.5 text-sm font-bold ${phaseInfo.color}`}
      >
        <span>{phaseInfo.icon}</span>
        <span>{phaseInfo.label}</span>
      </motion.div>

      {/* Troops to place */}
      {phase === 'place' && troopsToPlace > 0 && isHumanTurn && (
        <div className="text-xs text-cyan-300 font-semibold">
          +{troopsToPlace} remaining
        </div>
      )}

      {/* Message */}
      <motion.p
        key={message}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 text-xs text-white/50 truncate min-w-0 hidden md:block"
      >
        {message}
      </motion.p>

      {/* Action buttons */}
      <div className="flex gap-2 ml-auto">
        {isHumanTurn && phase === 'attack' && (
          <Button onClick={onEndAttack} size="sm" variant="secondary">
            Skip Attack
          </Button>
        )}
        {isHumanTurn && (phase === 'attack' || phase === 'fortify') && (
          <Button onClick={onEndTurn} size="sm" variant="primary">
            End Turn →
          </Button>
        )}
        <Button onClick={onPause} size="sm" variant="ghost">
          {isPaused ? '▶' : '⏸'}
        </Button>
      </div>
    </div>
  );
}
