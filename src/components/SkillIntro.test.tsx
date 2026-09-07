import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { intAnswer } from '../lib/answer'
import { rational } from '../lib/rational'
import type { Display, Problem, SkillGenerator } from '../lib/types'
import { SkillIntro } from './SkillIntro'

const baseProblem = (display: Display, answer: Problem['answer'], choices?: Problem['choices']): Problem => ({
  skillId: 'intro-test',
  prompt: 'What belongs here?',
  display,
  answer,
  choices,
  inputMode: answer.kind === 'choice' ? 'choice' : answer.kind === 'expression' ? 'expression' : 'keypad',
  hint: 'Use the displayed information.',
  solution: [{ text: 'Read the example.', detail: 'Then write the answer.' }],
  difficulty: 1,
})

const skill: SkillGenerator = {
  id: 'intro-test',
  name: 'Intro Test',
  blurb: 'A test intro',
  teachingLine: 'A clear line teaches one idea.',
  generate: () => baseProblem({ kind: 'inline', text: '2 + 3' }, intAnswer(5)),
}

const render = (problem: Problem, mode: 'automatic' | 'review' = 'automatic') =>
  renderToStaticMarkup(
    <SkillIntro
      skill={skill}
      problem={problem}
      mode={mode}
      onLeave={() => {}}
      onStart={() => {}}
      onBackToPractice={() => {}}
    />,
  )

describe('SkillIntro', () => {
  it('keeps teaching, example, answer, steps, and actions in reading order', () => {
    const html = render(baseProblem({ kind: 'inline', text: '2 + 3' }, intAnswer(5)))

    expect(html.indexOf('A clear line teaches one idea.')).toBeLessThan(html.indexOf('Worked example'))
    expect(html.indexOf('Worked example')).toBeLessThan(html.indexOf('What belongs here?'))
    expect(html.indexOf('What belongs here?')).toBeLessThan(html.indexOf('Correct answer'))
    expect(html.indexOf('Correct answer')).toBeLessThan(html.indexOf('Read the example.'))
    expect(html).toContain('Start practice')
    expect(html).toContain('>Leave<')
    expect(html).toContain('data-skill-intro="automatic"')
  })

  it('renders every answer shape as a visible answer without input controls', () => {
    const cases: Problem[] = [
      baseProblem({ kind: 'inline', text: '2 + 3' }, intAnswer(5)),
      baseProblem({ kind: 'inline', text: '2.5' }, { kind: 'approx', value: 2.5, tolerance: 0.1 }),
      baseProblem({ kind: 'inline', text: '4 ? 7' }, { kind: 'choice', id: 'less' }, [
        { id: 'less', label: 'Less than' },
      ]),
      baseProblem({ kind: 'inline', text: 'x + 2' }, {
        kind: 'expression',
        canonical: '-x+2',
        variable: 'x',
        form: 'exact',
      }),
      baseProblem({ kind: 'coordinate-plane', plane: {
        x: { min: -2, max: 2, step: 1 },
        y: { min: -2, max: 2, step: 1 },
        points: [],
        lines: [],
      } }, { kind: 'point', x: -1, y: 2 }),
      baseProblem({ kind: 'inline', text: 'x² − x − 12' }, {
        kind: 'root-pair',
        roots: [rational(-3, 1), rational(4, 1)],
      }),
    ]

    for (const problem of cases) {
      const html = render(problem)
      expect(html).toContain('Correct answer')
      expect(html).not.toContain('animate-pulse')
      expect(html).not.toContain('data-root-pair-input')
      expect(html).not.toContain('data-coordinate-plane-target')
      expect(html).not.toContain('>Check<')
    }
  })

  it('scrolls only the worked example so both actions stay on screen', () => {
    // A coordinate-plane example with three detailed steps is taller than the
    // 812px phone. The example alone scrolls, so the teaching line and both
    // actions stay in view instead of sliding under the fold with it.
    const html = render(baseProblem({ kind: 'inline', text: '2 + 3' }, intAnswer(5)))
    const regionStart = html.indexOf('data-example-scroll')
    const regionEnd = html.indexOf('</section></div>')

    expect(regionStart).toBeGreaterThan(-1)
    expect(regionEnd).toBeGreaterThan(regionStart)
    expect(html.indexOf('Worked example')).toBeGreaterThan(regionStart)
    expect(html.indexOf('Read the example.')).toBeLessThan(regionEnd)
    expect(html.indexOf('Start practice')).toBeGreaterThan(regionEnd)
    expect(html.indexOf('>Leave<')).toBeGreaterThan(regionEnd)
  })

  it('offers only the return action in review mode', () => {
    const html = render(baseProblem({ kind: 'inline', text: '2 + 3' }, intAnswer(5)), 'review')

    expect(html).toContain('Back to practice')
    expect(html).not.toContain('Start practice')
    expect(html).not.toContain('>Leave<')
    expect(html).toContain('data-skill-intro="review"')
  })
})
