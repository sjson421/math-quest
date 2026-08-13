## Context

See proposal.md - Why. This is pure capability infrastructure: no Unit 13 generator, no
manifest edit, no predicted misconceptions to name (item 20a already generalized
`Misconception.value` to carry non-numeric predictions — see
`openspec/changes/archive/2026-08-13-extend-diagnosis-to-expressions/`). The relevant
existing surfaces are `src/lib/types.ts` (`Answer`, `Problem`), `src/lib/answer.ts`
(`checkAnswer`), `src/lib/keypad.ts`/`src/components/Keypad.tsx`, and
`src/components/ProblemView.tsx`'s exhaustive `inputMode`/`Display['kind']` switches.

## Goals / Non-Goals

**Goals:**
- Parse and canonicalize single-variable integer expressions with the grammar in
  `specs/expression-input/spec.md`.
- Let a generator (in a later change) declare whether its expression answer wants
  `expanded` or `exact` comparison, per problem.
- Extend the keypad and `ProblemView` without disturbing any existing input mode.

**Non-Goals:**
- Deciding which Unit 13 skill wants which form — that decision is made per-generator when
  roadmap item 21 is proposed; this change only builds the mechanism.
- General algebraic simplification (like terms across more than one variable, exponents,
  rational expressions).

## Decisions

**Hand-rolled recursive-descent parser over an existing library.** No dependency in
`package.json` does math parsing today; `src/lib/rational.ts` is exact hand-rolled rational
arithmetic with zero dependencies, and `MathNotation`/`ShapeDiagram` are hand-built trees
rather than wrapping a rendering library. The Unit 13 grammar is small (one variable,
integers, `+`/`−`, parens, implicit multiplication) — small enough that a ~100-line parser
costs less to build and keep exact than integrating and constraining a general CAS, and it
keeps the app dependency-free and fully offline, matching `openspec/config.yaml`'s "no
runtime LLM calls" posture toward external computation generally.

**Canonical form as an AST-level normalization, not string manipulation.** Parse to a small
expression AST (`{ kind: 'num' | 'var' | 'add' | 'mul' | 'neg', ... }`), normalize by (a)
fully distributing multiplication over addition and flattening to a sum of monomials for
`expanded` form, or (b) normalizing operand order only (commutative sort) while preserving
group structure for `exact` form, then serialize each to a canonical string for `===`
comparison. AST-level avoids the string-matching bugs a regex-based normalizer would hit on
whitespace, operator spacing, and paren placement — the same reason `rational.ts` compares
values as `{n, d}` pairs rather than decimal strings.

**`form` lives on the `Answer`, not as a global rule or a per-generator checker.** Directly
required by the roadmap text ("it belongs to the answer type, not to a checker each
generator writes for itself"). Concretely:
```ts
| { kind: 'expression'; canonical: string; variable: string; form: 'expanded' | 'exact' }
```
`checkAnswer` parses both the canonical string (already normalized by the generator, trusted
the same way `answer.n`/`answer.d` are today) and the raw entry, normalizes the raw entry
under the declared `form`, and compares.

**Expression entry gets its own keypad layout rather than extending the numeric pad's
bottom row.** The numeric pad's 4-column grid already uses every cell (`Keypad.tsx:74-129`);
expression entry needs five new distinct keys (variable, `+`, `−` infix, `(`, `)`) that
don't fit the one adaptive cell `allowMixed`/`allowNegative` already share. `Keypad`
branches on a new `rules.kind === 'expression'` (or a sibling `ExpressionKeypad` component
selected by `Problem['inputMode']`) rather than growing `KeypadRules`' existing numeric
fields with expression-only meanings.

**`applyKey` gains an expression grammar-aware branch.** Balances parens incrementally
(refuses a `)` with no open `(`), refuses two consecutive operators, and reuses the existing
`back`/`clear` handling — mirroring how `applyKey` already refuses a second `.` or a
`/` before a numerator today (`src/lib/keypad.ts:71-84`), rather than validating only at
submit time.

**No new `Display` kind.** An expression problem's prompt renders through the existing
`MathNotation` `text`/`row` nodes (`src/lib/types.ts:246-251`), the same way today's
fraction and percent prompts compose text without a dedicated display arm.

## Risks / Trade-offs

- **Parser correctness for edge cases (e.g. `--x`, `2(-x+1)`)** → covered by focused unit
  tests in `src/lib/expression.test.ts` enumerating the grammar's edge cases before any
  consumer depends on it; `checkAnswer` treats anything outside the grammar as
  `unparseable`, never a silent misparse.
- **A future Unit 13 skill needs more grammar than this change ships (e.g. a second
  variable)** → deferred rather than guessed at; the roadmap item 21 change re-opens this
  capability's grammar if a skill genuinely needs it, rather than this change
  over-building for a skill that isn't proposed yet.
- **Expression comparison is more expensive than the existing exact-rational `===`
  check** → parsing a short single-variable expression is negligible cost on submit, not a
  hot path; no perf work needed.

## Migration Plan

Additive only: new `Answer` kind, new `inputMode` value, new keypad layout, new manifest
capability flag. No existing `Answer`, `Problem`, or stored-progress shape changes, so there
is no data migration and no sync-payload change. Rollback is deleting the new code paths and
leaving `expression-input` unflagged in `AVAILABLE_CAPABILITIES`.
