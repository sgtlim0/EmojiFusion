import { EMOJI_LEVELS } from '../../types/index.ts'
import type { LeaderboardEntry } from '../../types/index.ts'
import { playButtonPress } from '../../engine/sound.ts'
import styles from './GameOver.module.css'

interface GameOverProps {
  readonly score: number
  readonly bestScore: number
  readonly isNewBest: boolean
  readonly leaderboard: readonly LeaderboardEntry[]
  readonly onRestart: () => void
}

export default function GameOver({
  score,
  bestScore,
  isNewBest,
  leaderboard,
  onRestart,
}: GameOverProps) {
  const handleRestart = () => {
    playButtonPress()
    onRestart()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.gameOverText}>Game Over</span>
          {isNewBest && (
            <span className={styles.newBest}>New Record!</span>
          )}
        </div>

        <div className={styles.scoreSection}>
          <div className={styles.finalScore}>
            <span className={styles.scoreLabel}>Score</span>
            <span className={styles.scoreValue}>{score.toLocaleString()}</span>
          </div>
          <div className={styles.bestScoreBlock}>
            <span className={styles.scoreLabel}>Best</span>
            <span className={styles.bestValue}>{bestScore.toLocaleString()}</span>
          </div>
        </div>

        {leaderboard.length > 0 && (
          <div className={styles.leaderboard}>
            <span className={styles.lbTitle}>Leaderboard</span>
            <div className={styles.lbList}>
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div
                  key={`${entry.date}-${entry.score}-${i}`}
                  className={`${styles.lbEntry} ${entry.score === score ? styles.lbCurrent : ''}`}
                >
                  <span className={styles.lbRank}>{i + 1}</span>
                  <span className={styles.lbScore}>{entry.score.toLocaleString()}</span>
                  <span className={styles.lbDate}>{entry.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.emojiRow}>
          {EMOJI_LEVELS.slice(0, 7).map((e) => (
            <span key={e.level} className={styles.emojiItem}>{e.emoji}</span>
          ))}
        </div>

        <button className={styles.restartButton} onClick={handleRestart}>
          Play Again
        </button>
      </div>
    </div>
  )
}
