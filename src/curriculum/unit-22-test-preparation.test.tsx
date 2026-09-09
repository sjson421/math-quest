import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SkillIntro } from '../components/SkillIntro'
import { ProblemView } from '../components/ProblemView'
import { checkAnswer } from '../lib/answer'
import { answerLabel } from '../lib/answer-label'
import { generateProblem } from '../lib/generator'
import { geometryFormulaReferences, geometryFormulaSelection, type GeometryDiagram } from '../lib/geometry-diagram'
import { makeRng } from '../lib/rng'
import { advanceCorrect, currentProblem, currentSlot, recordSessionAttempt, requeueMiss, startStandardLessonSession } from '../lib/lesson'
import type { Difficulty, Problem } from '../lib/types'
import { allSkills } from './index'
import { format, sample, unrenderedKeys } from './recorded-output'
import { algebraicPool, formulaNodeCount, quantitativePool, unit22 } from './unit-22-test-preparation'
import { unit20 } from './unit-20-geometry-measurement'
import { initialProgress, useProgress } from '../store/progress'

// The store persists through idb-keyval and these tests run in node; the
// intro-seen assertions below are about what the store computes, not where it writes.
vi.mock('idb-keyval', () => ({ get: vi.fn(async () => undefined), set: vi.fn(async () => undefined) }))

const difficulties: Difficulty[] = [1, 2, 3, 4, 5]
const draws = (index: number) => difficulties.flatMap((difficulty) =>
  Array.from({ length: 200 }, (_, seed) => generateProblem(unit22[index], seed * 7919, difficulty)))
const calculatorProblems = draws(0)
const formulaProblems = draws(1)
const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;')

