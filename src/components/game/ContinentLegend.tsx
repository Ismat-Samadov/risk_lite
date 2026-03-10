// Compact continent bonus legend

'use client';

import type { GameState } from '@/types/game';
import { CONTINENTS } from '@/lib/mapData';

interface ContinentLegendProps {
  state: GameState;
}

const CONTINENT_COLORS: Record<string, string> = {
  'North America': '#00b4ff',
  'South America': '#00e664',
  Europe: '#b464ff',
  Africa: '#ffa000',
  Asia: '#ff3250',
  Oceania: '#ffe600',
};

export function ContinentLegend({ state }: ContinentLegendProps) {
  const { territories, players } = state;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
        Continents
      </p>
      <div className="space-y-1.5">
        {CONTINENTS.map((c) => {
          const controlledBy = players.find((p) =>
            c.territories.every((tid) => territories[tid]?.owner === p.id)
          );
          return (
            <div key={c.name} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: CONTINENT_COLORS[c.name] }}
              />
              <span className="text-xs text-white/60 flex-1 truncate">{c.name}</span>
              <span className="text-xs text-white/40 font-mono">+{c.bonus}</span>
              {controlledBy && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: controlledBy.color, boxShadow: `0 0 4px ${controlledBy.glowColor}` }}
                  title={controlledBy.name}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
