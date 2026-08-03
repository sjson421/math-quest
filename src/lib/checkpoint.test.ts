import { describe, expect, it } from 'vitest'
import { manifestIndex, skillStates } from '../curriculum'
import {
  indexSkills,
  stageA,
  stageB,
  type SkillState,
  type StageEntry,
} from '../curriculum/manifest'
import { completionAction, crossedStageCheckpoint } from './checkpoint'

const threshold = 2

const progressAt = (masteries: Record<string, number>) => ({
  skills: Object.fromEntries(
    Object.entries(masteries).map(([id, mastery]) => [id, { mastery }]),
  ),
})

const stage: StageEntry = {
  id: 'stage-test',
  name: 'Test Stage',
  units: [
    {
      id: 'unit-test',
      name: 'Test Unit',
      skills: [
        { id: 'first', name: 'First', blurb: 'First' },
        { id: 'last', name: 'Last', blurb: 'Last' },
      ],
    },
  ],
}

const locations = indexSkills([stage])
const implemented = new Map<string, SkillState>([
  ['first', 'implemented'],
  ['last', 'implemented'],
])

describe('crossedStageCheckpoint', () => {
  it('returns the stage when the last skill reaches the unlock threshold', () => {
    expect(
      crossedStageCheckpoint({
        skillId: 'last',
        before: progressAt({ first: threshold, last: threshold - 1 }),
        after: progressAt({ first: threshold, last: threshold }),
        locations,
        states: implemented,
        threshold,
      }),
    ).toEqual({ id: 'stage-test', name: 'Test Stage' })
  })

  it('does not fire while any implemented skill is below the threshold', () => {
    expect(
      crossedStageCheckpoint({
        skillId: 'last',
        before: progressAt({ first: threshold - 1, last: threshold - 1 }),
        after: progressAt({ first: threshold - 1, last: threshold }),
        locations,
        states: implemented,
        threshold,
      }),
    ).toBeUndefined()
  })

  it('does not fire while a manifest skill is planned', () => {
    const states = new Map(implemented)
    states.set('first', 'planned')

    expect(
      crossedStageCheckpoint({
        skillId: 'last',
        before: progressAt({ first: threshold, last: threshold - 1 }),
        after: progressAt({ first: threshold, last: threshold }),
        locations,
        states,
        threshold,
      }),
    ).toBeUndefined()
  })

  it('does not replay for a stage that was already complete', () => {
    expect(
      crossedStageCheckpoint({
        skillId: 'last',
        before: progressAt({ first: threshold, last: threshold }),
        after: progressAt({ first: threshold, last: threshold + 1 }),
        locations,
        states: implemented,
        threshold,
      }),
    ).toBeUndefined()
  })

  it('recognizes Stage A as the first real checkpoint', () => {
    const masteries = Object.fromEntries(
      stageA.units.flatMap((unit) => unit.skills.map((skill) => [skill.id, threshold])),
    )

    expect(
      crossedStageCheckpoint({
        skillId: 'round-to-100',
        before: progressAt({ ...masteries, 'round-to-100': threshold - 1 }),
        after: progressAt(masteries),
        locations: manifestIndex,
        states: skillStates,
        threshold,
      }),
    ).toEqual({ id: 'stage-a', name: 'Numbers' })
  })

  it('does not mistake the playable end of Stage B for its boundary', () => {
    const playable = stageB.units
      .flatMap((unit) => unit.skills)
      .filter((skill) => skillStates.get(skill.id) === 'implemented')
    const masteries = Object.fromEntries(playable.map((skill) => [skill.id, threshold]))
    const last = playable.at(-1)

    expect(last).toBeDefined()
    expect(
      crossedStageCheckpoint({
        skillId: last!.id,
        before: progressAt({ ...masteries, [last!.id]: threshold - 1 }),
        after: progressAt(masteries),
        locations: manifestIndex,
        states: skillStates,
        threshold,
      }),
    ).toBeUndefined()
  })
})

describe('completionAction', () => {
  it('shows the checkpoint after a lesson result that crossed a boundary', () => {
    expect(completionAction('lesson-result', true)).toBe('show-checkpoint')
  })

  it('exits directly after an ordinary lesson result', () => {
    expect(completionAction('lesson-result', false)).toBe('exit')
  })

  it('exits after the checkpoint', () => {
    expect(completionAction('stage-checkpoint', true)).toBe('exit')
  })
})
