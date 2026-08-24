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
