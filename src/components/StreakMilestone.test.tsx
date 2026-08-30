/**
 * The milestone screen.
 *
 * The one thing worth pinning beyond the copy is where the multiplier line
 * comes from: the screen reads the *streak*, not the milestone it announces, so
 * a record that jumped several days says what the learner is actually earning.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StreakMilestone } from './StreakMilestone'

const render = (
  milestone: { days: number; coins: number; index: number; of: number },
  streakCount = milestone.days,
) =>
  renderToStaticMarkup(
    <StreakMilestone
      milestone={milestone}
      streakCount={streakCount}
      onContinue={() => {}}
    />,
  )

const DAY_THREE = { days: 3, coins: 25, index: 1, of: 5 }
const DAY_THIRTY = { days: 30, coins: 400, index: 4, of: 5 }

describe('the streak milestone screen', () => {
  it('names the run, its place in the ladder, and what it paid', () => {
    const html = render(DAY_THREE)

    expect(html).toContain('3 days in a row')
    expect(html).toContain('Milestone 1 of 5')
    expect(html).toContain('+25 coins')
  })

  it('says nothing about a multiplier at a milestone that does not earn one', () => {
    expect(render(DAY_THREE)).not.toContain('coins while the streak holds')
  })

  it('states the new rate once the streak earns one', () => {
    expect(render(DAY_THIRTY)).toContain('2× coins while the streak holds')
  })

  it('reads the rate off the streak rather than the milestone it announces', () => {
    // A restored record can cross day 30 while standing on day 40. The screen
    // announces the milestone it passed and the rate it is actually paid.
    const html = render(DAY_THIRTY, 40)

    expect(html).toContain('30 days in a row')
    expect(html).toContain('2× coins')
  })

  it('describes the days and never the learner', () => {
    // The rule `PinUpgrade` is under: the app counted the days, so it can say
    // how many there were. What that makes somebody is not its to claim.
    const html = render(DAY_THIRTY).toLowerCase()

    for (const claim of ['brilliant', 'genius', 'smart', 'amazing', "you're"]) {
      expect(html, `should not claim "${claim}"`).not.toContain(claim)
    }
  })
})
