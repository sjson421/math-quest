/**
 * The colours the three built units already wear, pinned.
 *
 * Deriving the tone from manifest position replaced three hand-written `color`
 * fields. This is what says the derivation reproduced them rather than
 * recolouring the app on the way past.
 */

import { describe, expect, it } from 'vitest'
import { allUnits } from '../curriculum/manifest'
import { TONE_CLASSES, toneForUnit, type Tone } from './tone'

describe('toneForUnit', () => {
  it('keeps the colours the built units had before the tone was derived', () => {
    expect(toneForUnit('unit-0')).toBe('powder')
    expect(toneForUnit('unit-1')).toBe('blossom')
    expect(toneForUnit('unit-2')).toBe('mint')
  })

  it('gives every unit in the course a tone', () => {
    const untoned = allUnits.filter((unit) => !(toneForUnit(unit.id) in TONE_CLASSES))

    expect(allUnits).toHaveLength(23)
    expect(untoned).toEqual([])
  })

  it('never repeats a tone on neighbouring units', () => {
    const repeated = allUnits
      .map((unit) => toneForUnit(unit.id))
      .filter((tone, i, tones) => i > 0 && tone === tones[i - 1])

    expect(repeated).toEqual([])
  })

  it('is stable, so a unit does not change colour between reads', () => {
    expect(toneForUnit('unit-7')).toBe(toneForUnit('unit-7'))
  })

  it('falls back rather than leaving an unknown unit uncoloured', () => {
    const tone: Tone = toneForUnit('unit-not-in-the-manifest')

    expect(TONE_CLASSES[tone]).toBeDefined()
  })
})
