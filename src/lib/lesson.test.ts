import { describe, expect, it } from 'vitest'
import {
  advanceCorrect,
  recordCheckResult,
  currentProblem,
  currentSlot,
  INITIAL_PACING,
  difficultyForProblem,
  lessonTarget,
  recordPacing,
  recordSessionAttempt,
  requeueMiss,
  startCheckSession,
  startLessonSession,
  startStandardLessonSession,
  type LessonSource,
} from './lesson'
import { intAnswer } from './answer'
import { createSessionTiming } from './session-clock'
import type { Difficulty, Problem, SkillGenerator } from './types'

const problem = (label: string, difficulty: Difficulty, skillId = 'synthetic'): Problem => ({
  skillId,
  prompt: label,
  display: { kind: 'inline', text: label },
  answer: intAnswer(1),
  inputMode: 'keypad',
  hint: 'Use the displayed value.',
  solution: [{ text: 'Read the value.' }],
  difficulty,
})

const skill = (id: string): SkillGenerator => ({
  id,
  name: id,
  blurb: id,
  teachingLine: '',
  generate: (_rng, difficulty) => problem(id, difficulty, id),
})

const synthetic = skill('synthetic')

const source = (id: string, baseDifficulty: Difficulty): LessonSource => ({
  skill: skill(id),
  baseDifficulty,
})

const labeledFactory = () => {
  const generated: Problem[] = []
  const make = (skill: SkillGenerator, difficulty: Difficulty) => {
    const next = problem(`p${generated.length}`, difficulty, skill.id)
    generated.push(next)
    return next
  }
  return { generated, make }
}

describe('lessonTarget', () => {
  it('uses five correct answers only for an explicit quick skill', () => {
    expect(lessonTarget(true)).toBe(5)
    expect(lessonTarget(false)).toBe(10)
    expect(lessonTarget(undefined)).toBe(10)
  })
})

describe('difficultyForProblem', () => {
  it('opens one band below the base difficulty', () => {
    expect(difficultyForProblem(4, 'opening', false)).toBe(3)
  })

  it('does not drop below difficulty one', () => {
    expect(difficultyForProblem(1, 'opening', false)).toBe(1)
    expect(difficultyForProblem(1, 'later', true)).toBe(1)
  })

  it('uses base difficulty later until recovery begins', () => {
    expect(difficultyForProblem(4, 'later', false)).toBe(4)
    expect(difficultyForProblem(4, 'later', true)).toBe(3)
  })
})

describe('recordPacing', () => {
  it('starts sticky recovery on the third consecutive recorded miss', () => {
    const afterOne = recordPacing(INITIAL_PACING, 'incorrect')
    const afterTwo = recordPacing(afterOne, 'incorrect')
    const afterThree = recordPacing(afterTwo, 'incorrect')

    expect(afterOne).toEqual({ consecutiveMisses: 1, recovering: false })
    expect(afterTwo).toEqual({ consecutiveMisses: 2, recovering: false })
    expect(afterThree).toEqual({ consecutiveMisses: 3, recovering: true })
    expect(recordPacing(afterThree, 'correct')).toEqual({
      consecutiveMisses: 0,
      recovering: true,
    })
  })

  it('a correct answer breaks a miss streak before recovery', () => {
    const afterTwo = recordPacing(
      recordPacing(INITIAL_PACING, 'incorrect'),
      'incorrect',
    )

    expect(recordPacing(afterTwo, 'correct')).toEqual(INITIAL_PACING)
  })

  it('an unrecorded entry leaves pacing unchanged', () => {
    const afterOne = recordPacing(INITIAL_PACING, 'incorrect')
    expect(recordPacing(afterOne, 'none')).toBe(afterOne)
  })
})

