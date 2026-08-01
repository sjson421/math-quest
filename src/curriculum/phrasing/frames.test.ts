import { describe, expect, it } from 'vitest'
import {
  CHECK_QUANTITIES,
  applyOperator,
  storyProblem,
  type Frame,
  type Quantities,
} from '../engine'
import { skillById } from '../manifest/index'
import { checkContent, formatViolations } from '../../lib/content-rules'
import type { ContentLocation } from '../../lib/content-rules'
import type { Operator, Problem } from '../../lib/types'
import { ADDITION_FRAMES } from './addition'
import { SUBTRACTION_FRAMES } from './subtraction'

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

/**
 * Every authored bank, with the skill that draws from it and the unit that skill
 * sits in. The unit id is not decoration: the forward-reference rule is about
 * where a word is introduced relative to where it is used, so a bank checked
 * under another unit's number is checked under the wrong rule.
 */
type Bank = { name: string; skillId: string; unitId: string; frames: Frame[] }

const banks: Bank[] = [
  { name: 'addition', skillId: 'add-words', unitId: 'unit-1', frames: ADDITION_FRAMES },
  { name: 'subtraction', skillId: 'sub-words', unitId: 'unit-2', frames: SUBTRACTION_FRAMES },
]

const locationFor = (skillId: string, unitId: string): ContentLocation => {
  const skill = skillById.get(skillId)
  if (!skill) throw new Error(`${skillId} is not in the manifest`)
  return { skill, unit: { id: unitId } }
}

const problemFor = (frame: Frame, q: Quantities, skillId: string): Problem => ({
  ...storyProblem(frame, q),
  skillId,
  inputMode: 'keypad',
  difficulty: 1,
})

/**
 * The quantities a bank may be checked with — its operator's, since every frame
 * in a bank shares one. A bank whose frames disagree is a bug in the bank, and
 * is caught here rather than by quietly checking half of it wrongly.
 */
function quantitiesFor(frames: Frame[]): { operator: Operator; sets: Quantities[] } {
  const operators = [...new Set(frames.map((f) => f.operator))]
  if (operators.length !== 1) {
    throw new Error(`a bank must share one operator, found ${operators.join(', ')}`)
  }

  const operator = operators[0]
  const sets = CHECK_QUANTITIES[operator]
  if (!sets) {
    throw new Error(`no check quantities are declared for the ${operator} operator`)
  }
  return { operator, sets }
}

/** Every violation across the bank, each labelled with the frame that caused it. */
function checkBank({ skillId, unitId, frames }: Bank): string[] {
  const at = locationFor(skillId, unitId)
  const { sets } = quantitiesFor(frames)

  return frames.flatMap((frame) =>
    sets.flatMap((q) =>
      formatViolations(checkContent(problemFor(frame, q, skillId), at)).map(
        (violation) => `${frame.id}: ${violation}`,
      ),
    ),
  )
}

it('checks every authored bank, not only the first', async () => {
  // A checker that returns "no problems" looks exactly like a clean codebase.
  // The banks are registered by hand above, so a third one authored and not
  // added here would go entirely unchecked while this file stayed green — which
  // is the same hole, one level up, that checking frames at their source closes.
  const authored = import.meta.glob('./*.ts', { eager: false })
  const modules = Object.keys(authored).filter((path) => !path.endsWith('.test.ts'))

  const exported = await Promise.all(
    modules.map(async (path) => {
      const module = (await authored[path]()) as Record<string, unknown>
      const found = Object.values(module).find(
        (value): value is Frame[] => Array.isArray(value) && value.length > 0 && 'nudges' in value[0],
      )
      return { path, frames: found }
    }),
  )

  const unregistered = exported
    .filter(({ frames }) => frames && !banks.some((bank) => bank.frames === frames))
    .map(({ path }) => path)

  expect(unregistered, 'add these to `banks` so they are checked').toEqual([])
  expect(exported.filter(({ frames }) => frames)).toHaveLength(banks.length)
})

