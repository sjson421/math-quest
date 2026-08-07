/**
 * Generator coverage against the manifest.
 *
 * The asymmetry here is the whole point. A manifest entry with no generator is
 * normal and must not fail: the manifest is written in full now, generators
 * arrive a unit at a time over months. A generator with no manifest entry is a
 * real error — it means an id was invented outside the document, and progress
 * keyed to it would sit outside the course.
 */

import { describe, expect, it } from 'vitest'
import { generateProblem } from '../lib/generator'
import {
  allSkills,
  course,
  generators,
  implementedSkillIds,
  manifestIndex,
  skillState,
  skillStates,
  unlockPrerequisites,
} from './index'
import { parseCurriculumDoc } from './manifest/curriculum-doc'
import { AVAILABLE_CAPABILITIES, allSkills as manifestSkills } from './manifest'

const doc = parseCurriculumDoc()

/** Ids marked ✅ built in the curriculum document. */
const documentedAsBuilt = doc.rows.filter((row) => row.built).map((row) => row.id)

describe('every generator is declared in the manifest', () => {
  it('registers nothing the manifest does not declare', () => {
    const unregistered = [...generators.keys()].filter((id) => !manifestIndex.has(id))

    expect(unregistered).toEqual([])
  })

  it('names an id the manifest does not know', () => {
    // The failure this protects against: a generator written against a
    // hand-typed id that never made it into the document.
    const invented = ['add-facts', 'times-78'].filter((id) => !manifestIndex.has(id))

    expect(invented).toEqual(['times-78'])
  })

  it('keys the registry by the same ids the generators declare', () => {
    expect([...generators.keys()]).toEqual(allSkills.map((skill) => skill.id))
  })
})

describe('manifest entries without a generator', () => {
  it('resolve as planned rather than failing', () => {
    const planned = manifestSkills.filter((skill) => skillState(skill.id) === 'planned')

    expect(planned).toHaveLength(manifestSkills.length - generators.size)
    expect(planned.length).toBeGreaterThan(0)
  })

  it('account for every manifest skill, with nothing unresolved', () => {
    expect(skillStates.size).toBe(manifestSkills.length)
    expect(
      manifestSkills.filter((skill) => !skillStates.has(skill.id)).map((s) => s.id),
    ).toEqual([])
  })

  it('reads an unknown id as planned', () => {
    expect(skillState('not-a-skill')).toBe('planned')
  })
})

describe('the skills that are built', () => {
  it('resolve as implemented, and are exactly the ones the document marks ✅', () => {
    // Asserted against the parsed ✅ set rather than a hardcoded list, so the
    // document and the registry cannot drift apart as generators land.
    expect(documentedAsBuilt).toHaveLength(52)
    expect([...implementedSkillIds].sort()).toEqual([...documentedAsBuilt].sort())
  })

  it('keeps every inline expression inside the width its size band was chosen for', () => {
    // `ProblemView` picks a font size from a character count, and its thresholds
    // were set from a measurement of every built skill. A comment recording that
    // measurement is not a gate — the next unit to widen a display would land in
    // the bottom band with no headroom left, and the failure is a wrapped problem
    // on a phone, found by a person rather than by CI. This runs the measurement.
    //
    // `read-numbers` is exempt and is the only exemption: it spells a number out
    // in words, it is what the bottom band was built for, and it has shipped
    // there. Every other inline display is arithmetic, whose widest today is the
    // 18 characters of a `pemdas` expression.
    const widest = new Map<string, string>()

    for (const generator of allSkills) {
      for (const difficulty of [1, 2, 3, 4, 5] as const) {
        for (let i = 0; i < 50; i += 1) {
          const { display } = generateProblem(generator, i * 7919 + difficulty * 104729, difficulty)
          if (display.kind !== 'inline') continue
          const seen = widest.get(generator.id) ?? ''
          if (display.text.length > seen.length) widest.set(generator.id, display.text)
        }
      }
    }

    const tooWide = [...widest]
      .filter(([id, text]) => id !== 'read-numbers' && text.length > 18)
      .map(([id, text]) => `${id}: "${text}" is ${text.length} characters`)

    expect(tooWide, 'widen the ProblemView size bands, or narrow the draw').toEqual([])
  })

  it('matches every generator name and blurb to its manifest entry', () => {
    const mismatches = allSkills
      .filter((generator) => {
        const entry = manifestIndex.get(generator.id)?.skill
        return entry?.name !== generator.name || entry.blurb !== generator.blurb
      })
      .map((generator) => generator.id)
    const longBlurbs = allSkills
      .filter((generator) => generator.blurb.length > 32)
      .map((generator) => generator.id)

    expect(mismatches).toEqual([])
    expect(longBlurbs).toEqual([])
  })

  it('report the unit the manifest puts them in, not the file they live in', () => {
    // The files agree with the manifest today, now that Unit 2 has a module of
    // its own. Pinned anyway: the manifest is the authority, and a generator
    // moved between files must not be able to move between units.
    expect(manifestIndex.get('sub-facts')?.unit.id).toBe('unit-2')
    expect(manifestIndex.get('sub-2digit-borrow')?.unit.id).toBe('unit-2')
    expect(manifestIndex.get('add-facts')?.unit.id).toBe('unit-1')
    expect(manifestIndex.get('sub-facts')?.stage.id).toBe('stage-b')
    expect(manifestIndex.get('mult-2by2')?.unit.id).toBe('unit-3')
  })

  it('stay implemented because Stage B needs no unbuilt capability', () => {
    // Stage B declared nothing at all until Unit 4 landed. What this case was
    // really protecting is not the absence of a requirement but that every
    // requirement is met, so it asks that directly — a stage naming an unbuilt
    // capability would send all 44 of its skills back to `planned`.
    const stage = manifestIndex.get('add-facts')?.stage
    const unbuilt = (stage?.requires ?? []).filter(
      (capability) => !AVAILABLE_CAPABILITIES.has(capability),
    )

    expect(stage?.requires).toEqual(['choice-input'])
    expect(unbuilt).toEqual([])
    expect(documentedAsBuilt.every((id) => skillState(id) === 'implemented')).toBe(true)
  })

  it('implements Stage A because its choice input capability is available', () => {
    const stage = manifestIndex.get('read-numbers')?.stage
    const stageIds = stage?.units.flatMap((unit) => unit.skills.map((skill) => skill.id)) ?? []

    expect(stage?.requires).toEqual(['choice-input'])
    expect(stageIds.every((id) => skillState(id) === 'implemented')).toBe(true)
  })
})

