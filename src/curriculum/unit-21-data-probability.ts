import { intAnswer } from '../lib/answer'
import type { Chart, ScatterPoint } from '../lib/chart'
import { constrain } from '../lib/rng'
import type { Choice, StatisticsData } from '../lib/types'
import { band, defineSkill, drawn, type BuildContext, type Ladder } from './engine'

/** Unit 21 · Data & Probability, increment 21a. */

const MEAN_COUNT: Ladder = {
  1: [4, 4],
  2: [4, 5],
  3: [5, 5],
  4: [5, 6],
  5: [6, 6],
}

const MEAN_CENTER: Ladder = {
  1: [4, 8],
  2: [8, 14],
  3: [12, 22],
  4: [18, 32],
  5: [26, 48],
}

const MEDIAN_COUNT: Ladder = {
  1: [5, 6],
  2: [5, 6],
  3: [7, 8],
  4: [7, 9],
  5: [9, 10],
}

const MEDIAN_VALUES: Ladder = {
  1: [14, 24],
  2: [24, 38],
  3: [36, 56],
  4: [52, 78],
  5: [72, 108],
}

const MODE_COUNT: Ladder = {
  1: [5, 5],
  2: [5, 6],
  3: [6, 7],
  4: [7, 8],
  5: [8, 9],
}

const MODE_VALUES: Ladder = {
  1: [3, 12],
  2: [5, 20],
  3: [8, 32],
  4: [12, 48],
  5: [16, 72],
}

const WEIGHTED_COUNT: Ladder = {
  1: [3, 3],
  2: [3, 4],
  3: [4, 4],
  4: [4, 5],
  5: [5, 5],
}

const WEIGHTED_CENTER: Ladder = {
  1: [40, 60],
  2: [56, 82],
  3: [76, 110],
  4: [100, 144],
  5: [132, 190],
}

const WEIGHT_SCALE: Ladder = {
  1: [1, 1],
  2: [1, 2],
  3: [2, 3],
  4: [3, 4],
  5: [4, 5],
}

const CHART_CATEGORY_COUNT: Ladder = {
  1: [2, 3],
  2: [3, 4],
  3: [4, 4],
  4: [4, 5],
  5: [5, 6],
}

const CHART_STEP: Ladder = {
  1: [2, 4],
  2: [3, 5],
  3: [4, 7],
  4: [5, 9],
  5: [7, 12],
}

const CHART_INTERVALS: Ladder = {
  1: [4, 5],
  2: [4, 6],
  3: [5, 7],
  4: [5, 8],
  5: [6, 9],
}

const SCATTER_COUNT: Ladder = {
  1: [4, 5],
  2: [5, 6],
  3: [6, 7],
  4: [7, 8],
  5: [8, 10],
}

const listText = (values: readonly number[]): string =>
  `Values: ${values.map(drawn).join(', ')}`

const weightedListText = (entries: readonly { value: number; weight: number }[]): string =>
  `Values with weights: ${entries
    .map(({ value, weight }) => `${drawn(value)} (weight ${drawn(weight)})`)
    .join(', ')}`

const statisticsPrompt = (operation: 'mean' | 'median' | 'mode' | 'range' | 'weighted-mean'): string =>
  `What is the ${operation === 'weighted-mean' ? 'weighted mean' : operation} of these values?`

const balancedValues = (context: BuildContext, count: number, center: number): number[] => {
  const spread = Math.max(1, Math.floor(center / 4))
  const offsets: number[] = []
  for (let index = 0; index < Math.floor(count / 2); index += 1) {
    const amount = context.rng.int(1, spread)
    offsets.push(-amount, amount)
  }
  if (count % 2 === 1) offsets.push(0)
  return context.rng.shuffle(offsets).map((offset) => center + offset)
}

