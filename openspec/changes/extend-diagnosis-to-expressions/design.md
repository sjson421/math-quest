## Context

`Misconception.value: number` (`src/lib/types.ts:60-67`) is matched by `diagnose()`
(`src/lib/generator.ts:43-49`) and filtered/deduped by `generateProblem()`
(`src/lib/generator.ts:15-41`). Both assume every predicted mistake collapses to a plain JS
number. `Answer` (`src/lib/types.ts:8-42`) already handles a richer answer shape via a
discriminated union with an `exact {n, d}` rational branch, but `Misconception.value` never
followed — even fraction misconceptions today work only because `diagnose()` collapses the
learner's parsed rational to a float via `toNumber()` before comparing. That collapse has no
analog for an algebraic expression: there is no scalar to reduce `2x + 3` to. See
proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Let a generator predict a non-numeric mistake and have it reach the learner and be
  diagnosed, with no other behavior change for existing numeric predictions.
- Touch as little existing code as possible: 140 existing `Misconception` literals across 12
  curriculum files must keep compiling and behaving identically, unchanged.

**Non-Goals:**
- Expression parsing, canonical form, or algebraic equivalence (item 20b).
- Any UI or input-mode change — `raw` is still whatever the keypad already produces today;
  this change only widens what the matching side can compare it against.
- Persisting or syncing `Misconception` — it already isn't (only `.tag` reaches
  `recordAttempt`), so the progress reconcile/opaque-sync contract is untouched.

## Decisions

**`Misconception.value: number | { kind: 'text'; value: string }`, not a full discriminated
union.** A pattern like `Answer`'s (`{ kind: 'number'; value } | { kind: 'text'; value }` for
every branch) was the first approach explored, mirroring `Answer`'s shape exactly. Rejected:
it requires rewriting all 140 existing literals to `{ kind: 'number', value: 5 }`, a purely
mechanical migration across 12 generator files that adds no behavior and inflates this
change's diff for no reader benefit. The chosen shape keeps every existing numeric literal
valid as-is (`value: 5`) and only requires the new object form where a generator actually
predicts a non-numeric mistake — today, nowhere; the shape exists so item 21 can use it later.
`typeof m.value === 'number'` is the discriminant at every call site, which is exactly the
check `generateProblem()`'s filter already half-does (`Number.isFinite(m.value)`).

**`diagnose()` text comparison is trimmed exact-string equality, nothing more.** Considered
normalizing whitespace inside the string (e.g. collapsing `2x + 3` vs `2x+3`) but rejected:
deciding what counts as an equivalent expression is explicitly item 20b's job (per the
roadmap), and any normalization here would be a canonicalization decision made in the wrong
increment. Trimming only the ends (not interior whitespace) mirrors how numeric `raw` is
already trimmed before parsing, so the two paths stay symmetric.

**Dedup uses a second `Set<string>`, not one mixed-type set.** `generateProblem()` currently
dedups with `Set<number>`. A single `Set<number | string>` would work in JS but would let a
text prediction and a numeric prediction collide if a generator ever wrote `value: '5'` vs
`value: 5` — an easy authoring mistake to make invisible. Two separate sets make the kinds
structurally unable to collide, matching the spec's "within each kind independently"
requirement.

## Risks / Trade-offs

- **Silent forever if never exercised.** This increment ships no generator that uses the new
  branch (per proposal Non-goals), so the new code path has no production caller until item
  21. Mitigation: cover it directly in `generator.test.ts` with a synthetic problem
  constructed in the test rather than relying on real curriculum content to exercise it.
- **A generator could accidentally predict `value: 5` as text `'5'` instead of number `5`.**
  This would silently move a prediction into the wrong kind's dedup/filter path. Mitigation:
  none needed beyond code review — the type signature makes the two forms visually distinct
  (`5` vs `{ kind: 'text', value: '5' }`), and no existing generator has any reason to do
  this.