describe('what the learner is offered', () => {
  const offered = course.flatMap(({ units }) =>
    units.flatMap(({ skills }) => skills.map((skill) => skill.id)),
  )

  it('offers only implemented skills', () => {
    const notPlayable = offered.filter((id) => skillState(id) !== 'implemented')

    expect(notPlayable).toEqual([])
  })

  it('hides every planned skill', () => {
    const leaked = manifestSkills
      .filter((skill) => skillState(skill.id) === 'planned')
      .map((skill) => skill.id)
      .filter((id) => offered.includes(id))

    expect(leaked).toEqual([])
  })

  it('offers exactly the implemented set — nothing missing, nothing extra', () => {
    expect([...offered].sort()).toEqual([...implementedSkillIds].sort())
  })

  it('offers them in curriculum order, so the cards open top to bottom', () => {
    // Unsorted, unlike the test above: the unlock graph is a line, so a card out
    // of order reads as an arbitrary padlock with nothing to say which one is
    // next. `course` derives this order from the manifest rather than from the
    // order generators were registered in, which is what makes it hold — the
    // rules themselves are tested against synthetic stages in resolve.test.ts.
    expect(offered).toEqual(implementedSkillIds)
  })

  it('leaves the other 149 skills out of the skill tree entirely', () => {
    expect(manifestSkills).toHaveLength(201)
    expect(offered).toHaveLength(52)
  })

  it('groups them under the unit and stage the manifest declares', () => {
    const located = course.flatMap(({ stage, units }) =>
      units.flatMap(({ unit, skills }) =>
        skills.map((skill) => [skill.id, unit.id, stage.id] as const),
      ),
    )
    const misfiled = located.filter(
      ([id, unitId, stageId]) =>
        manifestIndex.get(id)?.unit.id !== unitId ||
        manifestIndex.get(id)?.stage.id !== stageId,
    )

    expect(misfiled).toEqual([])
    // Spot-checked against the ids the old hand-written array got wrong: it
    // called Unit 0 `unit-00` while the manifest calls it `unit-0`.
    expect(located).toContainEqual(['read-numbers', 'unit-0', 'stage-a'])
    expect(located).toContainEqual(['sub-facts', 'unit-2', 'stage-b'])
    expect(located).toContainEqual(['mult-meaning', 'unit-3', 'stage-b'])
    expect(located).toContainEqual(['div-meaning', 'unit-4', 'stage-b'])
  })

  it('shows the six built units, and no stage or unit that has nothing to play', () => {
    expect(course.map(({ stage }) => stage.id)).toEqual(['stage-a', 'stage-b'])
    expect(course.flatMap(({ units }) => units.map(({ unit }) => unit.id))).toEqual([
      'unit-0',
      'unit-1',
      'unit-2',
      'unit-3',
      'unit-4',
      'unit-5',
    ])
  })
})

describe('the unlock graph the store gates on', () => {
  it('has an entry for every implemented skill', () => {
    const missing = implementedSkillIds.filter((id) => !unlockPrerequisites.has(id))

    expect(missing).toEqual([])
  })

  it('points only at implemented skills', () => {
    // The property that makes the graph safe to gate on: a learner can never be
    // held behind a skill that has no generator, because pass-through already
    // resolved those away. Without this, unlocking would deadlock the course.
    const unplayable = [...unlockPrerequisites]
      .flatMap(([id, prereqs]) => prereqs.map((prereq) => `${id} → ${prereq}`))
      .filter((edge) => skillState(edge.split(' → ')[1]) !== 'implemented')

    expect(unplayable).toEqual([])
  })

  it('matches the committed snapshot for the skills that are built', () => {
    // Restricted to implemented skills because the other 149 have no edges that
    // can gate anyone yet. Committed so the next change that moves an edge has
    // to look at it — this is the review surface for a re-lock.
    const graph = Object.fromEntries(
      implementedSkillIds.map((id) => [id, unlockPrerequisites.get(id)]),
    )

    expect(graph).toMatchSnapshot()
  })
})
