/**
 * What a stage's level offers at first paint.
 *
 * The interesting assertions are the negative ones: an unbuilt unit must not be
 * on screen at all, while a built-but-locked one must be — the first is course
 * that does not exist, the second is course the learner is working toward.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { course } from '../curriculum'
import { initialProgress, type Progress } from '../store/progress'
import { UnitList } from './UnitList'

const stageB = course[1]

const render = (
  stage = stageB,
  progress: Progress = initialProgress(),
  isUnlocked: (id: string) => boolean = () => true,
) =>
  renderToStaticMarkup(
    <UnitList stage={stage} progress={progress} isUnlocked={isUnlocked} onOpen={() => {}} />,
  )

describe('UnitList', () => {
  it('names the stage and lists its playable units in curriculum order', () => {
    const html = render()

    expect(html).toContain('The Four Operations')
    expect(html.indexOf('Addition')).toBeLessThan(html.indexOf('Subtraction'))
    expect(html.indexOf('Subtraction')).toBeLessThan(html.indexOf('Multiplication'))
    expect(html.match(/<button/g)).toHaveLength(3)
  })

  it('leaves out the units of this stage that have no generator', () => {
    // Stage B declares five units; Division and Order of Operations are
    // unwritten, so the level cannot show them and the learner cannot count
    // what is missing.
    const html = render()

    for (const name of ['Division', 'Order of Operations'])
      expect(html).not.toContain(name)
    expect(stageB.stage.units).toHaveLength(5)
    expect(stageB.units).toHaveLength(3)
  })

  it('lists no skill, only units', () => {
    const html = render()

    for (const skill of stageB.units.flatMap(({ skills }) => skills))
      expect(html).not.toContain(skill.name)
  })

  it('shows a unit with nothing unlocked as locked, and still shows it', () => {
    const html = render(stageB, initialProgress(), () => false)

    expect(html).toContain('Addition')
    expect(html).toContain('🔒')
    expect(html).toContain('locked')
  })

  it('drops the lock once any skill in the unit is open', () => {
    const html = render()

    expect(html).not.toContain('🔒')
    expect(html).toContain('📘')
  })

  it('counts the playable skills of each unit', () => {
    expect(render()).toContain('8 skills')
  })

  it('reports mastery as a labelled progress bar', () => {
    const base = initialProgress()
    const half: Progress = {
      ...base,
      skills: {
        ...base.skills,
        ...Object.fromEntries(
          stageB.units[0].skills
            .slice(0, 4)
            .map((skill) => [
              skill.id,
              { mastery: 5, lastPracticed: null, attempts: 0, correct: 0 },
            ]),
        ),
      },
    }

    expect(render(stageB, initialProgress())).toContain('aria-label="0% mastered"')
    expect(render(stageB, half)).toContain('aria-label="50% mastered"')
  })
})
