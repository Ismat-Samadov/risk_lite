// Root page – orchestrates menu vs game states

'use client';

import { GameScreen } from '@/components/game/GameScreen';
import { MainMenu } from '@/components/game/MainMenu';
import { useGame } from '@/hooks/useGame';
import type { GameConfig } from '@/types/game';

export default function Home() {
  const {
    state,
    startGame,
    resetGame,
    pauseGame,
    selectTerritory,
    endAttackPhase,
    endTurn,
    dismissDice,
  } = useGame();

  if (!state) {
    return <MainMenu onStart={(config: GameConfig) => startGame(config)} />;
  }

  return (
    <GameScreen
      state={state}
      onSelectTerritory={selectTerritory}
      onEndAttack={endAttackPhase}
      onEndTurn={endTurn}
      onPause={pauseGame}
      onRestart={resetGame}
      onDismissDice={dismissDice}
    />
  );
}
