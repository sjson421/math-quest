import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { checkTeachingLine } from '../lib/content-rules'
import { diagnose, generateProblem } from '../lib/generator'
import {
  geometryDiagramLabel,
  geometryFormulaReferences,
  geometryMeasurementLabels,
  type GeometryDiagram,
} from '../lib/geometry-diagram'
import type { Difficulty, Problem } from '../lib/types'
import { SkillIntro } from '../components/SkillIntro'
import { manifestIndex } from './index'
import { sample, sweep, unrenderedKeys } from './recorded-output'
import {
  GED_PI,
  ROUNDING_TOLERANCE,
  roundToNearestTenth,
  unit20,
} from './unit-20-geometry-measurement'

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const { everyProblem, skill } = sweep(unit20, 'Unit 20')

const teachingLines = [
  ['perimeter', 'Perimeter adds the lengths of every outer side.'],
  ['area-rectangle', 'Area counts inside a rectangle by multiplying length and width.'],
  ['area-triangle', 'Triangle area is half its base times its perpendicular height.'],
  ['area-parallelogram-trapezoid', 'Parallelograms use base times height; trapezoids halve the sum of their bases times height.'],
  ['circumference', 'Circumference measures around a circle using its full width.'],
  ['area-circle', 'Square half the circle\'s width, then multiply by pi.'],
] as const

const dataFor = (problem: Problem): GeometryDiagram => {
  if (problem.display.kind !== 'diagram' || problem.display.diagram.kind !== 'geometry') {
    throw new Error(`${problem.skillId}: expected geometry display`)
  }
  return problem.display.diagram
}

const numericAnswer = (problem: Problem): number => {
  if (problem.answer.kind === 'exact') {
    if (problem.answer.d !== 1) throw new Error(`${problem.skillId}: expected a whole-number answer`)
    return problem.answer.n
  }
  if (problem.answer.kind === 'approx') return problem.answer.value
  throw new Error(`${problem.skillId}: expected a numeric answer`)
}

const sourceAnswer = (diagram: GeometryDiagram): number => {
  switch (diagram.operation) {
    case 'perimeter':
      return 2 * diagram.length + 2 * diagram.width
    case 'area-rectangle':
      return diagram.length * diagram.width
    case 'area-triangle':
      return (diagram.base * diagram.height) / 2
    case 'area-parallelogram':
      return diagram.base * diagram.height
    case 'area-trapezoid':
      return ((diagram.base1 + diagram.base2) * diagram.height) / 2
    case 'circumference':
      return roundToNearestTenth(GED_PI * diagram.radius * 2)
    case 'area-circle':
      return roundToNearestTenth(GED_PI * (diagram.diameter / 2) ** 2)
    default: {
      const unhandled: never = diagram
      throw new Error(`Unhandled geometry operation: ${unhandled}`)
    }
  }
}

const sourceValues = (diagram: GeometryDiagram): number[] => {
  switch (diagram.operation) {
    case 'perimeter':
    case 'area-rectangle':
      return [diagram.length, diagram.width]
    case 'area-triangle':
    case 'area-parallelogram':
      return [diagram.base, diagram.height]
    case 'area-trapezoid':
      return [diagram.base1, diagram.base2, diagram.height]
    case 'circumference':
      return [diagram.radius]
    case 'area-circle':
      return [diagram.diameter]
    default: {
      const unhandled: never = diagram
      throw new Error(`Unhandled geometry operation: ${unhandled}`)
    }
  }
}

const formulaLabels = (diagram: GeometryDiagram): string[] =>
  geometryFormulaReferences(diagram).map(({ label }) => label)

const unitWords = (unit: GeometryDiagram['unit']): string => {
  switch (unit) {
    case 'cm':
      return 'centimetres'
    case 'm':
      return 'metres'
    case 'in':
      return 'inches'
    case 'ft':
      return 'feet'
    default: {
      const unhandled: never = unit
      throw new Error(`Unhandled geometry unit: ${unhandled}`)
    }
  }
}

