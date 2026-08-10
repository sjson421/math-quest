import { describe, expect, it } from 'vitest'
import {
  indexSkills,
  resolveCourseTree,
  resolvePrerequisites,
  resolveSkillState,
  resolveSkillStates,
  resolveUnlockPrerequisites,
} from './resolve'
import type { CourseStage } from './resolve'
import type { Capability, SkillEntry, SkillState, StageEntry } from './types'

/**
 * Derivation is tested against synthetic stages, not the real manifest. The
 * rules are what is under test here; the real manifest gets its own structural
 * and cross-check tests.
 */

const skill = (id: string, extra: Partial<SkillEntry> = {}): SkillEntry => ({
  id,
  name: id,
  blurb: id,
  ...extra,
})

/** Two linear units, the second depending on the first. */
const stages: StageEntry[] = [
  {
    id: 'stage-x',
    name: 'X',
    units: [
      { id: 'unit-1', name: 'One', skills: [skill('a1'), skill('a2'), skill('a3')] },
      {
        id: 'unit-2',
        name: 'Two',
        dependsOn: ['unit-1'],
        skills: [skill('b1'), skill('b2')],
      },
    ],
  },
  {
    id: 'stage-y',
    name: 'Y',
    requires: ['math-notation'],
    units: [
      {
        id: 'unit-3',
        name: 'Three',
        dependsOn: ['unit-1', 'unit-2'],
        skills: [skill('c1'), skill('c2', { prerequisites: ['a1', 'b2'] })],
      },
    ],
  },
]

describe('indexSkills', () => {
  it('locates every skill in its unit and stage', () => {
    const index = indexSkills(stages)

    expect([...index.keys()]).toEqual(['a1', 'a2', 'a3', 'b1', 'b2', 'c1', 'c2'])
    expect(index.get('b2')?.unit.id).toBe('unit-2')
    expect(index.get('b2')?.stage.id).toBe('stage-x')
    expect(index.get('c1')?.stage.requires).toEqual(['math-notation'])
  })

  it('keeps the first entry when an id is duplicated', () => {
    const duplicated: StageEntry[] = [
      {
        id: 'stage-x',
        name: 'X',
        units: [
          { id: 'unit-1', name: 'One', skills: [skill('dup')] },
          { id: 'unit-2', name: 'Two', skills: [skill('dup')] },
        ],
      },
    ]

    expect(indexSkills(duplicated).get('dup')?.unit.id).toBe('unit-1')
  })
})

describe('resolvePrerequisites', () => {
  const resolved = resolvePrerequisites(stages)

  it('defaults to the previous skill in the unit', () => {
    expect(resolved.get('a2')).toEqual(['a1'])
    expect(resolved.get('a3')).toEqual(['a2'])
    expect(resolved.get('b2')).toEqual(['b1'])
  })

  it('gives the first skill of a unit the last skill of each dependsOn unit', () => {
    expect(resolved.get('b1')).toEqual(['a3'])
    expect(resolved.get('c1')).toEqual(['a3', 'b2'])
  })

  it('leaves a unit that depends on nothing as a root', () => {
    expect(resolved.get('a1')).toEqual([])
  })

  it('lets an explicit prerequisites array replace the default entirely', () => {
    // c2 would otherwise inherit ['c1'] as the next skill in its unit.
    expect(resolved.get('c2')).toEqual(['a1', 'b2'])
  })

  it('allows an override to clear prerequisites', () => {
    const rooted = resolvePrerequisites([
      {
        id: 'stage-x',
        name: 'X',
        units: [
          {
            id: 'unit-1',
            name: 'One',
            skills: [skill('a1'), skill('a2', { prerequisites: [] })],
          },
        ],
      },
    ])

    expect(rooted.get('a2')).toEqual([])
  })

  it('resolves dependsOn against the first unit when a unit id is duplicated', () => {
    // Matches indexSkills() and the id lookups in index.ts. Last-wins here would
    // point the edge at the duplicate while every lookup returned the original.
    const duplicated = resolvePrerequisites([
      {
        id: 'stage-x',
        name: 'X',
        units: [
          { id: 'unit-1', name: 'One', skills: [skill('a1')] },
          { id: 'unit-1', name: 'Copy', skills: [skill('b1')] },
          { id: 'unit-2', name: 'Two', dependsOn: ['unit-1'], skills: [skill('c1')] },
        ],
      },
    ])

    expect(duplicated.get('c1')).toEqual(['a1'])
  })

  it('names the unit and the missing target for an unresolvable dependsOn', () => {
    const broken: StageEntry[] = [
      {
        id: 'stage-x',
        name: 'X',
        units: [{ id: 'unit-1', name: 'One', dependsOn: ['unit-9'], skills: [skill('a1')] }],
      },
    ]

    expect(() => resolvePrerequisites(broken)).toThrow(/unit-1.*unit-9/)
  })

  it('passes a dangling prerequisite id through for validation to report', () => {
    const dangling = resolvePrerequisites([
      {
        id: 'stage-x',
        name: 'X',
        units: [
          { id: 'unit-1', name: 'One', skills: [skill('a1', { prerequisites: ['nope'] })] },
        ],
      },
    ])

    expect(dangling.get('a1')).toEqual(['nope'])
  })
})

