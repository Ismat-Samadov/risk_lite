// Animated dice roll display showing attacker vs defender results

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { CombatResult } from '@/types/game';
import { Button } from '@/components/ui/Button';

interface DiceRollProps {
  combat: CombatResult;
  attackerName: string;
  defenderName: string;
  onClose: () => void;
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function DieFace({ value, winner }: { value: number; winner: boolean | null }) {
  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
      className={`
        w-12 h-12 flex items-center justify-center text-3xl rounded-lg border-2 font-bold
        ${winner === true ? 'border-green-400 bg-green-900/40 shadow-lg shadow-green-500/30' :
          winner === false ? 'border-red-400 bg-red-900/40 shadow-lg shadow-red-500/20' :
          'border-white/20 bg-white/5'}
      `}
    >
      {DICE_FACES[value - 1]}
    </motion.div>
  );
}

export function DiceRoll({ combat, attackerName, defenderName, onClose }: DiceRollProps) {
  const { attackerDice, defenderDice, attackerLosses, defenderLosses, conquered } = combat;
  const comparisons = Math.min(attackerDice.length, defenderDice.length);

  // Determine winners per comparison pair
  const pairResults: ('attacker' | 'defender')[] = [];
  for (let i = 0; i < comparisons; i++) {
    pairResults.push(attackerDice[i] > defenderDice[i] ? 'attacker' : 'defender');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="bg-slate-900/95 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl min-w-[260px]"
    >
      <h3 className="text-center text-white/80 font-bold text-sm uppercase tracking-widest mb-4">
        ⚔️ Combat
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Attacker */}
        <div className="text-center">
          <p className="text-xs text-cyan-400 font-semibold mb-2 truncate">{attackerName}</p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {attackerDice.map((val, i) => (
              <DieFace
                key={i}
                value={val}
                winner={i < comparisons ? pairResults[i] === 'attacker' : null}
              />
            ))}
          </div>
        </div>

        {/* Defender */}
        <div className="text-center">
          <p className="text-xs text-red-400 font-semibold mb-2 truncate">{defenderName}</p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {defenderDice.map((val, i) => (
              <DieFace
                key={i}
                value={val}
                winner={i < comparisons ? pairResults[i] === 'defender' : null}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Result summary */}
      <div className="text-center mb-4">
        {conquered ? (
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-yellow-400 font-bold text-base"
          >
            🏴 Territory Conquered!
          </motion.p>
        ) : (
          <p className="text-white/60 text-sm">
            {attackerLosses > 0 && <span className="text-cyan-400">Attacker lost {attackerLosses} </span>}
            {defenderLosses > 0 && <span className="text-red-400">Defender lost {defenderLosses}</span>}
          </p>
        )}
      </div>

      <Button onClick={onClose} size="sm" variant="ghost" className="w-full">
        Continue
      </Button>
    </motion.div>
  );
}
