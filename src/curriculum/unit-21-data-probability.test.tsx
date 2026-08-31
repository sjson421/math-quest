import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../lib/answer'
import { assertChart, chartSourceValues, chartTable, scatterTrendSegment, type Chart } from '../lib/chart'
import { checkTeachingLine } from '../lib/content-rules'
import { diagnose, generateProblem } from '../lib/generator'
import { rational, toNumber } from '../lib/rational'
import type { Difficulty, Problem, StatisticsData } from '../lib/types'
import { SkillIntro } from '../components/SkillIntro'
import { manifestIndex } from './index'
import { sample, sweep, unrenderedKeys } from './recorded-output'
import { unit21 } from './unit-21-data-probability'

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const { everyProblem, skill } = sweep(unit21, 'Unit 21')

const teachingLines = [
  ['mean', 'Mean shares the total equally across all values.'],
  ['median', 'Sort the values before finding the middle.'],
  ['mode-range', 'Mode is most common; range is highest minus lowest.'],
  ['weighted-mean', 'Multiply each value by its weight, then divide by total weight.'],
  ['read-bar-line', 'Match the chart label to its bar or line value.'],
  ['read-scatterplot', 'A trend line shows the overall direction of paired data.'],
  ['basic-probability', 'Probability compares the outcomes you want with all outcomes.'],
  ['compound-probability', 'Multiply for and; add for or.'],
  ['counting-outcomes', 'Multiply the number of choices at each step.'],
] as const

type ListOperation = 'mean' | 'median' | 'mode' | 'range' | 'weighted-mean'
type ListStatistics = Extract<StatisticsData, { operation: ListOperation }>

const drawn = (value: number): string => String(value).replace('-', '−')

const listText = (values: readonly number[]): string =>
  `Values: ${values.map(drawn).join(', ')}`

const weightedListText = (entries: readonly { value: number; weight: number }[]): string =>
  `Values with weights: ${entries
    .map(({ value, weight }) => `${drawn(value)} (weight ${drawn(weight)})`)
    .join(', ')}`

const promptFor = (operation: ListOperation): string =>
  `What is the ${operation === 'weighted-mean' ? 'weighted mean' : operation} of these values?`

/** Only a denominator with no prime factor besides 2 and 5 has a finite decimal. */
const isTerminatingDecimal = (denominator: number): boolean => {
  let remaining = denominator
  while (remaining % 2 === 0) remaining /= 2
  while (remaining % 5 === 0) remaining /= 5
  return remaining === 1
}

const statisticsOf = (problem: Problem): StatisticsData => {
  if (problem.display.kind === 'story' && 'statistics' in problem.display && problem.display.statistics) {
    return problem.display.statistics
  }
  if (problem.display.kind === 'chart' && problem.display.statistics) return problem.display.statistics
  throw new Error(`${problem.skillId}: expected statistics data`)
}

/** The exact value a probability arm's carried counts derive, independent of the stated answer. */
const probabilityAnswer = (data: StatisticsData): number => {
  if (data.operation === 'basic-probability') return toNumber(rational(data.favourable, data.total))
  if (data.operation === 'compound-probability') {
    const first = rational(data.firstFavourable, data.firstTotal)
    const second = rational(data.secondFavourable, data.secondTotal)
    return data.cue === 'and'
      ? toNumber(rational(first.n * second.n, first.d * second.d))
      : toNumber(rational(first.n * second.d + second.n * first.d, first.d * second.d))
  }
  if (data.operation === 'counting-outcomes') return data.stages.reduce((product, count) => product * count, 1)
  throw new Error(`expected probability data, got ${data.operation}`)
}

const exactAnswer = (problem: Problem): number => {
  if (problem.answer.kind !== 'exact' || problem.answer.d !== 1) {
    throw new Error(`${problem.skillId}: expected exact whole-number answer`)
  }
  return problem.answer.n
}

