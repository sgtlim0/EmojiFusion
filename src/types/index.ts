export interface EmojiLevel {
  readonly level: number
  readonly emoji: string
  readonly radius: number
  readonly color: string
  readonly points: number
}

export const EMOJI_LEVELS: readonly EmojiLevel[] = [
  { level: 0, emoji: '\uD83C\uDF52', radius: 16, color: '#dc2626', points: 1 },   // cherry
  { level: 1, emoji: '\uD83C\uDF53', radius: 20, color: '#ef4444', points: 3 },   // strawberry
  { level: 2, emoji: '\uD83C\uDF47', radius: 26, color: '#8b5cf6', points: 6 },   // grapes
  { level: 3, emoji: '\uD83C\uDF4A', radius: 32, color: '#f97316', points: 10 },  // orange
  { level: 4, emoji: '\uD83C\uDF4B', radius: 38, color: '#eab308', points: 15 },  // lemon
  { level: 5, emoji: '\uD83C\uDF4E', radius: 46, color: '#22c55e', points: 21 },  // apple
  { level: 6, emoji: '\uD83C\uDF51', radius: 54, color: '#f472b6', points: 28 },  // peach
  { level: 7, emoji: '\uD83C\uDF4D', radius: 62, color: '#fbbf24', points: 36 },  // pineapple
  { level: 8, emoji: '\uD83C\uDF49', radius: 72, color: '#16a34a', points: 45 },  // watermelon
  { level: 9, emoji: '\uD83C\uDF48', radius: 82, color: '#a3e635', points: 55 },  // melon
  { level: 10, emoji: '\u2B50', radius: 92, color: '#fbbf24', points: 100 },       // star (max)
] as const

export const MAX_LEVEL = EMOJI_LEVELS.length - 1
export const DROP_LEVELS = 5 // Only levels 0-4 can be dropped

export interface GameConfig {
  readonly width: number
  readonly height: number
  readonly wallThickness: number
  readonly dangerLineY: number
  readonly dropY: number
}

export const GAME_CONFIG: GameConfig = {
  width: 350,
  height: 600,
  wallThickness: 12,
  dangerLineY: 80,
  dropY: 50,
} as const

export interface EmojiBody {
  readonly id: number
  readonly level: number
  readonly bodyId: number
}

export type GamePhase = 'ready' | 'dropping' | 'gameover'

export interface GameState {
  readonly phase: GamePhase
  readonly score: number
  readonly bestScore: number
  readonly currentLevel: number
  readonly nextLevel: number
  readonly dropX: number
  readonly emojis: readonly EmojiBody[]
  readonly combo: number
  readonly lastMergeTime: number
}

export interface LeaderboardEntry {
  readonly score: number
  readonly date: string
}

export const COMBO_WINDOW = 1500 // ms window for combo chain
export const DANGER_CHECK_DELAY = 2000 // ms before checking danger line after drop
export const DROP_COOLDOWN = 400 // ms between drops

// Lava mechanic
export const LAVA_INITIAL_Y = 800 // starts well below visible area (~1min to reach floor)
export const LAVA_SPEED = 0.04 // pixels per tick (60fps = ~2.4px/sec)
export const LAVA_SPEED_INCREASE = 0.0005 // acceleration per tick
export const LAVA_FREEZE_DURATION = 3000 // ms freeze on high-level merge
export const LAVA_FREEZE_MERGE_LEVEL = 4 // merge result level >= this triggers freeze
