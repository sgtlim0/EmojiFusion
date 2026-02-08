import { useEmojiGame } from './hooks/useEmojiGame.ts'
import GameCanvas from './components/GameCanvas/GameCanvas.tsx'
import ScorePanel from './components/ScorePanel/ScorePanel.tsx'
import GameOver from './components/GameOver/GameOver.tsx'
import ComboPopup from './components/ComboPopup/ComboPopup.tsx'
import EmojiGuide from './components/EmojiGuide/EmojiGuide.tsx'
import styles from './App.module.css'

export default function App() {
  const {
    phase,
    score,
    bestScore,
    currentLevel,
    nextLevel,
    dropX,
    combo,
    mergeEvents,
    leaderboard,
    muted,
    initPhysics,
    cleanupPhysics,
    drop,
    moveDropX,
    restart,
    getEmojis,
    toggleMute,
  } = useEmojiGame()

  const isGameOver = phase === 'gameover'
  const isNewBest = isGameOver && score >= bestScore && score > 0

  return (
    <div className={styles.app}>
      <ScorePanel
        score={score}
        bestScore={bestScore}
        currentLevel={currentLevel}
        nextLevel={nextLevel}
        combo={combo}
        muted={muted}
        onToggleMute={toggleMute}
      />

      <div className={styles.gameArea}>
        <div className={styles.canvasWrapper}>
          <GameCanvas
            currentLevel={currentLevel}
            dropX={dropX}
            phase={phase}
            mergeEvents={mergeEvents}
            getEmojis={getEmojis}
            onMoveX={moveDropX}
            onDrop={drop}
            onInit={initPhysics}
            onCleanup={cleanupPhysics}
          />
          <ComboPopup mergeEvents={mergeEvents} />
        </div>
      </div>

      {isGameOver && (
        <GameOver
          score={score}
          bestScore={bestScore}
          isNewBest={isNewBest}
          leaderboard={leaderboard}
          onRestart={restart}
        />
      )}

      <EmojiGuide />
    </div>
  )
}
