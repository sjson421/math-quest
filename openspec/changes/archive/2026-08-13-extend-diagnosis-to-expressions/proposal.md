## Why

`Misconception.value: number` and the number-only path through `diagnose()` and
`generateProblem()` mean any predicted mistake whose value cannot be represented as a plain
JS `number` is silently dropped before the learner ever sees it, and can never be matched
during diagnosis. Unit 13 (roadmap item 21) needs four walls — `words-to-expression`,
`combine-like-terms`, `distributive`, `distribute-negative` — to answer with an expression
and still carry two distinct surviving predicted misconceptions, as the content contract
requires. Item 22 needs the same generalization for a point answer. Generalizing the
diagnosis path now, decoupled from the expression input mode itself (roadmap item 20b),
unblocks both without mixing a data-model change into a new-capability change.

- Widen `Misconception.value` from `number` to `number | { kind: 'text'; value: string }` so
  a predicted mistake can carry a non-numeric result, while every existing numeric literal
  across the 12 curriculum generator files (140 predictions) keeps compiling unchanged —
  no mechanical migration of existing content.
- Fix `generateProblem()`'s misconception filter/dedup to branch on `typeof m.value`
  instead of assuming `number`: numeric predictions keep today's `Number.isFinite` +
  numeric-`Set` dedup and correct-answer exclusion; text predictions are dropped only when
  blank, and dedup via a separate string `Set`.
- Extend `diagnose()` to compare a text-valued misconception against trimmed `raw` input by
  plain string equality, alongside the existing numeric comparison path. No canonicalization
  or expression-equivalence logic is added — "what counts as the same expression" is
  explicitly item 20b's decision, not this change's.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `problem-generation`: the misconception-filtering and diagnosis requirements currently
  assume `Misconception.value` is numeric (see "A predicted mistake may be negative" and
  "it is filtered only if it equals the correct answer or another prediction"); this change
  generalizes those requirements to also cover non-numeric predicted values.

## Non-goals

- No expression parser, canonical form, or algebraic-equivalence comparison — that is
  roadmap item 20b, ordered later.
- No new input mode, capability flag, or `AVAILABLE_CAPABILITIES` change.
- No curriculum content: no skill ids gain a generator, no manifest edit, no new
  misconception predictions are authored for Unit 13 or item 22 in this change. Those land
  when items 21 and 22 are proposed.
- No change to `Answer`, `checkAnswer`, or how a learner's raw entry is parsed — only the
  misconception-matching side of diagnosis changes.

## Impact

- `src/lib/types.ts` — `Misconception` type definition.
- `src/lib/generator.ts` — `generateProblem()` filter/dedup, `diagnose()` matching.
- `src/lib/generator.test.ts` and any other test constructing a `Misconception` literal or
  asserting on its shape (grep confirms usage is via `.tag`/`.value` in test fixtures across
  `src/curriculum/**/*.test.ts`) — updated to the new discriminated shape.
- No API, dependency, or sync-contract changes; `Misconception` is never persisted (progress
  sync stores only `attempts`/`mastery`/tags via `recordAttempt`, not the misconception
  object itself).
