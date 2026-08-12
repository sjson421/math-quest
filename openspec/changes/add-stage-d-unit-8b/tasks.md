## 1. Structured fraction semantics

- [x] 1.1 Add operation-specific `FractionData` arms for mixed-to-improper, mixed-number
  addition/subtraction, and fraction multiplication/division; extend recorded formatting and
  difficulty source measurement exhaustively.
- [x] 1.2 Extend the independent display verifier to reconstruct every new notation and label
  and re-derive each exact answer from integer source fields.
- [x] 1.3 Add synthetic verifier tests for correct new displays, notation/data disagreement,
  operator or operand disagreement, and incorrect stated answers.

## 2. Mixed-to-improper

- [x] 2.1 Implement `mixed-to-improper` with reduced positive mixed draws, structured notation,
  fraction keypad entry, lowest-terms answers, two computed predictions, concise hint, and
  worked solution.
- [x] 2.2 Add independent `mixed-to-improper` tests for displayed-data agreement, the improper
  numerator formula, reduction, both prediction formulas, draw bounds, and difficulty growth.

## 3. Mixed-number arithmetic

- [x] 3.1 Implement `add-mixed` with positive same-denominator mixed draws, no-carry and carry
  cases, genuine reduced mixed answers, the `added-wholes-only` and `added-fractions-only`
  predictions, concise hint, and worked solution.
- [x] 3.2 Add independent `add-mixed` tests for display agreement, exact addition, carry/no-carry
  coverage, `not-mixed` for an improper fractional part, both predictions, bounds, and growth.
- [x] 3.3 Implement `sub-mixed` with borrowing on every draw, positive reduced mixed answers,
  and the `reversed-fraction-without-borrowing` and `borrowed-one-piece` wall predictions.
- [x] 3.4 Add independent `sub-mixed` tests for display agreement, exact borrowed subtraction,
  mixed-form checking, positive enterable prediction formulas, two-prediction survival on every
  draw, bounds, and growth.

## 4. Fraction multiplication and division

- [x] 4.1 Implement `mult-fractions` with reduced positive proper operands, exact reduced
  fraction answers, two computed arithmetic predictions, concise hint, and worked solution.
- [x] 4.2 Add independent `mult-fractions` tests for display agreement, straight-across exact
  arithmetic, lowest-terms checking, prediction formulas, bounds, and difficulty growth.
- [x] 4.3 Implement `div-fractions` with reduced positive unequal proper operands, reciprocal
  arithmetic, and the `flipped-first` and `multiplied-without-flip` wall predictions.
- [x] 4.4 Add independent `div-fractions` tests for display agreement, exact reciprocal
  arithmetic, lowest-terms checking, both prediction formulas and survival on every draw,
  bounds, and growth.

## 5. Fraction word-problem phrasing

- [x] 5.1 Add a fraction-valued story builder that reuses seeded frame selection and frame-owned
  diagnoses while returning an exact lowest-terms part-over-whole answer.
- [x] 5.2 Author at least eight adult `fraction-words` frames, each naming a part, its whole,
  and one irrelevant quantity without free-composed prose.
- [x] 5.3 Extend source-level frame checks with fraction quantity sets and builder dispatch,
  retaining every existing whole-number division invariant and proving all fraction predictions
  are distinct and survive.
- [x] 5.4 Implement `fraction-words` with difficulty-scaled proper part/whole draws, seeded frame
  selection, fraction keypad entry, and machine-readable story operands.
- [x] 5.5 Add independent `fraction-words` tests for exact story recomputation, prose/operand
  agreement, all frame-owned diagnoses, frame variety, bounds, and difficulty growth.

## 6. Registry, authorities, and recorded output

- [x] 6.1 Append the six generators to Unit 8 in manifest order, update its recorded-output
  snapshots, and pin intended fields and input modes for every new skill.
- [x] 6.2 Update coverage to pin all twelve Unit 8 skills implemented, Unit 9 still planned,
  course/unlock order, and the 82-skill playable total.
- [x] 6.3 Mark curriculum rows 8.7–8.12 playable, update the roadmap and README status text,
  and leave roadmap item 19 unchecked for the remaining Stage D increments.

## 7. Verification

- [x] 7.1 Run strict OpenSpec validation, focused Unit 8/phrasing/generator/coverage tests, the
  full test suite, production build, and lint; retain only documented pre-existing warnings.
- [x] 7.2 Run the real app at 375 pixels using `docs/environment.md`; complete representative
  mixed conversion, borrowed subtraction, fraction division, and fraction story problems,
  inspect changed notation/control/story states, capture screenshots, stop temporary services,
  and confirm their ports are free.
