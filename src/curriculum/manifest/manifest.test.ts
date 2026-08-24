/**
 * Structural validation of the real manifest.
 *
 * `resolve.test.ts` tests the derivation rules against synthetic stages; this
 * file tests the 201 transcribed entries those rules run over. Every check
 * reports *which* entry is wrong rather than just failing, because a bare
 * "expected true" on a 201-skill graph is nearly useless to debug.
 *
 * The graph *checkers* below live here rather than in `resolve.ts` because they
 * are test-time only — naming the offending entry is no use to a running app.
 *
 * The *derivation* in `resolve.ts` is no longer test-time, and this file is the
 * reason that matters. `curriculum/index.ts` builds the unlock graph at module
 * load, so `resolvePrerequisites()` and `resolveUnlockPrerequisites()` now run
 * on every app start — and both throw, on a `dependsOn` naming a unit with no
 * skills and on a prerequisite cycle respectively. A broken manifest is a white
 * screen, not a red test. These checks run over all 201 entries rather than a
 * sample precisely so that CI fails first.
 */

import { describe, expect, it } from 'vitest'
import {
  AVAILABLE_CAPABILITIES,
  allSkills,
  allUnits,
  indexSkills,
  resolvePrerequisites,
  skillById,
  stageById,
  stages,
  unitById,
} from './index'
import type { StageEntry } from './types'

/** From the stage map in `docs/curriculum.md`. Task 4.x parses these instead. */
const EXPECTED_SKILLS_PER_STAGE: Record<string, number> = {
  'stage-a': 8,
  'stage-b': 44,
  'stage-c': 9,
  'stage-d': 50,
  'stage-e': 34,
  'stage-f': 28,
  'stage-g': 22,
  'stage-h': 6,
}

const prerequisites = resolvePrerequisites(stages)
const index = indexSkills(stages)

/** Skills with nothing in front of them — the entry points to the course. */
const roots = [...prerequisites]
  .filter(([, prereqs]) => prereqs.length === 0)
  .map(([id]) => id)

/**
 * `id declared in stage/unit#position and …` for every id used more than once.
 *
 * The position is in the message because the two halves of a duplicate are often
 * in the same unit, and "declared in stage-b/unit-3 and stage-b/unit-3" does not
 * tell you which two rows to look at.
 */
function findDuplicateSkillIds(stages: readonly StageEntry[]): string[] {
  const locations = new Map<string, string[]>()
  for (const stage of stages)
    for (const unit of stage.units)
      unit.skills.forEach((skill, i) => {
        const where = `${stage.id}/${unit.id}#${i + 1}`
        locations.set(skill.id, [...(locations.get(skill.id) ?? []), where])
      })

  return [...locations]
    .filter(([, where]) => where.length > 1)
    .map(([id, where]) => `${id} declared in ${where.join(' and ')}`)
}

/** `skill → missing-id` for every prerequisite with no manifest entry. */
function findDanglingPrerequisites(
  graph: ReadonlyMap<string, readonly string[]>,
  known: { has(id: string): boolean },
): string[] {
  return [...graph].flatMap(([id, prereqs]) =>
    prereqs.filter((p) => !known.has(p)).map((p) => `${id} → ${p}`),
  )
}

/**
 * The first prerequisite cycle, as the path that closes it, or `null`.
 *
 * Whole-graph acyclicity has to be checked here rather than relying on the
 * guard inside `resolveUnlockPrerequisites()`: that one only fires on paths
 * pass-through actually walks, and a cycle among implemented skills is never
 * walked at all.
 */
function findCycle(graph: ReadonlyMap<string, readonly string[]>): string[] | null {
  const state = new Map<string, 'visiting' | 'done'>()
  const path: string[] = []

  const walk = (id: string): string[] | null => {
    if (state.get(id) === 'done') return null
    if (state.get(id) === 'visiting') return [...path.slice(path.indexOf(id)), id]

    state.set(id, 'visiting')
    path.push(id)

    for (const next of graph.get(id) ?? []) {
      const cycle = walk(next)
      if (cycle) return cycle
    }

    path.pop()
    state.set(id, 'done')
    return null
  }

  for (const id of graph.keys()) {
    const cycle = walk(id)
    if (cycle) return cycle
  }
  return null
}

