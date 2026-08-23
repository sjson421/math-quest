# expression-input Specification

## Purpose

Lets a problem ask for a single-variable integer expression as its answer, and decide
whether two differently-written expressions count as the same answer.

## Requirements

### Requirement: A problem declares its expression grammar

The expression `Answer` on a problem SHALL be the single runtime declaration of the variable
letter and maximum degree used by expression entry and comparison. It MAY opt into a maximum
degree of two; omitting the maximum degree SHALL keep the existing degree-one grammar. The
problem SHALL NOT carry a parallel expression configuration that can disagree with its
answer.

Both grammars SHALL accept integer coefficients, the declared variable, infix `+` and `−`,
unary `−`, parentheses, and implicit multiplication by juxtaposition (e.g. `2x`). A
degree-two grammar SHALL additionally accept a superscript `2` attached to the declared
variable and products whose every intermediate result has degree at most two. A degree-one
grammar SHALL reject those quadratic forms.

Additional variables, decimals, division, repeated-variable `xx` notation, a caret exponent,
any exponent other than the declared variable's square, and every expression that exceeds
the declared maximum degree SHALL NOT be accepted. An unsupported higher-degree intermediate
SHALL remain unparseable even if later terms would cancel it.

#### Scenario: A declared letter is accepted

- **WHEN** a problem declares the variable `x`
- **THEN** an entry using `x` may be parsed
- **AND** an entry using any other letter is rejected as unparseable

#### Scenario: One answer declaration governs the expression

- **WHEN** a problem uses expression input
- **THEN** its expression answer's variable and maximum degree govern the keypad, parser,
  answer checker, and recorded output
- **AND** no second problem field can declare different expression rules

#### Scenario: An out-of-grammar entry is rejected

- **WHEN** an entry contains a second variable letter, a division, a decimal, a caret
  exponent, or an unsupported power
- **THEN** the entry is rejected as unparseable rather than partially interpreted

#### Scenario: Linear entry remains the default

- **WHEN** an expression problem does not opt into degree two
- **THEN** `x²`, `xx`, and `(x + 1)(x + 2)` are rejected as unparseable
- **AND** every previously accepted linear expression keeps the same canonical result

#### Scenario: A degree-two problem accepts conventional quadratic forms

- **WHEN** a problem declares variable `x` and a maximum degree of two
- **THEN** entries such as `3x² + 2x − 1`, `x(x + 1)`, and `(x + 1)(x − 2)` may be parsed
- **AND** repeated-variable `xx` notation remains unparseable

#### Scenario: Higher-degree work cannot cancel into range

- **WHEN** any intermediate product in an entry exceeds the declared maximum degree
- **THEN** the whole entry is rejected as unparseable
- **AND** subtracting an equal unsupported term later does not make the entry valid

### Requirement: An expression answer declares its comparison form

An expression `Answer` SHALL declare a comparison form of `expanded` or `exact` and SHALL
use the same maximum degree as its problem's expression grammar. Omitting the maximum degree
SHALL keep degree one as the answer default.

Under `expanded`, an entry is correct when it is algebraically equal to the canonical answer
after fully distributing and combining like terms through the declared maximum degree — so
`2(x + 1)` and `2x + 2` are the same linear answer, while `(x + 2)(x + 3)` and
`x² + 5x + 6` are the same quadratic answer. Under `exact`, an entry is correct only when it
matches the canonical answer's structure (the same grouping into sums and products versus a
fully distributed sum), so a factored and an expanded form of the same value are different
answers.

Under `exact`, two entries SHALL compare equal only when they differ by the order of a sum's
terms or a product's factors. Differing in how the expression is grouped SHALL compare
unequal, whatever the nesting depth: a product of a number and a sum is never the same
answer as a sum containing that product, and a product of two binomials is never the same
answer as its expanded quadratic.

The comparison form and maximum degree SHALL be properties of the answer the generator
produces, not of a per-skill checker, so the same comparison mechanism serves every skill.
The stored answer and learner entry SHALL be parsed and canonicalized under the same declared
form and degree.

#### Scenario: Expanded form accepts a re-ordered sum

- **WHEN** the canonical answer is `2x + 3` and the form is `expanded`
- **THEN** an entry of `3 + 2x` is correct

#### Scenario: Expanded form accepts an undistributed equivalent

- **WHEN** the canonical answer is `2x + 2` and the form is `expanded`
- **THEN** an entry of `2(x + 1)` is correct

#### Scenario: Exact form rejects a differently-structured equivalent

- **WHEN** the canonical answer is `2(x + 1)` and the form is `exact`
- **THEN** an entry of `2x + 2` is incorrect, distinct from an unparseable or blank entry

#### Scenario: Exact form accepts the same structure differently ordered

- **WHEN** the canonical answer is `2x + 2` and the form is `exact`
- **THEN** an entry of `2 + 2x` is correct

#### Scenario: Exact form rejects a regrouping that reuses the same numbers

- **WHEN** the canonical answer is `3(x + 4)` and the form is `exact`
- **THEN** an entry of `3(4) + x` is incorrect, because the grouping differs even though
  both entries name the same numbers in the same order

#### Scenario: Expanded form accepts an equivalent quadratic

- **WHEN** a degree-two answer has canonical value `x² + 5x + 6` and form `expanded`
- **THEN** an entry of `(x + 2)(x + 3)` is correct
- **AND** reordering its terms does not change the result

#### Scenario: Exact form preserves a quadratic factorization

- **WHEN** a degree-two answer has canonical form `(x + 2)(x + 3)` and form `exact`
- **THEN** an entry of `(x + 3)(x + 2)` is correct
- **AND** an entry of `x² + 5x + 6` is incorrect

### Requirement: An unparseable expression entry is not a wrong answer

An entry that does not parse under the declared grammar SHALL be reported distinctly from an
entry that parses but is mathematically wrong, matching how a malformed numeric entry is
already distinguished from an incorrect one.

#### Scenario: A malformed entry is reported as unparseable

- **WHEN** an entry has unbalanced parentheses or a dangling operator
- **THEN** it is reported as unparseable
- **AND** it is not counted as an incorrect attempt
