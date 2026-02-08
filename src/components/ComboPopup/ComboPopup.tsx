import type { MergeEvent } from '../../hooks/useEmojiGame.ts'
import { EMOJI_LEVELS } from '../../types/index.ts'
import styles from './ComboPopup.module.css'

interface ComboPopupProps {
  readonly mergeEvents: readonly MergeEvent[]
}

export default function ComboPopup({ mergeEvents }: ComboPopupProps) {
  // Show last 5 events - CSS animation handles fade-out timing
  const recent = mergeEvents.slice(-5)

  if (recent.length === 0) return null

  return (
    <div className={styles.container}>
      {recent.map((evt) => (
        <div
          key={evt.time}
          className={styles.popup}
          style={{
            left: `${(evt.x / 350) * 100}%`,
            top: `${(evt.y / 600) * 100}%`,
          }}
        >
          <span className={styles.emoji}>{EMOJI_LEVELS[evt.level].emoji}</span>
          <span className={styles.points}>+{EMOJI_LEVELS[evt.level].points}</span>
        </div>
      ))}
    </div>
  )
}