const expectedPrompt = (diagram: GeometryDiagram): string => {
  switch (diagram.operation) {
    case 'perimeter':
      return 'Find the perimeter of this rectangle.'
    case 'area-rectangle':
      return `Find the area of this rectangle in square ${unitWords(diagram.unit)}.`
    case 'area-triangle':
      return `Find the area of this triangle in square ${unitWords(diagram.unit)}.`
    case 'area-parallelogram':
      return `Find the area of this parallelogram in square ${unitWords(diagram.unit)}.`
    case 'area-trapezoid':
      return `Find the area of this trapezoid in square ${unitWords(diagram.unit)}.`
    case 'circumference':
      return 'Find the circumference. Use π = 3.14 and round to the nearest tenth.'
    case 'area-circle':
      return "Find the circle's area. Use π = 3.14 and round to the nearest tenth."
    default: {
      const unhandled: never = diagram
      throw new Error(`Unhandled geometry operation: ${unhandled}`)
    }
  }
}

describe.each(unit20.map((candidate) => [candidate.id, candidate] as const))(
  'Unit 20 recorded output: %s',
  (_id, generator) => {
    it('matches the authored sample output', () => {
      expect(sample(generator)).toMatchSnapshot()
    })
  },
)

describe('Unit 20a shared contracts', () => {
  it('registers all six skills in manifest order', () => {
    expect(unit20.map(({ id }) => id)).toEqual([
      'perimeter',
      'area-rectangle',
      'area-triangle',
      'area-parallelogram-trapezoid',
      'circumference',
      'area-circle',
    ])
  })

  it('keeps every generated field recorded', () => {
    expect(unrenderedKeys(unit20)).toEqual([])
  })

  it('recomputes every answer from visible geometry data', () => {
    for (const generator of unit20) {
      for (const problem of everyProblem(generator.id)) {
        const diagram = dataFor(problem)
        expect(problem.prompt).toBe(expectedPrompt(diagram))
        expect(numericAnswer(problem)).toBe(sourceAnswer(diagram))
        expect(sourceValues(diagram).every((value) => Number.isFinite(value) && value > 0)).toBe(true)
      }
    }
  })

  it('uses all four supported units and varies source measurements', () => {
    const units = new Set<string>()
    for (const generator of unit20) {
      const sources = new Set<string>()
      for (const problem of everyProblem(generator.id)) {
        const diagram = dataFor(problem)
        units.add(diagram.unit)
        sources.add(JSON.stringify(sourceValues(diagram)))
      }
      expect(sources.size, generator.id).toBeGreaterThan(1)
    }
    expect(units).toEqual(new Set(['cm', 'm', 'in', 'ft']))
  })

  it('grows each skill from difficulty one to five', () => {
    for (const generator of unit20) {
      const means = difficulties.map((difficulty) => {
        const problems = Array.from({ length: 100 }, (_, seed) =>
          generateProblem(generator, seed * 7919 + difficulty, difficulty),
        )
        return problems.reduce((sum, problem) => {
          const values = sourceValues(dataFor(problem))
          return sum + values.reduce((subtotal, value) => subtotal + value, 0) / values.length
        }, 0) / problems.length
      })

      expect(means[4], generator.id).toBeGreaterThan(means[0])
    }
  })
})

