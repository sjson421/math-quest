import type { Difficulty, Problem, SkillGenerator } from './types'

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
  targetCorrect: number
  correctCount: number
  pacing: LessonPacing
  queue: LessonSlot[]
}

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
): LessonSession {
  if (sources.length === 0) throw new Error('Lesson needs at least one source')

  return {
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
): LessonSession {
  const source = { skill, baseDifficulty }
  return startLessonSession(
    Array.from({ length: targetCorrect }, () => source),
    makeProblem,
  )
}

export function currentSlot(session: LessonSession): LessonSlot {
  const current = session.queue[0]
  if (!current) throw new Error('Lesson has no current slot')
  return current
}

export function currentProblem(session: LessonSession): Problem {
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
