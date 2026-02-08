import Matter from 'matter-js'
import { EMOJI_LEVELS, GAME_CONFIG } from '../types/index.ts'
import type { EmojiLevel } from '../types/index.ts'

const { Engine, Render, Runner, Bodies, Composite, Events, Body, Mouse, Vector } = Matter

export interface PhysicsCallbacks {
  onMerge: (levelA: number, bodyIdA: number, bodyIdB: number, posX: number, posY: number) => void
}

interface EmojiBodyData {
  isEmoji: boolean
  level: number
  emojiId: number
}

let nextEmojiId = 0

export function getEmojiData(body: Matter.Body): EmojiBodyData | null {
  const data = body.plugin as unknown as EmojiBodyData | undefined
  if (data && data.isEmoji) return data
  return null
}

export function createPhysicsEngine(
  container: HTMLElement,
  callbacks: PhysicsCallbacks,
): {
  engine: Matter.Engine
  render: Matter.Render
  runner: Matter.Runner
  dropEmoji: (x: number, level: number) => number
  cleanup: () => void
} {
  const { width, height, wallThickness } = GAME_CONFIG

  const engine = Engine.create({
    gravity: { x: 0, y: 1.8, scale: 0.001 },
  })

  const render = Render.create({
    element: container,
    engine,
    options: {
      width,
      height,
      wireframes: false,
      background: 'transparent',
      pixelRatio: window.devicePixelRatio || 1,
    },
  })

  // Disable default mouse constraint rendering
  render.mouse = Mouse.create(render.canvas)

  const runner = Runner.create()

  // Walls
  const wallOptions: Matter.IBodyDefinition = {
    isStatic: true,
    render: {
      fillStyle: 'rgba(168, 85, 247, 0.15)',
      strokeStyle: 'rgba(168, 85, 247, 0.4)',
      lineWidth: 1,
    },
    friction: 0.1,
    restitution: 0.2,
  }

  const floor = Bodies.rectangle(
    width / 2,
    height - wallThickness / 2,
    width,
    wallThickness,
    wallOptions,
  )
  const leftWall = Bodies.rectangle(
    wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    wallOptions,
  )
  const rightWall = Bodies.rectangle(
    width - wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    wallOptions,
  )

  Composite.add(engine.world, [floor, leftWall, rightWall])

  // Track merging bodies to prevent double-merges
  const mergingBodies = new Set<number>()

  // Collision handler
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const dataA = getEmojiData(pair.bodyA)
      const dataB = getEmojiData(pair.bodyB)

      if (!dataA || !dataB) continue
      if (dataA.level !== dataB.level) continue
      if (dataA.level >= EMOJI_LEVELS.length - 1) continue
      if (mergingBodies.has(pair.bodyA.id) || mergingBodies.has(pair.bodyB.id)) continue

      mergingBodies.add(pair.bodyA.id)
      mergingBodies.add(pair.bodyB.id)

      const midX = (pair.bodyA.position.x + pair.bodyB.position.x) / 2
      const midY = (pair.bodyA.position.y + pair.bodyB.position.y) / 2

      // Remove both bodies
      Composite.remove(engine.world, pair.bodyA)
      Composite.remove(engine.world, pair.bodyB)

      mergingBodies.delete(pair.bodyA.id)
      mergingBodies.delete(pair.bodyB.id)

      // Create merged emoji
      const newLevel = dataA.level + 1
      const newEmoji = EMOJI_LEVELS[newLevel]
      const mergedBody = createEmojiBody(midX, midY, newEmoji)

      // Give a tiny upward impulse for satisfying physics
      Body.setVelocity(mergedBody, Vector.create(0, -2))

      Composite.add(engine.world, mergedBody)

      callbacks.onMerge(dataA.level, dataA.emojiId, dataB.emojiId, midX, midY)
    }
  })

  function createEmojiBody(x: number, y: number, emojiDef: EmojiLevel): Matter.Body {
    const id = nextEmojiId++
    const body = Bodies.circle(x, y, emojiDef.radius, {
      restitution: 0.3,
      friction: 0.5,
      density: 0.001 + emojiDef.level * 0.0003,
      render: {
        fillStyle: 'transparent',
        strokeStyle: 'transparent',
      },
      plugin: {
        isEmoji: true,
        level: emojiDef.level,
        emojiId: id,
      } as unknown as Matter.Plugin,
    })
    return body
  }

  function dropEmoji(x: number, level: number): number {
    const emoji = EMOJI_LEVELS[level]
    const clampedX = Math.max(
      wallThickness + emoji.radius,
      Math.min(width - wallThickness - emoji.radius, x),
    )
    const body = createEmojiBody(clampedX, GAME_CONFIG.dropY, emoji)
    Composite.add(engine.world, body)
    const data = getEmojiData(body)
    return data ? data.emojiId : -1
  }

  Render.run(render)
  Runner.run(runner, engine)

  function cleanup() {
    Render.stop(render)
    Runner.stop(runner)
    Composite.clear(engine.world, false)
    Engine.clear(engine)
    if (render.canvas.parentNode) {
      render.canvas.parentNode.removeChild(render.canvas)
    }
  }

  return { engine, render, runner, dropEmoji, cleanup }
}

export function getWorldEmojis(engine: Matter.Engine): Array<{
  id: number
  level: number
  x: number
  y: number
  angle: number
  radius: number
}> {
  const bodies = Composite.allBodies(engine.world)
  const result: Array<{
    id: number
    level: number
    x: number
    y: number
    angle: number
    radius: number
  }> = []

  for (const body of bodies) {
    const data = getEmojiData(body)
    if (!data) continue
    result.push({
      id: data.emojiId,
      level: data.level,
      x: body.position.x,
      y: body.position.y,
      angle: body.angle,
      radius: EMOJI_LEVELS[data.level].radius,
    })
  }

  return result
}