describe('Unit 20a teaching lines and intros', () => {
  it.each(teachingLines)('keeps the reviewed teaching line for %s', (id, line) => {
    const generator = skill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)

    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })

  it('keeps every fixed difficulty-one intro deterministic and independently solvable', () => {
    for (const [id] of teachingLines) {
      const generator = skill(id)
      const first = generateProblem(generator, 1, 1)
      const second = generateProblem(generator, 1, 1)
      expect(second).toEqual(first)
      expect(numericAnswer(first)).toBe(sourceAnswer(dataFor(first)))
      expect(first.solution.length).toBeGreaterThan(0)
    }
  })

  it('renders each intro with the practice figure, formulas, answer, and no input surface', () => {
    for (const [id] of teachingLines) {
      const generator = skill(id)
      const problem = generateProblem(generator, 1, 1)
      const html = renderToStaticMarkup(
        <SkillIntro
          skill={generator}
          problem={problem}
          mode="automatic"
          onLeave={() => {}}
          onStart={() => {}}
        />,
      )
      const diagram = dataFor(problem)

      expect(html).toContain('data-skill-intro="automatic"')
      expect(html).toContain(`data-geometry-operation="${diagram.operation}"`)
      expect(html).toContain(geometryDiagramLabel(diagram))
      for (const formula of formulaLabels(diagram)) expect(html).toContain(formula)
      expect(html).toContain('Correct answer')
      expect(html).toContain(`>${numericAnswer(problem)}<`)
      if (problem.answer.kind === 'approx') expect(html).not.toContain('±')
      expect(html).toContain(generator.teachingLine.replaceAll("'", '&#x27;'))
      expect(html).toContain('How it works')
      expect(html).toContain('Start practice')
      expect(html).toContain('>Leave<')
      expect(html).not.toContain('>Check<')
      expect(html).not.toContain('Show me a hint')
      expect(html).not.toContain('<input')
      expect(html).not.toContain('animate-pulse')
    }
  })
})

describe('perimeter', () => {
  it('uses both pairs of visible rectangle sides and exact keypad answers', () => {
    for (const problem of everyProblem('perimeter')) {
      const diagram = dataFor(problem)
      expect(diagram.operation).toBe('perimeter')
      if (diagram.operation !== 'perimeter') continue
      expect(numericAnswer(problem)).toBe(2 * diagram.length + 2 * diagram.width)
      expect(problem.answer.kind).toBe('exact')
      expect(problem.inputMode).toBe('keypad')
      expect(problem.keypad).toBeUndefined()
      expect(checkAnswer(problem.answer, String(numericAnswer(problem))).status).toBe('correct')
      expect(geometryMeasurementLabels(diagram)).toEqual([
        { name: 'length', text: `${diagram.length} ${diagram.unit}` },
        { name: 'width', text: `${diagram.width} ${diagram.unit}` },
      ])
      expect(formulaLabels(diagram)).toEqual(['P equals 2l plus 2w', 'A equals l times w'])
    }
  })
})

describe('area-rectangle', () => {
  it('uses length times width, square-unit wording, and exact keypad answers', () => {
    for (const problem of everyProblem('area-rectangle')) {
      const diagram = dataFor(problem)
      expect(diagram.operation).toBe('area-rectangle')
      if (diagram.operation !== 'area-rectangle') continue
      expect(numericAnswer(problem)).toBe(diagram.length * diagram.width)
      expect(problem.prompt).toContain(`square ${unitWords(diagram.unit)}`)
      expect(problem.answer.kind).toBe('exact')
      expect(problem.keypad).toBeUndefined()
      expect(formulaLabels(diagram)).toEqual(['P equals 2l plus 2w', 'A equals l times w'])
    }
  })
})

describe('area-triangle', () => {
  it('keeps the perpendicular source, one-half factor, and both wall diagnoses', () => {
    for (const problem of everyProblem('area-triangle')) {
      const diagram = dataFor(problem)
      if (diagram.operation !== 'area-triangle') throw new Error('expected triangle data')
      const answer = (diagram.base * diagram.height) / 2
      const misconceptions = problem.misconceptions ?? []

      expect(Number.isInteger(answer)).toBe(true)
      expect(numericAnswer(problem)).toBe(answer)
      expect(formulaLabels(diagram)).toEqual(['A equals b times h', 'A equals b times h divided by 2'])
      expect(misconceptions.map(({ tag }) => tag)).toEqual([
        'omitted-triangle-half',
        'added-triangle-dimensions',
      ])
      expect(misconceptions.map(({ value }) => value)).toEqual([
        diagram.base * diagram.height,
        diagram.base + diagram.height,
      ])
      for (const misconception of misconceptions) {
        expect(misconception.value).not.toBe(answer)
        expect(diagnose(problem, String(misconception.value))).toMatchObject({ tag: misconception.tag })
      }
    }
  })
})

