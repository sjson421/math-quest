/**
 * The common course shell offers the same review entry at every tree level.
 * Selection stays in `App`; this checks only the count-aware first paint.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { courseStageById, getSkill } from '../curriculum'
import type { CourseStage } from '../curriculum/manifest'
import { unitSkipState, type WarmUpSuggestion } from '../lib/skip'
import { initialProgress, isUnlocked } from '../store/progress'
import { Home, type TreeLevel } from './Home'
import { SkipUnitAction } from './SkipAhead'

const levels: TreeLevel[] = [
  { name: 'stages' },
  { name: 'units', stageId: 'stage-a' },
  { name: 'skills', unitId: 'unit-0' },
]

const render = (
  level: TreeLevel,
  reviewCount: number,
  firstLaunchStage?: CourseStage,
  progress = initialProgress(),
  warmUp?: WarmUpSuggestion,
) =>
  renderToStaticMarkup(
    <Home
      level={level}
      progress={progress}
      firstLaunchStage={firstLaunchStage}
      onNavigate={() => {}}
      reviewCount={reviewCount}
      onStartReview={() => {}}
      warmUp={warmUp}
      onStart={() => {}}
      onOpenSettings={() => {}}
      onOpenShop={() => {}}
    />,
  )

describe('Home review entry', () => {
  it('shows one count-aware review entry at every tree level', () => {
    for (const level of levels) {
      const html = render(level, 2)

      expect(html).toContain('Review time')
      expect(html).toContain('2 skills ready to revisit')
      expect(html.match(/aria-label="Start review/g)).toHaveLength(1)
    }
  })

  it('shows no review entry when no selected skill is due', () => {
    for (const level of levels) {
      const html = render(level, 0)

      expect(html).not.toContain('Review time')
      expect(html).not.toContain('Start review')
    }
  })
})

describe('Home skip entry', () => {
  it('shows the additive first-launch stage card', () => {
    const html = render(
      { name: 'skills', unitId: 'unit-0' },
      0,
      courseStageById.get('stage-a'),
    )

    expect(html).toContain('data-skip-stage-offer')
    expect(html).toContain('Numbers')
    expect(html).toContain('Choose starting point')
    expect(html).toContain('Start practice')
  })

  it('shows a new unit skip only for unstarted or locked units', () => {
    const fresh = render({ name: 'skills', unitId: 'unit-0' }, 0)
    expect(fresh).toContain('I already know this')

    const progress = initialProgress()
    progress.skills['read-numbers'] = { ...progress.skills['read-numbers'], attempts: 1 }
    expect(unitSkipState('unit-0', progress, (id) => isUnlocked(id, progress))).toBeUndefined()
  })

  it('does not render a new skip for a partly practised unit', () => {
    const progress = initialProgress()
    progress.skills['read-numbers'] = { ...progress.skills['read-numbers'], attempts: 1 }

    const html = render({ name: 'skills', unitId: 'unit-0' }, 0, undefined, progress)

    expect(html).not.toContain('data-skip-unit-action')
    expect(html).not.toContain('I already know this')
  })

  it('renders reversal on a marked unit instead of a new skip', () => {
    const progress = initialProgress()
    progress.skills['read-numbers'] = {
      ...progress.skills['read-numbers'],
      mastery: 3,
      source: 'tested-out',
    }

    const html = render({ name: 'skills', unitId: 'unit-0' }, 0, undefined, progress)

    expect(html).toContain('Actually, let me practice this')
    expect(html).not.toContain('I already know this')
  })

  it('shows reversal for a marked unit', () => {
    const html = renderToStaticMarkup(
      <SkipUnitAction label="Actually, let me practice this" onActivate={() => {}} />,
    )
    expect(html).toContain('Actually, let me practice this')
    expect(html).not.toContain('I already know this')
  })

  it('keeps unit action state explicit for fresh, practised, and marked units', () => {
    const fresh = initialProgress()
    expect(unitSkipState('unit-0', fresh, (id) => isUnlocked(id, fresh))).toBe('new')

    const marked = initialProgress()
    marked.skills['read-numbers'] = {
      ...marked.skills['read-numbers'],
      mastery: 3,
      source: 'self-assessed',
    }
    expect(unitSkipState('unit-0', marked, (id) => isUnlocked(id, marked))).toBe('reversal')
  })
})

describe('Home warm-up offer', () => {
  const suggestion: WarmUpSuggestion = {
    unitId: 'unit-0',
    unitName: 'Numbers & Place Value',
    reason: 'weak-review',
  }

  it('shows nothing without a suggestion', () => {
    expect(render({ name: 'stages' }, 0)).not.toContain('data-warm-up-offer')
  })

  it('names the suggested unit', () => {
    const html = render({ name: 'stages' }, 0, undefined, initialProgress(), suggestion)

    expect(html).toContain('data-warm-up-offer')
    expect(html).toContain('Warm up Numbers &amp; Place Value?')
  })

  it('names the failing skill on the downstream reason', () => {
    const html = render({ name: 'stages' }, 0, undefined, initialProgress(), {
      ...suggestion,
      reason: 'repeated-failure',
      skillId: 'add-facts-small',
    })

    expect(html).toContain(getSkill('add-facts-small').name)
  })

  it('keeps the review entry and the warm-up offer on screen together', () => {
    const html = render({ name: 'stages' }, 2, undefined, initialProgress(), suggestion)

    expect(html).toContain('Review time')
    expect(html.match(/data-warm-up-offer/g)).toHaveLength(1)
  })
})
