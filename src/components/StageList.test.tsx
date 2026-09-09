/**
 * What the top of the course offers at first paint.
 *
 * All eight stages now contain playable content.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { course } from '../curriculum'
import { initialProgress, type Progress } from '../store/progress'
import { StageList } from './StageList'

const render = (progress: Progress = initialProgress()) =>
  renderToStaticMarkup(
    <StageList course={course} progress={progress} onOpen={() => {}} />,
  )

describe('StageList', () => {
  it('lists the stages that have something to play, in curriculum order', () => {
    const html = render()

    expect(html.match(/<button/g)).toHaveLength(8)
    expect(html.indexOf('Numbers')).toBeLessThan(html.indexOf('The Four Operations'))
    expect(html.indexOf('The Four Operations')).toBeLessThan(html.indexOf('Negatives'))
    expect(html.indexOf('Negatives')).toBeLessThan(html.indexOf('Parts of a Whole'))
    expect(html.indexOf('Parts of a Whole')).toBeLessThan(html.indexOf('Powers &amp; Early Algebra'))
    expect(html.indexOf('Powers &amp; Early Algebra')).toBeLessThan(html.indexOf('Graphs &amp; Algebra II'))
    expect(html.indexOf('Graphs &amp; Algebra II')).toBeLessThan(html.indexOf('Geometry &amp; Data'))
    expect(html.indexOf('Geometry &amp; Data')).toBeLessThan(html.indexOf('GED Prep'))
  })

  // Empty-stage omission belongs to manifest/resolve.test.ts and coverage.test.ts.
  // As in UnitList.test.tsx, a hand-trimmed prop would only re-test Array.map.

  it('lists no unit and no skill, only stages', () => {
    const html = render()

    for (const { units } of course) {
      for (const { unit, skills } of units) {
        expect(html).not.toContain(unit.name)
        for (const skill of skills) expect(html).not.toContain(skill.name)
      }
    }
  })

  it('counts the units of each stage it is given', () => {
    // The component counts only units with something playable. Asserting it
    // again against a hand-chopped tree would only re-read `units.length`.
    //
    // Stages A, C, and the partial Stages D and F are one playable unit each.
    const html = render()

    expect(html).toContain('1 unit')
    expect(html).toContain('5 units')
  })

  it('reports mastery across the whole stage', () => {
    const base = initialProgress()
    const stageADone: Progress = {
      ...base,
      skills: {
        ...base.skills,
        ...Object.fromEntries(
          course[0].units[0].skills.map((skill) => [
            skill.id,
            { mastery: 5, lastPracticed: null, attempts: 0, correct: 0 },
          ]),
        ),
      },
    }

    expect(render()).toContain('aria-label="0% mastered"')
    expect(render(stageADone)).toContain('aria-label="100% mastered"')
  })
})
