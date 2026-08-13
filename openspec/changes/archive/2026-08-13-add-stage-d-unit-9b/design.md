## Context

See `proposal.md` — Why, and the three delta specs for requirements. 9a introduced
`DecimalValue` (coefficient + scale) and `DecimalData` (a closed union over `digit`, `read`,
`compare`, `round`, `add`, `sub`) in `src/lib/types.ts:121-139`, plus the
`decimal-column`/`inline` display arms that render them. This increment extends that union
for multiplication and division, and separately extends the unrelated `Answer`/`CheckResult`
surface in `src/lib/answer.ts` and `src/lib/submit.ts` for required-form conversion.

These are two independent pieces of work — one content (five generators reusing 9a's
decimal machinery, one word-problem frame bank), one small capability-adjacent extension to
answer checking (two flags two skills need) — and the roadmap explicitly calls for keeping
them separate.

## Goals / Non-Goals

**Goals:**

- Extend `DecimalData` for multiplication and division without touching 9a's five arms.
- Add `requireDecimal`/`requireFraction` as siblings of `requireSimplified`/`requireMixed`,
  reusing the same `ParsedInput.wasFraction` signal `requireSimplified` already checks,
  rather than adding new parsing.
- Keep every new `CheckResult` status exhaustively handled at compile time, matching
  `requireMixed`'s precedent in `submit.ts`.
- Guarantee exact (terminating, non-repeating) decimal division results by construction.

**Non-Goals:**

- A general `Answer`-kind redesign (see proposal Non-goals).
- Thousandths, arbitrary precision, or currency-formatted display — `money-problems` carries
  exact integer-cent quantities through the existing `story` display and decimal keypad.
- A shared cross-skill decimal verifier module; 9a established that per-generator tests
  reconstruct expected values independently, and this increment follows the same pattern.

## Decisions

### Multiplication and division extend `DecimalData` with two new operation arms

Add `{ operation: 'mult'; left: DecimalValue; right: DecimalValue }` to the union in
`src/lib/types.ts`. `mult-decimals` reuses the existing `decimal-column` display (product
alignment reads the same as sum alignment).

`decimal-to-fraction` needs a `{ operation: 'display'; value: DecimalValue }` arm too: its
inline display just shows a plain decimal (`0.75`), which is neither `'read'` (that operation
is paired, in `ProblemView`, with a wrapped word-prose layout only `read-decimals` wants) nor
expressible as a bare `inline` display with no `decimal` field (the independent verifier's
generic expression evaluator cannot parse a lone decimal like `"0.75"` — it evaluates
arithmetic expressions, not standalone numbers). `'display'` carries only what the digits
already show, so `recorded-output.ts` and the test verifier reconstruct it trivially.

Division needs two arms, not one: `{ operation: 'div-whole'; dividend: DecimalValue; divisor:
number }` for `div-decimal-by-whole`, and `{ operation: 'div-decimal'; dividend: DecimalValue;
divisor: DecimalValue }` for `div-by-decimal`. `DecimalValue`'s `scale` is `1 | 2` — it always
implies a decimal point at tenths or hundredths — so a whole-number divisor (e.g. `4`) cannot
be expressed as a `DecimalValue` at all; a single shared `div` arm typed with `DecimalValue`
on both sides would make `div-decimal-by-whole` unrepresentable. Both division skills use the
existing `inline` display (a division problem reads as an expression, not a stack); `inline`'s
`decimal?: DecimalData` field is read only by `recorded-output.ts` and by generator tests, not
by `ProblemView`'s layout, so the two-arm split has no rendering consequence.

`DecimalArithmeticData` (`types.ts:139`, currently `Extract<DecimalData, { operation: 'add' |
'sub' }>`) — the type `decimal-column`'s `Display` arm is declared over — must widen to
`'add' | 'sub' | 'mult'` for `mult-decimals` to type-check against that display kind.
`decimalColumnText` (`src/lib/decimal.ts:28`) reads only `.left`/`.right` and needs no change
once the type is widened.

