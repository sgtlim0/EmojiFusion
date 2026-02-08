let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playTone(freq: number, duration: number, volume: number, type: OscillatorType = 'sine') {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function playDrop(): void {
  playTone(440, 0.08, 0.15, 'sine')
  playTone(660, 0.06, 0.08, 'triangle')
}

export function playMerge(level: number): void {
  const baseFreq = 300 + level * 60
  playTone(baseFreq, 0.15, 0.2, 'sine')
  setTimeout(() => playTone(baseFreq * 1.5, 0.12, 0.15, 'triangle'), 50)
  setTimeout(() => playTone(baseFreq * 2, 0.1, 0.1, 'sine'), 100)
}

export function playCombo(combo: number): void {
  const base = 500 + combo * 100
  playTone(base, 0.1, 0.12, 'triangle')
  setTimeout(() => playTone(base * 1.25, 0.08, 0.1, 'sine'), 60)
}

export function playGameOver(): void {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.5)
}

export function playBounce(): void {
  playTone(200, 0.04, 0.05, 'sine')
}

export function playButtonPress(): void {
  playTone(800, 0.03, 0.08, 'square')
}

export function playFreeze(): void {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15)
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.4)

  // Ice crackling overlay
  const noise = ctx.createOscillator()
  const noiseGain = ctx.createGain()
  noise.type = 'square'
  noise.frequency.setValueAtTime(2000, ctx.currentTime)
  noise.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2)
  noiseGain.gain.setValueAtTime(0.03, ctx.currentTime)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
  noise.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noise.start(ctx.currentTime)
  noise.stop(ctx.currentTime + 0.2)
}

export function playBomb(): void {
  const ctx = getCtx()
  // Deep boom
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(100, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.5)

  // Crackle overlay
  const noise = ctx.createOscillator()
  const noiseGain = ctx.createGain()
  noise.type = 'sawtooth'
  noise.frequency.setValueAtTime(800, ctx.currentTime)
  noise.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3)
  noiseGain.gain.setValueAtTime(0.08, ctx.currentTime)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  noise.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noise.start(ctx.currentTime)
  noise.stop(ctx.currentTime + 0.3)
}

export function hapticLight(): void {
  if (navigator.vibrate) {
    navigator.vibrate(8)
  }
}

export function hapticMedium(): void {
  if (navigator.vibrate) {
    navigator.vibrate(15)
  }
}

export function hapticHeavy(): void {
  if (navigator.vibrate) {
    navigator.vibrate([20, 30, 20])
  }
}
