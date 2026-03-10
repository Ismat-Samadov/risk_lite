// Sidebar panel showing all players' stats

'use client';

import { motion } from 'framer-motion';
import type { GameState } from '@/types/game';
import { CONTINENTS, TERRITORIES } from '@/lib/mapData';

interface PlayerPanelProps {
  state: GameState;
}

export function PlayerPanel({ state }: PlayerPanelProps) {
  const { players, territories, currentPlayer } = state;

  return (
    <div className="flex flex-col gap-2">
      {players.map((player) => {
        if (player.eliminated) {
          return (
            <div
              key={player.id}
              className="rounded-xl border border-white/5 bg-white/3 px-3 py-2 opacity-40"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full opacity-50"
                  style={{ background: player.color }}
                />
                <span className="text-white/40 text-xs line-through">{player.name}</span>
                <span className="text-white/25 text-xs ml-auto">Eliminated</span>
              </div>
            </div>
          );
        }

        const owned = Object.values(territories).filter((t) => t.owner === player.id);
        const totalTroops = owned.reduce((s, t) => s + t.troops, 0);
        const ownedContinents = CONTINENTS.filter((c) =>
          c.territories.every((tid) => territories[tid]?.owner === player.id)
        );
        const isActive = player.id === currentPlayer;

        return (
          <motion.div
            key={player.id}
            animate={isActive ? { borderColor: player.glowColor + '80' } : { borderColor: 'rgba(255,255,255,0.06)' }}
            transition={{ duration: 0.4 }}
            className={`rounded-xl border px-3 py-2.5 transition-all duration-300 ${
              isActive
                ? 'bg-white/8'
                : 'bg-white/3'
            }`}
            style={{
              boxShadow: isActive ? `0 0 16px ${player.glowColor}20` : undefined,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {/* Color dot with pulse when active */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: player.color, boxShadow: `0 0 6px ${player.glowColor}80` }}
                />
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: player.color }}
                    animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </div>
              <span
                className="font-semibold text-xs truncate"
                style={{ color: isActive ? player.color : 'rgba(255,255,255,0.7)' }}
              >
                {player.name}
              </span>
              {player.isAI && (
                <span className="text-white/25 text-xs ml-auto">🤖</span>
              )}
              {!player.isAI && (
                <span className="text-white/25 text-xs ml-auto">👤</span>
              )}
            </div>

            <div className="flex gap-3 text-xs text-white/50">
              <span>
                <span style={{ color: player.color }} className="font-bold">{owned.length}</span> terr.
              </span>
              <span>
                <span style={{ color: player.color }} className="font-bold">{totalTroops}</span> troops
              </span>
            </div>

            {ownedContinents.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {ownedContinents.map((c) => (
                  <span
                    key={c.name}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-white/50"
                  >
                    {c.name.split(' ')[0]} +{c.bonus}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