`formatAnswer` and any other exhaustive switch over `DecimalData['operation']` (currently only
`recorded-output.ts`) gains two arms; TypeScript's `never` check makes a missed arm a compile
error, the same mechanism 9a relied on.

Alternative rejected: represent multiplication as two `add` operations or division as a
`sub`-based derivation. Neither reflects what the display needs to show and both obscure the
per-operation misconception each skill predicts.

### Division draws are constructed for an exact quotient, not filtered for one

Following Unit 4's `drawInexact`-adjacent pattern (`src/curriculum/unit-04-division.ts:74`),
each division draw picks a quotient and a divisor first, then multiplies to get the dividend —
so the quotient is exact by construction rather than by rejecting draws that do not divide
evenly. `div-decimal-by-whole` draws a decimal quotient and whole divisor; `div-by-decimal`
draws a decimal quotient and decimal divisor, and predicts the mistake of shifting only the
divisor's point (i.e., dividing by the divisor's coefficient without scaling the dividend).

Alternative rejected: draw arbitrary decimal pairs and reject non-terminating quotients by
resampling. Construction is deterministic and cheap; rejection sampling risks a low
acceptance rate at the boundary between scale-1 and scale-2 divisors and adds a retry loop
9a's arithmetic helpers do not need elsewhere.

### `requireDecimal`/`requireFraction` extend the existing form-gating mechanism

Add two optional booleans to the `exact` `Answer` arm in `src/lib/types.ts`, checked in
`checkAnswer` (`src/lib/answer.ts:79-118`) against `parsed.wasFraction` — the same signal
`requireSimplified` already gates on (`answer.ts:113`): `requireDecimal` fails when
`parsed.wasFraction` is true, `requireFraction` fails when it is false. (`requireMixed` is a
different precedent: it gates on `parsed.wasMixed`/`mixedWhole`/`rawNum`/`rawDen`, not
`wasFraction` — the two new flags follow `requireSimplified`'s check, not `requireMixed`'s.)
Two new `CheckResult` statuses
(`not-decimal`, `not-fraction`) join the existing union (`answer.ts:70-77`), and
`submit.ts`'s `feedbackText` switch and `responseTo` `Record` (`submit.ts:34-124`) both gain
the two branches — both already fail to compile on a missing status, so a fifth or sixth
status can only ship handled everywhere.

`fraction-to-decimal` sets `requireDecimal: true`; `decimal-to-fraction` sets
`requireFraction: true`. Neither skill sets `requireSimplified` or `requireMixed` — those two
pairs of flags address orthogonal questions (notation vs. reduction/mixedness) and nothing in
this increment needs both on one answer.

Both skills' `keypad` declares **both** `allowDecimal` and `allowFraction`, not only the form
being taught. The answer-entry baseline spec's "what the pad shows and what entry accepts are
one rule" means a key the pad withholds is a key `applyKey` also refuses (`src/lib/keypad.ts`)
— if `fraction-to-decimal` withheld the fraction slash, the learner could not retype the given
fraction even if they tried, and `requireDecimal`'s rejection would never fire in practice.
`improper-to-mixed`'s `keypad: { allowMixed: true }` is the existing precedent: `allowMixed`
implies the slash specifically so the improper form stays enterable for `requireMixed` to
reject.

Alternative rejected (from Phase 2 exploration): a broader `Answer`-kind split into
`exact-decimal`/`exact-fraction`. Two boolean flags are consistent with the existing
mechanism, touch fewer call sites, and the roadmap's "same care item 3 took" is about
exhaustiveness discipline, not about the shape of the flag.

### Money problems carry integer cents through the existing story engine, not `DecimalValue`

`money-problems` must use the `story` display kind (`types.ts:265`) — the only `Display` arm
that carries prose — whose `operands` field is plain `number[]`, and the shared frame-bank
engine (`src/curriculum/engine/phrasing.ts`, `applyOperator`/`storyMisconceptions`) computes
results with ordinary JS arithmetic over those operands, not `DecimalValue`. `decimal-column`
and `inline`-with-`DecimalData` are not options here: neither carries prose.

