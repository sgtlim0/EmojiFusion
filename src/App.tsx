import { useRef, useCallback, useEffect } from 'react'
import { useEmojiGame } from './hooks/useEmojiGame.ts'
import { useResponsiveScale } from './hooks/useResponsiveScale.ts'
import { hapticLight, hapticMedium } from './engine/sound.ts'
import GameCanvas from './components/GameCanvas/GameCanvas.tsx'
import ScorePanel from './components/ScorePanel/ScorePanel.tsx'
import GameOver from './components/GameOver/GameOver.tsx'
import ComboPopup from './components/ComboPopup/ComboPopup.tsx'
import EmojiGuide from './components/EmojiGuide/EmojiGuide.tsx'
import styles from './App.module.css'

const HEADER_HEIGHT = 48

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
    isFrozen,
    getLavaState,
    initPhysics,
    cleanupPhysics,
    drop,
    moveDropX,
    restart,
    getEmojis,
    toggleMute,
  } = useEmojiGame()

  const scaleInfo = useResponsiveScale(HEADER_HEIGHT)

  const isGameOver = phase === 'gameover'
  const isNewBest = isGameOver && score >= bestScore && score > 0

  // Wrap drop with haptic
  const handleDrop = useCallback(() => {
    hapticLight()
    drop()
  }, [drop])

  // Wrap restart with haptic
  const handleRestart = useCallback(() => {
    hapticMedium()
    restart()
  }, [restart])

  // Haptic on merge events
  const prevMergeCountRef = useRef(mergeEvents.length)
  useEffect(() => {
    if (mergeEvents.length > prevMergeCountRef.current && !muted) {
      hapticLight()
    }
    prevMergeCountRef.current = mergeEvents.length
  }, [mergeEvents.length, muted])

  return (
    <div className={styles.app}>
      <ScorePanel
        score={score}
        bestScore={bestScore}
        currentLevel={currentLevel}
        nextLevel={nextLevel}
        combo={combo}
        muted={muted}
        isFrozen={isFrozen}
        onToggleMute={toggleMute}
      />

      <div className={styles.gameArea}>
        <div
          className={styles.canvasWrapper}
          style={{
            width: scaleInfo.containerWidth,
            height: scaleInfo.containerHeight,
          }}
        >
          <GameCanvas
            currentLevel={currentLevel}
            dropX={dropX}
            phase={phase}
            mergeEvents={mergeEvents}
            scaleInfo={scaleInfo}
            getEmojis={getEmojis}
            getLavaState={getLavaState}
            onMoveX={moveDropX}
            onDrop={handleDrop}
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
          onRestart={handleRestart}
        />
      )}

      <EmojiGuide />
    </div>
  )
}
