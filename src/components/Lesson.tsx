import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import { skillById } from '../curriculum/manifest'
import { checkAnswer, type CheckResult } from '../lib/answer'
import { completionAction, type CompletionView } from '../lib/checkpoint'
import { visibleEntry } from '../lib/entry'
import { diagnose, generateProblem } from '../lib/generator'
import { celebrate, tap } from '../lib/haptics'
import {
  advanceCorrect,
  currentProblem,
  lessonTarget,
  recordSessionAttempt,
  requeueMiss,
  startLessonSession,
  type LessonSession,
} from '../lib/lesson'
import { createSubmissionGate } from '../lib/submission-gate'
import { feedbackText, responseTo } from '../lib/submit'
import type { Difficulty, Misconception, Problem, SkillGenerator } from '../lib/types'
import { difficultyFor, useProgress, type LessonOutcome } from '../store/progress'
import { ChoiceInput } from './ChoiceInput'
import { CoordinatePlaneInput } from './CoordinatePlaneInput'
import { ExpressionKeypad } from './ExpressionKeypad'
import { Keypad } from './Keypad'
import { Mascot, type MascotState } from './Mascot'
import { NumberLineInput } from './NumberLineInput'
import { ProblemView } from './ProblemView'
import { RootPairInput } from './RootPairInput'
import { StageCheckpoint } from './StageCheckpoint'
import { SolutionSteps } from './SolutionSteps'
import { SkillIntro, type SkillIntroMode } from './SkillIntro'

/**
 * What is on screen between submitting an answer and moving on, or `null` while
 * the learner is still typing.
 *
 * Holds the check result rather than a screen name, so `responseTo` stays the
 * one place that decides what each result means.
 */
type Feedback = { status: CheckResult['status']; misconception?: Misconception } | null

/**
 * The lesson loop.
 *
 * A lesson ends after its manifest-selected correct target, with no hearts or
 * lives. A missed problem is pushed back into the lazy queue, so the session
 * cannot finish without eventually getting it right.
 */
