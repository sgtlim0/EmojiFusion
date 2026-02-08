import { useState } from 'react'
import { EMOJI_LEVELS } from '../../types/index.ts'
import styles from './EmojiGuide.module.css'

export default function EmojiGuide() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.toggleButton}
        onClick={() => setOpen((p) => !p)}
        aria-label="Emoji guide"
      >
        {open ? '\u2715' : '?'}
      </button>
      {open && (
        <div className={styles.panel}>
          <span className={styles.title}>Merge Guide</span>
          <div className={styles.chain}>
            {EMOJI_LEVELS.map((e, i) => (
              <div key={e.level} className={styles.item}>
                <span className={styles.emoji}>{e.emoji}</span>
                <span className={styles.points}>{e.points}pt</span>
                {i < EMOJI_LEVELS.length - 1 && (
                  <span className={styles.arrow}>{'\u2192'}</span>
                )}
              </div>
            ))}
          </div>
          <p className={styles.hint}>
            Drop same emojis together to merge them into bigger ones!
          </p>
        </div>
      )}
    </div>
  )
}
