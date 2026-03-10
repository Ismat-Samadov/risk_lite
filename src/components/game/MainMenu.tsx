// Main menu / game setup screen

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameConfig, Difficulty } from '@/types/game';
import { Button } from '@/components/ui/Button';

interface MainMenuProps {
  onStart: (config: GameConfig) => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy — relaxed, random AI',
  hard: 'Hard — aggressive, strategic AI',
};

export function MainMenu({ onStart }: MainMenuProps) {
  const [playerName, setPlayerName] = useState('Commander');
  const [numPlayers, setNumPlayers] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  const handleStart = () => {
    if (!playerName.trim()) return;
    onStart({ numPlayers, difficulty, playerName: playerName.trim() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 14 }}
            className="inline-block mb-4"
          >
            <span className="text-7xl">🌐</span>
          </motion.div>
          <h1
            className="text-5xl font-black tracking-tight text-white"
            style={{ textShadow: '0 0 40px rgba(0,245,255,0.5), 0 0 80px rgba(0,245,255,0.2)' }}
          >
            RISK <span className="text-cyan-400">LITE</span>
          </h1>
          <p className="text-white/40 mt-2 text-sm tracking-widest uppercase">
            World Domination Strategy
          </p>
        </div>

        {/* Config card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          {/* Player name */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
              Commander Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60 focus:bg-cyan-500/5 transition-all text-sm"
              placeholder="Enter your name…"
            />
          </div>

          {/* Number of players */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
              Total Players
            </label>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumPlayers(n)}
                  className={`flex-1 py-3 rounded-lg border font-bold text-lg transition-all duration-200 ${
                    numPlayers === n
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white/70'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-2">
              You + {numPlayers - 1} AI opponent{numPlayers > 2 ? 's' : ''}
            </p>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
              AI Difficulty
            </label>
            <div className="flex flex-col gap-2">
              {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]).map(([d, label]) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                    difficulty === d
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                      : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/60'
                  }`}
                >
                  <span className="font-bold capitalize text-sm">{d}</span>
                  <span className="text-xs ml-2 opacity-70">— {label.split('— ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStart}
            size="lg"
            disabled={!playerName.trim()}
            className="w-full justify-center"
          >
            ⚔️ Deploy Forces
          </Button>
        </div>

        {/* Controls hint */}
        <div className="mt-6 text-center text-white/25 text-xs space-y-1">
          <p>Click territories to place troops • Click to attack • Drag to fortify</p>
          <p>Mobile: tap to interact • Works on all screen sizes</p>
        </div>
      </motion.div>
    </div>
  );
}
