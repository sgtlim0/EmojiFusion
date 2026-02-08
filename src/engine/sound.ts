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