describe('Unit 22 content', () => {
  it('partitions the registered course without recursion or duplicate members', () => {
    const ids = [...quantitativePool, ...algebraicPool].map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.sort()).toEqual(allSkills.filter((s) => !unit22.includes(s)).map((s) => s.id).sort())
  })

  it('covers calculator operations, both forms, diagnoses and bounded widths at every band', () => {
    for (const difficulty of difficulties) {
      const operations = new Set<string>()
      const forms = new Set<string>()
      const tags = new Set<string>()
      for (const p of calculatorProblems.filter((p) => p.difficulty === difficulty)) {
        if (p.display.kind !== 'inline' || !p.display.calculator) throw new Error('calculator fixture')
        const data = p.display.calculator
        operations.add(data.operation)
        expect(p.display.text.length).toBeLessThanOrEqual(18)
        for (const choice of p.choices ?? []) expect(choice.label.length).toBeLessThanOrEqual(18)
        for (const m of p.misconceptions ?? []) tags.add(m.tag)
        if (data.operation === 'answer-form') {
          forms.add(data.form)
          if (p.answer.kind !== 'exact') throw new Error('answer fixture')
          const fraction = `${p.answer.n}/${p.answer.d}`
          const decimal = String(p.answer.n / p.answer.d)
          expect(checkAnswer(p.answer, data.form === 'fraction' ? fraction : decimal).status).toBe('correct')
          expect(checkAnswer(p.answer, data.form === 'fraction' ? decimal : fraction).status).toBe(data.form === 'fraction' ? 'not-fraction' : 'not-decimal')
          expect(p.misconceptions).toEqual([])
        }
      }
      expect([...operations].sort()).toEqual(['answer-form', 'choose-sequence', 'evaluate'])
      expect([...forms].sort()).toEqual(['decimal', 'fraction'])
      expect([...tags].sort()).toEqual(['ignored-parentheses', 'sign-as-subtraction'])
    }
  })

  it('reaches all formula operations and side roles in the prescribed notation bands', () => {
    const bands = [[3, 3], [3, 5], [5, 8], [8, 11], [9, 11]]
    const operations = new Set<string>()
    const sizes = new Map<Difficulty, number[]>()
    for (const p of formulaProblems) {
      if (p.display.kind !== 'diagram' || p.display.diagram.kind !== 'geometry' || p.answer.kind !== 'choice') throw new Error('formula fixture')
      const diagram = p.display.diagram
      operations.add(diagram.operation === 'pythagorean' ? `${diagram.operation}-${diagram.missingSide}` : diagram.operation)
      const references = geometryFormulaReferences(diagram)
      expect(p.choices).toEqual(references.map(({ label }, index) => ({ id: `formula-${index}`, label })))
      const index = p.choices!.findIndex((c) => c.id === (p.answer as { id: string }).id)
      const size = formulaNodeCount(references[index].notation)
      expect(size).toBeGreaterThanOrEqual(bands[p.difficulty - 1][0])
      expect(size).toBeLessThanOrEqual(bands[p.difficulty - 1][1])
      sizes.set(p.difficulty, [...(sizes.get(p.difficulty) ?? []), size])
    }
    expect([...operations].sort()).toEqual([
      'perimeter', 'area-rectangle', 'area-triangle', 'area-parallelogram', 'area-trapezoid',
      'circumference', 'area-circle', 'volume-prism', 'volume-pyramid', 'volume-cylinder',
      'volume-cone', 'volume-sphere', 'surface-area', 'pythagorean-hypotenuse', 'pythagorean-leg',
    ].sort())
    expect(new Set(formulaProblems.map((p) => JSON.stringify(p.display))).size).toBeGreaterThan(20)
    expect(sizes.get(5)!.reduce((a, b) => a + b) / sizes.get(5)!.length).toBeGreaterThan(3)
  })

  it.each([[2, quantitativePool], [3, algebraicPool]] as const)('review %i preserves the selected source draw and difficulty', (index, pool) => {
    const sources = new Set<string>()
    let repeated = false
    let previous = ''
    for (let seed = 0; seed < 600; seed++) {
      const rng = makeRng(seed)
      const source = rng.pick(pool)
      sources.add(source.id)
      if (source.id === previous) repeated = true
      previous = source.id
      for (const difficulty of difficulties) {
        const expectedRng = makeRng(seed)
        expect(expectedRng.pick(pool)).toBe(source)
        expect(unit22[index].generate(makeRng(seed), difficulty)).toEqual(source.generate(expectedRng, difficulty))
        expect(generateProblem(unit22[index], seed, difficulty)).toEqual(generateProblem(unit22[index], seed, difficulty))
      }
    }
    expect(sources.size).toBeGreaterThan(1)
    expect(repeated).toBe(true)
  })

  it.each([2, 3])('review %i keeps session ownership, exact requeues and lazy recovery', (index) => {
    let seed = 0
    const made: Problem[] = []
    const make = (skill: typeof unit22[number], difficulty: Difficulty) => {
      const p = generateProblem(skill, seed++, difficulty)
      made.push(p)
      return p
    }
    let session = startStandardLessonSession(unit22[index], 10, 4, make)
    const first = currentProblem(session)
    expect(currentSlot(session).source.skill).toBe(unit22[index])
    expect(first.skillId).not.toBe(unit22[index].id)
    expect(made).toHaveLength(1)
    for (let miss = 0; miss < 3; miss++) session = recordSessionAttempt(session, 'incorrect')
    session = requeueMiss(session, make)
    expect(session.queue.some((slot) => slot.problem === first)).toBe(true)
    expect(currentProblem(session).difficulty).toBe(3)
    while (session.queue.length && currentProblem(session) !== first) session = advanceCorrect(session, make).session
    expect(currentProblem(session)).toBe(first)
    expect(session.queue.every((slot) => slot.source.skill === unit22[index])).toBe(true)
  })

  it.each(unit22.map((skill) => [skill.id, skill] as const))('%s records the complete output and stable intro', (_id, skill) => {
    expect(sample(skill)).toMatchSnapshot()
    const example = generateProblem(skill, 1, 1)
    expect(unrenderedKeys([skill])).toEqual([])
    expect(example).toEqual(generateProblem(skill, 1, 1))
    for (const mode of ['automatic', 'review'] as const) {
      const before = structuredClone(example)
      const html = renderToStaticMarkup(<SkillIntro skill={skill} problem={example} mode={mode} onLeave={() => {}} onStart={() => {}} onBackToPractice={() => {}} />)
      expect(html).toContain(escape(skill.teachingLine!))
      expect(html).toContain(escape(answerLabel(example.answer, example.choices)))
      for (const step of example.solution) expect(html).toContain(escape(step.text))
      expect(html).not.toContain('animate-pulse')
      expect(html).not.toContain('>Check<')
      expect(html).toContain(mode === 'automatic' ? 'Start practice' : 'Back to practice')
      expect(example).toEqual(before)
      if (example.display.kind === 'diagram' && example.display.diagram.kind === 'geometry') {
        for (const reference of geometryFormulaReferences(example.display.diagram)) expect(html).toContain(escape(reference.label))
      }
    }
  })

  it('presents authored Stage H examples as learner-facing text with no answer surface', () => {
    const sequence = calculatorProblems.find((p) =>
      p.display.kind === 'inline'
      && p.display.calculator?.operation === 'choose-sequence'
      && p.choices!.some((c) => c.label.includes('(-)'))
      && p.choices!.some((c) => c.label.includes('\u2212')))!
    const formula = formulaProblems[0]
    if (formula.display.kind !== 'diagram' || formula.display.diagram.kind !== 'geometry') throw new Error('formula fixture')
    const references = geometryFormulaReferences(formula.display.diagram)
    for (const [problem, skill] of [[sequence, unit22[0]], [formula, unit22[1]]] as const) {
      for (const mode of ['automatic', 'review'] as const) {
        const html = renderToStaticMarkup(<SkillIntro skill={skill} problem={problem} mode={mode} onLeave={() => {}} onStart={() => {}} onBackToPractice={() => {}} />)
        // The chosen sequence and the formula reach the learner as labels, never as choice ids.
        expect(html).toContain(escape(answerLabel(problem.answer, problem.choices)))
        for (const choice of problem.choices!) expect(html).not.toContain(choice.id)
        if (problem === formula) for (const choice of problem.choices!) expect(html).toContain(escape(choice.label))
        expect(html).not.toContain('animate-pulse')
        expect(html).not.toContain('>=</span>')
      }
    }
    // The sign-change key is not the subtraction operator.
    const html = renderToStaticMarkup(<SkillIntro skill={unit22[0]} problem={sequence} mode="automatic" onLeave={() => {}} onStart={() => {}} onBackToPractice={() => {}} />)
    expect(html).toContain('(-)')
    expect(html).toContain('\u2212')
    for (const reference of references) expect(reference.label).toBeTruthy()
  })

  it.each([[2, quantitativePool], [3, algebraicPool]] as const)('review %i intro shows its source draw under the review line', (index, pool) => {
    const review = unit22[index]
    const rng = makeRng(1)
    const source = rng.pick(pool)
    const drawn = source.generate(rng, 1)
    const example = generateProblem(review, 1, 1)
    expect(example.skillId).toBe(source.id)
    expect(example).toEqual(expect.objectContaining({
      prompt: drawn.prompt,
      display: drawn.display,
      answer: drawn.answer,
      solution: drawn.solution,
      inputMode: drawn.inputMode,
    }))
    // Whatever markup that source already uses in read-only practice is the markup shown here.
    // React mints a fresh id per render, so compare the markup with those ids normalized.
    const ids = (markup: string) => markup.replaceAll(/_R_[0-9a-z]+_/g, '_id_')
    const practice = ids(renderToStaticMarkup(<ProblemView display={example.display} entry="" entryMode={example.inputMode} readOnly />))
    for (const mode of ['automatic', 'review'] as const) {
      const html = ids(renderToStaticMarkup(<SkillIntro skill={review} problem={example} mode={mode} onLeave={() => {}} onStart={() => {}} onBackToPractice={() => {}} />))
      expect(html).toContain(practice)
      expect(html).toContain(escape(review.teachingLine!))
      if (source.teachingLine && source.teachingLine !== review.teachingLine) expect(html).not.toContain(escape(source.teachingLine))
      expect(html).toContain(escape(answerLabel(example.answer, example.choices)))
      for (const step of example.solution) expect(html).toContain(escape(step.text))
    }

    useProgress.setState({ progress: initialProgress() })
    const before = useProgress.getState().progress.skills
    useProgress.getState().markIntroSeen(review.id)
    const after = useProgress.getState().progress.skills
    expect(after[review.id]).toEqual({ ...before[review.id], introSeen: true })
    expect(after[source.id]).toEqual(before[source.id])
  })

  it('records calculator operations and formula variants explicitly', () => {
    // The standard snapshot seed set is small; these fixed draws cover each discriminant.
    const variants = new Map<string, Problem>()
    for (const p of [...calculatorProblems, ...formulaProblems]) {
      let key = ''
      if (p.display.kind === 'inline' && p.display.calculator) key = p.display.calculator.operation + (p.display.calculator.operation === 'answer-form' ? `-${p.display.calculator.form}` : '')
      if (p.display.kind === 'diagram' && p.display.diagram.kind === 'geometry') key = p.display.diagram.operation + (p.display.diagram.operation === 'pythagorean' ? `-${p.display.diagram.missingSide}` : '')
      if (!variants.has(key)) variants.set(key, p)

    }
    for (const [key, p] of variants) expect(format(p, 0)).toMatchSnapshot(key)
  })

  it('uses choice-owned frames while preserving numeric and ordinary frames', () => {
    const choice = calculatorProblems.find((p) => p.inputMode === 'choice')!
    const numeric = calculatorProblems.find((p) => p.inputMode === 'keypad')!
    const geometry = generateProblem(unit20[0], 1, 1)
    for (const p of [choice, formulaProblems[0], numeric, geometry]) {
      for (const readOnly of [false, true]) {
        const html = renderToStaticMarkup(<ProblemView display={p.display} entry="" entryMode={p.inputMode} readOnly={readOnly} />)
        expect(html.includes('animate-pulse')).toBe(!readOnly && p.inputMode === 'keypad')
        if (p.inputMode === 'choice' || readOnly) expect(html).not.toContain('>=</span>')
      }
    }
  })
})

