// Animated end-game screen shown after win/lose

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { GameState } from '@/types/game';
import { Button } from '@/components/ui/Button';

interface EndScreenProps {
  state: GameState;
  onRestart: () => void;
  highScore: number;
}

export function EndScreen({ state, onRestart, highScore }: EndScreenProps) {
  const { winner, players, territories, round } = state;
  const [particles, setParticles] = useState<{ x: number; y: number; color: string }[]>([]);

  const winnerPlayer = winner !== null ? players[winner] : null;
  const isHumanWinner = winnerPlayer && !winnerPlayer.isAI;
  const humanPlayer = players[0];
  const humanTerritories = Object.values(territories).filter((t) => t.owner === 0).length;

  useEffect(() => {
    if (isHumanWinner) {
      const pts = Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#00f5ff', '#ffd700', '#ff6b81', '#7bed9f', '#eccc68'][Math.floor(Math.random() * 5)],
      }));
      setParticles(pts);
    }
  }, [isHumanWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden">
      {/* Confetti particles for win */}
      {isHumanWinner &&
        particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{ left: `${p.x}%`, top: '-10px', background: p.color }}
            animate={{
              y: ['0vh', '110vh'],
              x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 20}%`],
              rotate: [0, Math.random() * 360],
              opacity: [1, 0],
            }}
            transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 1.5, ease: 'easeIn' }}
          />
        ))}

      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="relative z-10 w-full max-w-sm mx-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl text-center"
      >
        {/* Big emoji */}
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-6xl mb-4"
        >
          {isHumanWinner ? '🏆' : '💀'}
        </motion.div>

        {/* Title */}
        <h2
          className="text-3xl font-black mb-1"
          style={{
            color: winnerPlayer?.color ?? '#fff',
            textShadow: `0 0 30px ${winnerPlayer?.glowColor ?? '#fff'}80`,
          }}
        >
          {isHumanWinner ? 'Victory!' : 'Defeated'}
        </h2>
        <p className="text-white/50 text-sm mb-6">
          {isHumanWinner
            ? `You conquered the world in ${round} rounds!`
            : `${winnerPlayer?.name ?? 'An AI'} dominated the world in ${round} rounds.`}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Stat label="Territories" value={humanTerritories} color={humanPlayer.color} />
          <Stat label="Rounds" value={round} color="#fff" />
          <Stat label="High Score" value={highScore} color="#ffd700" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Button onClick={onRestart} size="lg" variant="primary" className="w-full">
            {isHumanWinner ? '⚔️ Play Again' : '🔄 Try Again'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/5 p-3">
      <div className="text-xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  );
}