const drawMeanValues = (context: BuildContext): number[] => {
  const count = context.rng.int(...band(context.difficulty, MEAN_COUNT))
  const center = context.rng.int(...band(context.difficulty, MEAN_CENTER))
  return constrain(
    () => balancedValues(context, count, center),
    (values) => new Set(values).size > 1,
  )
}

const mean = defineSkill({
  id: 'mean',
  name: 'Mean',
  blurb: 'The average of a set',
  teachingLine: 'Mean shares the total equally across all values.',
  build(context) {
    const values = drawMeanValues(context)
    const total = values.reduce((sum, value) => sum + value, 0)
    const answer = total / values.length
    const statistics: StatisticsData = { operation: 'mean', values }

    return {
      prompt: statisticsPrompt('mean'),
      display: { kind: 'story', text: listText(values), statistics },
      answer: intAnswer(answer),
      hint: 'Add the values, then divide by their count.',
      solution: [
        { text: 'Add all the values.', detail: `${values.map(drawn).join(' + ')} = ${total}` },
        { text: 'Divide the total by the count.', detail: `${total} ÷ ${values.length} = ${answer}` },
        { text: 'The mean is the result.', detail: `${answer}` },
      ],
    }
  },
})

type MedianDraw = {
  values: number[]
  median: number
  unsortedMiddle: number
  ordinaryMean: number
}

const MEDIAN_OFFSETS: Record<number, readonly number[]> = {
  5: [-4, -2, 0, 3, 8],
  6: [-6, -3, -1, 1, 4, 11],
  7: [-6, -4, -2, 0, 3, 5, 11],
  8: [-8, -5, -3, -1, 1, 4, 7, 13],
  9: [-8, -6, -4, -2, 0, 3, 5, 7, 14],
  10: [-10, -7, -5, -3, -1, 1, 4, 6, 8, 17],
}

const drawMedian = (context: BuildContext): MedianDraw => {
  const countBand = band(context.difficulty, MEDIAN_COUNT)
  const valueBand = band(context.difficulty, MEDIAN_VALUES)
  const count = context.rng.int(...countBand)
  const offsets = MEDIAN_OFFSETS[count]
  if (!offsets) throw new Error(`No median offsets for list length ${count}`)
  const center = context.rng.int(valueBand[0], valueBand[1])
  const sorted = offsets.map((offset) => center + offset)
  const middle = Math.floor(count / 2)
  const median = count % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
  const ordinaryMean = sorted.reduce((sum, value) => sum + value, 0) / count

  return constrain(
    () => {
      const values = context.rng.shuffle(sorted)
      const unsortedMiddle = count % 2 === 1
        ? values[middle]
        : (values[middle - 1] + values[middle]) / 2

      return { values, median, unsortedMiddle, ordinaryMean }
    },
    ({ values, unsortedMiddle }) =>
      new Set(values).size === values.length &&
      Number.isInteger(median) &&
      Number.isInteger(ordinaryMean) &&
      Number.isInteger(unsortedMiddle) &&
      [...values].sort((left, right) => left - right).some((value, index) => value !== values[index]) &&
      new Set([median, unsortedMiddle, ordinaryMean]).size === 3,
  )
}

const median = defineSkill({
  id: 'median',
  name: 'Median',
  blurb: 'The middle value',
  teachingLine: 'Sort the values before finding the middle.',
  build(context) {
    const data = drawMedian(context)
    const statistics: StatisticsData = { operation: 'median', values: data.values }

    return {
      prompt: statisticsPrompt('median'),
      display: { kind: 'story', text: listText(data.values), statistics },
      answer: intAnswer(data.median),
      misconceptions: [
        {
          value: data.unsortedMiddle,
          tag: 'used-unsorted-middle',
          nudge: 'Sort the list before choosing its middle.',
        },
        {
          value: data.ordinaryMean,
          tag: 'used-mean-for-median',
          nudge: 'Find the middle after sorting, not the overall average.',
        },
      ],
      hint: 'Sort the values before finding the middle.',
      solution: [
        { text: 'Sort the values from least to greatest.', detail: [...data.values].sort((left, right) => left - right).map(drawn).join(', ') },
        data.values.length % 2 === 1
          ? { text: 'Take the value in the middle.', detail: `${data.median}` }
          : {
              text: 'Average the two middle values.',
              detail: `(${[...data.values].sort((left, right) => left - right)[data.values.length / 2 - 1]} + ${[...data.values].sort((left, right) => left - right)[data.values.length / 2]}) ÷ 2 = ${data.median}`,
            },
        { text: 'The median is the result.', detail: `${data.median}` },
      ],
    }
  },
})