describe.each(banks)('the $name frame bank', (bank: Bank) => {
  const { skillId, frames } = bank
  const { operator, sets } = quantitiesFor(frames)
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
    expect(checkBank(bank)).toEqual([])
  })

  it('mentions all three quantities in every frame', () => {
    // A story with no distractor is an arithmetic problem wearing a sentence,
    // and `distractor-pair` would predict an error the wording cannot invite.
    for (const frame of frames) {
      for (const q of sets) {
        const text = frame.text(q)
        for (const [label, value] of Object.entries(q)) {
          expect(text, `${frame.id} omits its ${label}`).toContain(String(value))
        }
      }
    }
  })

  it('is checked with quantities its own operation can produce', () => {
    // The failure this replaces: one shared list whose first entry was 2 and 3,
    // which a subtraction bank would have been instantiated at — describing a
    // difference of −1 that its draw can never produce, while the sentences a
    // learner does see went unchecked.
    for (const q of sets) {
      expect(applyOperator(q.a, q.b, operator), `${q.a} ${operator} ${q.b}`).toBeGreaterThan(0)
      expect(
        applyOperator(q.a, q.distractor, operator),
        `${q.a} ${operator} ${q.distractor}`,
      ).toBeGreaterThan(0)
      expect(q.distractor, 'the distractor must not be the second quantity').not.toBe(q.b)
    }
  })

  it('predicts three comprehension errors per frame, none equal to the answer', () => {
    for (const frame of frames) {
      for (const q of sets) {
        const problem = problemFor(frame, q, skillId)
        const values = (problem.misconceptions ?? []).map((m) => m.value)
        // The bank's own operation, not addition's. Checking a subtraction bank
        // against `a + b` asks whether it predicts a value it never could.
        expect(values, frame.id).toHaveLength(3)
        expect(values, frame.id).not.toContain(applyOperator(q.a, q.b, operator))
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

  const check = (frames: Frame[]) =>
    checkBank({ name: 'broken', skillId: 'add-words', unitId: 'unit-1', frames }).join('\n')

  it('catches an over-long solution step and names the frame', () => {
    const problems = check([
      broken({
        solution: () => [
          {
            text: 'This solution step runs on and on well past the twelve word limit it must respect.',
          },
        ],
      }),
    ])

    expect(problems).toContain('deliberately-broken')
    expect(problems).toContain('step-length')
  })

  it('catches a two-sentence hint', () => {
    expect(check([broken({ hint: () => 'Add them. Then check your work.' })])).toContain(
      'hint-sentences',
    )
  })

  it('catches a frame that never gets sampled, because it checks all of them', () => {
    // The case sampling alone misses: one bad frame among nine good ones.
    expect(check([...ADDITION_FRAMES, broken({ hint: () => '' })])).toContain('empty-hint')
  })

  it('catches a forward reference in the story text itself', () => {
    // Story prose reaches `learnerText()`, so a later unit's word is caught
    // here rather than reaching a learner.
    expect(
      check([
        broken({
          text: ({ a, b, distractor }) =>
            `Find the numerator of ${a} and ${b}, ignoring ${distractor}.`,
        }),
      ]),
    ).toContain('forward-reference')
  })

  it('catches a broken subtraction frame too, under its own quantities', () => {
    // The second bank is not along for the ride: it is instantiated from the
    // subtraction quantity sets, so a violation only those numbers produce is
    // still named.
    const frames = [
      {
        ...SUBTRACTION_FRAMES[0],
        id: 'deliberately-broken',
        hint: () => 'Take one away. Then check it.',
      },
    ]

    const bank = { name: 'broken', skillId: 'sub-words', unitId: 'unit-2', frames }
    expect(checkBank(bank).join('\n')).toContain(
      'deliberately-broken: sub-words [hint-sentences]',
    )
  })

  it('refuses a bank whose frames disagree about the operation', () => {
    // Mixing operators would silently check half the bank against the other
    // half's quantities, which is exactly the failure this change removes.
    const mixed = {
      name: 'mixed',
      skillId: 'add-words',
      unitId: 'unit-1',
      frames: [ADDITION_FRAMES[0], SUBTRACTION_FRAMES[0]],
    }
    expect(() => checkBank(mixed)).toThrow('a bank must share one operator')
  })
})