// Fixtures name the meaning independently of production selection metadata.
describe('geometry formula selection mappings', () => {
  const fixtures: [GeometryDiagram, string, number, string][] = [
    [{ kind: 'geometry', operation: 'perimeter', length: 6, width: 3, unit: 'cm' }, 'rectangle perimeter', 0, 'rectangle area'],
    [{ kind: 'geometry', operation: 'area-rectangle', length: 6, width: 3, unit: 'cm' }, 'rectangle area', 1, 'rectangle perimeter'],
    [{ kind: 'geometry', operation: 'area-triangle', base: 6, height: 3, unit: 'cm' }, 'triangle area', 1, 'parallelogram area'],
    [{ kind: 'geometry', operation: 'area-parallelogram', base: 6, height: 3, unit: 'cm' }, 'parallelogram area', 0, 'trapezoid area'],
    [{ kind: 'geometry', operation: 'area-trapezoid', base1: 6, base2: 4, height: 3, unit: 'cm' }, 'trapezoid area', 1, 'parallelogram area'],
    [{ kind: 'geometry', operation: 'circumference', radius: 3, unit: 'cm' }, 'circle circumference', 0, 'circle area'],
    [{ kind: 'geometry', operation: 'area-circle', diameter: 6, unit: 'cm' }, 'circle area', 1, 'circle circumference'],
    [{ kind: 'geometry', operation: 'volume-prism', length: 6, width: 3, height: 2, unit: 'cm' }, 'prism volume', 0, 'pyramid volume'],
    [{ kind: 'geometry', operation: 'volume-pyramid', baseLength: 6, baseWidth: 3, height: 2, unit: 'cm' }, 'pyramid volume', 1, 'prism volume'],
    [{ kind: 'geometry', operation: 'volume-cylinder', radius: 3, height: 4, unit: 'cm' }, 'cylinder volume', 0, 'cone volume'],
    [{ kind: 'geometry', operation: 'volume-cone', radius: 3, height: 4, unit: 'cm' }, 'cone volume', 1, 'cylinder volume'],
    [{ kind: 'geometry', operation: 'volume-sphere', radius: 3, unit: 'cm' }, 'sphere volume', 0, 'sphere surface area'],
    [{ kind: 'geometry', operation: 'surface-area', length: 6, width: 3, height: 2, unit: 'cm' }, 'prism surface area', 0, 'prism volume'],
    [{ kind: 'geometry', operation: 'pythagorean', missingSide: 'hypotenuse', leg1: 3, leg2: 4, unit: 'cm' }, 'missing hypotenuse', 0, 'missing leg'],
    [{ kind: 'geometry', operation: 'pythagorean', missingSide: 'leg', leg: 3, hypotenuse: 5, unit: 'cm' }, 'missing leg', 1, 'missing hypotenuse'],
  ]
  it.each(fixtures)('maps $operation independently', (diagram, measurement, correctIndex, distractor) => {
    expect(geometryFormulaSelection(diagram)).toEqual({ measurement, correctIndex, distractor })
  })
  it('rejects equivalent-reference and composite figures', () => {
    for (const id of ['similar-figures', 'composite-figures']) {
      const p = generateProblem(unit20.find((s) => s.id === id)!, 1, 1)
      if (p.display.kind !== 'diagram' || p.display.diagram.kind !== 'geometry') throw new Error('fixture')
      const diagram = p.display.diagram
      expect(() => geometryFormulaSelection(diagram)).toThrow(/excludes/)
    }
  })
})
