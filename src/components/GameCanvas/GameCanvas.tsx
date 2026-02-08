import { useRef, useEffect, useCallback } from 'react'
import { EMOJI_LEVELS, GAME_CONFIG, BOMB_RADIUS, BOMB_EMOJI } from '../../types/index.ts'
import type { EmojiRenderData, MergeEvent } from '../../hooks/useEmojiGame.ts'
import type { ScaleInfo } from '../../hooks/useResponsiveScale.ts'
import styles from './GameCanvas.module.css'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface LavaState {
  readonly lavaY: number
  readonly isFrozen: boolean
}

interface GameCanvasProps {
  readonly currentLevel: number
  readonly dropX: number
  readonly phase: string
  readonly mergeEvents: readonly MergeEvent[]
  readonly scaleInfo: ScaleInfo
  readonly getEmojis: () => EmojiRenderData[]
  readonly getLavaState: () => LavaState
  readonly hasBomb: boolean
  readonly onMoveX: (x: number) => void
  readonly onDrop: () => void
  readonly onInit: (container: HTMLElement) => void
  readonly onCleanup: () => void
}

export default function GameCanvas({
  currentLevel,
  dropX,
  phase,
  mergeEvents,
  scaleInfo,
  getEmojis,
  getLavaState,
  hasBomb,
  onMoveX,
  onDrop,
  onInit,
  onCleanup,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)

  // Store latest props in refs for the animation loop
  const propsRef = useRef({ currentLevel, dropX, phase, getEmojis, getLavaState, hasBomb })
  const particlesRef = useRef<Particle[]>([])
  const prevMergeCountRef = useRef(0)
  const scaleRef = useRef(scaleInfo)

  // Sync props to refs in effects
  useEffect(() => {
    propsRef.current = { currentLevel, dropX, phase, getEmojis, getLavaState, hasBomb }
  }, [currentLevel, dropX, phase, getEmojis, getLavaState, hasBomb])

  useEffect(() => {
    scaleRef.current = scaleInfo
  }, [scaleInfo])

  // Init physics
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    onInit(el)
    return () => {
      onCleanup()
    }
  }, [onInit, onCleanup])

  // Spawn particles on merge
  useEffect(() => {
    if (mergeEvents.length > prevMergeCountRef.current) {
      const newEvents = mergeEvents.slice(prevMergeCountRef.current)
      const newParticles: Particle[] = []
      for (const evt of newEvents) {
        const color = EMOJI_LEVELS[evt.level].color
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI * 2 * i) / 10
          const speed = 1.5 + Math.random() * 2.5
          newParticles.push({
            x: evt.x,
            y: evt.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            life: 1,
            maxLife: 0.35 + Math.random() * 0.25,
            color,
            size: 2 + Math.random() * 2.5,
          })
        }
      }
      particlesRef.current = [...particlesRef.current, ...newParticles]
    }
    prevMergeCountRef.current = mergeEvents.length
  }, [mergeEvents])

  // Animation loop
  useEffect(() => {
    let animFrame = 0
    let canvasReady = false

    function loop() {
      const canvas = overlayCanvasRef.current
      if (!canvas) {
        animFrame = requestAnimationFrame(loop)
        return
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animFrame = requestAnimationFrame(loop)
        return
      }

      const { currentLevel: cl, dropX: dx, phase: ph, getEmojis: ge, getLavaState: gls } = propsRef.current
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = GAME_CONFIG.width
      const h = GAME_CONFIG.height

      if (!canvasReady || canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        canvasReady = true
      }

      ctx.clearRect(0, 0, w, h)

      // Lava
      const lavaState = gls()
      if (lavaState.lavaY < h) {
        const lavaTop = Math.max(0, lavaState.lavaY)
        const lavaGrad = ctx.createLinearGradient(0, lavaTop, 0, h)
        if (lavaState.isFrozen) {
          lavaGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)')
          lavaGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)')
          lavaGrad.addColorStop(1, 'rgba(37, 99, 235, 0.65)')
        } else {
          lavaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.15)')
          lavaGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.4)')
          lavaGrad.addColorStop(1, 'rgba(220, 38, 38, 0.65)')
        }
        ctx.fillStyle = lavaGrad
        ctx.fillRect(
          GAME_CONFIG.wallThickness, lavaTop,
          w - 2 * GAME_CONFIG.wallThickness, h - lavaTop,
        )

        // Surface line with glow
        if (lavaState.lavaY > 0) {
          ctx.save()
          ctx.shadowColor = lavaState.isFrozen ? '#3b82f6' : '#f97316'
          ctx.shadowBlur = 10
          ctx.strokeStyle = lavaState.isFrozen
            ? 'rgba(96, 165, 250, 0.9)'
            : 'rgba(251, 146, 60, 0.9)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(GAME_CONFIG.wallThickness, lavaState.lavaY)
          ctx.lineTo(w - GAME_CONFIG.wallThickness, lavaState.lavaY)
          ctx.stroke()
          ctx.restore()
        }
      }

      // Drop guide
      if (ph !== 'gameover') {
        const isBombDrop = propsRef.current.hasBomb
        const previewEmoji = isBombDrop ? BOMB_EMOJI : EMOJI_LEVELS[cl].emoji
        const previewRadius = isBombDrop ? BOMB_RADIUS : EMOJI_LEVELS[cl].radius

        ctx.strokeStyle = isBombDrop ? 'rgba(245, 158, 11, 0.3)' : 'rgba(168, 85, 247, 0.2)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(dx, GAME_CONFIG.dropY + previewRadius)
        ctx.lineTo(dx, h)
        ctx.stroke()
        ctx.setLineDash([])

        // Preview emoji
        if (isBombDrop) {
          const pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.006)
          ctx.shadowColor = '#f59e0b'
          ctx.shadowBlur = 12 * pulse
        }
        ctx.font = `${previewRadius * 1.4}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.globalAlpha = 0.7
        ctx.fillText(previewEmoji, dx, GAME_CONFIG.dropY)
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }

      // Render emojis
      const emojis = ge()
      for (const e of emojis) {
        const isBomb = e.isBomb
        const color = isBomb ? '#f59e0b' : EMOJI_LEVELS[e.level].color
        const emoji = isBomb ? BOMB_EMOJI : EMOJI_LEVELS[e.level].emoji
        const radius = e.radius

        ctx.save()
        ctx.translate(e.x, e.y)
        ctx.rotate(e.angle)

        if (isBomb) {
          const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.005)
          ctx.shadowColor = '#f59e0b'
          ctx.shadowBlur = 12 * pulse
        } else {
          ctx.shadowColor = color
          ctx.shadowBlur = 4
        }

        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.fillStyle = color + '20'
        ctx.fill()
        ctx.strokeStyle = color + '60'
        ctx.lineWidth = isBomb ? 2 : 1.5
        ctx.stroke()

        ctx.shadowBlur = 0
        ctx.font = `${radius * 1.3}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(emoji, 0, 1)

        ctx.restore()
      }

      // Particles
      const dt = 1 / 60
      const alive: Particle[] = []
      for (const p of particlesRef.current) {
        const updatedP: Particle = {
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.1,
          life: p.life - dt / p.maxLife,
        }

        if (updatedP.life <= 0) continue
        alive.push(updatedP)

        ctx.globalAlpha = updatedP.life
        ctx.fillStyle = updatedP.color
        ctx.beginPath()
        ctx.arc(updatedP.x, updatedP.y, updatedP.size * updatedP.life, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      particlesRef.current = alive

      animFrame = requestAnimationFrame(loop)
    }

    animFrame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrame)
  }, [])

  // Translate screen coordinates to game coordinates
  const toGameX = useCallback((clientX: number) => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return GAME_CONFIG.width / 2
    const rect = canvas.getBoundingClientRect()
    return ((clientX - rect.left) / rect.width) * GAME_CONFIG.width
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      onMoveX(toGameX(e.clientX))
    },
    [onMoveX, toGameX],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      onMoveX(toGameX(e.clientX))
      onDrop()
    },
    [onMoveX, onDrop, toGameX],
  )

  return (
    <div
      className={styles.container}
      style={{
        transform: `scale(${scaleInfo.scale})`,
        transformOrigin: 'top center',
      }}
    >
      <div ref={containerRef} className={styles.physicsContainer} />
      <canvas
        ref={overlayCanvasRef}
        className={styles.overlayCanvas}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{ touchAction: 'none' }}
      />
    </div>
  )
}
