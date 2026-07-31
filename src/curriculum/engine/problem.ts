import type { Rng } from '../../lib/rng'
import type {
  Answer,
  Choice,
  Difficulty,
  Display,
  Misconception,
  Problem,
  SkillGenerator,
  SolutionStep,
} from '../../lib/types'

/**
 * The parts of a problem a skill actually decides.
 *
 * `skillId`, `inputMode` and `difficulty` were repeated verbatim in all six
 * generators — the id restated two lines below the declaration that already
 * carries it, and the difficulty passed straight through from the argument.
 * Three fields of ceremony per problem is not much on its own; across 201 skills
 * it is three ways to disagree with yourself.
 */
export type ProblemSpec = {
  prompt: string
  display: Display
  answer: Answer
  /** Defaults to the keypad, which is every skill built so far. */
  inputMode?: Problem['inputMode']
  choices?: Choice[]
  misconceptions?: Misconception[]
  hint: string
  solution: SolutionStep[]
}

export type BuildContext = {
  rng: Rng
  difficulty: Difficulty
}

export type SkillConfig = {
  id: string
  name: string
  /** Shown on the skill tree node. Stays under 32 characters or the card truncates. */
  blurb: string
  build(context: BuildContext): ProblemSpec
}

/**
 * Declare a skill once and let the id reach the problem on its own.
 *
 * Deliberately not a class or a base object: a generator stays a plain function
 * of a seeded rng and a difficulty, which is what makes it reproducible and
 * testable without any of this being involved.
 */
export function defineSkill({ id, name, blurb, build }: SkillConfig): SkillGenerator {
  return {
    id,
    name,
    blurb,
    generate(rng, difficulty) {
      const spec = build({ rng, difficulty })
      return {
        ...spec,
        skillId: id,
        inputMode: spec.inputMode ?? 'keypad',
        difficulty,
      }
    },
  }
}
