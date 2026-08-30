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
import { checkTeachingLine, teachingLineTerms } from '../lib/content-rules'
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
import { stageA, stageB, stageC, stageD, stageE, stageF, stageG } from './manifest'
import type { Capability } from './manifest/types'
import type { Problem } from '../lib/types'

const doc = parseCurriculumDoc()

/** Ids marked ✅ built in the curriculum document. */
const documentedAsBuilt = doc.rows.filter((row) => row.built).map((row) => row.id)
const stageAIds = stageA.units.flatMap((unit) => unit.skills.map((skill) => skill.id))
const stageBIds = stageB.units.flatMap((unit) => unit.skills.map((skill) => skill.id))
const stageCIds = stageC.units.flatMap((unit) => unit.skills.map((skill) => skill.id))
const stageDIds = stageD.units.flatMap((unit) => unit.skills.map((skill) => skill.id))
const stageEIds = stageE.units.flatMap((unit) => unit.skills.map((skill) => skill.id))
const stageFIds = stageF.units.flatMap((unit) => unit.skills.map((skill) => skill.id))
const stageGIds = stageG.units.flatMap((unit) => unit.skills.map((skill) => skill.id))

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
    expect(manifestSkills.filter((skill) => !skillStates.has(skill.id)).map((s) => s.id)).toEqual([])
  })

  it('reads an unknown id as planned', () => {
    expect(skillState('not-a-skill')).toBe('planned')
  })
})

