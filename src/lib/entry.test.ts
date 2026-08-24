import { describe, expect, it } from 'vitest'
import { intAnswer } from './answer'
import { visibleEntry } from './entry'
import { rational } from './rational'
import type { Problem } from './types'

/**
 * The dispatch every input mode's echo goes through.
 *
 * Each translation is covered where it lives — `entryLabel` in `keypad.test.ts`,
 * `placedLabel` in `number-line.test.ts` — and until this moved out of the
 * component the thing choosing between them was covered nowhere: the lesson's
 * first paint always has an empty entry, so a static render exercises none of
 * these branches.
 */
const problem = (overrides: Partial<Problem> = {}): Problem => ({
  skillId: 'synthetic',
  prompt: 'What is the value?',
  display: { kind: 'inline', text: '−3 + −5' },
  answer: intAnswer(-8),
  inputMode: 'keypad',
  hint: 'Add the sizes, keep the sign.',
  solution: [{ text: 'Add 3 and 5.' }],
  difficulty: 1,
  ...overrides,
})

describe('visibleEntry', () => {
  it('reads a typed sign the way the problem above it is drawn', () => {
    // The pair this exists for: the display carries `−`, the checker gets `-`,
    // and before this both were on screen at once.
    expect(visibleEntry(problem(), '-8')).toBe('−8')
    expect(visibleEntry(problem(), '8')).toBe('8')
    expect(visibleEntry(problem(), '')).toBe('')
  })

  it('reads a choice as its label rather than its id', () => {
    const compare = problem({
      inputMode: 'choice',
      answer: { kind: 'choice', id: '-1' },
      choices: [
        { id: '-1', label: '<' },
        { id: '1', label: '>' },
      ],
    })

    expect(visibleEntry(compare, '-1')).toBe('<')
    // An id no declared choice carries echoes nothing, rather than the id.
    expect(visibleEntry(compare, 'nonexistent')).toBe('')
  })

  it('reads a placement through the tick it landed on', () => {
    const line = problem({
      inputMode: 'number-line',
      numberLine: { start: rational(-5, 1), step: rational(1, 1), count: 11 },
    })

    expect(visibleEntry(line, '-3')).toBe('−3')
    // Off the line is not a placement, so there is nothing to echo.
    expect(visibleEntry(line, '99')).toBe('')
  })

  it('echoes nothing for a number-line problem that declares no line', () => {
    // Unreachable in the course and cheap to pin: the lesson renders no control
    // for this problem, so there is no entry it could have come from. The
    // branch chain this replaced fell through to the keypad's translation here.
    expect(visibleEntry(problem({ inputMode: 'number-line' }), '-3')).toBe('')
  })

  it('leaves the internal point entry to the coordinate placement surface', () => {
    expect(visibleEntry(problem({ inputMode: 'coordinate-plane' }), '-3,2')).toBe('')
  })

  it('leaves the private root tuple to the two-slot input surface', () => {
    expect(visibleEntry(problem({ inputMode: 'root-pair' }), '["-3","4"]')).toBe('')
  })
})
