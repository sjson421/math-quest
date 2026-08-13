import { describe, expect, it } from 'vitest'
import {
  CHECK_QUANTITIES,
  applyOperator,
  fractionStoryProblem,
  storyMisconceptions,
  storyProblem,
  type Frame,
  type Quantities,
} from '../engine'
import {
  RATIO_FRAMES,
  ratioStoryProblem,
  ratioText,
  type RatioComparison,
  type RatioFrame,
  type RatioQuantities,
} from './ratios'
import { skillById } from '../manifest/index'
import { checkContent, formatViolations } from '../../lib/content-rules'
import type { ContentLocation } from '../../lib/content-rules'
import type { Operator, Problem } from '../../lib/types'
import { ADDITION_FRAMES } from './addition'
import { DIVISION_FRAMES } from './division'
import { FRACTION_FRAMES } from './fractions'
import { MONEY_FRAMES } from './money'
import { MULTIPLICATION_FRAMES } from './multiplication'
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
type Bank = {
  name: string
  skillId: string
  unitId: string
  kind: 'whole' | 'fraction'
  frames: Frame[]
}

const banks: Bank[] = [
  { name: 'addition', skillId: 'add-words', unitId: 'unit-1', kind: 'whole', frames: ADDITION_FRAMES },
  { name: 'subtraction', skillId: 'sub-words', unitId: 'unit-2', kind: 'whole', frames: SUBTRACTION_FRAMES },
  {
    name: 'multiplication',
    skillId: 'mult-words',
    unitId: 'unit-3',
    kind: 'whole',
    frames: MULTIPLICATION_FRAMES,
  },
  { name: 'division', skillId: 'div-words', unitId: 'unit-4', kind: 'whole', frames: DIVISION_FRAMES },
  { name: 'fractions', skillId: 'fraction-words', unitId: 'unit-8', kind: 'fraction', frames: FRACTION_FRAMES },
  { name: 'money', skillId: 'money-problems', unitId: 'unit-9', kind: 'whole', frames: MONEY_FRAMES },
]

type RatioBank = {
  name: string
  frames: RatioFrame[]
}

const ratioBanks: RatioBank[] = [
  { name: 'ratio', frames: RATIO_FRAMES },
]

const registeredFrameArrays: ReadonlyArray<readonly (Frame | RatioFrame)[]> = [
  ...banks.map(({ frames }) => frames),
  ...ratioBanks.map(({ frames }) => frames),
]

type FrameArray = Frame[] | RatioFrame[]

type ExportedFrameArray = {
  path: string
  exportName: string
  frames: FrameArray
}

const isFrameArray = (value: unknown): value is FrameArray =>
  Array.isArray(value) &&
  value.length > 0 &&
  ('nudges' in value[0] || 'partToPartText' in value[0])

const exportedFrameArrays = (
  path: string,
  module: Record<string, unknown>,
): ExportedFrameArray[] =>
  Object.entries(module).flatMap(([exportName, value]) =>
    isFrameArray(value) ? [{ path, exportName, frames: value }] : [],
  )

const unregisteredFrameArrays = (exported: ExportedFrameArray[]): string[] =>
  exported
    .filter(({ frames }) => !registeredFrameArrays.includes(frames))
    .map(({ path, exportName }) => `${path}#${exportName}`)

const FRACTION_CHECK_QUANTITIES: Quantities[] = [
  { a: 1, b: 4, distractor: 2 },
  { a: 2, b: 5, distractor: 3 },
  { a: 5, b: 12, distractor: 7 },
  { a: 18, b: 30, distractor: 11 },
]

const RATIO_CHECK_QUANTITIES: RatioQuantities[] = [
  { first: 2, second: 3 },
  { first: 11, second: 7 },
  { first: 28, second: 19 },
  { first: 75, second: 46 },
]

const RATIO_COMPARISONS: RatioComparison[] = ['part-to-part', 'part-to-whole']

