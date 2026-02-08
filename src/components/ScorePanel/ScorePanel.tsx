import { EMOJI_LEVELS, BOMB_EMOJI, BOMB_MERGE_INTERVAL } from '../../types/index.ts'
import styles from './ScorePanel.module.css'

interface ScorePanelProps {
  readonly score: number
  readonly bestScore: number
  readonly currentLevel: number
  readonly nextLevel: number
  readonly combo: number
  readonly muted: boolean
  readonly isFrozen: boolean
  readonly hasBomb: boolean
  readonly bombProgress: number
  readonly onToggleMute: () => void
}

export default function ScorePanel({
  score,
  bestScore,
  currentLevel,
  nextLevel,
  combo,
  muted,
  isFrozen,
  hasBomb,
  bombProgress,
  onToggleMute,
}: ScorePanelProps) {
  return (
    <header className={styles.panel}>
      <div className={styles.left}>
        <span className={styles.title}>Emoji Fusion</span>
        {combo > 0 && (
          <span className={styles.combo}>
            x{combo + 1}
          </span>
        )}
        {isFrozen && (
          <span className={styles.freeze}>FREEZE</span>
        )}
      </div>
      <div className={styles.center}>
        <div className={styles.scoreBlock}>
          <span className={styles.scoreLabel}>Score</span>
          <span className={styles.scoreValue}>{score.toLocaleString()}</span>
        </div>
        <div className={styles.scoreBlock}>
          <span className={styles.scoreLabel}>Best</span>
          <span className={styles.bestValue}>{bestScore.toLocaleString()}</span>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.bombMeter}>
          {hasBomb ? (
            <span className={styles.bombReady}>{BOMB_EMOJI}</span>
          ) : (
            <div className={styles.bombBar}>
              <div
                className={styles.bombFill}
                style={{ height: `${(bombProgress / BOMB_MERGE_INTERVAL) * 100}%` }}
              />
            </div>
          )}
        </div>
        <div className={styles.nextPreview}>
          <span className={styles.nextLabel}>Next</span>
          <span className={styles.nextEmoji}>{EMOJI_LEVELS[nextLevel].emoji}</span>
        </div>
        <div className={styles.currentPreview}>
          <span className={styles.nextLabel}>Now</span>
          <span className={hasBomb ? styles.bombCurrentEmoji : styles.currentEmoji}>
            {hasBomb ? BOMB_EMOJI : EMOJI_LEVELS[currentLevel].emoji}
          </span>
        </div>
        <button
          className={styles.muteButton}
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
        </button>
      </div>
    </header>
  )
}