const listAnswer = (problem: Problem, data: ListStatistics): number => {
  if (problem.display.kind !== 'story') throw new Error(`${problem.skillId}: expected story display`)
  expect(problem.prompt).toBe(promptFor(data.operation))
  if (data.operation === 'weighted-mean') {
    expect(problem.display.text).toBe(weightedListText(data.entries))
    const weightedTotal = data.entries.reduce((sum, entry) => sum + entry.value * entry.weight, 0)
    const totalWeight = data.entries.reduce((sum, entry) => sum + entry.weight, 0)
    expect(weightedTotal % totalWeight).toBe(0)
    return weightedTotal / totalWeight
  }

  expect(problem.display.text).toBe(listText(data.values))
  expect(problem.prompt).toBe(promptFor(data.operation))
  switch (data.operation) {
    case 'mean': {
      const total = data.values.reduce((sum, value) => sum + value, 0)
      expect(total % data.values.length).toBe(0)
      return total / data.values.length
    }
    case 'median': {
      const sorted = [...data.values].sort((left, right) => left - right)
      expect(sorted).not.toEqual(data.values)
      const middle = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 1
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2
    }
    case 'mode': {
      const counts = new Map<number, number>()
      data.values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
      const highest = Math.max(...counts.values())
      const modes = [...counts].filter(([, count]) => count === highest)
      expect(modes).toHaveLength(1)
      expect(highest).toBeGreaterThan(1)
      return modes[0][0]
    }
    case 'range':
      return Math.max(...data.values) - Math.min(...data.values)
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled list operation: ${unhandled}`)
    }
  }
}

const covariance = (points: readonly { x: number; y: number }[]): bigint => {
  const sumX = points.reduce((sum, point) => sum + BigInt(point.x), 0n)
  const sumY = points.reduce((sum, point) => sum + BigInt(point.y), 0n)
  const sumXY = points.reduce((sum, point) => sum + BigInt(point.x) * BigInt(point.y), 0n)
  return BigInt(points.length) * sumXY - sumX * sumY
}

const choiceId = (problem: Problem, label: string): string => {
  const choice = problem.choices?.find((candidate) => candidate.label === label)
  if (!choice) throw new Error(`${problem.skillId}: missing choice ${label}`)
  return choice.id
}

const chartAnswer = (problem: Problem, chart: Chart, data: StatisticsData): number | string => {
  assertChart(chart)
  if (data.operation === 'read-chart-value') {
    if (chart.kind === 'scatter') throw new Error(`${problem.skillId}: expected categorical chart`)
    const series = chart.series[data.seriesIndex]
    expect(series).toBeDefined()
    expect(chart.labels[data.categoryIndex]).toBeDefined()
    expect(problem.prompt).toBe(`What is the ${series.label} value for ${chart.labels[data.categoryIndex]}?`)
    return series.values[data.categoryIndex]
  }

  if (data.operation !== 'scatter-trend' || chart.kind !== 'scatter') {
    throw new Error(`${problem.skillId}: expected scatter trend data`)
  }
  expect(chart.series).toHaveLength(1)
  expect(chart.series[0].trendLine).toBe(true)
  expect(scatterTrendSegment(chart, 0)).toBeDefined()
  const direction = covariance(chart.series[0].points)
  const label = direction > 0n ? 'Increasing' : direction < 0n ? 'Decreasing' : 'Flat'
  return choiceId(problem, label)
}

const sourceWork = (problem: Problem): number => {
  const data = statisticsOf(problem)
  const values = data.operation === 'mean' || data.operation === 'median' || data.operation === 'mode' || data.operation === 'range'
    ? [...data.values]
    : data.operation === 'weighted-mean'
      ? data.entries.flatMap(({ value, weight }) => [value, weight])
      : data.operation === 'basic-probability'
        ? [data.favourable, data.total]
        : data.operation === 'compound-probability'
          ? [data.firstFavourable, data.firstTotal, data.secondFavourable, data.secondTotal]
          : data.operation === 'counting-outcomes'
            ? [...data.stages]
            : problem.display.kind === 'chart'
              ? chartSourceValues(problem.display.chart)
              : []
  return values.length + values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length
}

describe.each(unit21.map((candidate) => [candidate.id, candidate] as const))(
  'Unit 21 recorded output: %s',
  (_id, generator) => {
    it('matches authored sample output', () => {
      expect(sample(generator)).toMatchSnapshot()
    })
  },
)

describe('Unit 21 shared contracts', () => {
  it('registers nine skills in manifest order and records every field', () => {
    expect(unit21.map(({ id }) => id)).toEqual([
      'mean',
      'median',
      'mode-range',
      'weighted-mean',
      'read-bar-line',
      'read-scatterplot',
      'basic-probability',
      'compound-probability',
      'counting-outcomes',
    ])
    expect(unrenderedKeys(unit21)).toEqual([])
  })

  it('recomputes every list answer from its visible source', () => {
    for (const id of ['mean', 'median', 'mode-range', 'weighted-mean']) {
      for (const problem of everyProblem(id)) {
        const data = statisticsOf(problem)
        if (
          data.operation === 'read-chart-value' ||
          data.operation === 'scatter-trend' ||
          data.operation === 'basic-probability' ||
          data.operation === 'compound-probability' ||
          data.operation === 'counting-outcomes'
        ) {
          throw new Error(`${problem.skillId}: expected list operation`)
        }
        const answer = listAnswer(problem, data)
        expect(exactAnswer(problem)).toBe(answer)
        expect(problem.inputMode).toBe('keypad')
        expect(checkAnswer(problem.answer, String(answer)).status).toBe('correct')
      }
    }
  })

  it('keeps median sorting and both wall diagnoses distinct on every draw', () => {
    const lengths = new Set<number>()
    for (const problem of everyProblem('median')) {
      const data = statisticsOf(problem)
      if (data.operation !== 'median') throw new Error('expected median data')
      lengths.add(data.values.length)
      const sorted = [...data.values].sort((left, right) => left - right)
      expect(sorted).not.toEqual(data.values)
      const middle = Math.floor(sorted.length / 2)
      const answer = sorted.length % 2 === 1
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2
      const unsortedMiddle = data.values.length % 2 === 1
        ? data.values[middle]
        : (data.values[middle - 1] + data.values[middle]) / 2
      const ordinaryMean = data.values.reduce((sum, value) => sum + value, 0) / data.values.length
      const misconceptions = problem.misconceptions ?? []

      expect(Number.isInteger(answer)).toBe(true)
      expect(new Set([answer, unsortedMiddle, ordinaryMean]).size).toBe(3)
      expect(misconceptions.map(({ tag }) => tag)).toEqual([
        'used-unsorted-middle',
        'used-mean-for-median',
      ])
      expect(misconceptions.map(({ value }) => value)).toEqual([unsortedMiddle, ordinaryMean])
      for (const misconception of misconceptions) {
        if (typeof misconception.value !== 'number') throw new Error('expected numeric diagnosis')
        expect(diagnose(problem, String(misconception.value))?.tag).toBe(misconception.tag)
      }
    }
    expect(lengths).toEqual(new Set([5, 6, 7, 8, 9, 10]))
  })

  it('keeps list variants, positive sources, and reachable diagnoses distinct', () => {
    const operations = new Set<string>()
    for (const problem of everyProblem('mode-range')) {
      const data = statisticsOf(problem)
      if (
        data.operation === 'read-chart-value' ||
        data.operation === 'scatter-trend' ||
        data.operation === 'weighted-mean' ||
        data.operation === 'basic-probability' ||
        data.operation === 'compound-probability' ||
        data.operation === 'counting-outcomes'
      ) {
        throw new Error('expected mode or range data')
      }
      operations.add(data.operation)
      const counts = new Map<number, number>()
      data.values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
      expect([...counts.values()].filter((count) => count > 1)).toEqual([2])
      const answer = exactAnswer(problem)
      const misconception = problem.misconceptions?.[0]
      expect(misconception).toBeDefined()
      if (!misconception || typeof misconception.value !== 'number') throw new Error('expected numeric diagnosis')
      expect(misconception.value).not.toBe(answer)
      expect(diagnose(problem, String(misconception.value))?.tag).toBe(misconception.tag)
    }
    expect(operations).toEqual(new Set(['mode', 'range']))

    for (const problem of everyProblem('weighted-mean')) {
      const data = statisticsOf(problem)
      if (data.operation !== 'weighted-mean') throw new Error('expected weighted data')
      expect(data.entries.every(({ value, weight }) => Number.isSafeInteger(value) && value > 0 && Number.isSafeInteger(weight) && weight > 0)).toBe(true)
      const ordinaryMean = data.entries.reduce((sum, entry) => sum + entry.value, 0) / data.entries.length
      expect(ordinaryMean).not.toBe(exactAnswer(problem))
      const misconception = problem.misconceptions?.find(({ tag }) => tag === 'ignored-weights')
      expect(misconception).toBeDefined()
      if (!misconception || typeof misconception.value !== 'number') throw new Error('expected ignored-weight diagnosis')
      expect(diagnose(problem, String(misconception.value))?.tag).toBe('ignored-weights')
    }
  })

  it('recomputes categorical targets from chart selectors and semantic rows', () => {
    const kinds = new Set<string>()
    const seriesCounts = new Set<number>()
    for (const problem of everyProblem('read-bar-line')) {
      if (problem.display.kind !== 'chart' || !problem.display.statistics) throw new Error('expected chart statistics')
      const { chart, statistics } = problem.display
      if (statistics.operation !== 'read-chart-value') throw new Error('expected chart value selector')
      if (chart.kind === 'scatter') throw new Error('expected categorical chart')
      kinds.add(chart.kind)
      seriesCounts.add(chart.series.length)
      for (const series of chart.series) {
        expect(series.values.every((value) => (value - chart.y.min) % chart.y.step === 0)).toBe(true)
      }
      const answer = chartAnswer(problem, chart, statistics)
      expect(exactAnswer(problem)).toBe(answer)
      expect(problem.inputMode).toBe('keypad')
      expect(checkAnswer(problem.answer, String(answer)).status).toBe('correct')
      expect(chartTable(chart).rows[statistics.categoryIndex][statistics.seriesIndex + 1]).toBe(String(answer))
    }
    expect(kinds).toEqual(new Set(['bar', 'line']))
    expect(seriesCounts).toEqual(new Set([1, 2]))
  })

  it('derives all scatter directions from visible points and keeps choices identifiable', () => {
    const directions = new Set<string>()
    const choiceOrders = new Set<string>()
    for (const problem of everyProblem('read-scatterplot')) {
      if (problem.display.kind !== 'chart' || !problem.display.statistics) throw new Error('expected scatter statistics')
      const { chart, statistics } = problem.display
      if (statistics.operation !== 'scatter-trend' || chart.kind !== 'scatter') throw new Error('expected scatter trend')
      const direction = covariance(chart.series[0].points)
      const label = direction > 0n ? 'Increasing' : direction < 0n ? 'Decreasing' : 'Flat'
      directions.add(label)
      choiceOrders.add((problem.choices ?? []).map(({ id }) => id).join(','))
      expect(problem.answer).toEqual({ kind: 'choice', id: choiceId(problem, label) })
      expect(chartTable(chart).rows).toHaveLength(chart.series[0].points.length)
      expect(scatterTrendSegment(chart, 0)).toBeDefined()
    }
    expect(directions).toEqual(new Set(['Increasing', 'Decreasing', 'Flat']))
    expect(choiceOrders.size).toBeGreaterThan(1)
  })

  it('grows visible source work from difficulty one to five', () => {
    for (const generator of unit21) {
      const means = difficulties.map((difficulty) => {
        const problems = Array.from({ length: 100 }, (_, seed) =>
          generateProblem(generator, seed * 7919 + difficulty, difficulty),
        )
        return problems.reduce((sum, problem) => sum + sourceWork(problem), 0) / problems.length
      })
      expect(means[4], generator.id).toBeGreaterThan(means[0])
    }
  })
})

describe('Unit 21b probability', () => {
  it('recomputes basic-probability, requires fraction form, and rejects a decimal entry', () => {
    for (const problem of everyProblem('basic-probability')) {
      const data = statisticsOf(problem)
      if (data.operation !== 'basic-probability') throw new Error('expected basic-probability data')
      expect(data.favourable).toBeGreaterThan(0)
      expect(data.favourable).toBeLessThan(data.total)

      const exact = rational(data.favourable, data.total)
      expect(problem.answer).toEqual({ kind: 'exact', ...exact, requireFraction: true })
      expect(problem.keypad).toEqual({ allowFraction: true })
      expect(problem.inputMode).toBe('keypad')

      expect(checkAnswer(problem.answer, `${data.favourable}/${data.total}`).status).toBe('correct')
      expect(checkAnswer(problem.answer, `${data.favourable * 2}/${data.total * 2}`).status).toBe('correct')
      // Only checkable in decimal form when the reduced denominator terminates
      // — the pad's one adaptive cell offers the slash, not a decimal point,
      // so `String(toNumber(...))` would otherwise round-trip a repeating
      // decimal through too many digits for `parseInput` to accept at all.
      if (isTerminatingDecimal(exact.d)) {
        expect(checkAnswer(problem.answer, String(toNumber(exact))).status).toBe('not-fraction')
      }

      const misconceptions = problem.misconceptions ?? []
      expect(misconceptions.map(({ tag }) => tag)).toEqual(['favourable-over-remaining'])
      const [remaining] = misconceptions
      if (typeof remaining.value !== 'number') throw new Error('expected numeric diagnosis')
      const remainingFraction = rational(data.favourable, data.total - data.favourable)
      expect(remaining.value).toBe(toNumber(remainingFraction))
      expect(diagnose(problem, `${remainingFraction.n}/${remainingFraction.d}`)?.tag).toBe('favourable-over-remaining')
    }
  })

  it('keeps both compound-probability wall diagnoses distinct and both cues sampled', () => {
    const cues = new Set<string>()
    for (const problem of everyProblem('compound-probability')) {
      const data = statisticsOf(problem)
      if (data.operation !== 'compound-probability') throw new Error('expected compound-probability data')
      cues.add(data.cue)

      const first = rational(data.firstFavourable, data.firstTotal)
      const second = rational(data.secondFavourable, data.secondTotal)
      const combined = data.cue === 'and'
        ? rational(first.n * second.n, first.d * second.d)
        : rational(first.n * second.d + second.n * first.d, first.d * second.d)
      const value = toNumber(combined)
      expect(value).toBeGreaterThan(0)
      expect(value).toBeLessThan(1)
      expect(problem.answer).toEqual({ kind: 'exact', ...combined, requireFraction: true })
      expect(problem.keypad).toEqual({ allowFraction: true })

      const swapped = data.cue === 'and'
        ? rational(first.n * second.d + second.n * first.d, first.d * second.d)
        : rational(first.n * second.n, first.d * second.d)
      const addedNumeratorsDenominators = rational(
        data.firstFavourable + data.secondFavourable,
        data.firstTotal + data.secondTotal,
      )

      const misconceptions = problem.misconceptions ?? []
      expect(misconceptions.map(({ tag }) => tag)).toEqual([
        'swapped-operation',
        'added-numerators-and-denominators',
      ])
      expect(misconceptions.map(({ value: v }) => v)).toEqual([
        toNumber(swapped),
        toNumber(addedNumeratorsDenominators),
      ])
      expect(new Set([value, toNumber(swapped), toNumber(addedNumeratorsDenominators)]).size).toBe(3)
      // Diagnosed by its exact fraction, not a stringified decimal — the same
      // reason the basic-probability check above guards on a terminating
      // denominator: the pad these problems declare has no decimal point.
      expect(diagnose(problem, `${swapped.n}/${swapped.d}`)?.tag).toBe('swapped-operation')
      expect(diagnose(problem, `${addedNumeratorsDenominators.n}/${addedNumeratorsDenominators.d}`)?.tag).toBe(
        'added-numerators-and-denominators',
      )
    }
    expect(cues).toEqual(new Set(['and', 'or']))
  })

  it('derives counting-outcomes as a product with no fraction form, and a surviving diagnosis', () => {
    for (const problem of everyProblem('counting-outcomes')) {
      const data = statisticsOf(problem)
      if (data.operation !== 'counting-outcomes') throw new Error('expected counting-outcomes data')
      expect(data.stages.length).toBeGreaterThanOrEqual(2)
      expect(data.stages.every((count) => Number.isSafeInteger(count) && count >= 2)).toBe(true)

      const product = data.stages.reduce((total, count) => total * count, 1)
      const sum = data.stages.reduce((total, count) => total + count, 0)
      expect(exactAnswer(problem)).toBe(product)
      expect(problem.answer).toMatchObject({ kind: 'exact', d: 1 })
      expect(problem.keypad).toBeUndefined()
      expect(checkAnswer(problem.answer, String(product)).status).toBe('correct')

      const misconceptions = problem.misconceptions ?? []
      expect(misconceptions.map(({ tag }) => tag)).toEqual(['added-stage-counts'])
      const [added] = misconceptions
      expect(added.value).toBe(sum)
      expect(product).not.toBe(sum)
      expect(diagnose(problem, String(sum))?.tag).toBe('added-stage-counts')
    }
  })
})

describe('Unit 21 teaching lines and intros', () => {
  it.each(teachingLines)('keeps reviewed line for %s', (id, line) => {
    const generator = skill(id)
    const location = manifestIndex.get(id)
    if (!location) throw new Error(`Missing manifest location: ${id}`)
    expect(generator.teachingLine).toBe(line)
    expect(checkTeachingLine(generator.teachingLine, location)).toEqual([])
  })

  it('keeps fixed difficulty-one examples deterministic and solvable', () => {
    for (const [id] of teachingLines) {
      const generator = skill(id)
      const first = generateProblem(generator, 1, 1)
      expect(generateProblem(generator, 1, 1)).toEqual(first)
      const data = statisticsOf(first)
      if (
        data.operation === 'basic-probability' ||
        data.operation === 'compound-probability' ||
        data.operation === 'counting-outcomes'
      ) {
        const answer = probabilityAnswer(data)
        if (data.operation === 'counting-outcomes') {
          expect(exactAnswer(first)).toBe(answer)
        } else {
          if (first.answer.kind !== 'exact') throw new Error('expected exact fraction answer')
          expect(toNumber(rational(first.answer.n, first.answer.d))).toBe(answer)
        }
      } else if (first.display.kind === 'story') {
        expect(listAnswer(first, data as ListStatistics)).toBe(exactAnswer(first))
      } else {
        if (first.display.kind !== 'chart') throw new Error('expected chart display')
        const answer = chartAnswer(first, first.display.chart, data)
        if (first.answer.kind === 'choice') expect(answer).toBe(first.answer.id)
        else expect(answer).toBe(exactAnswer(first))
      }
      expect(first.solution.length).toBeGreaterThan(0)
    }
  })

  it('renders every intro with source display, answer, steps, and no input surface', () => {
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
      expect(html).toContain('data-skill-intro="automatic"')
      expect(html).toContain(generator.teachingLine)
      expect(html).toContain('Correct answer')
      expect(html).toContain('How it works')
      expect(html).toContain('Start practice')
      expect(html).toContain('>Leave<')
      expect(html).not.toContain('>Check<')
      expect(html).not.toContain('Show me a hint')
      expect(html).not.toContain('<input')
      expect(html).not.toContain('data-chart-answer')
      if (problem.display.kind === 'story') {
        expect(html).toContain(problem.display.text)
        // A probability intro shows its correct answer as a fraction — the
        // form `checkAnswer` requires and the exact reason `answerLabel`
        // never routes a `requireFraction` answer through `decimalLabel`.
        if (problem.answer.kind === 'exact' && problem.answer.requireFraction) {
          expect(html).toContain(`${problem.answer.n}/${problem.answer.d}`)
        }
      } else {
        expect(html).toContain('data-chart-table')
        expect(html).toContain('data-chart-axes')
        expect(html).toContain('data-chart-marks')
      }
    }
  })
})