export function Lesson({ skill, onExit }: { skill: SkillGenerator; onExit: () => void }) {
  const progress = useProgress((s) => s.progress)
  const recordAttempt = useProgress((s) => s.recordAttempt)
  const markIntroSeen = useProgress((s) => s.markIntroSeen)
  const completeLesson = useProgress((s) => s.completeLesson)

  const baseDifficulty = difficultyFor(progress.skills[skill.id]?.mastery ?? 0)
  const targetCorrect = lessonTarget(skillById.get(skill.id)?.quick)
  const introNeeded = skill.teachingLine !== undefined && progress.skills[skill.id]?.introSeen !== true

  // Seed from mount time so each lesson is a fresh set, but stays reproducible
  // within the session.
  const seedBase = useRef(Math.floor(Math.random() * 1_000_000)).current
  const nextSeed = useRef(0)

  const makeProblem = useCallback(
    (difficulty: Difficulty) =>
      generateProblem(skill, seedBase + nextSeed.current++ * 7919, difficulty),
    [skill, seedBase],
  )

  const [introMode, setIntroMode] = useState<SkillIntroMode | null>(() =>
    introNeeded ? 'automatic' : null,
  )
  const [introProblem, setIntroProblem] = useState<Problem | null>(() =>
    introNeeded ? generateProblem(skill, 1, 1) : null,
  )
  const [session, setSession] = useState<LessonSession | null>(() =>
    introNeeded ? null : startLessonSession(targetCorrect, baseDifficulty, makeProblem),
  )
  const [entry, setEntry] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [showHint, setShowHint] = useState(false)
  const [finished, setFinished] = useState<LessonOutcome | null>(null)
  const [submissionGate] = useState(createSubmissionGate)

  const response = feedback && responseTo[feedback.status]
  const feedbackCopy = feedback
    ? feedbackText(feedback.status, feedback.misconception?.nudge)
    : undefined

  /**
   * The entry survives, so the pad stays up rather than a panel taking over —
   * this was not an answer, just a number that is not finished.
   *
   * Read off the policy rather than naming a status, so `submit.ts` stays the
   * only place that decides which results behave this way.
   */
  const unfinished = response?.keepsEntry === true

  if (finished) {
    return <LessonComplete skill={skill} outcome={finished} onExit={onExit} />
  }

  const startPractice = () => {
    if (introMode !== 'automatic') return
    markIntroSeen(skill.id)
    setSession(startLessonSession(targetCorrect, baseDifficulty, makeProblem))
    setIntroMode(null)
  }

  const reviewIntro = () => {
    if (!skill.teachingLine || feedback) return
    if (!introProblem) setIntroProblem(generateProblem(skill, 1, 1))
    setIntroMode('review')
  }

  if (introMode && introProblem) {
    return (
      <SkillIntro
        skill={skill}
        problem={introProblem}
        mode={introMode}
        onLeave={onExit}
        onStart={startPractice}
        onBackToPractice={() => setIntroMode(null)}
      />
    )
  }

  if (!session) throw new Error('Lesson has no intro or session')

  const problem = currentProblem(session)
  const mascotState: MascotState =
    feedback?.status === 'correct'
      ? 'happy'
      : feedback && !unfinished
        ? 'encouraging'
        : 'thinking'

  const submit = (answerEntry = entry) => {
    // An unfinished entry left the pad up, so Check is still live — pressing it
    // again should re-answer rather than sit dead until a key is tapped.
    if ((feedback && !unfinished) || !problem) return
    if (!submissionGate.tryAcquire()) return

    const { status } = checkAnswer(problem.answer, answerEntry)
    const policy = responseTo[status]
    // Only a wrong value has a predicted mistake behind it. A right value in the
    // wrong form is not a miscalculation, so there is nothing to name.
    const misconception =
      status === 'incorrect' ? diagnose(problem, answerEntry) : undefined

    const nextSession = recordSessionAttempt(session, policy.record)
    if (policy.record !== 'none') {
      setSession(nextSession)
      recordAttempt(skill.id, policy.record === 'correct', misconception?.tag)
    } else {
      submissionGate.release()
    }

    if (policy.advances) {
      celebrate()
      setFeedback({ status })

      window.setTimeout(() => {
        setEntry('')
        setShowHint(false)
        setFeedback(null)

        const transition = advanceCorrect(nextSession, makeProblem)
        setSession(transition.session)
        if (transition.complete) {
          const outcome = completeLesson(skill.id)
          setFinished(outcome)
        }
        submissionGate.release()
      }, 750)
      return
    }

    tap()
    setFeedback({ status, misconception })
  }

  const dismiss = () => {
    if (!response) return
    submissionGate.release()
    setFeedback(null)
    if (!response.keepsEntry) setEntry('')
    if (!response.requeues) return

    setShowHint(false)
    setSession(requeueMiss(session, makeProblem))
  }

  /**
   * The control this problem is answered with.
   *
   * Exhaustive rather than a two-way branch with the pad as the fall-through.
   * The union widened silently when number-line input was added — nothing
   * failed to compile, the new mode simply drew a keypad — so the next mode
   * gets a compile error here instead of a plausible wrong control.
   */
  const answerControl = () => {
    switch (problem.inputMode) {
      case 'choice':
        return (
          <ChoiceInput
            choices={problem.choices ?? []}
            onChoose={(id) => {
              setEntry(id)
              submit(id)
            }}
          />
        )

      case 'number-line':
        // A tap only places; `submit` runs on confirm, so the placement goes
        // through the same gate, recording and re-queue as a typed answer, and
        // a slip costs nothing until the learner says it is their answer.
        return problem.numberLine ? (
          <NumberLineInput
            spec={problem.numberLine}
            entry={entry}
            onPlace={setEntry}
            onConfirm={() => submit()}
          />
        ) : null

      case 'keypad':
        return (
          <>
            {/* Not a wrong answer — the number simply is not finished. Say so and
                leave everything as it is, rather than spending an attempt on it. */}
            {unfinished && (
              <p className="text-center text-ink-soft text-sm pb-2">
                That number is not finished yet.
              </p>
            )}
            <Keypad
              value={entry}
              onEntry={(apply) => {
                if (unfinished) dismiss()
                setEntry(apply)
              }}
              onSubmit={submit}
              rules={problem.keypad}
            />
          </>
        )

      case 'expression':
        return problem.answer.kind === 'expression' ? (
          <ExpressionKeypad
            value={entry}
            variable={problem.answer.variable}
            maxDegree={problem.answer.maxDegree}
            onEntry={(apply) => setEntry(apply)}
            onSubmit={submit}
          />
        ) : null

      case 'coordinate-plane':
        // The interactive graph occupies the problem surface itself so the
        // learner sees one plane, not a passive display plus a second control.
        return null

      case 'root-pair':
        return (
          <>
            {unfinished && (
              <p className="text-center text-ink-soft text-sm pb-2">
                Both roots need a complete number.
              </p>
            )}
            <RootPairInput
              entry={entry}
              onEntry={(apply) => {
                if (unfinished) dismiss()
                setEntry(apply)
              }}
              onConfirm={() => submit()}
              rules={problem.keypad}
              disabled={feedback !== null && !unfinished}
            />
          </>
        )

      default: {
        const unhandled: never = problem.inputMode
        throw new Error(`Unhandled input mode: ${String(unhandled)}`)
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 pt-3 pb-2">
        <button
          onClick={onExit}
          className="text-2xl text-ink-soft w-9 h-9 rounded-full flex items-center justify-center active:bg-cream-deep"
          aria-label="Leave lesson"
        >
          ✕
        </button>
        <div className="flex-1 h-4 rounded-full bg-cream-deep overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-mint-deep"
            animate={{ width: `${(session.correctCount / session.targetCorrect) * 100}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          />
        </div>
        <span className="text-sm font-bold text-ink-soft tabular-nums w-12 text-right">
          {session.correctCount}/{session.targetCorrect}
        </span>
        {skill.teachingLine && !feedback && (
          <button
            type="button"
            onClick={reviewIntro}
            className="whitespace-nowrap text-xs font-bold text-lilac-deep"
          >
            Review intro
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5 min-h-0">
        <div className="flex items-center gap-2">
          <Mascot
            state={mascotState}
            size={92}
            character={progress.character}
            equipped={progress.equipped}
          />
          <p className="text-lg font-semibold text-ink-soft max-w-[11rem]">{problem.prompt}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${problem.display.kind}-${JSON.stringify(problem.display)}-${session.correctCount}`}
            initial={{ opacity: 0, x: 40 }}
            animate={
              feedback?.status === 'incorrect'
                ? { opacity: 1, x: [0, -9, 9, -6, 0] }
                : { opacity: 1, x: 0 }
            }
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: feedback?.status === 'incorrect' ? 0.36 : 0.22 }}
          >
            {problem.inputMode === 'coordinate-plane' &&
            problem.display.kind === 'coordinate-plane' ? (
              <CoordinatePlaneInput
                plane={problem.display.plane}
                coordinate={problem.display.coordinate}
                entry={entry}
                onPlace={setEntry}
                onConfirm={() => submit()}
                disabled={feedback !== null}
              />
            ) : (
              <ProblemView
                display={problem.display}
                entry={visibleEntry(problem, entry)}
                entryMode={problem.inputMode}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showHint && !feedback && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-ink-soft bg-butter-soft rounded-2xl px-4 py-2.5 max-w-sm"
            >
              {problem.hint}
            </motion.p>
          )}
        </AnimatePresence>

        {!showHint && !feedback && (
          <button
            onClick={() => {
              tap()
              setShowHint(true)
            }}
            className="text-sm font-semibold text-lilac-deep underline underline-offset-4"
          >
            Show me a hint
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {feedback?.status === 'correct' ? (
          <motion.div
            key="correct"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            className="bg-mint rounded-t-[2rem] px-5 py-7 text-center"
          >
            <p className="text-2xl font-bold">Yes! Nice work.</p>
          </motion.div>
        ) : feedback && response && !unfinished ? (
          <motion.div
            key="feedback"
            initial={{ y: 220 }}
            animate={{ y: 0 }}
            exit={{ y: 220 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="bg-butter-soft rounded-t-[2rem] px-5 pt-5 pb-6 shadow-[0_-4px_20px_rgba(180,140,165,0.18)]"
          >
            {feedbackCopy && (
              <>
                <p className="font-bold text-lg mb-1">{feedbackCopy.title}</p>
                <p className="text-ink-soft mb-3">{feedbackCopy.body}</p>
              </>
            )}

            {/* Withheld for a right value in the wrong form: the arithmetic was
                already done, and handing it back removes the step still to take. */}
            {response.showsSolution && (
              <SolutionSteps solution={problem.solution} />
            )}

            <button
              onClick={dismiss}
              className="w-full h-14 rounded-2xl bg-ink text-cream font-bold text-lg active:scale-[0.98] transition-transform"
            >
              Got it
            </button>
          </motion.div>
        ) : (
          <motion.div key={problem.inputMode} exit={{ opacity: 0 }}>
            {answerControl()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LessonComplete({
  skill,
  outcome,
  onExit,
}: {
  skill: SkillGenerator
  outcome: LessonOutcome
  onExit: () => void
}) {
  const mastery = useProgress((s) => s.progress.skills[skill.id]?.mastery ?? 0)
  const character = useProgress((s) => s.progress.character)
  const equipped = useProgress((s) => s.progress.equipped)
  const [view, setView] = useState<CompletionView>('lesson-result')

  const continueCompletion = () => {
    if (completionAction(view, Boolean(outcome.checkpoint)) === 'exit') {
      onExit()
      return
    }

    celebrate()
    setView('stage-checkpoint')
  }

  if (view === 'stage-checkpoint' && outcome.checkpoint) {
    return (
      <StageCheckpoint
        checkpoint={outcome.checkpoint}
        onContinue={continueCompletion}
        character={character}
        equipped={equipped}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center"
    >
      <Confetti />
      <Mascot state="celebrating" size={190} character={character} equipped={equipped} />

      <div>
        <h2 className="text-3xl font-bold">Lesson complete!</h2>
        <p className="text-ink-soft mt-1">
          {skill.name} — level {mastery}
        </p>
      </div>

      <div className="flex gap-3">
        <Reward icon="✦" label={`+${outcome.xpGained} XP`} tone="bg-lilac-soft" />
        <Reward icon="🪙" label={`+${outcome.coinsGained}`} tone="bg-butter-soft" />
      </div>

      <button
        onClick={continueCompletion}
        className="mt-2 w-full max-w-xs h-14 rounded-2xl bg-mint-deep text-white font-bold text-lg active:scale-[0.98] transition-transform"
      >
        Continue
      </button>
    </motion.div>
  )
}

function Reward({ icon, label, tone }: { icon: string; label: string; tone: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
      className={`${tone} rounded-2xl px-5 py-3 font-bold text-lg flex items-center gap-2`}
    >
      <span>{icon}</span>
      {label}
    </motion.div>
  )
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#ffb3c9', '#cbb6f0', '#a8e6cf', '#ffe5a3', '#a8d8f0'][i % 5],
        rotate: Math.random() * 360,
      })),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute w-2.5 h-3.5 rounded-[2px]"
          style={{ left: `${p.x}%`, top: -20, background: p.color }}
          initial={{ y: -20, rotate: p.rotate, opacity: 1 }}
          animate={{ y: '105vh', rotate: p.rotate + 420, opacity: [1, 1, 0] }}
          transition={{ duration: 2.4 + Math.random(), delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