const locationFor = (skillId: string, unitId: string): ContentLocation => {
  const skill = skillById.get(skillId)
  if (!skill) throw new Error(`${skillId} is not in the manifest`)
  return { skill, unit: { id: unitId } }
}

const problemFor = (bank: Bank, frame: Frame, q: Quantities): Problem => ({
  ...(bank.kind === 'fraction' ? fractionStoryProblem(frame, q) : storyProblem(frame, q)),
  skillId: bank.skillId,
  inputMode: 'keypad',
  difficulty: 1,
})

/**
 * The quantities a bank may be checked with — its operator's, since every frame
 * in a bank shares one. A bank whose frames disagree is a bug in the bank, and
 * is caught here rather than by quietly checking half of it wrongly.
 */
function quantitiesFor({ frames, kind }: Bank): { operator: Operator; sets: Quantities[] } {
  const operators = [...new Set(frames.map((f) => f.operator))]
  if (operators.length !== 1) {
    throw new Error(`a bank must share one operator, found ${operators.join(', ')}`)
  }

  const operator = operators[0]
  const sets = kind === 'fraction' ? FRACTION_CHECK_QUANTITIES : CHECK_QUANTITIES[operator]
  if (!sets) {
    throw new Error(`no check quantities are declared for the ${operator} operator`)
  }
  return { operator, sets }
}

/** Every violation across the bank, each labelled with the frame that caused it. */
function checkBank(bank: Bank): string[] {
  const { skillId, unitId, frames } = bank
  const at = locationFor(skillId, unitId)
  const { sets } = quantitiesFor(bank)

  return frames.flatMap((frame) =>
    sets.flatMap((q) =>
      formatViolations(checkContent(problemFor(bank, frame, q), at)).map(
        (violation) => `${frame.id}: ${violation}`,
      ),
    ),
  )
}

const ratioProblemFor = (
  frame: RatioFrame,
  q: RatioQuantities,
  comparison: RatioComparison,
): Problem => ({
  ...ratioStoryProblem(frame, q, comparison),
  skillId: 'ratio-words',
  inputMode: 'keypad',
  difficulty: 1,
})

