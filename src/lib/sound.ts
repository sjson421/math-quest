import { create } from 'zustand'

/**
 * Best-effort sound for celebrations.
 *
 * Synthesised with the Web Audio API rather than shipped as an audio file:
 * three notes need no asset, no licence and no decoder, and the whole cue is
 * described here instead of in a binary nobody can read or tune.
 *
 * Everything here is a silent no-op when unsupported — the same contract as
 * `haptics`. Sound is decoration; never gate UX on it.
 *
 * The mute flag lives here rather than in `Progress`, because it is about this
 * phone and not about this learner: a lesson done quietly in a waiting room
 * should not silence the tablet at home, and it should survive a progress reset.
 */

type SoundStore = {
  muted: boolean
  toggleMuted: () => void
}

/** `localStorage`, not the IndexedDB progress lives in: this has to be readable
 *  synchronously on first paint, or the button draws the wrong icon and flips. */
const MUTED_KEY = 'math-quest-muted'

function storedMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    // Private mode and blocked storage both throw. Sound on is the safe default.
    return false
  }
}

export const useSound = create<SoundStore>((set, get) => ({
  muted: storedMuted(),
  toggleMuted: () => {
    const muted = !get().muted
    try {
      localStorage.setItem(MUTED_KEY, muted ? '1' : '0')
    } catch {
      /* the choice still holds for this session, it just will not outlive it */
    }
    set({ muted })
  },
}))

/** A rising major triad, C6–E6–G6. Short and bright, ends before it can drone. */
const CHIME_HZ = [1046.5, 1318.5, 1568.0]
const NOTE_GAP_S = 0.085
const NOTE_LENGTH_S = 0.22
/** Well under a phone at half volume — this lands on top of a lesson, not over it. */
const PEAK_GAIN = 0.14

let context: AudioContext | null = null
let supported: boolean | null = null

function ensureContext(): AudioContext | null {
  if (context) return context
  if (supported === false) return null
  if (typeof window === 'undefined') return null

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  supported = Boolean(Ctor)
  if (!Ctor) return null

  context = new Ctor()
  return context
}

function playNote(ctx: AudioContext, hz: number, at: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  // Triangle, not sine: a little more body without the buzz of a square, which
  // matters on a phone speaker that rolls off everything below the note itself.
  osc.type = 'triangle'
  osc.frequency.value = hz

  // A quick fade in and an exponential tail. A bare start/stop clicks, because
  // the waveform is cut mid-cycle at full amplitude.
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, at + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + NOTE_LENGTH_S)

  osc.connect(gain).connect(ctx.destination)
  osc.start(at)
  osc.stop(at + NOTE_LENGTH_S)
}

/** The cue for finishing a skill's lesson. Roughly 0.4s end to end. */
export function success() {
  if (useSound.getState().muted) return

  try {
    const ctx = ensureContext()
    if (!ctx) return

    // Browsers start the context suspended until a gesture. Every call site is
    // downstream of a tap, so resuming here is enough — and if a policy still
    // refuses, the rejected promise is swallowed rather than surfacing.
    if (ctx.state === 'suspended') void ctx.resume()

    const start = ctx.currentTime
    CHIME_HZ.forEach((hz, i) => playNote(ctx, hz, start + i * NOTE_GAP_S))
  } catch {
    /* sound is decoration — never let it break a lesson */
  }
}
