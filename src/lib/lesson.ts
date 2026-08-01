import type { Difficulty, Problem } from './types'

export type AttemptRecord = 'correct' | 'incorrect' | 'none'

export type LessonPacing = {
  consecutiveMisses: number
  recovering: boolean
}

type ProblemFactory = (difficulty: Difficulty) => Problem

export type LessonSession = {
  targetCorrect: number
  correctCount: number
  baseDifficulty: Difficulty
  pacing: LessonPacing
  queue: Array<Problem | null>
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
  targetCorrect: number,
  baseDifficulty: Difficulty,
  makeProblem: ProblemFactory,
): LessonSession {
  return {
    targetCorrect,
    correctCount: 0,
    baseDifficulty,
    pacing: INITIAL_PACING,
    queue: [
      makeProblem(difficultyForProblem(baseDifficulty, 'opening', false)),
      ...Array.from({ length: targetCorrect - 1 }, () => null),
    ],
  }
}

export function currentProblem(session: LessonSession): Problem {
  const current = session.queue[0]
  if (!current) throw new Error('Lesson has no current problem')
  return current
}

function materializeCurrent(
  session: LessonSession,
  queue: Array<Problem | null>,
  makeProblem: ProblemFactory,
): Array<Problem | null> {
  if (queue.length === 0 || queue[0]) return queue

  const next = [...queue]
  next[0] = makeProblem(
    difficultyForProblem(session.baseDifficulty, 'later', session.pacing.recovering),
  )
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
  if (!missed) throw new Error('Lesson has no missed problem')

  const queue = [...rest]
  queue.splice(Math.min(3, queue.length), 0, missed)
  return { ...session, queue: materializeCurrent(session, queue, makeProblem) }
}
