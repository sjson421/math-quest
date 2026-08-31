import { describe, expect, it } from 'vitest'
import { generateProblem } from '../lib/generator'
import type { Problem } from '../lib/types'
import { rational } from '../lib/rational'
import { format } from './recorded-output'
import { unit18 } from './unit-18-polynomials'

describe('recorded output for structured math', () => {
  const unit18Problem = (id: string, difficulty: 1 | 2 | 3 | 4 | 5) => {
    const skill = unit18.find((candidate) => candidate.id === id)
    if (!skill) throw new Error(`missing ${id}`)
    return generateProblem(skill, 12345, difficulty)
  }

  it('records factored-zero sources and semantic roots without the entry codec', () => {
    const output = format(unit18Problem('solve-by-factoring', 4), 12345)
    expect(output).toContain('display  equation "')
    expect(output).toContain('[factored-zero constants ')
    expect(output).toContain('answer   root-pair roots (')
    expect(output).not.toContain('["')
  })

  it('records the quadratic coefficients, complete formula tree, and coefficient prompt', () => {
    const problem = unit18Problem('quadratic-formula', 5)
    const output = format(problem, 12345)
    expect(output).toContain('prompt   Solve ')
    expect(output).toContain('using a = ')
    expect(output).toContain('[quadratic-formula a=')
    expect(output).toContain('fraction(row("−b", "±", root(row(superscript("b", "2"), "−", "4ac"))), "2a")')
    expect(output).toContain('answer   root-pair roots (')
  })

  it('records root-pair answers, input, and misconceptions semantically', () => {
    const problem: Problem = {
      skillId: 'synthetic-root-pair',
      prompt: 'Find both roots.',
      display: { kind: 'inline', text: 'x² − x − 12' },
      answer: { kind: 'root-pair', roots: [rational(-3, 1), rational(4, 1)] },
      inputMode: 'root-pair',
      misconceptions: [{
        value: { kind: 'root-pair', roots: [rational(-3, 1), rational(-3, 1)] },
        tag: 'repeated-root',
        nudge: 'Check both factors.',
      }],
      hint: 'Find both values that make zero.',
      solution: [{ text: 'Set each factor equal to zero.' }],
      difficulty: 1,
    }

    const output = format(problem, 3)
    expect(output).toContain('answer   root-pair roots (-3, 4)')
    expect(output).toContain('input    root-pair (Root 1, Root 2; one Check)')
    expect(output).toContain('miss     repeated-root = roots (-3, -3)')
    expect(output).not.toContain('["-3","4"]')
  })

  it('records both the authored label and every notation node', () => {
    const problem: Problem = {
      skillId: 'synthetic-math',
      prompt: 'What is the value?',
      display: {
        kind: 'math',
        notation: {
          kind: 'row',
          children: [
            {
              kind: 'fraction',
              numerator: { kind: 'text', value: '3' },
              denominator: { kind: 'text', value: '4' },
            },
            { kind: 'text', value: '+' },
            {
              kind: 'root',
              radicand: {
                kind: 'superscript',
                base: { kind: 'text', value: 'x' },
                exponent: { kind: 'text', value: '2' },
              },
            },
          ],
        },
        label: 'three fourths plus the square root of x squared',
      },
      answer: { kind: 'exact', n: 1, d: 1 },
      inputMode: 'keypad',
      hint: 'Read the expression.',
      solution: [{ text: 'Follow the notation.' }],
      difficulty: 1,
    }

    expect(format(problem, 1)).toContain(
      'display  math "three fourths plus the square root of x squared" ' +
        'row(fraction("3", "4"), "+", root(superscript("x", "2")))',
    )
  })

  it('records expression rules from the answer as one declaration', () => {
    const problem: Problem = {
      skillId: 'synthetic-quadratic',
      prompt: 'Write the expression.',
      display: { kind: 'inline', text: '(x + 2)(x + 3)' },
      answer: {
        kind: 'expression',
        canonical: 'x² + 5x + 6',
        variable: 'x',
        form: 'expanded',
        maxDegree: 2,
      },
      inputMode: 'expression',
      hint: 'Multiply each term.',
      solution: [{ text: 'Combine like terms.' }],
      difficulty: 1,
    }

    const output = format(problem, 1)
    expect(output).toContain('answer   expression x² + 5x + 6 (x, expanded, degree 2)')
    expect(output).not.toContain('\nvariable ')
  })
})

