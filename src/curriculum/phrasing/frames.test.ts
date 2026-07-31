import { describe, expect, it } from 'vitest'
import { CHECK_QUANTITIES, storyProblem, type Frame, type Quantities } from '../engine'
import { skillById } from '../manifest/index'
import { checkContent, formatViolations } from '../../lib/content-rules'
import type { ContentLocation } from '../../lib/content-rules'
import type { Problem } from '../../lib/types'
import { ADDITION_FRAMES } from './addition'

/**
 * The frame bank, checked at its source.
 *
 * `generators.test.ts` checks the frames a thousand samples happen to draw. That
 * is sound while every string is computed from the operands of the problem it
 * belongs to, because a thousand problems is a thousand strings — but a bank of
 * ten frames drawn at random can leave one unsampled, and an unchecked sentence
 * reaching a learner is the exact failure the contract exists to prevent.
 *
 * So: every frame, every time, whether or not a sample ever draws it.
 */

const banks: [string, string, Frame[]][] = [['addition', 'add-words', ADDITION_FRAMES]]

const locationFor = (skillId: string): ContentLocation => {
  const skill = skillById.get(skillId)
  if (!skill) throw new Error(`${skillId} is not in the manifest`)
  return { skill, unit: { id: 'unit-1' } }
}

const problemFor = (frame: Frame, q: Quantities, skillId: string): Problem => ({
  ...storyProblem(frame, q),
  skillId,
  inputMode: 'keypad',
  difficulty: 1,
})

/** Every violation across the bank, each labelled with the frame that caused it. */
function checkBank(frames: Frame[], skillId: string): string[] {
  const at = locationFor(skillId)

  return frames.flatMap((frame) =>
    CHECK_QUANTITIES.flatMap((q) =>
      formatViolations(checkContent(problemFor(frame, q, skillId), at)).map(
        (violation) => `${frame.id}: ${violation}`,
      ),
    ),
  )
}

describe.each(banks)('the %s frame bank', (_name, skillId, frames) => {
  it('has enough frames that a lesson does not read as one sentence', () => {
    // Ten problems in a lesson, so fewer than eight frames guarantees repeats
    // that a learner will notice.
    expect(frames.length).toBeGreaterThanOrEqual(8)
  })

  it('gives every frame a distinct id', () => {
    const ids = frames.map((f) => f.id)
    expect(new Set(ids).size, ids.join(', ')).toBe(ids.length)
  })

  it('satisfies the content contract on every frame, drawn or not', () => {
    expect(checkBank(frames, skillId)).toEqual([])
  })

  it('mentions all three quantities in every frame', () => {
    // A story with no distractor is an arithmetic problem wearing a sentence,
    // and `distractor-pair` would predict an error the wording cannot invite.
    for (const frame of frames) {
      const q = { a: 14, b: 27, distractor: 9 }
      const text = frame.text(q)
      for (const [label, value] of Object.entries(q)) {
        expect(text, `${frame.id} omits its ${label}`).toContain(String(value))
      }
    }
  })

  it('predicts three comprehension errors per frame, none equal to the answer', () => {
    for (const frame of frames) {
      for (const q of CHECK_QUANTITIES) {
        const problem = problemFor(frame, q, skillId)
        const values = (problem.misconceptions ?? []).map((m) => m.value)
        expect(values, frame.id).toHaveLength(3)
        expect(values, frame.id).not.toContain(q.a + q.b)
      }
    }
  })
})

describe('the frame check itself', () => {
  // A checker that returns "no problems" looks exactly like a clean codebase.
  const broken = (overrides: Partial<Frame>): Frame => ({
    ...ADDITION_FRAMES[0],
    id: 'deliberately-broken',
    ...overrides,
  })

  it('catches an over-long solution step and names the frame', () => {
    const frames = [
      broken({
        solution: () => [
          {
            text: 'This solution step runs on and on well past the twelve word limit it must respect.',
          },
        ],
      }),
    ]

    const problems = checkBank(frames, 'add-words')
    expect(problems.join('\n')).toContain('deliberately-broken')
    expect(problems.join('\n')).toContain('step-length')
  })

  it('catches a two-sentence hint', () => {
    const frames = [broken({ hint: () => 'Add them. Then check your work.' })]
    expect(checkBank(frames, 'add-words').join('\n')).toContain('hint-sentences')
  })

  it('catches a frame that never gets sampled, because it checks all of them', () => {
    // The case sampling alone misses: one bad frame among nine good ones.
    const frames = [...ADDITION_FRAMES, broken({ hint: () => '' })]
    expect(checkBank(frames, 'add-words').join('\n')).toContain('empty-hint')
  })

  it('catches a forward reference in the story text itself', () => {
    // Story prose reaches `learnerText()`, so a later unit's word is caught
    // here rather than reaching a learner.
    const frames = [
      broken({
        text: ({ a, b, distractor }) =>
          `Find the numerator of ${a} and ${b}, ignoring ${distractor}.`,
      }),
    ]
    expect(checkBank(frames, 'add-words').join('\n')).toContain('forward-reference')
  })
})