describe('area-parallelogram-trapezoid', () => {
  it('practises both figure families from their visible measurements', () => {
    const operations = new Set<GeometryDiagram['operation']>()

    for (const problem of everyProblem('area-parallelogram-trapezoid')) {
      const diagram = dataFor(problem)
      operations.add(diagram.operation)
      expect(['A equals b times h', 'A equals b1 plus b2 times h divided by 2']).toEqual(formulaLabels(diagram))
      if (diagram.operation === 'area-parallelogram') {
        expect(numericAnswer(problem)).toBe(diagram.base * diagram.height)
      } else if (diagram.operation === 'area-trapezoid') {
        expect(diagram.base1).not.toBe(diagram.base2)
        expect(numericAnswer(problem)).toBe(((diagram.base1 + diagram.base2) * diagram.height) / 2)
        expect(Number.isInteger(numericAnswer(problem))).toBe(true)
      } else {
        throw new Error(`unexpected operation ${diagram.operation}`)
      }
    }

    expect(operations).toEqual(new Set(['area-parallelogram', 'area-trapezoid']))
  })
})

describe('circle geometry', () => {
  it.each([
    ['circumference', 'radius-as-diameter', 'area-for-circumference'],
    ['area-circle', 'squared-diameter', 'circumference-for-area'],
  ] as const)('keeps both reachable diagnoses for %s', (id, firstTag, secondTag) => {
    for (const problem of everyProblem(id)) {
      const diagram = dataFor(problem)
      const answer = sourceAnswer(diagram)
      const misconceptions = problem.misconceptions ?? []

      expect(problem.answer).toMatchObject({ kind: 'approx', tolerance: ROUNDING_TOLERANCE, value: answer })
      expect(problem.keypad).toEqual({ allowDecimal: true })
      expect(formulaLabels(diagram)).toEqual([
        'C equals pi times d',
        'A equals pi times r squared',
      ])
      expect(misconceptions.map(({ tag }) => tag)).toEqual([firstTag, secondTag])
      expect(misconceptions.map(({ value }) => value).every((value) => typeof value === 'number')).toBe(true)
      expect(new Set([answer, ...misconceptions.map(({ value }) => value)])).toHaveProperty('size', 3)
      for (const misconception of misconceptions) {
        expect(diagnose(problem, String(misconception.value))).toMatchObject({ tag: misconception.tag })
        expect(checkAnswer(problem.answer, String(misconception.value)).status).toBe('incorrect')
      }
      expect(checkAnswer(problem.answer, String(answer)).status).toBe('correct')
      expect(answer * 10).toBe(Math.round(answer * 10))
      expect(answer).toBe(roundToNearestTenth(answer))
    }
  })

  it('uses the GED pi literal and exposes the decimal rule', () => {
    expect(GED_PI).toBe(3.14)
    expect(ROUNDING_TOLERANCE).toBe(0.05)
    expect(roundToNearestTenth(3.14 * 10)).toBe(31.4)
    expect(roundToNearestTenth(3.14 * 5 ** 2)).toBe(78.5)
  })

  it('keeps circumference on radius input and circle area on even diameter input', () => {
    for (const problem of everyProblem('circumference')) {
      const diagram = dataFor(problem)
      if (diagram.operation !== 'circumference') throw new Error('expected circumference data')
      expect(geometryDiagramLabel(diagram)).toContain(`radius ${diagram.radius}`)
      expect(diagram.radius * 2).toBeGreaterThan(diagram.radius)
    }
    for (const problem of everyProblem('area-circle')) {
      const diagram = dataFor(problem)
      if (diagram.operation !== 'area-circle') throw new Error('expected circle-area data')
      expect(diagram.diameter % 2).toBe(0)
      expect(geometryDiagramLabel(diagram)).toContain(`diameter ${diagram.diameter}`)
    }
  })
})