describe('the skills that are built', () => {
  it('resolve as implemented, and are exactly the ones the document marks ✅', () => {
    // Asserted against the parsed ✅ set rather than a hardcoded list, so the
    // document and the registry cannot drift apart as generators land.
    expect(documentedAsBuilt).toHaveLength(185)
    expect([...implementedSkillIds].sort()).toEqual([...documentedAsBuilt].sort())
  })
  it('keeps every inline expression inside the width its size band was chosen for', () => {
    // `ProblemView` picks a font size from a character count, and its thresholds
    // were set from a measurement of every built skill. A comment recording that
    // measurement is not a gate — the next unit to widen a display would land in
    // the bottom band with no headroom left, and the failure is a wrapped problem
    // on a phone, found by a person rather than by CI. This runs the measurement.
    //
    // Reading skills are prose rather than arithmetic. `read-numbers` keeps its
    // shipped smallest-band behavior; `read-decimals` has a bounded wrapping
    // layout pinned in `ProblemView.test.tsx`. Every other inline display is
    // arithmetic, whose widest today is the 18 characters of a `pemdas`
    // expression.
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
      .filter(([id, text]) => !['read-numbers', 'read-decimals'].includes(id) && text.length > 18)
      .map(([id, text]) => `${id}: "${text}" is ${text.length} characters`)

    expect(tooWide, 'widen the ProblemView size bands, or narrow the draw').toEqual([])
    // Vitest's default is 5s and this measurement generates ~45,000 problems,
    // which lands close enough to the limit that it has failed on load rather
    // than on a finding. The work is deterministic — every seed here is fixed —
    // so the only thing a timeout measures is how busy the machine was.
  }, 20_000)

  it('keeps every equation inside the width its own size band was chosen for', () => {
    // Measured separately from the inline ladder above, and that separation is
    // the point rather than tidiness. An inline row spends part of its width on
    // a trailing `=` and the answer slot, both sized in `em` and both growing as
    // the learner types — which is what the 18-character cap was measured
    // against. An equation row carries neither: the slot sits on a second row,
    // framed by the variable. One number cannot be right for two differently
    // shaped rows, and sharing it is how a display passes the gate and still
    // wraps on a phone.
    //
    // 21 is the measurement, not a judgement. The widest plain row any Unit 14
    // draw produces is `vars-both-sides` at 20 characters
    // (`17x + 14 = 10x + 119`), and `EquationView`'s smallest band starts at 19.
    //
    // A row drawn as *notation* is measured against its own number, because the
    // character count stops describing it: `x/6` is three characters and one
    // stacked column. The count over-estimates a notated row's width, so a cap
    // on it is conservative — it fires early rather than late, which is the
    // safe direction for a gate. The number comes from the browser: Unit 14b's
    // widest notated draw is `x/6 + 10 = 15`, 13 characters, rendering 101.6px
    // wide in a 375px viewport. 16 leaves room for a wider denominator without
    // leaving the row ungated, which was the alternative considered and
    // rejected — `with-fractions` would then be the only equation in the course
    // whose widening ships green.
    const CAPS = { text: 21, notation: 16 }
    const widest = new Map<string, { text: string; notated: boolean }>()

    for (const generator of allSkills) {
      for (const difficulty of [1, 2, 3, 4, 5] as const) {
        for (let i = 0; i < 50; i += 1) {
          const { display } = generateProblem(generator, i * 7919 + difficulty * 104729, difficulty)
          if (display.kind !== 'equation') continue
          const seen = widest.get(generator.id)
          if (display.text.length > (seen?.text.length ?? 0)) {
            widest.set(generator.id, { text: display.text, notated: display.notation !== undefined })
          }
        }
      }
    }

    expect(widest.size, 'no equation displays were sampled').toBeGreaterThan(0)
    expect(
      [...widest.values()].filter(({ notated }) => notated).length,
      'no notated equation was sampled, so its cap is testing nothing',
    ).toBeGreaterThan(0)

    const tooWide = [...widest]
      .filter(([, { text, notated }]) => text.length > (notated ? CAPS.notation : CAPS.text))
      .map(([id, { text, notated }]) =>
        `${id}: "${text}" is ${text.length} characters, over the ${notated ? 'notation' : 'text'} cap`,
      )

    expect(tooWide, 'widen the EquationView size bands, or narrow the draw').toEqual([])
  })

  it('matches every generator name and blurb to its manifest entry', () => {
    const mismatches = allSkills
      .filter((generator) => {
        const entry = manifestIndex.get(generator.id)?.skill
        return entry?.name !== generator.name || entry.blurb !== generator.blurb
      })
      .map((generator) => generator.id)
    const longBlurbs = allSkills.filter((generator) => generator.blurb.length > 32).map((generator) => generator.id)

    expect(mismatches).toEqual([])
    expect(longBlurbs).toEqual([])
  })

  it('ships teaching lines for every playable skill through Stage G', () => {
    const withLines = allSkills.filter((skill) => skill.teachingLine !== undefined)
    const stageGImplementedIds = stageGIds.filter((id) => generators.has(id))
    expect(stageBIds).toHaveLength(44)
    expect(stageCIds).toHaveLength(9)
    expect(stageDIds).toHaveLength(50)
    expect(stageEIds).toHaveLength(34)
    expect(stageFIds).toHaveLength(28)
    expect(stageGIds).toHaveLength(22)
    expect(stageGImplementedIds).toEqual([
      'perimeter',
      'area-rectangle',
      'area-triangle',
      'area-parallelogram-trapezoid',
      'circumference',
      'area-circle',
      'composite-figures',
      'volume-prism',
      'volume-cylinder',
      'volume-cone-pyramid-sphere',
      'surface-area',
      'pythagorean',
    ])
    expect(withLines.map((skill) => skill.id)).toEqual([
      ...stageAIds,
      ...stageBIds,
      ...stageCIds,
      ...stageDIds,
      ...stageEIds,
      ...stageFIds,
      ...stageGImplementedIds,
    ])

    const terms = withLines.map((skill) => {
      const location = manifestIndex.get(skill.id)
      if (!location || skill.teachingLine === undefined) throw new Error(`Missing location: ${skill.id}`)
      expect(checkTeachingLine(skill.teachingLine, location)).toEqual([])
      return teachingLineTerms(skill.teachingLine, location.unit.id)
    })
    expect(terms.slice(0, stageAIds.length).map((lineTerms) => lineTerms.length)).toEqual([
      1, 0, 0, 1, 0, 1, 1, 0,
    ])

    const stageBTerms = terms.slice(stageAIds.length, stageAIds.length + stageBIds.length).flat()
    expect(stageBTerms.filter((term) => term === 'remainder')).toHaveLength(1)
    expect([...new Set(stageBTerms)]).toEqual(['remainder', 'factor', 'multiple', 'prime'])

    const termsByUnit = new Map<string, string[]>()
    for (const id of [...stageCIds, ...stageDIds, ...stageEIds, ...stageFIds, ...stageGImplementedIds]) {
      const location = manifestIndex.get(id)
      if (!location) throw new Error(`Missing manifest location: ${id}`)
      const line = allSkills.find((skill) => skill.id === id)?.teachingLine
      if (line === undefined) throw new Error(`Missing teaching line: ${id}`)
      termsByUnit.set(location.unit.id, [
        ...(termsByUnit.get(location.unit.id) ?? []),
        ...teachingLineTerms(line, location.unit.id),
      ])
    }

    expect([...termsByUnit]).toEqual([
      ['unit-6', ['absolute value']],
      ['unit-7', ['equivalent fraction', 'lowest terms', 'denominator', 'denominator']],
      ['unit-8', [
        'common denominator',
        'common denominator',
        'common denominator',
        'improper fraction',
        'mixed number',
        'reciprocal',
      ]],
      ['unit-9', Array.from({ length: 9 }, () => 'decimal')],
      ['unit-10', Array.from({ length: 8 }, () => 'percent')],
      ['unit-11', ['ratio', 'ratio', 'unit rate', 'proportion', 'ratio']],
      ['unit-12', ['exponent', 'exponent', 'square root', 'exponent', 'exponent', 'exponent', 'exponent', 'exponent']],
      ['unit-13', ['variable', 'variable', 'like terms', 'like terms', 'distribute', 'distribute']],
      ['unit-14', ['equation', 'equation']],
      ['unit-15', ['inequality', 'inequality', 'inequality']],
      ['unit-16', ['coordinate', 'quadrant', 'slope', 'slope', 'intercept', 'slope']],
      ['unit-17', []],
      ['unit-18', ['polynomial', 'polynomial', 'binomial', 'quadratic']],
      ['unit-19', ['function', 'domain']],
      ['unit-20', ['perimeter', 'area', 'area', 'circumference', 'volume', 'volume', 'hypotenuse']],
    ])
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
    const unbuilt = (stage?.requires ?? []).filter((capability) => !AVAILABLE_CAPABILITIES.has(capability))

    expect(stage?.requires).toEqual(['choice-input'])
    expect(unbuilt).toEqual([])
    expect(documentedAsBuilt.every((id) => skillState(id) === 'implemented')).toBe(true)
  })

  it('makes a number-line skill playable on its generator, never on the capability', () => {
    // The capability is built, so it contributes nothing on its own: across
    // every stage that declares it, a skill is playable exactly when it has a
    // generator. Stating it as the biconditional covers every declaring stage
    // without naming one, so later number-line consumers need no new rule.
    //
    // `manifestSkills`, not the registry's `allSkills`: the registry holds only
    // skills that have a generator, so filtering it would measure an empty set
    // for the stage that has none and pass by vacuity.
    const declaring = manifestSkills.filter((skill) =>
      manifestIndex.get(skill.id)!.stage.requires?.includes('number-line'),
    )
    const wrong = declaring
      .filter((skill) => (skillState(skill.id) === 'implemented') !== generators.has(skill.id))
      .map((skill) => skill.id)

    expect(AVAILABLE_CAPABILITIES.has('number-line')).toBe(true)
    expect(declaring.length).toBeGreaterThan(0)
    expect(wrong).toEqual([])
    // Stage D is complete now, so every current number-line consumer is built.
    // The derived biconditional above still covers a later planned consumer as
    // soon as one enters a stage that declares the capability.
    expect(declaring.some((skill) => generators.has(skill.id))).toBe(true)
  })

  it('implements exactly the Stage D generators that have landed', () => {
    const stage = manifestIndex.get('fraction-meaning')?.stage
    const stageIds = stage?.units.flatMap((unit) => unit.skills.map((skill) => skill.id)) ?? []
    const unavailable = (stage?.requires ?? []).filter((capability) => !AVAILABLE_CAPABILITIES.has(capability))

    expect(AVAILABLE_CAPABILITIES.has('math-notation')).toBe(true)
    expect(AVAILABLE_CAPABILITIES.has('fraction-input')).toBe(true)
    expect(AVAILABLE_CAPABILITIES.has('diagram')).toBe(true)
    expect(unavailable).toEqual([])
    expect(stageIds.filter((id) => generators.has(id))).toEqual([
      'fraction-meaning',
      'fraction-of-shape',
      'name-parts',
      'fractions-numberline',
      'equivalent-visual',
      'equivalent-multiply',
      'simplify-fractions',
      'compare-same-den',
      'compare-diff-den',
      'add-frac-same-den',
      'sub-frac-same-den',
      'common-denominator',
      'add-frac-diff-den',
      'sub-frac-diff-den',
      'improper-to-mixed',
      'mixed-to-improper',
      'add-mixed',
      'sub-mixed',
      'mult-fractions',
      'div-fractions',
      'fraction-words',
      'decimal-place-value',
      'read-decimals',
      'compare-decimals',
      'round-decimals',
      'add-decimals',
      'sub-decimals',
      'mult-decimals',
      'div-decimal-by-whole',
      'div-by-decimal',
      'fraction-to-decimal',
      'decimal-to-fraction',
      'money-problems',
      'percent-meaning',
      'percent-to-decimal',
      'decimal-to-percent',
      'percent-to-fraction',
      'percent-of',
      'find-the-percent',
      'find-the-whole',
      'percent-change',
      'discount-tax-tip',
      'simple-interest',
      'write-ratios',
      'simplify-ratios',
      'unit-rate',
      'solve-proportions',
      'scale-drawings',
      'unit-conversion',
      'ratio-words',
    ])
    expect(stageIds.filter((id) => skillState(id) === 'implemented')).toEqual(
      stageIds.filter((id) => generators.has(id)),
    )
    expect(stageIds.filter((id) => skillState(id) === 'planned')).toHaveLength(0)
    const unit8 = stage?.units.find((unit) => unit.id === 'unit-8')
    const unit8Ids = unit8?.skills.map((skill) => skill.id) ?? []
    expect(unit8Ids.filter((id) => skillState(id) === 'implemented')).toEqual([
      'add-frac-same-den',
      'sub-frac-same-den',
      'common-denominator',
      'add-frac-diff-den',
      'sub-frac-diff-den',
      'improper-to-mixed',
      'mixed-to-improper',
      'add-mixed',
      'sub-mixed',
      'mult-fractions',
      'div-fractions',
      'fraction-words',
    ])
    expect(unit8Ids.filter((id) => skillState(id) === 'planned')).toHaveLength(0)
    const unit9 = stage?.units.find((unit) => unit.id === 'unit-9')
    const unit9Ids = unit9?.skills.map((skill) => skill.id) ?? []
    expect(unit9Ids.filter((id) => skillState(id) === 'implemented')).toEqual([
      'decimal-place-value',
      'read-decimals',
      'compare-decimals',
      'round-decimals',
      'add-decimals',
      'sub-decimals',
      'mult-decimals',
      'div-decimal-by-whole',
      'div-by-decimal',
      'fraction-to-decimal',
      'decimal-to-fraction',
      'money-problems',
    ])
    expect(unit9Ids.filter((id) => skillState(id) === 'planned')).toHaveLength(0)
    const unit10 = stage?.units.find((unit) => unit.id === 'unit-10')
    const unit10Ids = unit10?.skills.map((skill) => skill.id) ?? []
    expect(unit10Ids.filter((id) => skillState(id) === 'implemented')).toEqual([
      'percent-meaning',
      'percent-to-decimal',
      'decimal-to-percent',
      'percent-to-fraction',
      'percent-of',
      'find-the-percent',
      'find-the-whole',
      'percent-change',
      'discount-tax-tip',
      'simple-interest',
    ])
    expect(unit10Ids.filter((id) => skillState(id) === 'planned')).toHaveLength(0)
    const unit11 = stage?.units.find((unit) => unit.id === 'unit-11')
    const unit11Ids = unit11?.skills.map((skill) => skill.id) ?? []
    expect(unit11Ids.filter((id) => skillState(id) === 'implemented')).toEqual([
      'write-ratios',
      'simplify-ratios',
      'unit-rate',
      'solve-proportions',
      'scale-drawings',
      'unit-conversion',
      'ratio-words',
    ])
    expect(unit11Ids.filter((id) => skillState(id) === 'planned')).toHaveLength(0)
    expect(implementedSkillIds).toHaveLength(185)
  })

  it('has a skill that actually draws a line, which the capability went a change without', () => {
    // The capability shipped unlocking nothing, because a declared capability
    // is not a declared line. `negatives-numberline` is the first skill
    // anywhere to carry one.
    const drawing = allSkills.filter((generator) => generateProblem(generator, 1, 3).numberLine !== undefined)

    expect(drawing.map((generator) => generator.id)).toEqual(['negatives-numberline', 'fractions-numberline'])
  })

  it('implements Stage A because its choice input capability is available', () => {
    const stage = manifestIndex.get('read-numbers')?.stage
    const stageIds = stage?.units.flatMap((unit) => unit.skills.map((skill) => skill.id)) ?? []

    expect(stage?.requires).toEqual(['choice-input'])
    expect(stageIds.every((id) => skillState(id) === 'implemented')).toBe(true)
  })

  it('marks expression input available, with Units 12 and 13 complete', () => {
    // Roadmap item 20b: the capability shipped before Unit 13's generators did,
    // proving availability alone adds no playable skill — the same pattern
    // `diagram` and `number-line` proved for their stages. Both units have since
    // landed in full, so this checks their membership rather than the whole
    // stage: Units 14 and 15 are still ahead.
    const stage = manifestIndex.get('variable-meaning')?.stage
    const unit13 = stage?.units.find((unit) => unit.id === 'unit-13')
    const unit13Ids = unit13?.skills.map((skill) => skill.id) ?? []
    const unavailable = (stage?.requires ?? []).filter((capability) => !AVAILABLE_CAPABILITIES.has(capability))

    expect(AVAILABLE_CAPABILITIES.has('expression-input')).toBe(true)
    // `choice-input` joined in Unit 14b, owed since 13a — see the input-mode
    // check below, which is what makes the next omission fail on its own unit.
    expect(stage?.requires).toEqual([
      'choice-input',
      'math-notation',
      'fraction-input',
      'expression-input',
    ])
    expect(unavailable).toEqual([])
    const unit12 = stage?.units.find((unit) => unit.id === 'unit-12')
    expect(unit12?.skills.map((skill) => skill.id).filter((id) => skillState(id) === 'implemented'))
      .toEqual([
        'exponent-meaning',
        'evaluate-powers',
        'perfect-squares',
        'estimate-roots',
        'exponent-multiply',
        'exponent-divide',
        'power-of-power',
        'zero-neg-exponents',
        'scientific-notation',
        'pemdas-exponents',
      ])
    expect(unit13Ids.filter((id) => skillState(id) === 'implemented')).toEqual([
      'variable-meaning',
      'evaluate-expression',
      'words-to-expression',
      'identify-like-terms',
      'combine-like-terms',
      'distributive',
      'distribute-negative',
      'factor-gcf',
    ])
    expect(unit13Ids.filter((id) => skillState(id) === 'planned')).toEqual([])
    expect(implementedSkillIds).toHaveLength(185)
  })

  it('completes Unit 14 on the capabilities Stage E already had, adding none', () => {
    // Unit 14's claim across both increments is that equations needed no new
    // capability — 14a drew as text on the keypad built in item 3, and 14b's
    // three answer surfaces were all built before Stage E opened. Asserted
    // rather than assumed: a generator that quietly wanted a new flag would
    // otherwise show up only as skills silently staying `planned`, which reads
    // exactly like work that has not been done yet.
    const stage = manifestIndex.get('equation-balance')?.stage
    const unit14 = stage?.units.find((unit) => unit.id === 'unit-14')
    const unit14Ids = unit14?.skills.map((skill) => skill.id) ?? []

    expect(unit14Ids.filter((id) => skillState(id) === 'implemented')).toEqual([
      'equation-balance',
      'one-step-addsub',
      'one-step-multdiv',
      'two-step',
      'vars-both-sides',
      'equation-parentheses',
      'with-fractions',
      'special-solutions',
      'equation-words',
      'rearrange-formula',
    ])
    // Nothing left in the unit. Roadmap item 21 stays open on increment 15.
    expect(unit14Ids.filter((id) => skillState(id) === 'planned')).toEqual([])
    // What the claim needs, and no more: Stage E asks for nothing this change
    // had to build. Pinning the whole capability set here would fail this Unit
    // 14 test the day an unrelated capability lands.
    expect((stage?.requires ?? []).filter((c) => !AVAILABLE_CAPABILITIES.has(c))).toEqual([])
  })

  it('completes Unit 15 and Stage E without declaring a capability for the graph', () => {
    // Roadmap item 21's last increment, and the one whose input mode the item
    // held open. `graph-inequality` names its graph through the choice input
    // built in item 5 rather than drawing one, so `number-line` is *not* here —
    // the manifest's note on that skill anticipated leaning on a line, and the
    // resolution was that nothing in the stage does. Stated as the full set
    // because that absence is the claim.
    const stage = manifestIndex.get('inequality-symbols')?.stage
    const unit15Ids = stage?.units.find((unit) => unit.id === 'unit-15')?.skills.map((skill) => skill.id) ?? []

    expect(stage?.requires).toEqual(['choice-input', 'math-notation', 'fraction-input', 'expression-input'])
    expect(unit15Ids.filter((id) => skillState(id) === 'implemented')).toEqual([
      'inequality-symbols',
      'graph-inequality',
      'solve-one-step-ineq',
      'solve-multi-step-ineq',
      'flip-the-sign',
      'compound-inequalities',
    ])
    // Nothing left anywhere in Stage E, which closes roadmap item 21.
    const stageIds = stage?.units.flatMap((unit) => unit.skills.map((skill) => skill.id)) ?? []
    expect(stageIds.filter((id) => skillState(id) === 'planned')).toEqual([])
  })

  it('completes all of Stage F, including Unit 19', () => {
    const stage = manifestIndex.get('plot-points')?.stage
    const stageIds = stage?.units.flatMap((unit) => unit.skills.map((skill) => skill.id)) ?? []
    const unit16Ids = stage?.units.find((unit) => unit.id === 'unit-16')?.skills.map((skill) => skill.id) ?? []

    expect(stage?.requires).toEqual([
      'choice-input',
      'math-notation',
      'expression-input',
      'coordinate-plane',
      'root-pair-input',
    ])
    expect((stage?.requires ?? []).filter((c) => !AVAILABLE_CAPABILITIES.has(c))).toEqual([])
    expect(stageIds).toHaveLength(28)
    expect(stageIds.filter((id) => generators.has(id))).toEqual([
      'plot-points',
      'quadrants',
      'table-to-graph',
      'slope-from-graph',
      'slope-from-points',
      'y-intercept',
      'slope-intercept',
      'graph-from-equation',
      'equation-from-graph',
      'parallel-perpendicular',
      'system-by-graphing',
      'substitution',
      'elimination',
      'system-words',
      'add-polynomials',
      'sub-polynomials',
      'mult-monomial',
      'foil',
      'factor-gcf-poly',
      'factor-trinomial',
      'difference-of-squares',
      'solve-by-factoring',
      'quadratic-formula',
      'function-notation',
      'evaluate-function',
      'domain-range',
      'linear-vs-nonlinear',
      'compare-functions',
    ])
    expect(unit16Ids.filter((id) => skillState(id) === 'planned')).toEqual([])
    const unit17Ids = stage?.units.find((unit) => unit.id === 'unit-17')?.skills.map((skill) => skill.id) ?? []
    expect(unit17Ids.filter((id) => skillState(id) === 'planned')).toEqual([])
    const unit18Ids = stage?.units.find((unit) => unit.id === 'unit-18')?.skills.map((skill) => skill.id) ?? []
    expect(unit18Ids.filter((id) => skillState(id) === 'planned')).toEqual([])
    const unit19Ids = stage?.units.find((unit) => unit.id === 'unit-19')?.skills.map((skill) => skill.id) ?? []
    expect(unit19Ids.filter((id) => skillState(id) === 'planned')).toEqual([])
    expect(implementedSkillIds).toHaveLength(185)
  })

  it('opens Unit 20b while keeping the rest of Stage G planned', () => {
    const stage = manifestIndex.get('read-bar-line')?.stage
    const stageIds = stage?.units.flatMap((unit) => unit.skills.map((skill) => skill.id)) ?? []
    const unit20Ids = stage?.units.find((unit) => unit.id === 'unit-20')?.skills.map((skill) => skill.id) ?? []
    const unit21Ids = stage?.units.find((unit) => unit.id === 'unit-21')?.skills.map((skill) => skill.id) ?? []
    const stageH = manifestIndex.get('timed-practice-1')?.stage
    const stageHIds = stageH?.units.flatMap((unit) => unit.skills.map((skill) => skill.id)) ?? []

    expect(AVAILABLE_CAPABILITIES.has('chart')).toBe(true)
    expect(stage?.requires).toEqual(['math-notation', 'diagram', 'chart'])
    expect((stage?.requires ?? []).filter((capability) => !AVAILABLE_CAPABILITIES.has(capability))).toEqual([])
    expect(stageIds).toHaveLength(22)
    expect(stageIds.filter((id) => generators.has(id))).toEqual([
      'perimeter',
      'area-rectangle',
      'area-triangle',
      'area-parallelogram-trapezoid',
      'circumference',
      'area-circle',
      'composite-figures',
      'volume-prism',
      'volume-cylinder',
      'volume-cone-pyramid-sphere',
      'surface-area',
      'pythagorean',
    ])
    expect(unit20Ids.slice(0, 12)).toEqual(stageIds.slice(0, 12))
    expect(unit20Ids.filter((id) => skillState(id) === 'planned')).toHaveLength(1)
    expect(unit21Ids.filter((id) => skillState(id) === 'planned')).toHaveLength(9)
    expect(stageIds.filter((id) => skillState(id) === 'planned')).toHaveLength(10)
    expect(stageHIds).toHaveLength(6)
    expect(stageHIds.filter((id) => skillState(id) === 'planned')).toHaveLength(6)
    expect(stageH?.requires).toEqual(['timed'])
    expect(implementedSkillIds).toHaveLength(185)
    expect(allSkills).toHaveLength(185)
    expect(course.map(({ stage: courseStage }) => courseStage.id)).toContain('stage-g')
  })

  it('declares a capability for every input mode a stage actually uses', () => {
    // The rule `requires` states, executed rather than restated. Stage E carried
    // a choice-input consumer from 13a without declaring one, and nothing
    // failed — because a capability that is *available* changes no skill's
    // state, so the only symptom was the manifest quietly disagreeing with the
    // course. This is what makes the next one fail at the unit that causes it.
    const modes: Record<Problem['inputMode'], Capability | undefined> = {
      keypad: undefined,
      choice: 'choice-input',
      expression: 'expression-input',
      'number-line': 'number-line',
      'coordinate-plane': 'coordinate-plane',
      'root-pair': 'root-pair-input',
    }

    const undeclared = new Set<string>()
    for (const generator of allSkills) {
      const stage = manifestIndex.get(generator.id)?.stage
      if (!stage) continue
      for (const difficulty of [1, 2, 3, 4, 5] as const) {
        // Five a difficulty rather than twenty: `inputMode` varies by draw at
        // most, never by seed depth, and this walks all 185 generators.
        for (let i = 0; i < 5; i += 1) {
          const { inputMode } = generateProblem(generator, i * 7919 + difficulty * 104729, difficulty)
          const capability = modes[inputMode]
          if (capability && !(stage.requires ?? []).includes(capability)) {
            undeclared.add(`${stage.id} uses ${capability} for ${generator.id}`)
          }
        }
      }
    }

    expect([...undeclared], 'add these to the stage’s `requires`').toEqual([])
  })
})