describe('resolveSkillState', () => {
  const noCapabilities = new Set<never>()

  it('is planned when no generator is registered', () => {
    expect(
      resolveSkillState('a1', {}, { generators: new Set(), available: noCapabilities }),
    ).toBe('planned')
  })

  it('is implemented when a generator exists and the stage needs nothing', () => {
    expect(
      resolveSkillState('a1', {}, { generators: new Set(['a1']), available: noCapabilities }),
    ).toBe('implemented')
  })

  it('accepts the generator registry map directly', () => {
    const registry = new Map([['a1', { id: 'a1' }]])

    expect(resolveSkillState('a1', {}, { generators: registry })).toBe('implemented')
  })

  it('stays planned when a required capability is not built', () => {
    expect(
      resolveSkillState(
        'c1',
        { requires: ['math-notation'] },
        { generators: new Set(['c1']), available: noCapabilities },
      ),
    ).toBe('planned')
  })

  it('keeps a choice skill planned when choice input is withheld', () => {
    const choiceInput = 'choice-input' as Capability

    expect(
      resolveSkillState(
        'c1',
        { requires: [choiceInput] },
        { generators: new Set(['c1']), available: noCapabilities },
      ),
    ).toBe('planned')
  })

  it('is implemented once every required capability is available', () => {
    expect(
      resolveSkillState(
        'c1',
        { requires: ['math-notation', 'diagram'] },
        { generators: new Set(['c1']), available: new Set(['math-notation', 'diagram']) },
      ),
    ).toBe('implemented')
  })

  it('stays planned when only some required capabilities are available', () => {
    expect(
      resolveSkillState(
        'c1',
        { requires: ['math-notation', 'diagram'] },
        { generators: new Set(['c1']), available: new Set(['math-notation']) },
      ),
    ).toBe('planned')
  })
})

describe('resolveSkillStates', () => {
  it('resolves every manifest skill, honouring its own stage requirements', () => {
    const states = resolveSkillStates(stages, {
      generators: new Set(['a1', 'a2', 'c1']),
      available: new Set(),
    })

    expect(states.get('a1')).toBe('implemented')
    expect(states.get('a3')).toBe('planned')
    // c1 has a generator but stage-y needs math notation, which is not built.
    expect(states.get('c1')).toBe('planned')
    expect(states.size).toBe(7)
  })
})