type ModeRangeDraw = {
  values: number[]
  mode: number
  range: number
}

const drawModeRange = (context: BuildContext): ModeRangeDraw => {
  const countBand = band(context.difficulty, MODE_COUNT)
  const valueBand = band(context.difficulty, MODE_VALUES)

  return constrain(
    () => {
      const count = context.rng.int(...countBand)
      const mode = context.rng.int(...valueBand)
      const others = Array.from({ length: count - 2 }, () => context.rng.int(...valueBand))
      const values = context.rng.shuffle([mode, mode, ...others])
      const counts = new Map<number, number>()
      values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
      const range = Math.max(...values) - Math.min(...values)
      return { values, mode, range, counts }
    },
    ({ values, mode, range, counts }) =>
      counts.size === values.length - 1 &&
      counts.get(mode) === 2 &&
      [...counts].every(([value, count]) => value === mode || count === 1) &&
      range !== mode,
  )
}

const modeRange = defineSkill({
  id: 'mode-range',
  name: 'Mode & Range',
  blurb: 'Most common, and the spread',
  teachingLine: 'Mode is most common; range is highest minus lowest.',
  build(context) {
    const operation = context.rng.bool() ? 'mode' as const : 'range' as const
    const data = drawModeRange(context)
    const answer = operation === 'mode' ? data.mode : data.range
    const misconception = operation === 'mode'
      ? {
          value: data.range,
          tag: 'used-range-for-mode',
          nudge: 'Count repeats when the question asks for mode.',
        }
      : {
          value: data.mode,
          tag: 'used-mode-for-range',
          nudge: 'Subtract lowest from highest to find range.',
        }
    const statistics: StatisticsData = { operation, values: data.values }

    return {
      prompt: statisticsPrompt(operation),
      display: { kind: 'story', text: listText(data.values), statistics },
      answer: intAnswer(answer),
      misconceptions: [misconception],
      hint: operation === 'mode'
        ? 'Count repeats to find the mode.'
        : 'Subtract the lowest value from the highest.',
      solution: operation === 'mode'
        ? [
            { text: 'Count how often each value appears.', detail: `${data.mode} appears twice` },
            { text: 'Choose the most common value.', detail: `${data.mode}` },
          ]
        : [
            { text: 'Find the highest and lowest values.', detail: `${Math.max(...data.values)} and ${Math.min(...data.values)}` },
            { text: 'Subtract lowest from highest.', detail: `${Math.max(...data.values)} − ${Math.min(...data.values)} = ${data.range}` },
            { text: 'The range is the difference.', detail: `${data.range}` },
          ],
    }
  },
})

type WeightedEntry = { value: number; weight: number }

const drawWeightedEntries = (context: BuildContext): WeightedEntry[] => {
  const count = context.rng.int(...band(context.difficulty, WEIGHTED_COUNT))
  const center = context.rng.int(...band(context.difficulty, WEIGHTED_CENTER))
  const scale = context.rng.int(...band(context.difficulty, WEIGHT_SCALE))
  const totalWeight = scale * (count + 3)
  const offset = totalWeight
  const entries: WeightedEntry[] = [
    { value: center - offset, weight: scale },
    { value: center, weight: 2 * scale },
    { value: center + offset, weight: 3 * scale },
    ...Array.from({ length: count - 3 }, () => ({ value: center, weight: scale })),
  ]
  return context.rng.shuffle(entries)
}

