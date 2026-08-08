/**
 * What the top of the course offers at first paint.
 *
 * Five of the eight stages have no generator anywhere in them. None of the five
 * may appear here, in any form — that is the difference between a course that
 * is being written and one that looks two-thirds empty.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { course } from '../curriculum'
import { stages } from '../curriculum/manifest'
import { initialProgress, type Progress } from '../store/progress'
import { StageList } from './StageList'

const render = (progress: Progress = initialProgress()) =>
  renderToStaticMarkup(
    <StageList course={course} progress={progress} onOpen={() => {}} />,
  )

describe('StageList', () => {
  it('lists the stages that have something to play, in curriculum order', () => {
    const html = render()

    expect(html.match(/<button/g)).toHaveLength(3)
    expect(html.indexOf('Numbers')).toBeLessThan(html.indexOf('The Four Operations'))
    expect(html.indexOf('The Four Operations')).toBeLessThan(html.indexOf('Negatives'))
  })

  it('shows no trace of a stage with no generator in it', () => {
    const html = render()
    const unbuilt = stages.filter(
      (stage) => !course.some((entry) => entry.stage.id === stage.id),
    )

    expect(unbuilt.map((stage) => stage.name)).toEqual([
      'Parts of a Whole',
      'Powers & Early Algebra',
      'Graphs & Algebra II',
      'Geometry & Data',
      'GED Prep',
    ])
    for (const stage of unbuilt) expect(html).not.toContain(stage.name)
  })

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
    // All three built stages are complete now, so these counts match what the
    // curriculum declares. They did not before Unit 5, and the omission that
    // made the two differ belongs to `resolveCourseTree` rather than to this
    // component — which reads `units.length` and nothing else. Asserting it
    // again against a hand-chopped tree would only re-read that length.
    //
    // Stages A and C are both one unit, so the singular covers two stages here.
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
