import { describe, expect, it } from 'vitest'
import { checkTeachingLine } from '../lib/content-rules'
import { generateProblem } from '../lib/generator'
import { placement, ticks } from '../lib/number-line'
import { toNumber } from '../lib/rational'
import type { Problem } from '../lib/types'
import { manifestIndex } from './index'
import { format, sample, sweep, unrenderedKeys } from './recorded-output'
import { unit06 } from './unit-06-negatives'

describe.each(unit06.map((skill) => [skill.id, skill] as const))(
  'recorded output: %s',
  (_id, skill) => {
    it('matches the wording recorded when the skill landed', () => {
      expect(sample(skill)).toMatchSnapshot()
    })
  },
)

const { everyProblem, exactValue } = sweep(unit06, 'Unit 6')

const allProblems = () => unit06.flatMap((generator) => everyProblem(generator.id))

const shown = (problem: Problem) => {
  if (problem.display.kind !== 'inline') throw new Error('expected an inline problem')
  return problem.display.text
}

const teachingLines = [
  ['negatives-numberline', 'Negative numbers sit to the left of zero on a number line.'],
  ['compare-negatives', 'Farther left on the number line means smaller.'],
  ['add-neg-pos', "With different signs, subtract the sizes and keep the larger size's sign."],
  ['add-two-negs', 'Add the sizes of two negative numbers, then keep the negative sign.'],
  ['sub-negatives', "Subtracting a negative is the same as adding its positive size."],
  ['mult-negatives', 'When multiplying, matching signs give positive and different signs give negative.'],
  ['div-negatives', 'When dividing, matching signs give positive and different signs give negative.'],
  ['absolute-value', "Absolute value is a number's distance from zero."],
  ['negatives-mixed', 'Choose the operation first, then apply its negative-number rule.'],
] as const