const weightedMean = defineSkill({
  id: 'weighted-mean',
  name: 'Weighted Mean',
  blurb: 'When some values count more',
  teachingLine: 'Multiply each value by its weight, then divide by total weight.',
  build(context) {
    const entries = drawWeightedEntries(context)
    const weightedTotal = entries.reduce((sum, entry) => sum + entry.value * entry.weight, 0)
    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0)
    const ordinaryMean = entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length
    const answer = weightedTotal / totalWeight
    const statistics: StatisticsData = { operation: 'weighted-mean', entries }

    return {
      prompt: statisticsPrompt('weighted-mean'),
      display: { kind: 'story', text: weightedListText(entries), statistics },
      answer: intAnswer(answer),
      misconceptions: [{
        value: ordinaryMean,
        tag: 'ignored-weights',
        nudge: 'Use each weight before dividing by total weight.',
      }],
      hint: 'Use each weight before dividing by total weight.',
      solution: [
        {
          text: 'Multiply each value by its weight.',
          detail: entries.map(({ value, weight }) => `${value} × ${weight}`).join(' + '),
        },
        { text: 'Add the weighted products.', detail: `${weightedTotal}` },
        { text: 'Add all the weights.', detail: `${totalWeight}` },
        { text: 'Divide weighted total by total weight.', detail: `${weightedTotal} ÷ ${totalWeight} = ${answer}` },
      ],
    }
  },
})

const CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const
const SERIES = ['Books', 'Games'] as const

const chartValuePrompt = (category: string, series: string): string =>
  `What is the ${series} value for ${category}?`

type CategoricalChart = Extract<Chart, { kind: 'bar' | 'line' }>

type CategoricalDraw = {
  chart: CategoricalChart
  categoryIndex: number
  seriesIndex: number
}

const drawCategorical = (context: BuildContext): CategoricalDraw => {
  const categoryCount = context.rng.int(...band(context.difficulty, CHART_CATEGORY_COUNT))
  const kind = context.rng.bool() ? 'bar' as const : 'line' as const
  const seriesCount = context.rng.bool() ? 1 : 2
  const step = context.rng.int(...band(context.difficulty, CHART_STEP))
  const intervals = context.rng.int(...band(context.difficulty, CHART_INTERVALS))
  const yMax = step * intervals
  const labels = CATEGORIES.slice(0, categoryCount)
  const series = SERIES.slice(0, seriesCount).map((label) => ({
    label,
    values: Array.from({ length: categoryCount }, () => step * context.rng.int(1, intervals - 1)),
  }))
  const categoryIndex = context.rng.int(0, categoryCount - 1)
  const seriesIndex = context.rng.int(0, seriesCount - 1)

  return {
    chart: {
      title: 'Monthly activity',
      xLabel: 'Month',
      yLabel: 'Count',
      kind,
      labels,
      y: { min: 0, max: yMax, step },
      series,
    },
    categoryIndex,
    seriesIndex,
  }
}

const readBarLine = defineSkill({
  id: 'read-bar-line',
  name: 'Bar & Line Graphs',
  blurb: 'Read values off a chart',
  teachingLine: 'Match the chart label to its bar or line value.',
  build(context) {
    const data = drawCategorical(context)
    const series = data.chart.series[data.seriesIndex]
    const category = data.chart.labels[data.categoryIndex]
    const value = series.values[data.categoryIndex]
    const statistics: StatisticsData = {
      operation: 'read-chart-value',
      categoryIndex: data.categoryIndex,
      seriesIndex: data.seriesIndex,
    }

    return {
      prompt: chartValuePrompt(category, series.label),
      display: { kind: 'chart', chart: data.chart, statistics },
      answer: intAnswer(value),
      hint: 'Match the label to its bar or line.',
      solution: [
        { text: 'Find the requested chart label.', detail: category },
        { text: 'Follow the requested series.', detail: series.label },
        { text: 'Read the value at their intersection.', detail: `${value}` },
      ],
    }
  },
})

