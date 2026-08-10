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
