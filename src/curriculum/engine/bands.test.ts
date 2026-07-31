import { describe, expect, it } from 'vitest'
import {
  SINGLE_DIGIT,
  THREE_DIGIT,
  TWO_DIGIT,
  band,
  ladderProblems,
  type Ladder,
} from './bands'

const named: [string, Ladder][] = [
  ['SINGLE_DIGIT', SINGLE_DIGIT],
  ['TWO_DIGIT', TWO_DIGIT],
  ['THREE_DIGIT', THREE_DIGIT],
]

describe('band', () => {
  it('reads the range for a difficulty', () => {
    expect(band(1, TWO_DIGIT)).toEqual([10, 40])
    expect(band(5, TWO_DIGIT)).toEqual([20, 95])
  })
})

describe('the named ladders', () => {
  it.each(named)('%s widens without narrowing', (name, ladder) => {
    expect(ladderProblems(name, ladder)).toEqual([])
  })
})

describe('ladderProblems', () => {
  it('reports a flat ladder', () => {
    const flat: Ladder = { 1: [1, 9], 2: [1, 9], 3: [1, 9], 4: [1, 9], 5: [1, 9] }
    expect(ladderProblems('flat', flat)).toEqual([
      'flat never widens: difficulty 5 tops out at 9, same as 9',
    ])
  })

  it('reports a ladder that narrows partway up', () => {
    const narrowing: Ladder = { 1: [1, 5], 2: [1, 9], 3: [1, 7], 4: [1, 12], 5: [1, 20] }
    expect(ladderProblems('narrowing', narrowing)).toEqual([
      'narrowing difficulty 3: max drops from 9 to 7',
    ])
  })

  it('reports a min above its max', () => {
    const inverted: Ladder = { 1: [9, 2], 2: [1, 9], 3: [1, 12], 4: [1, 15], 5: [1, 20] }
    expect(ladderProblems('inverted', inverted)).toContain('inverted difficulty 1: min 9 above max 2')
  })

  it('reports a min that drops', () => {
    const dropping: Ladder = { 1: [10, 20], 2: [5, 30], 3: [10, 40], 4: [10, 50], 5: [10, 60] }
    expect(ladderProblems('dropping', dropping)).toEqual([
      'dropping difficulty 2: min drops from 10 to 5',
    ])
  })
})