/** Ids that cannot be reached by following prerequisites forward from a root. */
function findUnreachable(
  graph: ReadonlyMap<string, readonly string[]>,
  from: readonly string[],
): string[] {
  const dependants = new Map<string, string[]>()
  for (const [id, prereqs] of graph)
    for (const prerequisite of prereqs)
      dependants.set(prerequisite, [...(dependants.get(prerequisite) ?? []), id])

  const seen = new Set(from)
  const queue = [...from]
  while (queue.length) {
    for (const dependant of dependants.get(queue.shift()!) ?? [])
      if (!seen.has(dependant)) {
        seen.add(dependant)
        queue.push(dependant)
      }
  }

  return [...graph.keys()].filter((id) => !seen.has(id))
}

describe('manifest counts', () => {
  it('holds the whole course', () => {
    expect(stages).toHaveLength(8)
    expect(allUnits).toHaveLength(23)
    expect(allSkills).toHaveLength(201)
  })

  it('matches the per-stage skill counts in the curriculum document', () => {
    const counts = Object.fromEntries(
      stages.map((stage) => [
        stage.id,
        stage.units.reduce((n, unit) => n + unit.skills.length, 0),
      ]),
    )

    expect(counts).toEqual(EXPECTED_SKILLS_PER_STAGE)
  })

  it('indexes every entry, so no id is shadowed', () => {
    expect(skillById.size).toBe(allSkills.length)
    expect(unitById.size).toBe(allUnits.length)
    expect(stageById.size).toBe(stages.length)
    expect(index.size).toBe(allSkills.length)
  })
})

describe('stage capabilities', () => {
  it('marks choice input built and records every stage with a named consumer', () => {
    expect(AVAILABLE_CAPABILITIES.has('choice-input')).toBe(true)
    expect(stageById.get('stage-a')?.requires).toContain('choice-input')
    // Stage B joined the list with Unit 4: `factors`, `multiples` and `primes`
    // ask which complete list is right, which the number keypad cannot express.
    expect(stageById.get('stage-b')?.requires).toContain('choice-input')
    expect(stageById.get('stage-c')?.requires).toContain('choice-input')
    expect(stageById.get('stage-d')?.requires).toContain('choice-input')
  })

  it('marks number-line input built and records both stages that need it', () => {
    // Stage C for `negatives-numberline` (6.1) and Stage D for
    // `fractions-numberline` (7.4). Stage C left it undeclared while it was
    // unbuilt, because naming an unavailable capability would have held its
    // other eight skills back; that cost went away when the capability shipped.
    //
    // Pinned exactly rather than with `toContain`, because the claim is that
    // `requires` names every capability the stage's own skills need — a set
    // missing an entry is the failure, and a containment check cannot see it.
    expect(AVAILABLE_CAPABILITIES.has('number-line')).toBe(true)
    expect(stageById.get('stage-c')?.requires).toEqual(['choice-input', 'number-line'])
    expect(stageById.get('stage-d')?.requires).toEqual([
      'choice-input',
      'math-notation',
      'fraction-input',
      'diagram',
      'number-line',
    ])
  })

  it('marks math notation and fraction input built under honest stage requirements', () => {
    expect(AVAILABLE_CAPABILITIES.has('math-notation')).toBe(true)
    expect(AVAILABLE_CAPABILITIES.has('fraction-input')).toBe(true)

    for (const stageId of ['stage-d', 'stage-e', 'stage-f', 'stage-g']) {
      const requires = stageById.get(stageId)?.requires ?? []
      expect(requires, stageId).toContain('math-notation')
      expect((requires as readonly string[]).includes('katex'), stageId).toBe(false)
    }
  })

  it('records every built input capability Stage E consumes', () => {
    expect(AVAILABLE_CAPABILITIES.has('expression-input')).toBe(true)
    expect(AVAILABLE_CAPABILITIES.has('fraction-input')).toBe(true)
    // `choice-input` joined in Unit 14b and had been owed since 13a, when
    // `identify-like-terms` began answering through it. `requires` states what a
    // stage's own skills need rather than what it introduced, so a consumer
    // without a declaration is this file disagreeing with the course — the same
    // correction Stage B took in item 11.
    expect(stageById.get('stage-e')?.requires).toEqual([
      'choice-input',
      'math-notation',
      'fraction-input',
      'expression-input',
    ])
  })

  it('records built root-pair input in Stage F before its content', () => {
    expect(AVAILABLE_CAPABILITIES.has('root-pair-input')).toBe(true)
    expect(stageById.get('stage-f')?.requires).toEqual([
      'choice-input',
      'math-notation',
      'expression-input',
      'coordinate-plane',
      'root-pair-input',
    ])
  })
})

