import type { Difficulty, Problem, SkillGenerator } from './types'
import { CHECK_DIFFICULTY, CHECK_PROBLEM_COUNT } from './skip'
import type { SessionTiming } from './session-clock'

export type AttemptRecord = 'correct' | 'incorrect' | 'none'

export type LessonPacing = {
  consecutiveMisses: number
  recovering: boolean
}

export type ProblemFactory = (skill: SkillGenerator, difficulty: Difficulty) => Problem

export type LessonSource = {
  skill: SkillGenerator
  baseDifficulty: Difficulty
}

export type LessonSlot = {
  source: LessonSource
  problem: Problem | null
}

export type LessonSession = {
  timing?: SessionTiming
  targetCorrect: number
  correctCount: number
  pacing: LessonPacing
  queue: LessonSlot[]
}

/** A fixed paper where every recorded answer consumes one queued slot. */
export type FixedAnswerSession = {
  timing?: SessionTiming
  totalProblems: number
  answeredCount: number
  correctCount: number
  queue: LessonSlot[]
}

/** Existing skip-check name, retained for its separate count contract. */
export type CheckSession = FixedAnswerSession
export type FormSession = FixedAnswerSession

export const INITIAL_PACING: LessonPacing = {
  consecutiveMisses: 0,
  recovering: false,
}

export function lessonTarget(quick: boolean | undefined): number {
  return quick ? 5 : 10
}

export function difficultyForProblem(
  base: Difficulty,
  position: 'opening' | 'later',
  recovering: boolean,
): Difficulty {
  if (position === 'later' && !recovering) return base
  return Math.max(1, base - 1) as Difficulty
}

export function recordPacing(
  pacing: LessonPacing,
  record: AttemptRecord,
): LessonPacing {
  if (record === 'none') return pacing
  if (record === 'correct') {
    return { consecutiveMisses: 0, recovering: pacing.recovering }
  }

  const consecutiveMisses = pacing.consecutiveMisses + 1
  return {
    consecutiveMisses,
    recovering: pacing.recovering || consecutiveMisses >= 3,
  }
}

export function recordSessionAttempt(
  session: LessonSession,
  record: AttemptRecord,
): LessonSession {
  return { ...session, pacing: recordPacing(session.pacing, record) }
}

export function startLessonSession(
  sources: readonly LessonSource[],
  makeProblem: ProblemFactory,
  timing?: SessionTiming,
): LessonSession {
  if (sources.length === 0) throw new Error('Lesson needs at least one source')

  return {
    ...(timing ? { timing } : {}),
    targetCorrect: sources.length,
    correctCount: 0,
    pacing: INITIAL_PACING,
    queue: sources.map((source, index) => ({
      source,
      problem:
        index === 0
          ? makeProblem(
              source.skill,
              difficultyForProblem(source.baseDifficulty, 'opening', false),
            )
          : null,
    })),
  }
}

export function startStandardLessonSession(
  skill: SkillGenerator,
  targetCorrect: number,
  baseDifficulty: Difficulty,
  makeProblem: ProblemFactory,
  timing?: SessionTiming,
): LessonSession {
  const source = { skill, baseDifficulty }
  return startLessonSession(
    Array.from({ length: targetCorrect }, () => source),
    makeProblem,
    timing,
  )
}

/** A check uses the same lazy slots, but every recorded answer consumes one. */
function startFixedAnswerSession(
  sources: readonly LessonSource[],
  makeProblem: ProblemFactory,
  timing?: SessionTiming,
): FixedAnswerSession {
  if (sources.length === 0) throw new Error('Fixed-answer session needs at least one source')

  return {
    ...(timing ? { timing } : {}),
    totalProblems: sources.length,
    answeredCount: 0,
    correctCount: 0,
    queue: sources.map((source, index) => ({
      source,
      problem: index === 0 ? makeProblem(source.skill, source.baseDifficulty) : null,
    })),
  }
}

