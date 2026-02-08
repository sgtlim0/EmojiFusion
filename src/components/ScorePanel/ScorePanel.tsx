import { EMOJI_LEVELS } from '../../types/index.ts'
import styles from './ScorePanel.module.css'

interface ScorePanelProps {
  readonly score: number
  readonly bestScore: number
  readonly currentLevel: number
  readonly nextLevel: number
  readonly combo: number
  readonly muted: boolean
  readonly isFrozen: boolean
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
        <div className={styles.nextPreview}>
          <span className={styles.nextLabel}>Next</span>
          <span className={styles.nextEmoji}>{EMOJI_LEVELS[nextLevel].emoji}</span>
        </div>
        <div className={styles.currentPreview}>
          <span className={styles.nextLabel}>Now</span>
          <span className={styles.currentEmoji}>{EMOJI_LEVELS[currentLevel].emoji}</span>
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
