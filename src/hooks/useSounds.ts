// Sound effects via Web Audio API (no external assets needed)

'use client';

import { useCallback, useRef, useState } from 'react';

type SoundType = 'place' | 'attack' | 'conquer' | 'dice' | 'win' | 'lose' | 'click';

export function useSounds() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.2) => {
      if (!soundEnabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    },
    [soundEnabled, getCtx]
  );

  const play = useCallback(
    (sound: SoundType) => {
      if (!soundEnabled) return;
      switch (sound) {
        case 'click':
          playTone(440, 0.08, 'square', 0.1);
          break;
        case 'place':
          playTone(523, 0.12, 'sine', 0.15);
          break;
        case 'dice':
          // quick random rattling sound
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              playTone(200 + Math.random() * 300, 0.06, 'sawtooth', 0.08);
            }, i * 60);
          }
          break;
        case 'attack':
          playTone(180, 0.15, 'sawtooth', 0.15);
          setTimeout(() => playTone(140, 0.2, 'sawtooth', 0.12), 100);
          break;
        case 'conquer':
          [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.18, 'sine', 0.18), i * 80);
          });
          break;
        case 'win':
          [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.25, 'sine', 0.2), i * 100);
          });
          break;
        case 'lose':
          [400, 350, 280, 220].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.3, 'sawtooth', 0.15), i * 120);
          });
          break;
      }
    },
    [soundEnabled, playTone]
  );

  const toggleSound = useCallback(() => {
    setSoundEnabled((v) => !v);
  }, []);

  return { play, soundEnabled, toggleSound };
}
