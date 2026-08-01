import { describe, expect, it } from 'vitest'
import {
  advanceCorrect,
  currentProblem,
  INITIAL_PACING,
  difficultyForProblem,
  lessonTarget,
  recordPacing,
  recordSessionAttempt,
  requeueMiss,
  startLessonSession,
} from './lesson'
import { intAnswer } from './answer'
import type { Difficulty, Problem } from './types'

const problem = (label: string, difficulty: Difficulty): Problem => ({
  skillId: 'synthetic',
  prompt: label,
  display: { kind: 'inline', text: label },
  answer: intAnswer(1),
  inputMode: 'keypad',
  hint: 'Use the displayed value.',
  solution: [{ text: 'Read the value.' }],
  difficulty,
})

const labeledFactory = () => {
  const generated: Problem[] = []
  const make = (difficulty: Difficulty) => {
    const next = problem(`p${generated.length}`, difficulty)
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
  it('generates an unseen problem only when it becomes current', () => {
    const { generated, make } = labeledFactory()
    const started = startLessonSession(5, 4, make)

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
    const missed = startLessonSession(5, 3, make)
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
    const started = startLessonSession(2, 2, make)
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
    const started = startLessonSession(5, 2, make)
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
    let session = startLessonSession(5, 4, make)
    const warmupRetry = currentProblem(session)

    for (let miss = 0; miss < 3; miss += 1) {
      session = recordSessionAttempt(session, 'incorrect')
      session = requeueMiss(session, make)
    }

    expect(generated.map((item) => item.difficulty)).toEqual([3, 4, 4, 3])
    expect(session.pacing).toEqual({ consecutiveMisses: 3, recovering: true })

    session = recordSessionAttempt(session, 'correct')
    session = advanceCorrect(session, make).session
    expect(currentProblem(session)).toBe(warmupRetry)
    expect(currentProblem(session).difficulty).toBe(3)
    expect(session.pacing).toEqual({ consecutiveMisses: 0, recovering: true })
  })

  it('cannot complete while a late retry remains', () => {
    const { make } = labeledFactory()
    let session = startLessonSession(2, 3, make)
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
})
