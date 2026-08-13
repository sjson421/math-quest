/**
 * The document and the manifest cross-check each other.
 *
 * This is the only check that catches a semantically-wrong-but-structurally-valid
 * id — `times-78` for `times-7-8` passes uniqueness, resolves, and sits in an
 * acyclic reachable graph. Either file may be edited; the tests fail until both
 * agree.
 *
 * The document also gets checked against itself, so a hand-edit to a unit
 * heading, the stage map, or the build order cannot silently disagree with the
 * rows beneath it.
 */

import { describe, expect, it } from 'vitest'
import { parseCurriculumDoc } from './curriculum-doc'
import { allSkills, skillById, stages } from './index'

const doc = parseCurriculumDoc()

describe('parsing the curriculum document', () => {
  it('matches all 201 skill rows on the id column alone', () => {
    expect(doc.rows).toHaveLength(201)
    expect(doc.units).toHaveLength(23)
    expect(doc.stages).toHaveLength(8)
  })

  it('parses no phantom id from the `quick` marker in the Note column', () => {
    // The anchor is the trap this test exists for: `quick` is backticked and
    // lives in the Note column, so any looser scrape reports it as a skill.
    expect(doc.rows.map((row) => row.id)).not.toContain('quick')
    expect(doc.rows.filter((row) => row.quick).length).toBeGreaterThan(0)
  })

  it('numbers every row sequentially within its unit', () => {
    const misnumbered = doc.units.flatMap((unit) =>
      unit.rows
        .filter((row, i) => row.unit !== unit.number || row.index !== i + 1)
        .map((row) => `${row.unit}.${row.index} (${row.id}) in unit ${unit.number}`),
    )

    expect(misnumbered).toEqual([])
  })
})

describe('document and manifest agree on ids', () => {
  it('declares exactly the same set of skills, in the same order', () => {
    expect(allSkills.map((skill) => skill.id)).toEqual(doc.rows.map((row) => row.id))
  })

  it('has a manifest entry for every documented id', () => {
    const missing = doc.rows.filter((row) => !skillById.has(row.id)).map((row) => row.id)

    expect(missing).toEqual([])
  })

  it('documents every manifest entry', () => {
    const documented = new Set(doc.rows.map((row) => row.id))
    const undocumented = allSkills
      .filter((skill) => !documented.has(skill.id))
      .map((skill) => skill.id)

    expect(undocumented).toEqual([])
  })

  it('places every skill in the unit the document puts it in', () => {
    const documentedUnit = new Map(doc.rows.map((row) => [row.id, `unit-${row.unit}`]))
    const misplaced = stages.flatMap((stage) =>
      stage.units.flatMap((unit) =>
        unit.skills
          .filter((skill) => documentedUnit.get(skill.id) !== unit.id)
          .map((skill) => `${skill.id} in ${unit.id}, documented in ${documentedUnit.get(skill.id)}`),
      ),
    )

    expect(misplaced).toEqual([])
  })
})

describe('document and manifest agree on pacing markers', () => {
  it('marks the same skills `quick`', () => {
    const documented = doc.rows.filter((row) => row.quick).map((row) => row.id)

    expect(allSkills.filter((skill) => skill.quick).map((skill) => skill.id)).toEqual(
      documented,
    )
    expect(documented).toHaveLength(19)
  })

  it('marks the same skills as walls', () => {
    const documented = doc.rows.filter((row) => row.wall).map((row) => row.id)

    expect(allSkills.filter((skill) => skill.wall).map((skill) => skill.id)).toEqual(
      documented,
    )
    expect(documented).toHaveLength(46)
  })

  it('carries both markers on plot-points, the only skill with both', () => {
    const both = doc.rows.filter((row) => row.quick && row.wall).map((row) => row.id)

    expect(both).toEqual(['plot-points'])
    expect(skillById.get('plot-points')).toMatchObject({ quick: true, wall: true })
  })

  it('leaves three wall rows unexplained, which still have to be predicted', () => {
    // A bare ⚠️ gives misconception authoring nothing to start from, so these
    // three are the ones needing their diagnosis worked out from scratch.
    const bare = doc.rows.filter((row) => row.note === '⚠️').map((row) => row.id)

    expect(bare).toEqual([
      'function-notation',
      'area-circle',
      'compound-probability',
    ])
    expect(bare.every((id) => skillById.get(id)?.wall)).toBe(true)
  })
})

describe('the document agrees with itself', () => {
  it('has the totals its title block claims', () => {
    expect(doc.declared).toEqual({ stages: 8, units: 23, skills: 201 })
    expect(doc.stages).toHaveLength(doc.declared.stages)
    expect(doc.units).toHaveLength(doc.declared.units)
    expect(doc.rows).toHaveLength(doc.declared.skills)
  })

  it('has the row count each unit heading declares', () => {
    const wrong = doc.units
      .filter((unit) => unit.rows.length !== unit.declared)
      .map((unit) => `Unit ${unit.number} heading says ${unit.declared}, has ${unit.rows.length}`)

    expect(wrong).toEqual([])
  })

  it('has the skill count each stage map row declares', () => {
    const wrong = doc.stages
      .map((stage) => {
        const [first, last] = stage.units
        const actual = doc.units
          .filter((unit) => unit.number >= first && unit.number <= last)
          .reduce((n, unit) => n + unit.rows.length, 0)
        return actual === stage.declaredSkills
          ? null
          : `Stage ${stage.letter.toUpperCase()} says ${stage.declaredSkills}, units ${first}–${last} have ${actual}`
      })
      .filter((problem) => problem !== null)

    expect(wrong).toEqual([])
  })

  it('covers every unit exactly once across the stage map', () => {
    const covered = doc.stages.flatMap(({ units: [first, last] }) =>
      Array.from({ length: last - first + 1 }, (_, i) => first + i),
    )

    expect(covered).toEqual(doc.units.map((unit) => unit.number))
  })

  it('repeats the same per-stage counts in the build order', () => {
    const declared = new Map(doc.stages.map((stage) => [stage.letter, stage.declaredSkills]))
    const wrong = [...doc.buildOrder]
      .filter(([letter, count]) => declared.get(letter) !== count)
      .map(([letter, count]) => `Stage ${letter.toUpperCase()}: build order ${count}, stage map ${declared.get(letter)}`)

    expect(wrong).toEqual([])
    // Stage A is absent — it was already built when the build order was written.
    expect([...doc.buildOrder.keys()]).toEqual(['b', 'c', 'd', 'e', 'f', 'g', 'h'])
  })
})

describe('document and manifest agree on stage membership', () => {
  it('gives each manifest stage the units and count the stage map declares', () => {
    const wrong = stages
      .map((stage) => {
        const letter = stage.id.replace('stage-', '')
        const documented = doc.stages.find((candidate) => candidate.letter === letter)
        if (!documented) return `${stage.id} is not in the stage map`

        const numbers = stage.units.map((unit) => Number(unit.id.replace('unit-', '')))
        const skills = stage.units.reduce((n, unit) => n + unit.skills.length, 0)
        const expected = Array.from(
          { length: documented.units[1] - documented.units[0] + 1 },
          (_, i) => documented.units[0] + i,
        )

        if (numbers.join(',') !== expected.join(','))
          return `${stage.id} holds units ${numbers.join(',')}, documented as ${expected.join(',')}`
        if (skills !== documented.declaredSkills)
          return `${stage.id} has ${skills} skills, documented as ${documented.declaredSkills}`
        return null
      })
      .filter((problem) => problem !== null)

    expect(wrong).toEqual([])
  })
})
