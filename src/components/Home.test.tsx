/**
 * The common course shell offers the same review entry at every tree level.
 * Selection stays in `App`; this checks only the count-aware first paint.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Home, type TreeLevel } from './Home'

const levels: TreeLevel[] = [
  { name: 'stages' },
  { name: 'units', stageId: 'stage-a' },
  { name: 'skills', unitId: 'unit-0' },
]

const render = (level: TreeLevel, reviewCount: number) =>
  renderToStaticMarkup(
    <Home
      level={level}
      onNavigate={() => {}}
      reviewCount={reviewCount}
      onStartReview={() => {}}
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