describe('recorded output for diagrams', () => {
  it('records the shape, both counts, and the derived accessible name', () => {
    const problem: Problem = {
      skillId: 'synthetic-diagram',
      prompt: 'What fraction is shaded?',
      display: {
        kind: 'diagram',
        diagram: { kind: 'grid', parts: 6, shadedParts: 4 },
      },
      answer: { kind: 'exact', n: 2, d: 3 },
      inputMode: 'keypad',
      hint: 'Count all parts, then shaded parts.',
      solution: [{ text: 'Four of six parts are shaded.' }],
      difficulty: 1,
    }

    expect(format(problem, 7)).toContain(
      'display  diagram grid 4/6 "grid in 6 parts, 4 shaded"',
    )
  })

  it('records every geometry source, derived formula, answer policy, and diagnosis', () => {
    const problem: Problem = {
      skillId: 'synthetic-geometry',
      prompt: 'Find the circle\'s area. Use π = 3.14 and round to the nearest tenth.',
      display: {
        kind: 'diagram',
        diagram: { kind: 'geometry', operation: 'area-circle', diameter: 10, unit: 'm' },
      },
      answer: { kind: 'approx', value: 78.5, tolerance: 0.05 },
      inputMode: 'keypad',
      keypad: { allowDecimal: true },
      misconceptions: [
        { value: 314, tag: 'squared-diameter', nudge: 'Square the radius, not the whole diameter.' },
        { value: 31.4, tag: 'circumference-for-area', nudge: 'Area and circumference use different formulas.' },
      ],
      hint: 'Halve the diameter to get radius, then square it.',
      solution: [{ text: 'Halve the diameter.', detail: '10 ÷ 2 = 5' }],
      difficulty: 1,
    }

    const output = format(problem, 31)
    expect(output).toContain(
      'display  geometry area-circle diameter 10 unit m name "Circle with diameter 10 m" ' +
        'formulas ["C equals pi times d" row("C = ", "πd"); ' +
        '"A equals pi times r squared" row("A = ", row("π", superscript("r", "2")))]',
    )
    expect(output).toContain('answer   approx 78.5 ±0.05')
    expect(output).toContain('input    keypad')
    expect(output).toContain('keypad   allowDecimal=true')
    expect(output).toContain('miss     squared-diameter = 314')
    expect(output).toContain('miss     circumference-for-area = 31.4')
  })

  it('records every similar-figure source, proportion, exact answer, and diagnosis', () => {
    const problem: Problem = {
      skillId: 'synthetic-similar-figures',
      prompt: 'Find the missing side of the larger rectangle in centimetres.',
      display: {
        kind: 'diagram',
        diagram: {
          kind: 'geometry',
          operation: 'similar-figures',
          smallLength: 4,
          smallWidth: 3,
          largeKnownSide: 8,
          knownSide: 'length',
          unit: 'cm',
        },
      },
      answer: { kind: 'exact', n: 6, d: 1 },
      inputMode: 'keypad',
      misconceptions: [
        { value: 8, tag: 'copied-known-large-side', nudge: 'Use the known pair to find the scale factor first.' },
        { value: 7, tag: 'used-additive-side-change', nudge: 'Scale the matching side instead of adding a fixed difference.' },
      ],
      hint: 'Find the scale factor, then use it on the other small side.',
      solution: [{ text: 'Find the scale factor.' }, { text: 'Scale the other side.' }],
      difficulty: 1,
    }

    const output = format(problem, 31)
    expect(output).toContain(
      'display  geometry similar-figures smallLength 4 smallWidth 3 largeKnownSide 8 knownSide length unit cm ' +
        'name "Similar rectangles: small rectangle has lowercase sides a = 4 cm and b = 3 cm; large rectangle has uppercase side A = 8 cm and missing uppercase side B (width)" ' +
        'formulas ["a over A equals b over B" row(fraction("a", "A"), " = ", fraction("b", "B")); ' +
        '"a over b equals A over B" row(fraction("a", "b"), " = ", fraction("A", "B"))]',
    )
    expect(output).toContain('answer   exact 6/1')
    expect(output).toContain('input    keypad')
    expect(output).toContain('miss     copied-known-large-side = 8')
    expect(output).toContain('miss     used-additive-side-change = 7')
  })
})

