## 1. Variable meaning and expression evaluation

- [x] 1.1 Implement `variable-meaning`, substituting a given integer value into a one-term
  expression and requiring the resulting number via the numeric keypad, with concise
  guidance (under two hours).
- [x] 1.2 Add independent `variable-meaning` tests: exact substitution, single-term display,
  bounds, variety, and difficulty growth (under two hours).
- [x] 1.3 Implement `evaluate-expression`, substituting a given integer value into a
  multi-term expression and requiring the resulting number via the numeric keypad, with
  concise guidance (under two hours).
- [x] 1.4 Add independent `evaluate-expression` tests: exact substitution, multi-term
  display, bounds, variety, and difficulty growth (under two hours).

## 2. Words to expression

- [x] 2.1 Implement `words-to-expression` as a wall: display a phrase naming an operation on
  a variable (including at least one "less than"/"subtracted from" order-reversing phrase),
  require the matching expression via `inputMode: 'expression'` with `form: 'expanded'`, and
  predict two distinct misconceptions including the reversed-order form (under two hours).
- [x] 2.2 Add independent `words-to-expression` tests: correct expression for both
  reversing and non-reversing phrasings, both misconceptions surviving
  `generateProblem`'s collision/dedup filtering, bounds, variety, and difficulty growth
  (under two hours).

## 3. Identifying like terms

- [x] 3.1 Implement `identify-like-terms` via choice input: display a target term and offer
  choices where exactly one shares the target's variable part, with distinct-looking
  choices, and concise guidance (under two hours).
- [x] 3.2 Add independent `identify-like-terms` tests: correct choice identification,
  uniqueness/no-collision of offered choice labels, bounds, variety, and difficulty growth
  (under two hours).

## 4. Combining like terms and distributing

- [x] 4.1 Implement `combine-like-terms` as a wall: display a sum of terms (including at
  least two variable terms and a constant), require the combined form via `inputMode:
  'expression'` with `form: 'expanded'`, and predict two distinct misconceptions including
  an unlike-term collapse (under two hours).
- [x] 4.2 Add independent `combine-like-terms` tests: correct combined form, misconceptions
  surviving filtering, bounds, variety, and difficulty growth (under two hours).
- [x] 4.3 Implement `distributive` as a wall: display a coefficient applied to a
  parenthesized sum, require the distributed form via `inputMode: 'expression'` with `form:
  'expanded'`, and predict two distinct misconceptions including a first-term-only miss
  (under two hours).
- [x] 4.4 Add independent `distributive` tests: correct distributed form, an undistributed
  equivalent entry also accepted under `expanded` form, misconceptions surviving filtering,
  bounds, variety, and difficulty growth (under two hours).

## 5. Registry, authorities, and recorded output

- [x] 5.1 Register the six Unit 13a generators in manifest order and add per-skill recorded
  snapshots.
- [x] 5.2 Update coverage assertions for the six newly implemented skills, unlock order, and
  the 127-skill playable total.
- [x] 5.3 Mark curriculum rows 13.1–13.6 playable, update README and roadmap status text,
  and leave roadmap item 21 unchecked for the remaining increments (13b, 14a, 14b, 15).

## 6. Verification

- [x] 6.1 Run strict OpenSpec validation, focused Unit 13/coverage/content tests, the full
  test suite, production build, and lint; retain only documented pre-existing warnings.
- [x] 6.2 Run the real app using `docs/environment.md`; complete representative problems
  from all six skills including all three `inputMode: 'expression'` skills, exercise a
  diagnosed wrong answer on one wall, capture and inspect a screenshot of the expression
  keypad in use, stop temporary services, and confirm their ports are free.