function checkRatioBank(frames: RatioFrame[]): string[] {
  const at = locationFor('ratio-words', 'unit-11')

  return frames.flatMap((frame) =>
    RATIO_CHECK_QUANTITIES.flatMap((q) =>
      RATIO_COMPARISONS.flatMap((comparison) =>
        formatViolations(checkContent(ratioProblemFor(frame, q, comparison), at)).map(
          (violation) => `${frame.id}: ${violation}`,
        ),
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

  const exported = (await Promise.all(
    modules.map(async (path) =>
      exportedFrameArrays(path, (await authored[path]()) as Record<string, unknown>),
    ),
  )).flat()

  expect(unregisteredFrameArrays(exported), 'add these to `banks` so they are checked').toEqual([])
  expect(exported).toHaveLength(registeredFrameArrays.length)
})

it('finds a second unregistered frame bank exported from one module', () => {
  const extra = [RATIO_FRAMES[0]]
  const exported = exportedFrameArrays('./ratios.ts', {
    RATIO_FRAMES,
    EXTRA_RATIO_FRAMES: extra,
  })

  expect(unregisteredFrameArrays(exported)).toEqual(['./ratios.ts#EXTRA_RATIO_FRAMES'])
})

it('rejects a whole-number frame in the fraction builder', () => {
  expect(() =>
    fractionStoryProblem(ADDITION_FRAMES[0], { a: 2, b: 5, distractor: 3 }),
  ).toThrow('fraction stories require division frames')
})

describe.each(banks)('the $name frame bank', (bank: Bank) => {
  const { frames } = bank
  const { operator, sets } = quantitiesFor(bank)
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
        const problem = problemFor(bank, frame, q)
        const values = (problem.misconceptions ?? []).map((m) => m.value)
        // The bank's own operation, not addition's. Checking a subtraction bank
        // against `a + b` asks whether it predicts a value it never could.
        expect(values, frame.id).toHaveLength(3)
        expect(values, frame.id).not.toContain(applyOperator(q.a, q.b, operator))
      }
    }
  })

  if (operator === '×') {
    it('rejects quantity sets where addition accidentally equals multiplication', () => {
      for (const q of sets) {
        expect(q.a + q.b, `${q.a} + ${q.b} must differ from ${q.a} × ${q.b}`).not.toBe(
          q.a * q.b,
        )
      }
    })
  }

  if (operator === '÷' && bank.kind === 'whole') {
    it('divides exactly by both the second quantity and the distractor', () => {
      // The division equivalent of the rule above. `a ÷ distractor` is one of
      // the three predicted values, so a distractor that does not divide the
      // total predicts a fraction — which no whole-number pad can produce, so
      // the diagnosis sits in the bank and never once fires.
      for (const q of sets) {
        expect(q.a % q.b, `${q.a} ÷ ${q.b} must come out exactly`).toBe(0)
        expect(
          q.a % q.distractor,
          `${q.a} ÷ ${q.distractor} must come out exactly`,
        ).toBe(0)
        // Dividing by one returns the total, which is already predicted as the
        // intermediate-value error — dedup would silently drop one of the two.
        expect(q.distractor, 'the distractor must not be one').not.toBe(1)
      }
    })
  }

  if (bank.kind === 'fraction') {
    it('uses singular grammar when the named part is one item', () => {
      const singleton = { a: 1, b: 4, distractor: 2 }
      const pluralAfterOne =
        /\b1 (?:are|complete tasks|overdue invoices|occupied desks|completed modules|restocked shelves|approved applications|inspected tools|planted beds)\b/
      for (const frame of frames) {
        expect(frame.text(singleton), frame.id).not.toMatch(pluralAfterOne)
        expect(frame.hint(singleton), frame.id).not.toMatch(pluralAfterOne)
      }
    })

    it('uses positive proper part-over-whole quantities', () => {
      for (const q of sets) {
        expect(q.a).toBeGreaterThan(0)
        expect(q.a).toBeLessThan(q.b)
        expect(q.distractor).toBeGreaterThan(1)
        expect(q.distractor).not.toBe(q.b)
      }
    })

    it('keeps all three fraction comprehension predictions distinct', () => {
      for (const frame of frames) {
        for (const q of sets) {
          const problem = problemFor(bank, frame, q)
          const values = problem.misconceptions?.map(({ value }) => value) ?? []
          expect(new Set(values).size, frame.id).toBe(3)
          expect(values, frame.id).not.toContain(q.a / q.b)
        }
      }
    })
  }
})

