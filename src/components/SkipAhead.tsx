import { motion } from 'framer-motion'
import { tap } from '../lib/haptics'

export type SkipBlock = {
  kind: 'stage' | 'unit'
  id: string
  name: string
}

export function SkipUnitAction({
  label,
  onActivate,
}: {
  label: string
  onActivate: () => void
}) {
  return (
    <div className="px-5 pb-4">
      <button
        type="button"
        onClick={() => {
          tap()
          onActivate()
        }}
        className="w-full rounded-2xl bg-lilac-soft px-4 py-3 text-left text-sm font-bold text-lilac-deep active:scale-[0.98] transition-transform"
        data-skip-unit-action
      >
        {label}
      </button>
    </div>
  )
}

export function SkipAheadChoice({
  block,
  freshStart,
  onCheck,
  onSkip,
  onBack,
}: {
  block: SkipBlock
  freshStart: boolean
  onCheck: () => void
  onSkip: () => void
  onBack: () => void
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center"
      aria-labelledby="skip-choice-title"
      data-skip-choice
    >
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-lilac-deep">
          Optional starting point
        </p>
        <h1 id="skip-choice-title" className="mt-1 text-3xl font-bold">
          Already know {block.name}?
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-soft">
          Check a few problems first, or move ahead when you are ready.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            tap()
            onCheck()
          }}
          className="h-14 w-full rounded-2xl bg-mint-deep font-bold text-lg text-white active:scale-[0.98] transition-transform"
        >
          Check first
          <span className="ml-2 text-sm font-semibold opacity-80">Suggested</span>
        </button>
        <button
          type="button"
          onClick={() => {
            tap()
            onSkip()
          }}
          className="h-14 w-full rounded-2xl bg-white font-bold text-lg text-ink shadow-soft active:scale-[0.98] transition-transform"
        >
          Just skip it
        </button>
        <button
          type="button"
          onClick={() => {
            tap()
            onBack()
          }}
          className="h-10 w-full rounded-2xl text-sm font-semibold text-ink-soft"
        >
          {freshStart ? 'Start practice' : 'Back'}
        </button>
      </div>
    </motion.main>
  )
}

export function SkipAheadResult({
  block,
  correct,
  passed,
  frontierName,
  onContinue,
}: {
  block: SkipBlock
  correct: number
  passed: boolean
  frontierName?: string
  onContinue: () => void
}) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center"
      aria-labelledby="skip-result-title"
      data-skip-result={passed ? 'passed' : 'practice'}
    >
      <div>
        <p className="text-5xl" aria-hidden="true">
          {passed ? '🌟' : '🧭'}
        </p>
        <h1 id="skip-result-title" className="mt-3 text-3xl font-bold">
          {passed ? 'Ready for what comes next' : 'Let’s build from here'}
        </h1>
        <p className="mt-2 text-ink-soft">
          {passed
            ? `${block.name} is marked as known.`
            : 'A little practice will help you get ready.'}
        </p>
        <p className="mt-1 text-sm font-semibold text-ink-soft">{correct}/8 correct</p>
      </div>

      <button
        type="button"
        onClick={() => {
          tap()
          onContinue()
        }}
        className="h-14 w-full max-w-xs rounded-2xl bg-mint-deep font-bold text-lg text-white active:scale-[0.98] transition-transform"
      >
        {passed ? 'Continue' : frontierName ? `Practice ${frontierName}` : 'Continue'}
      </button>
    </motion.main>
  )
}

/**
 * The quiet offer to warm a unit up, from `warmUpSuggestion()`.
 *
 * Framed as a warm-up rather than a correction: the learner declared they knew
 * this block, and the app has evidence they are struggling — which is worth
 * saying, and not worth saying as failure, penalty, or lost progress.
 *
 * One action, and it only opens the unit. Taking a skip back lowers a mastery
 * level, so it keeps the deliberate, labelled control it already has there.
 */
export function WarmUpOffer({
  unitName,
  skillName,
  onActivate,
}: {
  unitName: string
  skillName?: string
  onActivate: () => void
}) {
  return (
    <button
      type="button"
      onClick={() => {
        tap()
        onActivate()
      }}
      className="mx-5 mb-5 flex items-center justify-between gap-3 rounded-blob bg-white p-4 text-left shadow-soft active:scale-[0.98] transition-transform"
      data-warm-up-offer
    >
      <span className="min-w-0">
        <span className="block font-bold text-lg">Warm up {unitName}?</span>
        <span className="block text-sm text-ink-soft">
          {skillName
            ? `A few problems here would help with ${skillName}.`
            : 'A few problems here would help it stick.'}
        </span>
      </span>
      <span className="shrink-0 text-2xl text-lilac-deep" aria-hidden="true">
        ›
      </span>
    </button>
  )
}
