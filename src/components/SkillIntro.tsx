import { motion } from 'framer-motion'
import type { Problem, SkillGenerator } from '../lib/types'
import { answerLabel } from '../lib/answer-label'
import { ProblemView } from './ProblemView'
import { SolutionSteps } from './SolutionSteps'

export type SkillIntroMode = 'automatic' | 'review'

/** Read-only teaching screen shared by first presentation and later review. */
export function SkillIntro({
  skill,
  problem,
  mode,
  onLeave,
  onStart,
  onBackToPractice,
}: {
  skill: SkillGenerator
  problem: Problem
  mode: SkillIntroMode
  onLeave: () => void
  onStart?: () => void
  onBackToPractice?: () => void
}) {
  const automatic = mode === 'automatic'
  const title = automatic ? 'Before you practice' : 'Review the intro'
  const answer = answerLabel(problem.answer, problem.choices)

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      // The installed phone is 375px wide. Tighten only its vertical rhythm so
      // a three-step chart intro keeps both actions on screen without shrinking
      // the chart, source text, or teaching line.
      className="flex h-full min-h-0 flex-col overflow-y-auto px-5 py-3 max-[390px]:py-1"
      aria-labelledby="skill-intro-title"
      data-skill-intro={mode}
    >
      <header className="text-center">
        <button
          type="button"
          onClick={onLeave}
          className="absolute left-4 top-3 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-ink-soft active:bg-cream-deep"
          aria-label="Leave lesson"
        >
          ✕
        </button>
        <p className="text-sm font-bold uppercase tracking-wide text-lilac-deep">{title}</p>
        <h1 id="skill-intro-title" className="mt-1 text-2xl font-bold">{skill.name}</h1>
        <p className="mx-auto mt-2 max-w-sm text-base font-semibold leading-snug text-ink-soft" data-teaching-line>
          {skill.teachingLine}
        </p>
      </header>

      <section
        className="mx-auto mt-4 w-full max-w-sm rounded-[1.5rem] bg-white/60 px-4 py-3 shadow-soft max-[390px]:mt-3 max-[390px]:py-2"
        aria-labelledby="worked-example-title"
      >
        <h2 id="worked-example-title" className="text-center text-sm font-bold uppercase tracking-wide text-ink-soft">
          Worked example
        </h2>
        <p className="mt-2 text-center font-semibold text-ink-soft max-[390px]:mt-1" data-example-prompt>
          {problem.prompt}
        </p>
        <div className="mt-3 flex justify-center max-[390px]:mt-2" data-example-display>
          <ProblemView
            display={problem.display}
            entry=""
            entryMode={problem.inputMode}
            readOnly
          />
        </div>

        <div className="mt-3 rounded-2xl bg-mint-soft px-3 py-2 text-center max-[390px]:mt-2" aria-labelledby="correct-answer-label">
          <p id="correct-answer-label" className="text-xs font-bold uppercase tracking-wide text-mint-deep">
            Correct answer
          </p>
          <p className="mt-1 text-xl font-bold" data-correct-answer>{answer}</p>
        </div>

        <h3 className="mt-3 text-center text-sm font-bold text-ink-soft max-[390px]:mt-2">How it works</h3>
        <div data-worked-steps>
          <SolutionSteps solution={problem.solution} />
        </div>
      </section>

      <div className="mx-auto mt-3 flex w-full max-w-sm flex-col gap-2 pb-1 max-[390px]:mt-2 max-[390px]:gap-1 max-[390px]:pb-0">
        {automatic ? (
          <button
            type="button"
            onClick={onStart}
            className="h-12 w-full rounded-2xl bg-mint-deep font-bold text-white active:scale-[0.98] transition-transform"
          >
            Start practice
          </button>
        ) : (
          <button
            type="button"
            onClick={onBackToPractice}
            className="h-12 w-full rounded-2xl bg-mint-deep font-bold text-white active:scale-[0.98] transition-transform"
          >
            Back to practice
          </button>
        )}
        {automatic && (
          <button
            type="button"
            onClick={onLeave}
            className="h-9 w-full rounded-2xl font-semibold text-sm text-ink-soft max-[390px]:h-8"
          >
            Leave
          </button>
        )}
      </div>
    </motion.main>
  )
}
