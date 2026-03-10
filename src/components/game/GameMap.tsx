// SVG-based game board with territory nodes, connections, and continent regions

'use client';

import { motion } from 'framer-motion';
import type { GameState, TerritoryId } from '@/types/game';
import { TERRITORIES, TERRITORY_MAP } from '@/lib/mapData';
import { MAP_WIDTH, MAP_HEIGHT, TERRITORY_RADIUS } from '@/lib/constants';

interface GameMapProps {
  state: GameState;
  onSelectTerritory: (id: TerritoryId) => void;
}

// ── Continent hull polygons (approximate bounding shapes) ──────────────────
// Each continent gets a subtle colored background polygon
const CONTINENT_HULLS: Record<string, string> = {
  'North America': '40,55 215,55 250,200 215,300 130,300 40,300',
  'South America': '205,285 315,285 340,540 180,540',
  Europe: '355,40 570,40 570,270 355,270',
  Africa: '340,270 545,270 545,530 340,530',
  Asia: '555,40 920,40 920,380 685,380 555,380',
  Oceania: '745,360 940,360 940,540 745,540',
};

function getContinentColor(name: string): string {
  const map: Record<string, string> = {
    'North America': 'rgba(0,180,255,0.07)',
    'South America': 'rgba(0,230,100,0.07)',
    Europe: 'rgba(180,100,255,0.07)',
    Africa: 'rgba(255,160,0,0.07)',
    Asia: 'rgba(255,50,80,0.07)',
    Oceania: 'rgba(255,230,0,0.07)',
  };
  return map[name] ?? 'rgba(255,255,255,0.04)';
}

function getContinentStroke(name: string): string {
  const map: Record<string, string> = {
    'North America': 'rgba(0,180,255,0.2)',
    'South America': 'rgba(0,230,100,0.2)',
    Europe: 'rgba(180,100,255,0.2)',
    Africa: 'rgba(255,160,0,0.2)',
    Asia: 'rgba(255,50,80,0.2)',
    Oceania: 'rgba(255,230,0,0.2)',
  };
  return map[name] ?? 'rgba(255,255,255,0.1)';
}

