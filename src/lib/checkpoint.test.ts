import { describe, expect, it } from 'vitest'
import { manifestIndex, skillStates } from '../curriculum'
import {
  indexSkills,
  stageA,
  stageB,
  stageC,
  type SkillState,
  type StageEntry,
} from '../curriculum/manifest'
import { completionAction, crossedStageCheckpoint, type Earned } from './checkpoint'

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

  it('does not mistake the playable end of a part-built stage for its boundary', () => {
    // This case used to run against Stage B, whose forty-one playable skills sat
    // inside forty-four declared ones. Unit 5 finished the stage, and a case
    // whose premise the course outgrows stops testing anything — so it moved to
    // a synthetic stage, where "part-built" is a property rather than a
    // temporary fact. `resolve.test.ts` tests its derivation rules the same way.
    const partBuilt: StageEntry = {
      id: 'stage-part-built',
      name: 'Part Built',
      units: [
        {
          id: 'unit-part-built',
          name: 'Part Built Unit',
          skills: [
            { id: 'playable', name: 'Playable', blurb: 'Playable' },
            { id: 'unwritten', name: 'Unwritten', blurb: 'Unwritten' },
          ],
        },
      ],
    }

    expect(
      crossedStageCheckpoint({
        skillId: 'playable',
        // Everything playable is mastered, and the stage is still not finished.
        before: progressAt({ playable: threshold - 1 }),
        after: progressAt({ playable: threshold }),
        locations: indexSkills([partBuilt]),
        states: new Map<string, SkillState>([
          ['playable', 'implemented'],
          ['unwritten', 'planned'],
        ]),
        threshold,
      }),
    ).toBeUndefined()
  })

  it('recognizes Stage B now that its last unit is built', () => {
    // The other half of the case above, and the reason it had to move: Stage B
    // is complete for the first time, so mastering all forty-four of its skills
    // does now carry the learner across a boundary.
    const skills = stageB.units.flatMap((unit) => unit.skills)
    const masteries = Object.fromEntries(skills.map((skill) => [skill.id, threshold]))
    const last = skills.at(-1)

    expect(last?.id).toBe('pemdas')
    expect(skills.every((skill) => skillStates.get(skill.id) === 'implemented')).toBe(true)
    expect(
      crossedStageCheckpoint({
        skillId: last!.id,
        before: progressAt({ ...masteries, [last!.id]: threshold - 1 }),
        after: progressAt(masteries),
        locations: manifestIndex,
        states: skillStates,
        threshold,
      }),
    ).toEqual({ id: 'stage-b', name: 'The Four Operations' })
  })

  it('recognizes Stage C, whose one unit is the whole stage', () => {
    // A different shape from the two above and worth its own case: Stage A and
    // Stage B each close on the last unit of several, and Stage C closes on its
    // only one. Nothing in the rule distinguishes them — it walks the manifest's
    // membership either way — and that is the claim.
    const skills = stageC.units.flatMap((unit) => unit.skills)
    const masteries = Object.fromEntries(skills.map((skill) => [skill.id, threshold]))
    const last = skills.at(-1)

    expect(stageC.units).toHaveLength(1)
    expect(last?.id).toBe('negatives-mixed')
    expect(skills.every((skill) => skillStates.get(skill.id) === 'implemented')).toBe(true)
    expect(
      crossedStageCheckpoint({
        skillId: last!.id,
        before: progressAt({ ...masteries, [last!.id]: threshold - 1 }),
        after: progressAt(masteries),
        locations: manifestIndex,
        states: skillStates,
        threshold,
      }),
    ).toEqual({ id: 'stage-c', name: 'Negatives' })
  })

  it('does not fire part way through Stage C', () => {
    // The other side of the case above: eight of the nine at the threshold is
    // not a completed stage, however close it looks.
    const skills = stageC.units.flatMap((unit) => unit.skills)
    const short = Object.fromEntries(
      skills.slice(0, -1).map((skill) => [skill.id, threshold]),
    )

    expect(
      crossedStageCheckpoint({
        skillId: skills.at(-2)!.id,
        before: progressAt({ ...short, [skills.at(-2)!.id]: threshold - 1 }),
        after: progressAt(short),
        locations: manifestIndex,
        states: skillStates,
        threshold,
      }),
    ).toBeUndefined()
  })
})

describe('completionAction', () => {
  /** Nothing earned but the lesson itself, overridden per case. */
  const earned = (over: Partial<Earned> = {}): Earned => ({
    checkpoint: false,
    upgrade: false,
    milestone: false,
    ...over,
  })

  it('exits directly after an ordinary lesson result', () => {
    expect(completionAction('lesson-result', earned())).toBe('exit')
  })

  it('shows the checkpoint after a lesson result that crossed a boundary', () => {
    expect(completionAction('lesson-result', earned({ checkpoint: true }))).toBe(
      'show-checkpoint',
    )
  })

  it('exits after the checkpoint', () => {
    expect(completionAction('stage-checkpoint', earned({ checkpoint: true }))).toBe('exit')
  })

  it('shows a pin upgrade straight after the result when no boundary was crossed', () => {
    expect(completionAction('lesson-result', earned({ upgrade: true }))).toBe(
      'show-pin-upgrade',
    )
  })

  it('shows a streak milestone straight after the result when it is the only one', () => {
    expect(completionAction('lesson-result', earned({ milestone: true }))).toBe(
      'show-streak-milestone',
    )
  })

  it('shows the checkpoint first when a lesson earns both', () => {
    // The order is the whole point of the pair: the stage is the larger thing,
    // and the pin reads as what followed it rather than an interruption.
    const both = earned({ checkpoint: true, upgrade: true })

    expect(completionAction('lesson-result', both)).toBe('show-checkpoint')
    expect(completionAction('stage-checkpoint', both)).toBe('show-pin-upgrade')
  })

  it('exits after the pin upgrade when the streak earned nothing', () => {
    expect(completionAction('pin-upgrade', earned({ upgrade: true }))).toBe('exit')
    expect(completionAction('pin-upgrade', earned({ checkpoint: true, upgrade: true }))).toBe(
      'exit',
    )
  })

  it('walks all three in order when one lesson earns everything', () => {
    // The rare day: a stage finished, the pin grown, and the streak past a
    // milestone. One tap each, largest thing first, habit last.
    const all = earned({ checkpoint: true, upgrade: true, milestone: true })

    expect(completionAction('lesson-result', all)).toBe('show-checkpoint')
    expect(completionAction('stage-checkpoint', all)).toBe('show-pin-upgrade')
    expect(completionAction('pin-upgrade', all)).toBe('show-streak-milestone')
    expect(completionAction('streak-milestone', all)).toBe('exit')
  })

  it('skips past what was not earned rather than stopping at it', () => {
    // A milestone with no pin upgrade must not be stranded behind the screen
    // that did not happen — the bug a chain of conditionals invites.
    expect(completionAction('stage-checkpoint', earned({ checkpoint: true, milestone: true })))
      .toBe('show-streak-milestone')
  })

  it('exits from the last screen whatever the lesson earned', () => {
    expect(
      completionAction(
        'streak-milestone',
        earned({ checkpoint: true, upgrade: true, milestone: true }),
      ),
    ).toBe('exit')
  })
})