describe('lesson queue', () => {
  it('keeps standard, mixed-review, and skip-check sessions untimed by default', () => {
    const { make } = labeledFactory()

    expect(startStandardLessonSession(synthetic, 2, 2, make)).not.toHaveProperty('timing')
    expect(startLessonSession([source('review', 2)], make)).not.toHaveProperty('timing')
    expect(
      startCheckSession(Array.from({ length: 8 }, () => synthetic), make),
    ).not.toHaveProperty('timing')
  })

  it('keeps one explicit timing origin through lazy review transitions and retries', () => {
    const { make } = labeledFactory()
    const timing = createSessionTiming(500)
    const started = startLessonSession([source('first', 4), source('second', 2)], make, timing)
    const first = currentProblem(started)

    expect(started.timing).toBe(timing)

    let session = recordSessionAttempt(started, 'incorrect')
    session = requeueMiss(session, make)
    expect(session.timing).toBe(timing)

    const next = advanceCorrect(session, make)
    expect(next.session.timing).toBe(timing)
    expect(currentProblem(next.session)).toBe(first)
  })

  it('keeps a check at difficulty three and materializes one source at a time', () => {
    const { generated, make } = labeledFactory()
    const skills = Array.from({ length: 8 }, (_, index) => skill(`check-${index}`))
    let session = startCheckSession(skills, make)

    expect(generated).toHaveLength(1)
    expect(generated[0].difficulty).toBe(3)
    expect(session.queue[1].problem).toBeNull()

    for (let answer = 0; answer < skills.length; answer += 1) {
      expect(currentProblem(session).difficulty).toBe(3)
      const transition = recordCheckResult(session, 'incorrect', make)
      if (!transition.complete) session = transition.session
    }

    expect(generated).toHaveLength(8)
    expect(generated.every(({ difficulty }) => difficulty === 3)).toBe(true)
  })

  it('requires the fixed eight-source snapshot', () => {
    expect(() => startCheckSession(Array.from({ length: 7 }, () => synthetic), () => problem('p', 3)))
      .toThrow('Check needs exactly 8 sources')
    expect(() => startCheckSession(Array.from({ length: 9 }, () => synthetic), () => problem('p', 3)))
      .toThrow('Check needs exactly 8 sources')
  })

  it('advances a check miss once without retry or recovery', () => {
    const { generated, make } = labeledFactory()
    const session = startCheckSession(
      [skill('first'), skill('second'), ...Array.from({ length: 6 }, (_, index) => skill(`extra-${index}`))],
      make,
    )
    const first = currentProblem(session)

    const transition = recordCheckResult(session, 'incorrect', make)

    expect(transition.complete).toBe(false)
    expect(transition.session.answeredCount).toBe(1)
    expect(transition.session.correctCount).toBe(0)
    expect(currentProblem(transition.session)).not.toBe(first)
    expect(generated).toHaveLength(2)
  })

  it('keeps an unrecorded check entry on the same problem', () => {
    const { make } = labeledFactory()
    const session = startCheckSession(
      [synthetic, skill('second'), ...Array.from({ length: 6 }, (_, index) => skill(`extra-${index}`))],
      make,
    )

    const transition = recordCheckResult(session, 'none', make)

    expect(transition.complete).toBe(false)
    expect(transition.session).toBe(session)
    expect(currentProblem(transition.session)).toBe(currentProblem(session))
  })

  it('keeps explicit timing through check results', () => {
    const { make } = labeledFactory()
    const timing = createSessionTiming(900)
    const session = startCheckSession(
      [synthetic, skill('second'), ...Array.from({ length: 6 }, (_, index) => skill(`extra-${index}`))],
      make,
      timing,
    )

    const transition = recordCheckResult(session, 'incorrect', make)

    expect(session.timing).toBe(timing)
    expect(transition.session.timing).toBe(timing)
  })

  it('generates an unseen problem only when it becomes current', () => {
    const { generated, make } = labeledFactory()
    const started = startStandardLessonSession(synthetic, 5, 4, make)

    expect(generated.map((item) => item.prompt)).toEqual(['p0'])
    expect(started.queue).toHaveLength(5)
    expect(currentProblem(started)).toBe(generated[0])

    const next = advanceCorrect(started, make)
    expect(next.complete).toBe(false)
    expect(generated.map((item) => item.prompt)).toEqual(['p0', 'p1'])
    expect(currentProblem(next.session)).toBe(generated[1])
  })

  it('returns a miss after three intervening problem positions', () => {
    const { make } = labeledFactory()
    const missed = startStandardLessonSession(synthetic, 5, 3, make)
    const original = currentProblem(missed)
    let session = requeueMiss(missed, make)

    expect(currentProblem(session).prompt).toBe('p1')
    session = advanceCorrect(session, make).session
    expect(currentProblem(session).prompt).toBe('p2')
    session = advanceCorrect(session, make).session
    expect(currentProblem(session).prompt).toBe('p3')
    session = advanceCorrect(session, make).session
    expect(currentProblem(session)).toBe(original)
  })

  it('clamps a late miss to the required positions remaining', () => {
    const { make } = labeledFactory()
    const started = startStandardLessonSession(synthetic, 2, 2, make)
    const original = currentProblem(started)
    const afterMiss = requeueMiss(started, make)
    const afterIntervening = advanceCorrect(afterMiss, make)

    expect(afterIntervening.complete).toBe(false)
    expect(afterIntervening.session.correctCount).toBe(1)
    expect(currentProblem(afterIntervening.session)).toBe(original)
    expect(advanceCorrect(afterIntervening.session, make).complete).toBe(true)
  })

  it('keeps multiple misses in the order they occurred', () => {
    const { make } = labeledFactory()
    const started = startStandardLessonSession(synthetic, 5, 2, make)
    const firstMiss = currentProblem(started)
    let session = requeueMiss(started, make)
    const secondMiss = currentProblem(session)
    session = requeueMiss(session, make)

    session = advanceCorrect(session, make).session
    session = advanceCorrect(session, make).session
    expect(currentProblem(session)).toBe(firstMiss)
    session = advanceCorrect(session, make).session
    expect(currentProblem(session)).toBe(secondMiss)
  })
})

