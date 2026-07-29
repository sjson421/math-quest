export type Difficulty = 1 | 2 | 3 | 4 | 5

export type Answer =
  /** Exact rational match — covers integers and fractions alike. */
  | { kind: 'exact'; n: number; d: number; requireSimplified?: boolean }
  /** Numeric match within a tolerance, for irrational or rounded results. */
  | { kind: 'approx'; value: number; tolerance: number }
  /** Multiple choice. */
  | { kind: 'choice'; id: string }

export type Choice = {
  id: string
  label: string
}

/**
 * A specific wrong answer this problem is likely to attract, and why.
 *
 * Because generators know every intermediate value, they can predict the exact
 * number a learner lands on when they make a particular mistake. When a typed
 * answer matches one, we can respond to the actual error ("it looks like you
 * forgot to carry the 1") instead of a bare "incorrect" — which is the whole
 * diagnostic benefit of multiple choice, without giving up free response.
 */
export type Misconception = {
  /** The wrong value this mistake produces. */
  value: number
  /** Stable tag for tracking recurring errors across sessions. */
  tag: string
  /** Shown to the learner. Warm, specific, never scolding. */
  nudge: string
}

export type SolutionStep = {
  text: string
  /** Optional working shown beneath the step, e.g. "7 + 5 = 12". */
  detail?: string
}

/** How the problem is presented. Column layout matches how arithmetic is taught. */
export type Display =
  | { kind: 'inline'; text: string }
  | { kind: 'column'; operands: number[]; operator: '+' | '−' | '×' | '÷' }

export type Problem = {
  skillId: string
  /** Short instruction, e.g. "What is the sum?" */
  prompt: string
  display: Display
  answer: Answer
  inputMode: 'keypad' | 'choice'
  choices?: Choice[]
  misconceptions?: Misconception[]
  hint: string
  /** Worked steps, generated procedurally from the actual operands. */
  solution: SolutionStep[]
  difficulty: Difficulty
}

export type SkillGenerator = {
  id: string
  name: string
  /** Shown on the skill tree node. */
  blurb: string
  /** Skills that must reach mastery >= 2 before this one unlocks. */
  prerequisites: string[]
  generate(rng: import('./rng').Rng, difficulty: Difficulty): Problem
}

export type Unit = {
  id: string
  name: string
  /** Palette key used to colour this unit's nodes on the skill tree. */
  color: 'blossom' | 'lilac' | 'mint' | 'butter' | 'powder'
  skills: SkillGenerator[]
}
