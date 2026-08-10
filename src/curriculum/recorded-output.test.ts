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
