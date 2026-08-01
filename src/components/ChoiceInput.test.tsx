import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Choice } from '../lib/types'
import { ChoiceInput } from './ChoiceInput'

const choices: Choice[] = [
  { id: 'lt-option', label: 'Less than' },
  { id: 'eq-option', label: 'Equal to' },
  { id: 'gt-option', label: 'Greater than' },
]

const render = () =>
  renderToStaticMarkup(<ChoiceInput choices={choices} onChoose={() => {}} />)

describe('ChoiceInput', () => {
  it('offers every declared label once as a native button, in order', () => {
    const html = render()
    const positions = choices.map(({ label }) => html.indexOf(label))

    expect(html.match(/<button/g)).toHaveLength(3)
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    for (const { label } of choices) expect(html.split(label)).toHaveLength(2)
  })

  it('keeps stable ids out of learner-facing markup', () => {
    const html = render()

    for (const { id } of choices) expect(html).not.toContain(id)
    expect(html).not.toContain('<input')
  })
})