describe('what the learner is offered', () => {
  const offered = course.flatMap(({ units }) => units.flatMap(({ skills }) => skills.map((skill) => skill.id)))

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

  it('leaves the other 16 skills out of the skill tree entirely', () => {
    expect(manifestSkills).toHaveLength(201)
    expect(offered).toHaveLength(185)
  })

  it('groups them under the unit and stage the manifest declares', () => {
    const located = course.flatMap(({ stage, units }) =>
      units.flatMap(({ unit, skills }) => skills.map((skill) => [skill.id, unit.id, stage.id] as const)),
    )
    const misfiled = located.filter(
      ([id, unitId, stageId]) =>
        manifestIndex.get(id)?.unit.id !== unitId || manifestIndex.get(id)?.stage.id !== stageId,
    )

    expect(misfiled).toEqual([])
    // Spot-checked against the ids the old hand-written array got wrong: it
    // called Unit 0 `unit-00` while the manifest calls it `unit-0`.
    expect(located).toContainEqual(['read-numbers', 'unit-0', 'stage-a'])
    expect(located).toContainEqual(['sub-facts', 'unit-2', 'stage-b'])
    expect(located).toContainEqual(['mult-meaning', 'unit-3', 'stage-b'])
    expect(located).toContainEqual(['div-meaning', 'unit-4', 'stage-b'])
    expect(located).toContainEqual(['fraction-meaning', 'unit-7', 'stage-d'])
    expect(located).toContainEqual(['compare-diff-den', 'unit-7', 'stage-d'])
  })

  it('shows the twenty built units, and no stage or unit that has nothing to play', () => {
    expect(course.map(({ stage }) => stage.id)).toEqual([
      'stage-a',
      'stage-b',
      'stage-c',
      'stage-d',
      'stage-e',
      'stage-f',
      'stage-g',
    ])
    expect(course.flatMap(({ units }) => units.map(({ unit }) => unit.id))).toEqual([
      'unit-0',
      'unit-1',
      'unit-2',
      'unit-3',
      'unit-4',
      'unit-5',
      'unit-6',
      'unit-7',
      'unit-8',
      'unit-9',
      'unit-10',
      'unit-11',
      'unit-12',
      'unit-13',
      'unit-14',
      'unit-15',
      'unit-16',
      'unit-17',
      'unit-18',
      'unit-19',
      'unit-20',
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
    // Restricted to implemented skills because planned skills have no edges
    // that can gate anyone yet. Committed so the next change that moves an edge
    // has to look at it — this is the review surface for a re-lock.
    const graph = Object.fromEntries(implementedSkillIds.map((id) => [id, unlockPrerequisites.get(id)]))

    expect(graph).toMatchSnapshot()
  })
})