describe('recorded output for coordinate planes', () => {
  it('records both axes, every mark, and the derived accessible name', () => {
    const problem: Problem = {
      skillId: 'synthetic-coordinate-plane',
      prompt: 'What is the slope?',
      display: {
        kind: 'coordinate-plane',
        plane: {
          x: { min: -5, max: 5, step: 1 },
          y: { min: -4, max: 4, step: 2 },
          points: [{ x: -2, y: 2 }],
          lines: [{ through: [{ x: 0, y: 0 }, { x: 2, y: 2 }] }],
        },
      },
      answer: { kind: 'exact', n: 1, d: 1 },
      inputMode: 'keypad',
      hint: 'Compare rise with run.',
      solution: [{ text: 'Read two points.' }],
      difficulty: 1,
    }

    expect(format(problem, 11)).toContain(
      'display  coordinate-plane x -5..5/1 y -4..4/2 points [(−2, 2)] ' +
        'lines [(0, 0)→(2, 2)] "Coordinate plane, x-axis −5 to 5 by 1; ' +
        'y-axis −4 to 4 by 2; points (−2, 2); line 1 through (0, 0) and (2, 2)"',
    )
  })

  it('records point input, its exact answer, and structured point misconceptions', () => {
    const problem: Problem = {
      skillId: 'synthetic-point',
      prompt: 'Plot the point.',
      display: {
        kind: 'coordinate-plane',
        plane: {
          x: { min: -5, max: 5, step: 1 },
          y: { min: -5, max: 5, step: 1 },
          points: [],
          lines: [],
        },
      },
      answer: { kind: 'point', x: 3, y: 2 },
      inputMode: 'coordinate-plane',
      misconceptions: [{
        value: { kind: 'point', x: 2, y: 3 },
        tag: 'swapped-coordinates',
        nudge: 'Read x first, then y.',
      }],
      hint: 'Read x first, then y.',
      solution: [{ text: 'Move across, then up.' }],
      difficulty: 1,
    }

    const output = format(problem, 13)
    expect(output).toContain('answer   point (3, 2)')
    expect(output).toContain('input    coordinate-plane')
    expect(output).toContain('miss     swapped-coordinates = (2, 3)')
  })

  it('records every coordinate table row, target, and operation', () => {
    const problem: Problem = {
      skillId: 'synthetic-table',
      prompt: 'Plot the highlighted row.',
      display: {
        kind: 'coordinate-plane',
        plane: {
          x: { min: -5, max: 5, step: 1 },
          y: { min: -5, max: 5, step: 1 },
          points: [{ x: -2, y: -1 }, { x: 0, y: 1 }],
          lines: [],
        },
        coordinate: {
          operation: 'table-to-graph',
          rows: [{ x: -2, y: -1 }, { x: 0, y: 1 }, { x: 2, y: 3 }],
          targetX: 2,
        },
      },
      answer: { kind: 'point', x: 2, y: 3 },
      inputMode: 'coordinate-plane',
      hint: 'Read x first, then y.',
      solution: [{ text: 'Move across, then up.' }],
      difficulty: 1,
    }

    expect(format(problem, 17)).toContain(
      'table-to-graph rows [(−2, −1), (0, 1), (2, 3)] target-x 2',
    )
  })

  it('records equation sources and both graph candidates', () => {
    const problem: Problem = {
      skillId: 'synthetic-graph-equation',
      prompt: 'Which line matches?',
      display: {
        kind: 'coordinate-plane',
        plane: {
          x: { min: -5, max: 5, step: 1 },
          y: { min: -5, max: 5, step: 1 },
          points: [],
          lines: [
            { through: [{ x: 0, y: -3 }, { x: 1, y: -1 }] },
            { through: [{ x: 0, y: 3 }, { x: 1, y: 5 }] },
          ],
        },
        coordinate: { operation: 'graph-from-equation', slope: 2, intercept: -3 },
      },
      answer: { kind: 'choice', id: 'line-1' },
      inputMode: 'choice',
      choices: [
        { id: 'line-1', label: 'Line 1 (solid)' },
        { id: 'line-2', label: 'Line 2 (dashed)' },
      ],
      hint: 'Match the slope and intercept.',
      solution: [{ text: 'Find the matching line.' }],
      difficulty: 1,
    }

    const output = format(problem, 19)
    expect(output).toContain('graph-from-equation slope 2 intercept -3 y = 2x − 3')
    expect(output).toContain('lines [(0, −3)→(1, −1), (0, 3)→(1, 5)]')
  })
})

