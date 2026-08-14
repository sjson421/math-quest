/**
 * How an algebraic term is written down.
 *
 * One rule, and it is a notation rule rather than an arithmetic one: a
 * coefficient of one is not written, and a coefficient of minus one is written
 * as a bare sign. `2x`, but `x` and `-x`.
 *
 * Here rather than in a unit file because it arrived in Unit 13 and was rewritten
 * in Unit 14 — the engine's standing rule, the same one `signs.ts` records for
 * `drawn` and `padFor`: a helper moves here when a second skill needs it, so a
 * later unit inherits the decision instead of re-deriving it.
 *
 * The `-1` arm is the half Unit 13 did not need and Unit 14 did, and it is not
 * cosmetic. A predicted mistake is matched against the learner's raw entry by
 * exact string, and the pad has no way to produce `1x` — pressing the variable
 * key yields `x`. `rearrange-formula` shipped a first draft predicting `1x+2`,
 * a diagnosis that could never once have fired.
 *
 * Deliberately not a general expression printer. It writes one term; a sum's
 * separators and its signs belong to the skill that knows what it is building.
 */
export const term = (coefficient: number, variable: string): string =>
  coefficient === 1 ? variable : coefficient === -1 ? `-${variable}` : `${coefficient}${variable}`