describe('skill ids are unique', () => {
  it('uses each id exactly once across the whole course', () => {
    expect(findDuplicateSkillIds(stages)).toEqual([])
  })

  it('names both entries when an id is duplicated', () => {
    const duplicated: StageEntry[] = [
      {
        id: 'stage-x',
        name: 'X',
        units: [
          { id: 'unit-1', name: 'One', skills: [{ id: 'dup', name: 'A', blurb: 'a' }] },
          { id: 'unit-2', name: 'Two', skills: [{ id: 'dup', name: 'B', blurb: 'b' }] },
        ],
      },
    ]

    expect(findDuplicateSkillIds(duplicated)).toEqual([
      'dup declared in stage-x/unit-1#1 and stage-x/unit-2#1',
    ])
  })
})

describe('prerequisite graph', () => {
  it('resolves every prerequisite to a manifest entry', () => {
    expect(findDanglingPrerequisites(prerequisites, index)).toEqual([])
  })

  it('names the skill and the missing target for a dangling prerequisite', () => {
    expect(
      findDanglingPrerequisites(new Map([['a1', ['nope']]]), new Set(['a1'])),
    ).toEqual(['a1 → nope'])
  })

  it('is acyclic', () => {
    const cycle = findCycle(prerequisites)

    expect(cycle ? cycle.join(' → ') : null).toBeNull()
  })

  it('reports the full path of a cycle', () => {
    const cyclic = new Map([
      ['x', ['y']],
      ['y', ['z']],
      ['z', ['x']],
      ['outside', ['x']],
    ])

    expect(findCycle(cyclic)?.join(' → ')).toBe('x → y → z → x')
  })

  it('starts at exactly one root — the start of the course', () => {
    // A second root would mean a unit or an override cut a skill loose from
    // everything before it. That is a real design change, so it should have to
    // be made here deliberately rather than appearing by accident.
    expect(roots).toEqual(['read-numbers'])
  })

  it('reaches every skill from a root', () => {
    expect(findUnreachable(prerequisites, roots)).toEqual([])
  })

  it('names a skill that no root can reach', () => {
    const stranded = new Map([
      ['a1', []],
      ['a2', ['a1']],
      // Mutually dependent, so neither is reachable from a1.
      ['orphan-1', ['orphan-2']],
      ['orphan-2', ['orphan-1']],
    ])

    expect(findUnreachable(stranded, ['a1'])).toEqual(['orphan-1', 'orphan-2'])
  })
})

describe('resolved prerequisite graph', () => {
  it('matches the committed snapshot', () => {
    // Derivation is indirection: a skill entry does not state its prerequisites.
    // This is the expanded form, so any change to the rules or to unit order
    // shows up as a reviewable diff instead of silently rewiring the course.
    const expanded = allSkills
      .map((skill) => {
        const prereqs = prerequisites.get(skill.id) ?? []
        return `${skill.id} ← ${prereqs.length ? prereqs.join(', ') : '(root)'}`
      })
      .join('\n')

    expect(expanded).toMatchSnapshot()
  })
})
