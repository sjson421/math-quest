/**
 * What one unit's level offers at first paint.
 *
 * No DOM and no handlers here, so what is asserted is what the level *offers*:
 * which skills are on screen, which are startable, and what a learner can read
 * off it. Whether tapping one navigates is exercised in a browser.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { course } from '../curriculum'
import { initialProgress, type Progress } from '../store/progress'
import { SkillList } from './SkillList'

const unit0 = course[0].units[0]
const unit1 = course[1].units[0]

const render = (
  unit = unit0,
  progress: Progress = initialProgress(),
  isUnlocked: (id: string) => boolean = () => true,
) =>
  renderToStaticMarkup(
    <SkillList unit={unit} progress={progress} isUnlocked={isUnlocked} onStart={() => {}} />,
  )

describe('SkillList', () => {
  it('names the unit and lists its skills in curriculum order', () => {
    const html = render()
    const positions = unit0.skills.map(({ name }) => html.indexOf(name))

    expect(html).toContain('Numbers &amp; Place Value')
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('offers one card per skill and nothing from another unit', () => {
    const html = render()

    expect(html.match(/<button/g)).toHaveLength(unit0.skills.length)
    for (const skill of unit1.skills) expect(html).not.toContain(skill.name)
  })

  it('renders no skill the tree left out, because planned ones never arrive', () => {
    // `course` carries implemented skills only. The Unit 3 ids below are in the
    // manifest and have no generator, so the level has no way to show them.
    const html = render()

    for (const id of ['times-2-5', 'mult-2by2']) expect(html).not.toContain(id)
  })

  it('disables a locked skill and shows its lock', () => {
    const html = render(unit0, initialProgress(), (id) => id === 'read-numbers')

    expect(html).toContain('🔒')
    expect(html.match(/disabled=""/g)).toHaveLength(unit0.skills.length - 1)
  })

  it('leaves every unlocked skill startable', () => {
    expect(render()).not.toContain('disabled=""')
  })

  it('keeps a unit whose skills are all locked in manifest order', () => {
    // On a fresh install the whole of Unit 1 sits behind Unit 0, so this is the
    // ordinary first-launch view of it — not an edge case. Order is what makes
    // such a unit legible; it cannot make it open, and does not try to.
    const html = render(unit1, initialProgress(), () => false)
    const positions = unit1.skills.map(({ name }) => html.indexOf(name))

    expect(html.match(/disabled=""/g)).toHaveLength(unit1.skills.length)
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('marks a fully mastered skill with a star rather than a pencil', () => {
    const base = initialProgress()
    const mastered: Progress = {
      ...base,
      skills: {
        ...base.skills,
        'read-numbers': { mastery: 5, lastPracticed: null, attempts: 0, correct: 0 },
      },
    }

    expect(render(unit0, mastered)).toContain('⭐')
    expect(render()).not.toContain('⭐')
  })

  it('reports a mastery level for assistive technology', () => {
    expect(render()).toContain('aria-label="Level 0 of 5"')
  })
})