describe('resolveCourseTree', () => {
  /** Ids in the given order; everything else in the manifest planned. */
  const states = (implemented: string[]): Map<string, SkillState> =>
    new Map(
      [...indexSkills(stages).keys()].map((id) => [
        id,
        implemented.includes(id) ? 'implemented' : 'planned',
      ]),
    )

  /** `[stage, [unit, [skill]]]`, which is what the assertions are actually about. */
  const shape = (course: CourseStage[]) =>
    course.map(({ stage, units }) => [
      stage.id,
      units.map(({ unit, skills }) => [unit.id, skills.map((s) => s.id)]),
    ])

  it('carries only the skills that can be played', () => {
    const course = resolveCourseTree(stages, states(['a1', 'a3']))

    expect(shape(course)).toEqual([['stage-x', [['unit-1', ['a1', 'a3']]]]])
  })

  it('omits a unit with no playable skill rather than leaving it empty', () => {
    // unit-2 holds b1 and b2, neither implemented. An empty unit on screen
    // would tease course that is not written.
    const course = resolveCourseTree(stages, states(['a1', 'c1', 'c2']))
    const stageX = course.find((entry) => entry.stage.id === 'stage-x')

    expect(stageX?.units.map((u) => u.unit.id)).toEqual(['unit-1'])
  })

  it('omits a stage left with no playable unit', () => {
    const course = resolveCourseTree(stages, states(['a1']))

    expect(course.map((entry) => entry.stage.id)).toEqual(['stage-x'])
  })

  it('is empty when nothing is implemented', () => {
    expect(resolveCourseTree(stages, states([]))).toEqual([])
  })

  it('keeps manifest order at all three levels', () => {
    const course = resolveCourseTree(stages, states(['a1', 'a2', 'a3', 'b1', 'b2', 'c1', 'c2']))

    expect(shape(course)).toEqual([
      [
        'stage-x',
        [
          ['unit-1', ['a1', 'a2', 'a3']],
          ['unit-2', ['b1', 'b2']],
        ],
      ],
      ['stage-y', [['unit-3', ['c1', 'c2']]]],
    ])
  })

  it('ignores the order the states arrive in', () => {
    // The paired offender case. Order is structural here — it comes from
    // walking the manifest — so this is what proves it, by handing the
    // derivation a state map built back to front and getting the manifest's
    // order out anyway. A version that iterated `states` would fail here.
    const reversed = new Map(
      [...states(['a1', 'a2', 'a3', 'b1', 'b2'])].reverse(),
    )

    expect(shape(resolveCourseTree(stages, reversed))).toEqual([
      [
        'stage-x',
        [
          ['unit-1', ['a1', 'a2', 'a3']],
          ['unit-2', ['b1', 'b2']],
        ],
      ],
    ])
  })

  it('carries the manifest entry, so pacing markers survive the walk', () => {
    const marked: StageEntry[] = [
      {
        id: 'stage-x',
        name: 'X',
        units: [
          { id: 'unit-1', name: 'One', skills: [skill('a1', { quick: true, wall: true })] },
        ],
      },
    ]
    const course = resolveCourseTree(
      marked,
      new Map<string, SkillState>([['a1', 'implemented']]),
    )

    expect(course[0].units[0].skills[0]).toMatchObject({ quick: true, wall: true })
  })
})

describe('resolveUnlockPrerequisites', () => {
  const states = (implemented: string[]): Map<string, SkillState> =>
    new Map(
      [...indexSkills(stages).keys()].map((id) => [
        id,
        implemented.includes(id) ? 'implemented' : 'planned',
      ]),
    )

  it('leaves edges alone when every prerequisite is implemented', () => {
    const unlock = resolveUnlockPrerequisites(
      resolvePrerequisites(stages),
      states(['a1', 'a2', 'a3', 'b1', 'b2', 'c1', 'c2']),
    )

    expect(unlock.get('a2')).toEqual(['a1'])
    expect(unlock.get('c1')).toEqual(['a3', 'b2'])
  })

  it('sees through a planned skill to its prerequisites', () => {
    // a2 planned → a3 inherits a2's own prerequisite, a1.
    const unlock = resolveUnlockPrerequisites(
      resolvePrerequisites(stages),
      states(['a1', 'a3']),
    )

    expect(unlock.get('a3')).toEqual(['a1'])
  })

  it('sees through a run of consecutive planned skills', () => {
    // a2 and a3 planned → b1 reaches back past both to a1.
    const unlock = resolveUnlockPrerequisites(
      resolvePrerequisites(stages),
      states(['a1', 'b1']),
    )

    expect(unlock.get('b1')).toEqual(['a1'])
  })

  it('leaves a skill unblocked when everything behind it is planned', () => {
    const unlock = resolveUnlockPrerequisites(resolvePrerequisites(stages), states(['b2']))

    expect(unlock.get('b2')).toEqual([])
  })

  it('deduplicates edges that converge on the same skill', () => {
    // c1 depends on a3 and b2; with b1 and b2 planned, b2 collapses back to a3.
    const unlock = resolveUnlockPrerequisites(
      resolvePrerequisites(stages),
      states(['a1', 'a2', 'a3', 'c1']),
    )

    expect(unlock.get('c1')).toEqual(['a3'])
  })

  it('drops an unknown prerequisite id rather than throwing', () => {
    const unlock = resolveUnlockPrerequisites(
      new Map([['a1', ['nope']]]),
      new Map<string, SkillState>([['a1', 'implemented']]),
    )

    expect(unlock.get('a1')).toEqual([])
  })

  it('reports the full path when pass-through hits a cycle', () => {
    const cyclic = new Map([
      ['x', ['y']],
      ['y', ['z']],
      ['z', ['x']],
    ])

    expect(() =>
      resolveUnlockPrerequisites(cyclic, new Map<string, SkillState>()),
    ).toThrow(/x → y → z → x/)
  })
})
