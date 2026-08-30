/**
 * What the home screen says about the streak.
 *
 * First paint only, against props rather than the live record — the same shape
 * every other component test here takes, and the reason the card reads a
 * `Progress` nowhere.
 *
 * The card shows exactly one line of state, so each case below is as much about
 * what is *absent* as what is present: a warning stacked under a countdown is a
 * warning nobody reads.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MAX_STREAK_FREEZES } from '../lib/streak'
import { StreakCard } from './StreakCard'

const render = (props: Partial<Parameters<typeof StreakCard>[0]> = {}) =>
  renderToStaticMarkup(
    <StreakCard
      streakCount={5}
      atRisk={false}
      freezes={0}
      multiplier={1}
      nextMilestone={{ days: 7, away: 2 }}
      {...props}
    />,
  )

describe('a streak worth keeping', () => {
  it('states the count and what it is counting', () => {
    const html = render({ streakCount: 5 })

    expect(html).toContain('5')
    expect(html).toContain('days in a row')
  })

  it('says day rather than days on the first one', () => {
    expect(render({ streakCount: 1 })).toContain('day in a row')
  })

  it('counts down to the next milestone when nothing is wrong', () => {
    expect(render({ nextMilestone: { days: 7, away: 2 } })).toContain(
      '2 days to the 7-day milestone',
    )
  })

  it('says a day rather than days when one is left', () => {
    expect(render({ nextMilestone: { days: 30, away: 1 } })).toContain(
      '1 day to the 30-day milestone',
    )
  })

  it('does not invent a rung past the last milestone', () => {
    const html = render({ streakCount: 400, nextMilestone: undefined })

    expect(html).toContain('Every milestone reached')
    expect(html).not.toContain('milestone.')
  })
})

describe('the warning', () => {
  it('replaces the countdown rather than stacking under it', () => {
    const html = render({ atRisk: true, nextMilestone: { days: 7, away: 2 } })

    expect(html).toContain('finish a lesson to keep it')
    expect(html, 'the countdown gives way to the warning').not.toContain(
      '2 days to the 7-day milestone',
    )
  })

  it('says nothing at all on a streak of zero', () => {
    // There is nothing to lose yet, and a warning here would be the app
    // inventing a loss to motivate with.
    const html = render({ streakCount: 0, atRisk: false, nextMilestone: { days: 3, away: 3 } })

    expect(html).toContain('Finish a lesson to start one')
    expect(html).not.toContain('keep it')
  })
})

describe('what is held and what it earns', () => {
  it('says nothing about freezes when none are held', () => {
    expect(render({ freezes: 0 })).not.toContain('freezes held')
  })

  it('counts held freezes against the cap', () => {
    const one = render({ freezes: 1 })

    expect(one).toContain(`1 of ${MAX_STREAK_FREEZES} freezes held`)
    expect(one).toContain('covers one missed day')
    expect(render({ freezes: 2 })).toContain('covers two missed days')
  })

  it('shows the multiplier only once it is above the base rate', () => {
    expect(render({ multiplier: 1 }), 'no badge at 1x').not.toContain('× coins')
    expect(render({ multiplier: 1.25 })).toContain('1.25× coins')
    expect(render({ multiplier: 2 })).toContain('2× coins')
  })
})