describe.each(ratioBanks)('the $name frame bank', ({ frames }) => {
  it('has enough distinct frames for a standard lesson', () => {
    expect(frames.length).toBeGreaterThanOrEqual(8)
    expect(new Set(frames.map(({ id }) => id)).size).toBe(frames.length)
  })

  it('satisfies the content contract in both comparison modes', () => {
    expect(checkRatioBank(frames)).toEqual([])
  })

  it('states both category counts and their combined whole', () => {
    for (const frame of frames) {
      for (const q of RATIO_CHECK_QUANTITIES) {
        for (const comparison of RATIO_COMPARISONS) {
          const text = ratioText(frame, q, comparison)
          expect(text, `${frame.id} omits its first count`).toContain(String(q.first))
          expect(text, `${frame.id} omits its second count`).toContain(String(q.second))
          expect(text, `${frame.id} omits its total`).toContain(String(q.first + q.second))
        }
      }
    }
  })

  it('carries the same counts and comparison as the visible story', () => {
    for (const frame of frames) {
      for (const q of RATIO_CHECK_QUANTITIES) {
        for (const comparison of RATIO_COMPARISONS) {
          const problem = ratioProblemFor(frame, q, comparison)
          if (problem.display.kind !== 'story' || problem.display.ratio?.operation !== 'ratio-word') {
            throw new Error('expected ratio-word story')
          }
          expect(problem.display.text).toBe(ratioText(frame, q, comparison))
          expect(problem.display.ratio).toEqual({
            operation: 'ratio-word',
            frameId: frame.id,
            ...q,
            comparison,
          })
        }
      }
    }
  })

  it('keeps both wall predictions distinct from each other and the answer', () => {
    for (const frame of frames) {
      for (const q of RATIO_CHECK_QUANTITIES) {
        for (const comparison of RATIO_COMPARISONS) {
          const problem = ratioProblemFor(frame, q, comparison)
          const values = problem.misconceptions?.map(({ value }) => value) ?? []
          const denominator = comparison === 'part-to-part' ? q.second : q.first + q.second
          expect(values, `${frame.id} ${comparison}`).toHaveLength(2)
          expect(new Set(values).size, `${frame.id} ${comparison}`).toBe(2)
          expect(values, `${frame.id} ${comparison}`).not.toContain(q.first / denominator)
        }
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
    checkBank({ name: 'broken', skillId: 'add-words', unitId: 'unit-1', kind: 'whole', frames }).join('\n')

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

    const bank = { name: 'broken', skillId: 'sub-words', unitId: 'unit-2', kind: 'whole' as const, frames }
    expect(checkBank(bank).join('\n')).toContain(
      'deliberately-broken: sub-words [hint-sentences]',
    )
  })

  it('catches a broken multiplication frame under multiplication quantities', () => {
    const frames = [
      {
        ...MULTIPLICATION_FRAMES[0],
        id: 'deliberately-broken-multiplication',
        hint: () => 'Multiply the groups. Then check it.',
      },
    ]

    const bank = { name: 'broken', skillId: 'mult-words', unitId: 'unit-3', kind: 'whole' as const, frames }
    expect(checkBank(bank).join('\n')).toContain(
      'deliberately-broken-multiplication: mult-words [hint-sentences]',
    )
  })

  it('catches a broken division frame under division quantities', () => {
    const frames = [
      {
        ...DIVISION_FRAMES[0],
        id: 'deliberately-broken-division',
        hint: () => 'Divide the total. Then check it.',
      },
    ]

    const bank = { name: 'broken', skillId: 'div-words', unitId: 'unit-4', kind: 'whole' as const, frames }
    expect(checkBank(bank).join('\n')).toContain(
      'deliberately-broken-division: div-words [hint-sentences]',
    )
  })

  it('predicts multiplication as a division story wrong operation, not addition', () => {
    // The partner map's whole reason. A learner who has not identified the
    // operation combines the two quantities; predicting 12 + 3 would name an
    // error the sentence does not invite, and 15 is not a value anyone reaches.
    const q = { a: 12, b: 3, distractor: 2 }
    const wrongOperation = storyMisconceptions(DIVISION_FRAMES[0], q).find(
      (m) => m.tag === 'wrong-operation',
    )

    expect(wrongOperation?.value).toBe(36)
  })

  it('leaves the other three operations predicting what they always did', () => {
    const pairs = [
      [ADDITION_FRAMES[0], { a: 14, b: 27, distractor: 9 }, 13],
      [SUBTRACTION_FRAMES[0], { a: 41, b: 27, distractor: 9 }, 68],
      [MULTIPLICATION_FRAMES[0], { a: 7, b: 6, distractor: 4 }, 13],
    ] as const

    for (const [frame, q, expected] of pairs) {
      const wrongOperation = storyMisconceptions(frame, q).find(
        (m) => m.tag === 'wrong-operation',
      )
      expect(wrongOperation?.value, frame.id).toBe(expected)
    }
  })

  it('refuses a bank whose frames disagree about the operation', () => {
    // Mixing operators would silently check half the bank against the other
    // half's quantities, which is exactly the failure this change removes.
    const mixed = {
      name: 'mixed',
      skillId: 'add-words',
      unitId: 'unit-1',
      kind: 'whole' as const,
      frames: [ADDITION_FRAMES[0], SUBTRACTION_FRAMES[0]],
    }
    expect(() => checkBank(mixed)).toThrow('a bank must share one operator')
  })
})
