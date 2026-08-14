/**
 * The generator engine — what a unit file imports.
 *
 * Everything here was extracted from the six generators in
 * `unit-01-add-sub.ts`, which had written each of these shapes by hand. Nothing
 * here is speculative: a helper arrives when a second skill needs it, so that
 * multiplication and fractions can shape their own rather than inherit
 * something guessed at from addition.
 */

export {
  borrowChain,
  columnTrace,
  digitAt,
  digitWidth,
  at,
  place,
  requirePlace,
  stackPlace,
  stackTrace,
} from './column'
export type {
  BorrowChain,
  CarryingTrace,
  ColumnOperator,
  ColumnPlace,
  ColumnTrace,
  StackPlace,
  StackTrace,
} from './column'

export {
  carriedBeforeMultiplying,
  firstPartialOnly,
  forgotMultiplicationCarry,
  missingPlaceholder,
  multiplicationPlace,
  multiplicationTrace,
  partialProductRow,
  partialProductTrace,
} from './multiplication'
export type {
  MultiplicationPlace,
  MultiplicationTrace,
  PartialProductRow,
  PartialProductTrace,
} from './multiplication'

export {
  divisionStep,
  divisionTrace,
  forgotBringDown,
  forgotBringDownValue,
  ignoredStepRemainder,
  ignoredStepRemainderValue,
} from './division'
export type { DivisionStep, DivisionTrace } from './division'

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
  chainStoppedAtLender,
  digitConcat,
  flippedColumns,
  forgotCarry,
  misalignedColumns,
  misalignedValue,
  offBy,
  offByOne,
  skippedUpperSubtraction,
  wroteFullColumn,
  wrongOperation,
} from './misconceptions'

export { drawn, padFor } from './signs'

export { term } from './algebra'

export { defineSkill } from './problem'
export type { BuildContext, ProblemSpec, SkillConfig } from './problem'

export {
  evaluateExpression,
  expressionNotation,
  foldInOrder,
  ignoringParentheses,
  op,
  power,
  renderExpression,
} from './expression'
export type { NumericExpression } from './expression'

export {
  CHECK_QUANTITIES,
  applyOperator,
  countOf,
  fractionStoryProblem,
  pickFrame,
  storyMisconceptions,
  storyProblem,
} from './phrasing'
export type { Frame, FrameNudges, Quantities } from './phrasing'
