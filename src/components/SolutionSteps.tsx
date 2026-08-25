import type { SolutionStep } from '../lib/types'

/** Shared numbered working for feedback and read-only worked examples. */
export function SolutionSteps({ solution }: { solution: readonly SolutionStep[] }) {
  return (
    <ol className="space-y-2 mb-4">
      {solution.map((step, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="shrink-0 w-6 h-6 rounded-full bg-butter-deep/30 text-xs font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <span>
            <span className="block">{step.text}</span>
            {step.detail && (
              <span className="block font-bold tabular-nums text-ink">{step.detail}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  )
}
