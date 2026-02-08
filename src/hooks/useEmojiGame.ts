import { useState, useCallback, useRef, useEffect } from 'react'
import { createPhysicsEngine, getWorldEmojis } from '../engine/physics.ts'
import { playDrop, playMerge, playCombo, playGameOver } from '../engine/sound.ts'
import {
  EMOJI_LEVELS,
  GAME_CONFIG,
  DROP_LEVELS,
  COMBO_WINDOW,
  DROP_COOLDOWN,
} from '../types/index.ts'
import type { GamePhase, LeaderboardEntry } from '../types/index.ts'

const LEADERBOARD_KEY = 'emoji_fusion_leaderboard'
const BEST_SCORE_KEY = 'emoji_fusion_best'
const MAX_ENTRIES = 10

function loadBestScore(): number {
  try {
    return parseInt(localStorage.getItem(BEST_SCORE_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function saveBestScore(score: number): void {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score))
  } catch {
    // ignore
  }
}

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY)
    if (!raw) return []
    return JSON.parse(raw) as LeaderboardEntry[]
  } catch {
    return []
  }
}

function saveLeaderboardEntries(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries))
  } catch {
    // ignore
  }
}

function randomDropLevel(): number {
  return Math.floor(Math.random() * DROP_LEVELS)
}

export interface MergeEvent {
  readonly x: number
  readonly y: number
  readonly level: number
  readonly time: number
}

export interface EmojiRenderData {
  readonly id: number
  readonly level: number
  readonly x: number
  readonly y: number
  readonly angle: number
  readonly radius: number
}

export function useEmojiGame() {
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(loadBestScore)
  const [currentLevel, setCurrentLevel] = useState(() => randomDropLevel())
  const [nextLevel, setNextLevel] = useState(() => randomDropLevel())
  const [dropX, setDropX] = useState(GAME_CONFIG.width / 2)
  const [combo, setCombo] = useState(0)
  const [mergeEvents, setMergeEvents] = useState<readonly MergeEvent[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadLeaderboard())
  const [muted, setMuted] = useState(false)

  const engineRef = useRef<ReturnType<typeof createPhysicsEngine> | null>(null)
  const lastDropTime = useRef(0)
  const lastMergeTime = useRef(0)
  const gameOverCalled = useRef(false)
  const scoreRef = useRef(0)

  // Keep scoreRef in sync via effect (not during render)
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const handleMerge = useCallback(
    (level: number, _bodyIdA: number, _bodyIdB: number, posX: number, posY: number) => {
      const newLevel = level + 1
      const points = EMOJI_LEVELS[newLevel].points

      const now = Date.now()
      const timeSinceLastMerge = now - lastMergeTime.current
      lastMergeTime.current = now

      const isCombo = timeSinceLastMerge < COMBO_WINDOW

      setCombo((prev) => {
        const newCombo = isCombo ? prev + 1 : 0
        return newCombo
      })

      setScore((prev) => {
        const comboMultiplier = isCombo ? 1.5 : 1
        const earned = Math.round(points * comboMultiplier)
        const newScore = prev + earned
        return newScore
      })

      setMergeEvents((prev) => [
        ...prev.slice(-4),
        { x: posX, y: posY, level: newLevel, time: now },
      ])

      if (!muted) {
        playMerge(newLevel)
        if (isCombo) {
          setTimeout(() => playCombo(1), 80)
        }
      }
    },
    [muted],
  )

  const handleGameOver = useCallback(() => {
    if (gameOverCalled.current) return
    gameOverCalled.current = true

    setPhase('gameover')
    if (!muted) playGameOver()

    // Use scoreRef (synced in effect) to get current score
    const finalScore = scoreRef.current
    setBestScore((prev) => {
      const newBest = Math.max(prev, finalScore)
      saveBestScore(newBest)
      return newBest
    })

    // Save to leaderboard
    const entry: LeaderboardEntry = {
      score: finalScore,
      date: new Date().toISOString().slice(0, 10),
    }
    setLeaderboard((prev) => {
      const updated = [...prev, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES)
      saveLeaderboardEntries(updated)
      return updated
    })
  }, [muted])

  const initPhysics = useCallback(
    (container: HTMLElement) => {
      if (engineRef.current) {
        engineRef.current.cleanup()
      }

      engineRef.current = createPhysicsEngine(container, {
        onMerge: handleMerge,
        onGameOver: handleGameOver,
      })
    },
    [handleMerge, handleGameOver],
  )

  const drop = useCallback(() => {
    if (phase !== 'ready') return
    const now = Date.now()
    if (now - lastDropTime.current < DROP_COOLDOWN) return

    if (!engineRef.current) return

    lastDropTime.current = now
    setPhase('dropping')

    engineRef.current.dropEmoji(dropX, currentLevel)
    if (!muted) playDrop()

    // Advance to next emoji
    setCurrentLevel(nextLevel)
    setNextLevel(randomDropLevel())

    // Brief cooldown before next drop
    setTimeout(() => {
      setPhase((prev) => (prev === 'dropping' ? 'ready' : prev))
    }, DROP_COOLDOWN)
  }, [phase, dropX, currentLevel, nextLevel, muted])

  const moveDropX = useCallback(
    (x: number) => {
      if (phase === 'gameover') return
      const emoji = EMOJI_LEVELS[currentLevel]
      const clamped = Math.max(
        GAME_CONFIG.wallThickness + emoji.radius,
        Math.min(GAME_CONFIG.width - GAME_CONFIG.wallThickness - emoji.radius, x),
      )
      setDropX(clamped)
    },
    [phase, currentLevel],
  )

  const restart = useCallback(() => {
    gameOverCalled.current = false
    lastDropTime.current = 0
    lastMergeTime.current = 0
    setScore(0)
    setCombo(0)
    setMergeEvents([])
    setCurrentLevel(randomDropLevel())
    setNextLevel(randomDropLevel())
    setDropX(GAME_CONFIG.width / 2)
    setPhase('ready')
  }, [])

  const getEmojis = useCallback((): EmojiRenderData[] => {
    if (!engineRef.current) return []
    return getWorldEmojis(engineRef.current.engine)
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev)
  }, [])

  const cleanupPhysics = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.cleanup()
      engineRef.current = null
    }
  }, [])

  return {
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
  }
}