export function GameMap({ state, onSelectTerritory }: GameMapProps) {
  const { territories, currentPlayer, attackingFrom, selectedTerritory, fortifyFrom, phase, players } = state;

  const isPlayerTurn = !players[currentPlayer]?.isAI;

  function getTerritoryFill(tid: TerritoryId): string {
    const ts = territories[tid];
    if (!ts || ts.owner === null) return 'rgba(255,255,255,0.08)';
    return players[ts.owner]?.color ?? '#888';
  }

  function isSelected(tid: TerritoryId): boolean {
    return selectedTerritory === tid || attackingFrom === tid || fortifyFrom === tid;
  }

  function isValidTarget(tid: TerritoryId): boolean {
    if (!isPlayerTurn) return false;
    const fromId = attackingFrom ?? fortifyFrom;
    if (!fromId) return false;
    const from = TERRITORY_MAP[fromId];
    if (!from?.adjacencies.includes(tid)) return false;
    const ts = territories[tid];
    if (phase === 'attack') return ts?.owner !== currentPlayer;
    if (phase === 'fortify') return ts?.owner === currentPlayer;
    return false;
  }

  function getNodeClass(tid: TerritoryId): string {
    if (isSelected(tid)) return 'cursor-pointer';
    if (isValidTarget(tid)) return 'cursor-crosshair';
    if (isPlayerTurn) return 'cursor-pointer';
    return 'cursor-default';
  }

  function handleClick(tid: TerritoryId) {
    if (!isPlayerTurn && state.phase !== 'setup') return;
    onSelectTerritory(tid);
  }

  // Rendered connection lines (avoid duplicates)
  const renderedEdges = new Set<string>();
  const edges: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (const t of TERRITORIES) {
    for (const adjId of t.adjacencies) {
      const edgeKey = [t.id, adjId].sort().join('--');
      if (renderedEdges.has(edgeKey)) continue;
      renderedEdges.add(edgeKey);
      const adj = TERRITORY_MAP[adjId];
      if (!adj) continue;
      edges.push({ x1: t.position.x, y1: t.position.y, x2: adj.position.x, y2: adj.position.y, key: edgeKey });
    }
  }

  return (
    <div className="w-full overflow-auto">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full max-w-full"
        style={{ minWidth: 320, background: 'transparent' }}
      >
        {/* Continent background regions */}
        {Object.entries(CONTINENT_HULLS).map(([name, points]) => (
          <polygon
            key={name}
            points={points}
            fill={getContinentColor(name)}
            stroke={getContinentStroke(name)}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        ))}

        {/* Connection lines */}
        {edges.map((e) => {
          const isCrossContinent = Math.abs(e.x1 - e.x2) > 300 || Math.abs(e.y1 - e.y2) > 300;
          return (
            <line
              key={e.key}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={isCrossContinent ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.1)'}
              strokeWidth={isCrossContinent ? 1 : 1.5}
              strokeDasharray={isCrossContinent ? '4 4' : undefined}
            />
          );
        })}

        {/* Territory nodes */}
        {TERRITORIES.map((t) => {
          const ts = territories[t.id];
          const fill = getTerritoryFill(t.id);
          const selected = isSelected(t.id);
          const validTarget = isValidTarget(t.id);
          const owner = ts?.owner;
          const glowColor = owner !== null && owner !== undefined ? players[owner]?.glowColor : '#fff';
          const r = TERRITORY_RADIUS;

          return (
            <motion.g
              key={t.id}
              className={getNodeClass(t.id)}
              onClick={() => handleClick(t.id)}
              whileHover={isPlayerTurn ? { scale: 1.1 } : {}}
              whileTap={isPlayerTurn ? { scale: 0.93 } : {}}
              // transformOrigin must be the absolute SVG coordinate of the circle centre
              // so the node scales around its own centre rather than the SVG (0,0) point.
              style={{ transformOrigin: `${t.position.x}px ${t.position.y}px` }}
            >
              {/* Outer glow ring for selected/targeted */}
              {(selected || validTarget) && (
                <motion.circle
                  cx={t.position.x}
                  cy={t.position.y}
                  r={r + 8}
                  fill="none"
                  stroke={selected ? '#00f5ff' : '#ffd700'}
                  strokeWidth={2}
                  opacity={0.8}
                  animate={{ r: [r + 6, r + 12, r + 6] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                />
              )}

              {/* Continent-light aura (owned territories) */}
              {owner !== null && owner !== undefined && (
                <circle
                  cx={t.position.x}
                  cy={t.position.y}
                  r={r + 4}
                  fill={glowColor}
                  opacity={0.12}
                />
              )}

              {/* Main circle */}
              <circle
                cx={t.position.x}
                cy={t.position.y}
                r={r}
                fill={fill}
                stroke={selected ? '#00f5ff' : validTarget ? '#ffd700' : 'rgba(255,255,255,0.25)'}
                strokeWidth={selected || validTarget ? 2.5 : 1.5}
                opacity={0.95}
                style={{
                  filter:
                    owner !== null && owner !== undefined
                      ? `drop-shadow(0 0 6px ${glowColor}66)`
                      : undefined,
                }}
              />

              {/* Troop count */}
              <text
                x={t.position.x}
                y={t.position.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={ts?.troops && ts.troops >= 10 ? '11' : '13'}
                fontWeight="bold"
                fill="white"
                style={{ pointerEvents: 'none', userSelect: 'none', textShadow: '0 1px 3px #000' }}
              >
                {ts?.troops ?? 0}
              </text>

              {/* Territory name label */}
              <text
                x={t.position.x}
                y={t.position.y + r + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8.5"
                fill="rgba(255,255,255,0.6)"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {t.name}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