Rather than introduce a decimal-aware story variant, `money-problems` frames carry their
dollar amounts as **integer cents** — `$12.50` is the operand `1250` — through the existing
`operands: number[]` story shape unchanged. Integer cents are exact under `×` (JS numbers are
exact for safe integers), which gets money the same no-floating-point-drift guarantee
`DecimalValue` gives the rest of Unit 9, without widening `story`'s type or `applyOperator`.
The frame text formats a cents operand as a dollar string (`decimalText`-style, cents →
`n.nn`) for the prose only; the carried `operands` stay integer cents for verification.

**Single operator, not three.** `word-problem-phrasing`'s existing (unmodified) frame-bank
check (`src/curriculum/phrasing/frames.test.ts`'s `quantitiesFor`) requires every bank to
share exactly one `Operator` — it throws "a bank must share one operator" otherwise, since a
bank is instantiated at source-check time against one `CHECK_QUANTITIES[operator]` set. A
bank spanning addition, subtraction, and multiplication (as first drafted) is incompatible
with that existing contract without changing infrastructure this increment does not own.
`money-problems` is therefore multiplication-only: price-per-item × quantity = total, the
most natural money scenario and a direct structural match for the existing
`MULTIPLICATION_FRAMES` precedent (`src/curriculum/phrasing/multiplication.ts`), just with
`a` carrying a cents price instead of a plain count.

The final answer is a dollar amount, so it needs the decimal keypad, not `intAnswer`: the
money-problems generator wraps `storyProblem`'s result in an `exact` answer of
`rational(resultCents, 100)` (mirroring `unit-09-decimals.ts`'s `exactAnswer` helper) instead
of using `intAnswer` directly, and declares `keypad: { allowDecimal: true }`.

This makes money the one story problem whose stated answer is not the same unit as its
carried operands (cents vs. dollars) — the baseline `word-problem-phrasing` requirement "a
story problem carries its quantities in machine-readable form" otherwise expects the answer
to equal `applyOperator` directly over the carried operands. The delta spec MODIFIES that
requirement to name the cents-to-dollars exception explicitly, rather than leaving it an
undocumented deviation the independent verifier would have to special-case silently.

Alternative rejected: extend `DecimalData`/`decimal-column` with a money-aware, prose-carrying
display arm. Rejected as disproportionate — it would duplicate the entire frame-selection,
misconception-prediction, and source-checking machinery `word-problem-phrasing` already
provides for `story`, just to carry a `DecimalValue` instead of an integer; integer cents get
the same exactness for free.

## Risks / Trade-offs

- [A division draw's quotient scale can exceed what the display expects] → Bound quotient
  scale to 1 or 2 explicitly at draw time, matching 9a's `wholeBounds`/`drawDecimal` pattern.
- [`requireDecimal`/`requireFraction` set together would be contradictory] → Neither
  generator in scope sets both; a future skill that tried would fail the content contract's
  existing agreement check the same way an invalid answer combination would today.
- [A missed exhaustive-switch arm silently falls through] → Rely on the existing `never`
  checks in `checkAnswer`'s status union, `submit.ts`, and `recorded-output.ts`'s
  `formatAnswer`; each is already written to force a compile error.
- [Money frame quantities produce a negative result] → Constrain frame quantity sets the same
  way the existing subtraction-frame and division-frame checks do (`word-problem-phrasing`'s
  "quantities its own operation admits" requirement).

## Migration Plan

No stored data, sync, manifest, or capability migration is required. Shipping registers six
generators and two new optional `Answer` flags (default `undefined`/falsy, so every existing
stored `Answer` and every already-shipped skill is unaffected). Rollback removes the six
generators, the two `DecimalData` arms, and the two `Answer` flags, returning the six skills
to `planned` without changing learner progress records.
