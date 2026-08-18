import { describe, expect, it } from 'vitest'
import type { Problem } from '../lib/types'
import { format } from './recorded-output'

describe('recorded output for structured math', () => {
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