describe('recorded output for charts', () => {
  it('records every chart source and the derived accessible name', () => {
    const problem: Problem = {
      skillId: 'synthetic-chart',
      prompt: 'Read the bar.',
      display: {
        kind: 'chart',
        chart: {
          title: 'Monthly output',
          xLabel: 'Month',
          yLabel: 'Units',
          kind: 'bar',
          labels: ['Jan', 'Feb'],
          y: { min: 0, max: 20, step: 5 },
          series: [
            { label: 'North', values: [4, 12] },
            { label: 'South', values: [7, 8] },
          ],
        },
      },
      answer: { kind: 'exact', n: 12, d: 1 },
      inputMode: 'keypad',
      hint: 'Read the February bar.',
      solution: [{ text: 'The February value is 12.' }],
      difficulty: 1,
    }

    const output = format(problem, 23)
    expect(output).toContain(
      'display  chart bar "Monthly output" x-label "Month" y-label "Units" ' +
        'y-scale 0..20/5 labels ["Jan","Feb"] series ["North": [4,12]; "South": [7,8]]',
    )
    expect(output).toContain('Bar chart "Monthly output"')
    expect(output).toContain('South')
    expect(output).toContain('12')
  })

  it('records scatter points and each trend request', () => {
    const problem: Problem = {
      skillId: 'synthetic-scatter',
      prompt: 'Read the trend.',
      display: {
        kind: 'chart',
        chart: {
          title: 'Study results',
          xLabel: 'Hours',
          yLabel: 'Score',
          kind: 'scatter',
          x: { min: 0, max: 10, step: 5 },
          y: { min: 0, max: 10, step: 5 },
          series: [{
            label: 'Learners',
            points: [{ x: 1, y: 2 }, { x: 5, y: 6 }, { x: 9, y: 8 }],
            trendLine: true,
          }],
        },
      },
      answer: { kind: 'choice', id: 'rising' },
      inputMode: 'choice',
      choices: [{ id: 'rising', label: 'Rising' }],
      hint: 'Compare left and right.',
      solution: [{ text: 'The points rise overall.' }],
      difficulty: 1,
    }

    const output = format(problem, 29)
    expect(output).toContain('x-scale 0..10/5 y-scale 0..10/5')
    expect(output).toContain('"Learners": [{"x":1,"y":2},{"x":5,"y":6},{"x":9,"y":8}] trend=true')
  })
})

describe('recorded output for statistics sources', () => {
  const base = (display: Problem['display']): Problem => ({
    skillId: 'synthetic-statistics',
    prompt: 'Read the data.',
    display,
    answer: { kind: 'exact', n: 7, d: 1 },
    inputMode: 'keypad',
    hint: 'Use the visible source.',
    solution: [{ text: 'Read the source data.' }],
    difficulty: 1,
  })

  it('records every list operation, ordered value, and weighted pair', () => {
    const displays: Problem['display'][] = [
      { kind: 'story', text: 'Values: 4, 6, 8', statistics: { operation: 'mean', values: [4, 6, 8] } },
      { kind: 'story', text: 'Values: 10, 1, 8', statistics: { operation: 'median', values: [10, 1, 8] } },
      { kind: 'story', text: 'Values: 2, 4, 4', statistics: { operation: 'mode', values: [2, 4, 4] } },
      { kind: 'story', text: 'Values: 2, 4, 9', statistics: { operation: 'range', values: [2, 4, 9] } },
      {
        kind: 'story',
        text: 'Values with weights: 60 (weight 1), 75 (weight 2)',
        statistics: {
          operation: 'weighted-mean',
          entries: [{ value: 60, weight: 1 }, { value: 75, weight: 2 }],
        },
      },
    ]

    const output = displays.map((display) => format(base(display), 37)).join('\n')
    expect(output).toContain('mean values [4,6,8]')
    expect(output).toContain('median values [10,1,8]')
    expect(output).toContain('mode values [2,4,4]')
    expect(output).toContain('range values [2,4,9]')
    expect(output).toContain('weighted-mean entries [{"value":60,"weight":1},{"value":75,"weight":2}]')
  })

  it('records chart selectors, plotted source values, and trend-line requests', () => {
    const categorical = base({
      kind: 'chart',
      chart: {
        title: 'Monthly output',
        xLabel: 'Month',
        yLabel: 'Units',
        kind: 'bar',
        labels: ['Jan', 'Feb'],
        y: { min: 0, max: 20, step: 5 },
        series: [{ label: 'Books', values: [4, 12] }],
      },
      statistics: { operation: 'read-chart-value', categoryIndex: 1, seriesIndex: 0 },
    })
    const scatter = base({
      kind: 'chart',
      chart: {
        title: 'Study results',
        xLabel: 'Hours',
        yLabel: 'Score',
        kind: 'scatter',
        x: { min: 0, max: 4, step: 1 },
        y: { min: 0, max: 10, step: 5 },
        series: [{
          label: 'Learners',
          points: [{ x: 0, y: 2 }, { x: 1, y: 4 }, { x: 2, y: 5 }],
          trendLine: true,
        }],
      },
      statistics: { operation: 'scatter-trend' },
    })

    expect(format(categorical, 41)).toContain('[read-chart-value category 1 series 0]')
    expect(format(categorical, 41)).toContain('series ["Books": [4,12]]')
    expect(format(scatter, 43)).toContain('[scatter-trend trend-line true]')
    expect(format(scatter, 43)).toContain('"Learners": [{"x":0,"y":2},{"x":1,"y":4},{"x":2,"y":5}] trend=true')
  })
})