const teachingSkill = (id: string) => {
  const found = unit06.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing Unit 6 skill: ${id}`)
  return found
}

const answerChoiceLabel = (problem: Problem): string => {
  if (problem.answer.kind !== 'choice') throw new Error(`Expected choice answer for ${problem.skillId}`)
  const answerId = problem.answer.id
  const choice = problem.choices?.find((candidate) => candidate.id === answerId)
  if (!choice) throw new Error(`Missing answer choice for ${problem.skillId}`)
  return choice.label
}

describe('Stage C Unit 6 teaching lines', () => {
  it.each(teachingLines)('keeps the reviewed line for %s', (id, line) => {
    const generator = teachingSkill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })
})

describe('Stage C Unit 6 intro examples', () => {
  it('recomputes every fixed example from visible values', () => {
    for (const [id] of teachingLines) {
      const problem = generateProblem(teachingSkill(id), 1, 1)

      if (id === 'compare-negatives') {
        if (problem.display.kind !== 'inline' || problem.display.wholeNumber?.operation !== 'compare') {
          throw new Error('expected comparison data')
        }
        const { left, right } = problem.display.wholeNumber
        const relation = left < right ? -1 : 1
        expect(problem.answer).toEqual({ kind: 'choice', id: String(relation) })
        expect(answerChoiceLabel(problem)).toBe(left < right ? '<' : '>')
        expect(new Set(problem.misconceptions?.map(({ tag }) => tag))).toEqual(
          new Set(['reversed-comparison', 'called-equal']),
        )
        continue
      }

      const value = readDisplay(shown(problem))
      expect(problem.answer).toEqual({ kind: 'exact', n: value, d: 1 })

      if (id === 'negatives-numberline') {
        if (!problem.numberLine) throw new Error('expected number line')
        expect(placement(ticks(problem.numberLine), String(value)).canConfirm).toBe(true)
      }

      if (id === 'add-neg-pos') {
        expect(new Set(problem.misconceptions?.map(({ tag }) => tag))).toEqual(
          new Set(['added-magnitudes', 'wrong-sign']),
        )
      }
      if (id === 'sub-negatives') {
        const tags = new Set(problem.misconceptions?.map(({ tag }) => tag))
        expect(tags).toContain('still-subtracted')
        expect(tags.size).toBe(2)
      }
    }
  })
})

/**
 * Read a Unit 6 display back, written from scratch.
 *
 * The third independent reader in the repository, and the reason is the one
 * Unit 5 gives for the second: a helper shared with the generator agrees with
 * it by construction. `generators.test.ts` uses recursive descent over a
 * tokenizer; Unit 5 uses a shunting-yard fold; this one splits on the operator
 * because a Unit 6 display is exactly two signed values around one of four
 * symbols, or a value between bars.
 *
 * Everything it accepts must be spelled the way the course draws it — the
 * typographic minus. An ASCII hyphen reaching here is a display carrying the
 * entry form, and it throws rather than quietly agreeing.
 */
function readDisplay(text: string): number {
  if (text.includes('-')) throw new Error(`ASCII hyphen in a display: "${text}"`)

  const value = (token: string): number => {
    if (!/^−?\d+$/.test(token)) throw new Error(`not a signed whole number: "${token}"`)
    return Number(token.replace('−', '-'))
  }

  // A value on its own, which is what the reading skill shows: there is no
  // arithmetic to do, and the question is where it sits rather than what it is.
  if (/^−?\d+$/.test(text)) return value(text)

  const bars = /^\|(−?\d+)\|$/.exec(text)
  if (bars) return Math.abs(value(bars[1]))

  // The subtraction shape brackets its second operand, and its two minus signs
  // are different things — one is the operator and one belongs to the value.
  const subtraction = /^(−?\d+) − \((−\d+)\)$/.exec(text)
  if (subtraction) return value(subtraction[1]) - value(subtraction[2])

  const binary = /^(−?\d+) ([+×÷]) (−?\d+)$/.exec(text)
  if (!binary) throw new Error(`cannot read "${text}"`)

  const [, left, operator, right] = binary
  // A lookup rather than a switch: the regex above already narrowed the operator
  // to three characters, so a switch's default arm could never run — a branch
  // that reads as a guard and guards nothing.
  const apply: Record<string, (a: number, b: number) => number> = {
    '+': (a, b) => a + b,
    '×': (a, b) => a * b,
    '÷': (a, b) => a / b,
  }

  return apply[operator](value(left), value(right))
}

describe('readDisplay', () => {
  // A reader that returns "no problems" looks exactly like a working one, so
  // these are the cases proving it reads rather than accepts.
  it('reads each shape the unit draws', () => {
    expect(readDisplay('−7')).toBe(-7)
    expect(readDisplay('7')).toBe(7)
    expect(readDisplay('−3 + 5')).toBe(2)
    expect(readDisplay('−3 + −5')).toBe(-8)
    expect(readDisplay('5 − (−3)')).toBe(8)
    expect(readDisplay('−6 − (−8)')).toBe(2)
    expect(readDisplay('−6 × −9')).toBe(54)
    expect(readDisplay('−12 ÷ 3')).toBe(-4)
    expect(readDisplay('|−18|')).toBe(18)
    expect(readDisplay('|18|')).toBe(18)
  })

  it('refuses a display drawn with the entry form of the sign', () => {
    // The pair the course keeps apart: `−` is drawn, `-` is submitted. A display
    // carrying the submitted form is the defect, not a spelling preference.
    expect(() => readDisplay('-3 + 5')).toThrow('ASCII hyphen')
  })

  it('refuses a display it does not recognise', () => {
    expect(() => readDisplay('3 + 4 × 2')).toThrow('cannot read')
    expect(() => readDisplay('|−3| + 1')).toThrow('cannot read')
    expect(() => readDisplay('')).toThrow('cannot read')
  })
})

describe('what the unit guarantees about every problem it makes', () => {
  it('shows exactly the value the answer is derived from', () => {
    // Not the same check `generators.test.ts` runs: that one parses with a
    // precedence evaluator and this one with a shape match, and both have to
    // agree with the generator for a wrong answer key to survive.
    //
    // The comparison is excluded because it has no value to read — its answer is
    // which symbol fits, and the case below checks its display against its
    // carried values instead.
    const wrong = allProblems()
      .filter((problem) => problem.answer.kind === 'exact')
      .filter((problem) => readDisplay(shown(problem)) !== exactValue(problem))
      .map((problem) => `${problem.skillId}: ${shown(problem)}`)

    expect([...new Set(wrong)]).toEqual([])
    // The filter above must not be quietly emptying the set.
    expect(allProblems().filter((problem) => problem.answer.kind === 'exact').length)
      .toBeGreaterThan(everyProblem('compare-negatives').length * 6)
  })

  it('shows the comparison the two values it carries, in that order', () => {
    const wrong = everyProblem('compare-negatives')
      .filter((problem) => {
        const data = problem.display.kind === 'inline' ? problem.display.wholeNumber : undefined
        if (data?.operation !== 'compare') throw new Error('expected compared values')
        const expected = `${String(data.left).replace('-', '−')} ? ${String(data.right).replace('-', '−')}`
        const symbol = data.left < data.right ? '<' : data.left > data.right ? '>' : '='
        if (problem.answer.kind !== 'choice') throw new Error('expected a choice answer')
        const answerId = problem.answer.id
        const chosen = problem.choices?.find((choice) => choice.id === answerId)
        return shown(problem) !== expected || chosen?.label !== symbol
      })
      .map((problem) => `${problem.skillId}: ${shown(problem)}`)

    expect([...new Set(wrong)]).toEqual([])
  })

  it('keeps every value whole, on both sides of zero', () => {
    const fractional = allProblems()
      .flatMap((problem) => [
        problem.answer.kind === 'exact' && problem.answer.d !== 1 ? problem.skillId : '',
        ...(problem.misconceptions ?? [])
          .filter((m) => typeof m.value === 'number' && !Number.isInteger(m.value))
          .map(() => problem.skillId),
      ])
      .filter(Boolean)

    expect([...new Set(fractional)]).toEqual([])
  })

  it('draws every sign the way the course draws one', () => {
    // Covers the text `readDisplay` never sees: prompts, hints, worked steps and
    // nudges. A raw `${-3}` in any of them is one glyph away from the display
    // beside it, which is exactly small enough to survive review.
    const hyphenated = allProblems()
      .flatMap((problem) => [
        problem.prompt,
        problem.hint,
        ...problem.solution.flatMap((step) => [step.text, step.detail ?? '']),
        ...(problem.misconceptions ?? []).map((m) => m.nudge),
        ...(problem.choices ?? []).map((choice) => choice.label),
      ])
      .filter((text) => /-\d/.test(text))

    expect([...new Set(hyphenated)]).toEqual([])
  })

  it('offers the sign key exactly when a negative value is plausible', () => {
    // The rule this unit exists to demonstrate, asserted as a biconditional:
    // withholding the key where a predicted mistake is negative tells the
    // learner the answer is not, at the skills whose question is what sign it
    // has — and offering it where nothing negative is reachable is noise.
    const wrong = allProblems()
      .filter((problem) => problem.inputMode === 'keypad')
      .filter((problem) => {
        const plausible =
          exactValue(problem) < 0 ||
          (problem.misconceptions ?? []).some((m) => typeof m.value === 'number' && m.value < 0)
        return plausible !== (problem.keypad?.allowNegative === true)
      })
      .map((problem) => `${problem.skillId}: ${shown(problem)}`)

    expect([...new Set(wrong)]).toEqual([])
  })

  it('asks for nothing the pad cannot type', () => {
    // The sign is the only class Unit 6 needs. A decimal point or a slash here
    // would be Unit 8 or 9's surface reached for early.
    const declared = allProblems()
      .filter((problem) => problem.keypad?.allowDecimal || problem.keypad?.allowFraction)
      .map((problem) => problem.skillId)

    expect([...new Set(declared)]).toEqual([])
  })

  it('uses each input mode on exactly the skill that needs it', () => {
    const modes = unit06.map(
      (generator) => `${generator.id} ${everyProblem(generator.id)[0].inputMode}`,
    )
    const mixed = unit06
      .filter(
        (generator) =>
          new Set(everyProblem(generator.id).map((problem) => problem.inputMode)).size > 1,
      )
      .map((generator) => generator.id)

    expect(modes).toEqual([
      'negatives-numberline number-line',
      'compare-negatives choice',
      'add-neg-pos keypad',
      'add-two-negs keypad',
      'sub-negatives keypad',
      'mult-negatives keypad',
      'div-negatives keypad',
      'absolute-value keypad',
      // The review interleaves six shapes and stays on one control: a lesson
      // whose control changes between problems is a different thing to answer.
      'negatives-mixed keypad',
    ])
    expect(mixed).toEqual([])
  })

  it('renders every field the generators set', () => {
    // Two of these fields had never been set by any generator, so the gate did
    // not render them and would not have shown the sign declaration above.
    expect(
      unrenderedKeys(unit06),
      'add the field to RENDERED_KEYS and render it in format()',
    ).toEqual([])
  })
})

describe('the three walls', () => {
  const WALLS = ['compare-negatives', 'add-neg-pos', 'sub-negatives']

  it('keep two distinct diagnoses on every problem, not on average', () => {
    // After the central collision filter, which is the whole point: a prediction
    // equal to the answer is dropped silently, so a wall can pass every other
    // test while diagnosing nothing on the problems that collide.
    const thin = WALLS.flatMap((id) =>
      everyProblem(id)
        .filter((problem) => new Set((problem.misconceptions ?? []).map((m) => m.tag)).size < 2)
        .map((problem) => `${id}: ${JSON.stringify(problem.display)}`),
    )

    expect([...new Set(thin)]).toEqual([])
  })

  it('spread three diagnoses across the two shapes of the major wall', () => {
    // `sub-negatives` predicts `still-subtracted` on both shapes and a different
    // partner on each. All three have to reach a learner, or one shape is
    // drawing and the skill is quietly half the diagnosis it claims.
    const tags = new Set(
      everyProblem('sub-negatives').flatMap((problem) =>
        (problem.misconceptions ?? []).map((m) => m.tag),
      ),
    )

    expect([...tags].sort()).toEqual([
      'dropped-both-signs',
      'negated-the-whole',
      'still-subtracted',
    ])
  })

  it('draws the comparison both below zero and across it', () => {
    // Without the crossing third, "the negative one is smaller" passes every
    // problem — a different wrong rule, learned in place of the right one.
    const pairs = everyProblem('compare-negatives').map((problem) => {
      const data = problem.display.kind === 'inline' ? problem.display.wholeNumber : undefined
      if (data?.operation !== 'compare') throw new Error('expected compared values')
      return data
    })

    expect(pairs.some(({ left, right }) => left < 0 && right < 0)).toBe(true)
    expect(pairs.some(({ left, right }) => left * right < 0)).toBe(true)
    // Never equal, which is what makes both predictions survive every time.
    expect(pairs.filter(({ left, right }) => left === right)).toEqual([])
  })
})

describe('the number line the reading skill draws', () => {
  const lines = () =>
    everyProblem('negatives-numberline').map((problem) => {
      if (!problem.numberLine) throw new Error('expected a declared line')
      return { problem, spec: problem.numberLine }
    })

  it('reaches equally far on both sides of zero', () => {
    // Not decoration: the mirrored tick is one of the skill's two predictions,
    // so a line reaching further one way would put it off the end and stop
    // diagnosing the mistake it exists for.
    const lopsided = lines().filter(({ spec }) => {
      const tickList = ticks(spec)
      return toNumber(tickList[0]) !== -toNumber(tickList[tickList.length - 1])
    })

    expect(lopsided).toEqual([])
  })

  it('carries the answer and both predictions as real ticks', () => {
    const unreachable = lines()
      .flatMap(({ problem, spec }) => {
        const tickList = ticks(spec)
        const wanted = [
          exactValue(problem),
          ...(problem.misconceptions ?? [])
            .filter((m) => typeof m.value === 'number')
            .map((m) => m.value),
        ]
        return wanted
          .filter((value) => !placement(tickList, String(value)).canConfirm)
          .map((value) => `${value} is not on ${JSON.stringify(spec)}`)
      })

    expect([...new Set(unreachable)]).toEqual([])
  })

  it('never asks for zero, which is neither above nor below it', () => {
    expect(lines().filter(({ problem }) => exactValue(problem) === 0)).toEqual([])
  })
})

describe('the difficulty ladders', () => {
  /**
   * Mean answer magnitude, which is what `generators.test.ts` measures for an
   * arithmetic skill — repeated here for the two skills whose answer is a
   * *difference* of two growing sizes. Widening both bands symmetrically can
   * leave that difference flat, and a ladder that does not widen leaves a
   * learner repeating one problem at every level.
   */
  const meanMagnitude = (id: string, difficulty: number) => {
    const problems = everyProblem(id).filter((problem) => problem.difficulty === difficulty)
    return (
      problems.reduce((total, problem) => total + Math.abs(exactValue(problem)), 0) /
      problems.length
    )
  }

  it.each(['add-neg-pos', 'sub-negatives'])('widens the answers %s produces', (id) => {
    expect(meanMagnitude(id, 5)).toBeGreaterThan(meanMagnitude(id, 1))
  })

  it('widens the line the reading skill draws', () => {
    const reach = (difficulty: number) =>
      everyProblem('negatives-numberline')
        .filter((problem) => problem.difficulty === difficulty)
        .reduce((widest, problem) => Math.max(widest, problem.numberLine?.count ?? 0), 0)

    expect(reach(5)).toBeGreaterThan(reach(1))
  })
})

describe('the review', () => {
  /** The six shapes 6.9 interleaves — every keypad skill in the unit. */
  const TAUGHT = [
    'add-neg-pos',
    'add-two-negs',
    'sub-negatives',
    'mult-negatives',
    'div-negatives',
    'absolute-value',
  ]

  /**
   * The diagnosis and the words a skill produces, as one set.
   *
   * Both together rather than a case each: 6.9 calls the same builders the
   * standalone skills call, and what would break that is a rewording — which
   * can move the hint without moving the tag, or the other way.
   *
   * Digits are masked because several nudges name the operands they diagnose.
   * Left in, this would compare which *numbers* each skill happened to draw
   * rather than what it says about them, and the review drawing a size the
   * standalone skill's sample missed would fail as though the wording differed.
   */
  const wording = (ids: string[]) =>
    new Set(
      ids
        .flatMap((id) => everyProblem(id))
        .flatMap((problem) =>
          (problem.misconceptions ?? []).map((m) =>
            `${m.tag} · ${m.nudge} · ${problem.hint}`.replace(/\d+/g, '#'),
          ),
        ),
    )

  it('words every shape the way the skill that taught it does', () => {
    // Containment, not equality, and the direction is the point: the review
    // draws each shape a sixth as often, so it does not reach every rare
    // variant across one sweep. What must hold is that nothing it *does* say
    // differs from what the standalone skill says — which is exactly what a
    // rewording landing on one and not the other would break.
    const taught = wording(TAUGHT)

    expect([...wording(['negatives-mixed'])].filter((said) => !taught.has(said))).toEqual([])
  })

  it('reaches all six shapes, and every diagnosis they carry', () => {
    // The containment above would pass on a review that drew one shape. Tags
    // are few enough that a full sweep reaches all of them, so this half is an
    // equality: no shape may go undrawn and none may leak in from elsewhere.
    const tags = (ids: string[]) =>
      new Set(
        ids
          .flatMap((id) => everyProblem(id))
          .flatMap((problem) => (problem.misconceptions ?? []).map((m) => m.tag)),
      )
    const hints = new Set(everyProblem('negatives-mixed').map((problem) => problem.hint))

    expect([...tags(['negatives-mixed'])].sort()).toEqual([...tags(TAUGHT)].sort())
    expect(hints.size).toBe(TAUGHT.length)
  })
})

describe('one skill, recorded whole', () => {
  it('shows the sign declaration and the line in the recorded output', () => {
    // The two fields the gate could not see before this change. Pinned outside
    // the snapshot as well, so deleting them from `format()` fails by name
    // rather than as an unexplained snapshot diff.
    const line = format(everyProblem('negatives-numberline')[0], 1)
    const typed = format(everyProblem('add-two-negs')[0], 1)

    expect(line).toContain('line     ')
    expect(line).toContain('input    number-line')
    expect(typed).toContain('keypad   allowNegative=true')
  })
})