type ScatterTrend = 'increasing' | 'decreasing' | 'flat'

const TREND_CHOICES: readonly Choice[] = [
  { id: 'increasing', label: 'Increasing' },
  { id: 'decreasing', label: 'Decreasing' },
  { id: 'flat', label: 'Flat' },
]

const trendLabel = (trend: ScatterTrend): string =>
  trend === 'increasing' ? 'Increasing' : trend === 'decreasing' ? 'Decreasing' : 'Flat'

const covariance = (points: readonly ScatterPoint[]): number => {
  const sumX = points.reduce((sum, point) => sum + point.x, 0)
  const sumY = points.reduce((sum, point) => sum + point.y, 0)
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0)
  return points.length * sumXY - sumX * sumY
}

type ScatterDraw = {
  chart: Extract<Chart, { kind: 'scatter' }>
  trend: ScatterTrend
}

const drawScatter = (context: BuildContext): ScatterDraw => {
  const count = context.rng.int(...band(context.difficulty, SCATTER_COUNT))
  const trend = context.rng.pick(['increasing', 'decreasing', 'flat'] as const)
  const yMax = context.difficulty * 10
  const slope = Math.max(1, Math.floor((yMax - 4) / (count + 2)))

  const { points } = constrain(
    () => {
      const baseMin = trend === 'decreasing' ? slope * (count - 1) + 2 : 2
      const baseMax = trend === 'increasing' ? yMax - slope * (count - 1) - 2 : yMax - 2
      const base = context.rng.int(baseMin, baseMax)
      const points = Array.from({ length: count }, (_, index) => {
        const signal = trend === 'increasing' ? slope * index : trend === 'decreasing' ? -slope * index : 0
        const noise = trend === 'flat' ? 0 : context.rng.int(-1, 1)
        return { x: index, y: base + signal + noise }
      })
      return { points, base }
    },
    ({ points }) => {
      const direction = covariance(points)
      const correctDirection = trend === 'increasing'
        ? direction > 0
        : trend === 'decreasing'
          ? direction < 0
          : direction === 0
      return correctDirection && points.every((point) => point.y >= 0 && point.y <= yMax)
    },
  )

  return {
    chart: {
      title: 'Study time and scores',
      xLabel: 'Hours',
      yLabel: 'Score',
      kind: 'scatter',
      x: { min: 0, max: count, step: 1 },
      y: { min: 0, max: yMax, step: context.difficulty * 2 },
      series: [{ label: 'Learners', points, trendLine: true }],
    },
    trend,
  }
}

const readScatterplot = defineSkill({
  id: 'read-scatterplot',
  name: 'Scatterplots',
  blurb: 'Read a trend line',
  teachingLine: 'A trend line shows the overall direction of paired data.',
  build(context) {
    const data = drawScatter(context)
    const label = trendLabel(data.trend)
    const statistics: StatisticsData = { operation: 'scatter-trend' }

    return {
      prompt: 'What is the overall trend in these paired data?',
      display: { kind: 'chart', chart: data.chart, statistics },
      answer: { kind: 'choice', id: data.trend },
      inputMode: 'choice',
      choices: context.rng.shuffle([...TREND_CHOICES]),
      hint: 'Follow the trend line from left to right.',
      solution: [
        { text: 'Look at the trend line.', detail: label },
        { text: `Choose ${label.toLowerCase()} for its direction.`, detail: label },
      ],
    }
  },
})

export const unit21: [
  typeof mean,
  typeof median,
  typeof modeRange,
  typeof weightedMean,
  typeof readBarLine,
  typeof readScatterplot,
] = [mean, median, modeRange, weightedMean, readBarLine, readScatterplot]