describe('lesson session integration', () => {
  it('generates at recovery difficulty immediately after the third miss', () => {
    const { generated, make } = labeledFactory()
    const timing = createSessionTiming(1_200)
    let session = startStandardLessonSession(synthetic, 5, 4, make, timing)
    const warmupRetry = currentProblem(session)

    for (let miss = 0; miss < 3; miss += 1) {
      session = recordSessionAttempt(session, 'incorrect')
      session = requeueMiss(session, make)
      expect(session.timing).toBe(timing)
    }

    expect(generated.map((item) => item.difficulty)).toEqual([3, 4, 4, 3])
    expect(session.pacing).toEqual({ consecutiveMisses: 3, recovering: true })

    session = recordSessionAttempt(session, 'correct')
    session = advanceCorrect(session, make).session
    expect(session.timing).toBe(timing)
    expect(currentProblem(session)).toBe(warmupRetry)
    expect(currentProblem(session).difficulty).toBe(3)
    expect(session.pacing).toEqual({ consecutiveMisses: 0, recovering: true })
  })

  it('cannot complete while a late retry remains', () => {
    const { make } = labeledFactory()
    let session = startStandardLessonSession(synthetic, 2, 3, make)
    const retry = currentProblem(session)
    session = recordSessionAttempt(session, 'incorrect')
    session = requeueMiss(session, make)
    session = recordSessionAttempt(session, 'correct')

    const beforeRetry = advanceCorrect(session, make)
    expect(beforeRetry.complete).toBe(false)
    expect(currentProblem(beforeRetry.session)).toBe(retry)

    session = recordSessionAttempt(beforeRetry.session, 'correct')
    expect(advanceCorrect(session, make).complete).toBe(true)
  })

  it('keeps mixed sources explicit and materializes each skill lazily', () => {
    const { generated, make } = labeledFactory()
    const first = source('first', 4)
    const second = source('second', 2)
    const started = startLessonSession([first, second], make)

    expect(started.targetCorrect).toBe(2)
    expect(currentSlot(started).source).toBe(first)
    expect(currentProblem(started).skillId).toBe('first')
    expect(started.queue[1]).toEqual({ source: second, problem: null })
    expect(generated.map(({ skillId, difficulty }) => [skillId, difficulty])).toEqual([
      ['first', 3],
    ])

    const next = advanceCorrect(started, make)
    expect(currentSlot(next.session).source).toBe(second)
    expect(currentProblem(next.session).skillId).toBe('second')
    expect(currentProblem(next.session).difficulty).toBe(2)
  })

  it('keeps recovery across skills and lowers later skills from their own base', () => {
    const { generated, make } = labeledFactory()
    const sources = [source('first', 4), source('second', 5), source('third', 3), source('fourth', 2)]
    let session = startLessonSession(sources, make)

    for (let miss = 0; miss < 3; miss += 1) {
      session = recordSessionAttempt(session, 'incorrect')
      session = requeueMiss(session, make)
    }

    expect(generated.map(({ skillId, difficulty }) => [skillId, difficulty])).toEqual([
      ['first', 3],
      ['second', 5],
      ['third', 3],
      ['fourth', 1],
    ])
    expect(session.pacing).toEqual({ consecutiveMisses: 3, recovering: true })
  })

  it('keeps a mixed retry tied to its original source and problem', () => {
    const { make } = labeledFactory()
    const first = source('first', 4)
    const second = source('second', 2)
    const started = startLessonSession([first, second], make)
    const missed = currentProblem(started)
    let session = requeueMiss(started, make)

    session = advanceCorrect(session, make).session

    expect(currentSlot(session).source).toBe(first)
    expect(currentProblem(session)).toBe(missed)
    expect(currentProblem(session).difficulty).toBe(3)
  })

  it('keeps quick and standard targets in standard sessions', () => {
    const { make } = labeledFactory()

    expect(startStandardLessonSession(synthetic, lessonTarget(true), 1, make).queue).toHaveLength(5)
    expect(startStandardLessonSession(synthetic, lessonTarget(false), 1, make).queue).toHaveLength(10)
  })
})
