/**
 * The generator engine — what a unit file imports.
 *
 * Everything here was extracted from the six generators in
 * `unit-01-add-sub.ts`, which had written each of these shapes by hand. Nothing
 * here is speculative: a helper arrives when a second skill needs it, so that
 * multiplication and fractions can shape their own rather than inherit
 * something guessed at from addition.
 */

export { columnTrace, digitAt, at, place, requirePlace, stackPlace, stackTrace } from './column'
export type {
  CarryingTrace,
  ColumnOperator,
  ColumnPlace,
  ColumnTrace,
  StackPlace,
  StackTrace,
} from './column'

export {
  DIFFICULTIES,
  SINGLE_DIGIT,
  THREE_DIGIT,
  TWO_DIGIT,
  band,
  ladderProblems,
} from './bands'
export type { Band, Ladder } from './bands'

export { drawOperands, drawPair } from './draw'
export type { DrawOperandsOptions, DrawOptions, Pair } from './draw'

export {
  borrowedWithoutReducing,
  digitConcat,
  flippedColumns,
  forgotCarry,
  misalignedColumns,
  offBy,
  offByOne,
  skippedUpperSubtraction,
  wroteFullColumn,
  wrongOperation,
} from './misconceptions'

export { defineSkill } from './problem'
export type { BuildContext, ProblemSpec, SkillConfig } from './problem'

export {
  CHECK_QUANTITIES,
  applyOperator,
  pickFrame,
  storyMisconceptions,
  storyProblem,
} from './phrasing'
export type { Frame, FrameNudges, Quantities } from './phrasing'