export function startCheckSession(
  skills: readonly SkillGenerator[],
  makeProblem: ProblemFactory,
  timing?: SessionTiming,
): CheckSession {
  if (skills.length !== CHECK_PROBLEM_COUNT) {
    throw new Error(`Check needs exactly ${CHECK_PROBLEM_COUNT} sources`)
  }

  return startFixedAnswerSession(
    skills.map((skill) => ({
      skill,
      baseDifficulty: CHECK_DIFFICULTY as Difficulty,
    })),
    makeProblem,
    timing,
  )
}

/** The full-length forms have a fixed paper size and fixed live difficulty. */
export function startFormSession(
  sources: readonly LessonSource[],
  makeProblem: ProblemFactory,
  timing?: SessionTiming,
): FormSession {
  if (sources.length !== 46) throw new Error('Form needs exactly 46 sources')
  if (sources.some(({ baseDifficulty }) => baseDifficulty !== 3)) {
    throw new Error('Form sources must use difficulty 3')
  }

  return startFixedAnswerSession(sources, makeProblem, timing)
}

export function currentSlot(session: Pick<LessonSession | FixedAnswerSession, 'queue'>): LessonSlot {
  const current = session.queue[0]
  if (!current) throw new Error('Lesson has no current slot')
  return current
}

export function currentProblem(session: Pick<LessonSession | FixedAnswerSession, 'queue'>): Problem {
  const current = currentSlot(session)
  if (!current.problem) throw new Error('Lesson has no current problem')
  return current.problem
}

function materializeCurrent(
  session: LessonSession,
  queue: LessonSlot[],
  makeProblem: ProblemFactory,
): LessonSlot[] {
  const current = queue[0]
  if (!current || current.problem) return queue

  const next = [...queue]
  next[0] = {
    ...current,
    problem: makeProblem(
      current.source.skill,
      difficultyForProblem(
        current.source.baseDifficulty,
        'later',
        session.pacing.recovering,
      ),
    ),
  }
  return next
}

function materializeFixedCurrent(
  queue: LessonSlot[],
  makeProblem: ProblemFactory,
): LessonSlot[] {
  const current = queue[0]
  if (!current || current.problem) return queue

  const next = [...queue]
  next[0] = {
    ...current,
    problem: makeProblem(current.source.skill, current.source.baseDifficulty),
  }
  return next
}

export function advanceCorrect(
  session: LessonSession,
  makeProblem: ProblemFactory,
): { session: LessonSession; complete: boolean } {
  const correctCount = session.correctCount + 1
  const complete = correctCount >= session.targetCorrect
  const next = { ...session, correctCount }

  return {
    session: {
      ...next,
      queue: complete ? [] : materializeCurrent(next, session.queue.slice(1), makeProblem),
    },
    complete,
  }
}

export function requeueMiss(
  session: LessonSession,
  makeProblem: ProblemFactory,
): LessonSession {
  const [missed, ...rest] = session.queue
  if (!missed?.problem) throw new Error('Lesson has no missed problem')

  const queue = [...rest]
  queue.splice(Math.min(3, queue.length), 0, missed)
  return { ...session, queue: materializeCurrent(session, queue, makeProblem) }
}

export function recordFixedAnswer(
  session: FixedAnswerSession,
  record: AttemptRecord,
  makeProblem: ProblemFactory,
): { session: FixedAnswerSession; complete: boolean } {
  if (record === 'none') return { session, complete: false }
  if (session.queue.length === 0) throw new Error('Check has no current slot')

  const answeredCount = session.answeredCount + 1
  const correctCount = session.correctCount + (record === 'correct' ? 1 : 0)
  const complete = answeredCount >= session.totalProblems
  const next = {
    ...session,
    answeredCount,
    correctCount,
  }

  return {
    session: {
      ...next,
      queue: complete
        ? []
        : materializeFixedCurrent(session.queue.slice(1), makeProblem),
    },
    complete,
  }
}

export function recordCheckResult(
  session: CheckSession,
  record: AttemptRecord,
  makeProblem: ProblemFactory,
): { session: CheckSession; complete: boolean } {
  return recordFixedAnswer(session, record, makeProblem)
}
