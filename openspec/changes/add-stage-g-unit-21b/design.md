## Context

See proposal.md — Why. Unit 21's module, its statistics source records, its verification path,
and its snapshot gate all exist from increment 21a. The constraints that shape this increment:

- `StatisticsData` is a closed union read by four exhaustive switches that fail closed on an
  unhandled arm — `statisticsLearnerText` in `src/lib/content-rules.ts`, `formatStatisticsData`
  in `src/curriculum/recorded-output.ts`, and `expectedStatisticsList` plus
  `statisticsSourceValues` in `src/curriculum/generators.test.ts`, with a fifth touchpoint in
  that file's story-magnitude branch.
- `expectedStatisticsList` returns a `number` and routes every list arm through
  `wholeStatisticsAnswer`, which explicitly rejects `requireFraction`. A probability answer
  cannot travel that path.
- Fraction entry is a per-problem `keypad: { allowFraction: true }` declaration, built since
  item 3. Nothing new is needed to type `3/8`.
- `requireFraction` and its `not-fraction` response already exist and are already tested: the
  response records a miss and re-queues without revealing the solution. The pad has one adaptive
  cell and spends it on the slash, so that response is unreachable from the app here and the
  form check is a contract on the answer rather than a screen a learner meets.

## Goals / Non-Goals

**Goals:**

- Settle the answer-form question once for the unit, in the mechanism the repository already
  has, rather than inventing a fourth form check.
- Keep every probability answer recoverable from typed counts, so verification never parses
  generated prose or trusts the stated answer.
- Give the compound wall predictions that cannot collide, by construction rather than by luck
  of the draw.

**Non-Goals:**

- Any change to `checkAnswer`, the keypad, the story display, or the intro renderer. This is
  content work on built infrastructure; the only shared-code edits are new arms on a closed
  union and the switches that must handle them.
- A new `requirePercent` check. Adding a form mechanism is capability work and belongs in its
  own change, if a later unit ever needs it.

## Decisions

### A probability answers as a fraction, form-checked, not reduction-checked

`requireFraction: true`, no `requireSimplified`.

The roadmap left three notations open. Decimal was rejected because requiring one restricts
denominators to 2, 4, 5, 8, 10, and 20 — every bag, spinner, and deck would be sized to serve
the notation rather than the situation, and `1/3` would be unaskable. Percent was rejected
because no `requirePercent` check exists, adding one is capability work outside a content
increment, and it inherits the same restriction. Choice input was rejected because a
probability is exactly computable, so choices would give up the exact misconception diagnosis
that free response provides here.

The pad has one adaptive cell and gives it to the slash whenever fraction entry is allowed, so
a decimal cannot be typed on these problems and `not-fraction` is unreachable from the app.
`write-ratio` already ships in exactly that position: the declaration states the answer's
written form, keeps the recorded output honest, and is proved against `checkAnswer` directly.
Widening the pad is keypad work and a non-goal here.

Reduction is deliberately not required. The governing precedent is `write-ratio`, whose helper
is `exactRatio(numerator, denominator, requireSimplified = false)`: a written ratio of counts
requires the notation, and only `simplify-ratio` — the skill that teaches reduction — opts into
the reduction. A probability is a ratio of counts, so it takes the same shape. Requiring
simplest form here would turn a probability miss into a Unit 7 miss.

### Probability arms extend `StatisticsData` rather than starting a new payload type

Unit 21 is one unit with one display arm, and the story arm already accepts `statistics`. Three
new arms — a single event, a compound pair with its cue, and an ordered list of stage counts —
keep one closed union for the whole unit and make those four exhaustive switches, and the
story-magnitude branch beside them, the enforcement mechanism for the new arms too. A parallel
`ProbabilityData` would add a second payload and a second set of switch obligations for no
behavioural gain.

### Probability recompute is a separate branch, not an extension of the list path

`expectedStatisticsList` returns `number` and asserts a whole-number answer with no form flags.
The probability arms need a branch that returns the fraction's value and asserts
`requireFraction` where the arm requires it. `recompute` already returns `number | string` and
`answerValue` reduces an exact answer through `toNumber(rational(n, d))`, so a branch returning
`favourable / total` compares equal even when the derivation is unreduced — the same comparison
`expectedRatioDisplay` already relies on. The counting arm keeps the whole-number assertion.

### The generator constrains the draw so predictions cannot collide

Every predicted value equal to the answer is dropped centrally, and predictions are deduplicated
by value, so a wall's surviving count is decided by the draw and not by the source. Each
generator therefore rejects a draw rather than emitting a prediction that would vanish.

Predicted misconceptions:

- `basic-probability` — favourable over *remaining* rather than over the total: `3/5` where the
  answer is `3/8`. The two are equal only when the favourable count is 0, and the remaining
  count is 0 only when every outcome is favourable, so the strict `0 < P < 1` bound below
  already makes this prediction both defined and distinct.
- `compound-probability`, the wall — applying the other cue's operation (adding an `and`, or
  multiplying an `or`), and combining the two events by adding numerators and denominators.
  Both are the classic errors for the only cue the problem gives. A draw is rejected unless the
  answer and both predictions are three distinct values.
- `counting-outcomes` — the sum of the stage counts where the principle multiplies. With every
  stage at two or more choices, the product exceeds the sum on every draw except two stages of
  two, where both are 4; the generator rejects that one draw.

### Every probability stays strictly between 0 and 1

A probability of 0 or 1 reduces to a whole number, which makes `requireFraction` ask for a
notation the answer does not have, and it is a weak practice item either way. The constraint
binds the `or` sum too, where two exclusive events could otherwise exhaust the outcome set.

### Stage G declares `fraction-input`

`requires` is the full set a stage's skills need, read off the stage rather than assembled from
earlier ones. Stage G's two probability skills type fractions, so the stage declares
`fraction-input`. It is already in `AVAILABLE_CAPABILITIES`, so the declaration flips nothing
off and no skill's resolved state changes. Stage E made the same move for `choice-input`, but
late: `identify-like-terms` answered through it from 13a and the stage declared it only in 14b,
as a correction. Declaring it here with its first consumer is that correction taken on time.

## Risks / Trade-offs

- Float comparison in verification → both sides are computed as one division of small integers,
  and `answerValue` divides the reduced rational, so an unreduced derivation and its reduced
  answer round to the same double. The existing ratio path already depends on this.
- A wall draw that silently loses a prediction → the generator rejects the draw instead of
  emitting it, and the spec requires both predictions to survive on every generated problem, so
  the content gate fails rather than a learner seeing a wall with one diagnosis.
- Learners who think in percent type `50` and see a plain miss → the value is genuinely wrong,
  not a form error, so the form check cannot catch it. Whether to predict the percent-shaped
  entry on draws whose percent is a whole number is left to implementation as an optional
  third prediction; it changes no requirement either way.
- Adding `fraction-input` to Stage G touches a pinned manifest assertion and the capability
  coverage test → both are updated with the manifest, and the coverage test proves no skill's
  resolved state changed.
