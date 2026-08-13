import { describe, expect, it } from 'vitest'
import {
  evaluateExpression,
  expressionNotation,
  foldInOrder,
  ignoringParentheses,
  op,
  power,
  renderExpression,
} from './expression'

describe('numeric expression model', () => {
  it('renders arithmetic precedence and only meaningful parentheses', () => {
    expect(renderExpression(op(3, '+', op(4, '×', 2)))).toBe('3 + 4 × 2')
    expect(renderExpression(op(op(3, '+', 4), '×', 2))).toBe('(3 + 4) × 2')
    expect(renderExpression(op(20, '−', op(8, '+', 3)))).toBe('20 − (8 + 3)')
  })

  it('gives powers precedence and brackets a compound base', () => {
    expect(renderExpression(op(3, '+', op(power(2, 3), '×', 4)))).toBe('3 + 2^3 × 4')
    expect(renderExpression(op(power(op(2, '+', 3), 2), '÷', 5))).toBe('(2 + 3)^2 ÷ 5')
    expect(renderExpression(power(power(2, 3), 4))).toBe('(2^3)^4')
    expect(evaluateExpression(op(3, '+', op(power(2, 3), '×', 4)))).toBe(35)
    expect(evaluateExpression(op(power(op(2, '+', 3), 2), '÷', 5))).toBe(5)
  })

  it('renders the same structure as math notation', () => {
    expect(expressionNotation(op(power(op(2, '+', 3), 2), '÷', 5))).toEqual({
      kind: 'row',
      children: [
        {
          kind: 'superscript',
          base: {
            kind: 'row',
            children: [
              { kind: 'text', value: '(' },
              {
                kind: 'row',
                children: [
                  { kind: 'text', value: '2' },
                  { kind: 'text', value: ' + ' },
                  { kind: 'text', value: '3' },
                ],
              },
              { kind: 'text', value: ')' },
            ],
          },
          exponent: { kind: 'text', value: '2' },
        },
        { kind: 'text', value: ' ÷ ' },
        { kind: 'text', value: '5' },
      ],
    })
    expect(expressionNotation(power(power(2, 3), 4))).toEqual({
      kind: 'superscript',
      base: {
        kind: 'row',
        children: [
          { kind: 'text', value: '(' },
          {
            kind: 'superscript',
            base: { kind: 'text', value: '2' },
            exponent: { kind: 'text', value: '3' },
          },
          { kind: 'text', value: ')' },
        ],
      },
      exponent: { kind: 'text', value: '4' },
    })
  })

  it('keeps Unit 5 wrong-rule evaluations over binary expressions', () => {
    expect(foldInOrder(op(3, '+', op(4, '×', 2)))).toBe(14)
    expect(ignoringParentheses(op(op(3, '+', 4), '×', 2))).toBe(11)
  })
})
