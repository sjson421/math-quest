## MODIFIED Requirements

### Requirement: Equation displays carry independently verifiable source data

A display whose learner-facing text is a **statement already containing a relation** — an
equality or an inequality, as opposed to an open expression whose answer is its value — SHALL
carry that statement's source relation, coefficients, constants, right-hand value, and family
selector separately from the text, as `EquationData`. Independent verification SHALL derive
the exact answer from that structured data alone, without parsing the displayed statement and
without trusting the generator's stated answer.

The carried data SHALL NOT include the solution itself. A payload that carries the answer
and a verification that reads it back is the generator's stated answer under another name,
which is the one thing this capability's independence rule exists to prevent. Every carried
value SHALL be a quantity the statement puts on screen.

This is the third case of what a display's answer is, and it is why the existing arms cannot
serve it. Where a displayed expression's answer is **the value of what is shown**,
recomputation may evaluate the display. Where the answer is **a rewriting of what is shown**,
the display is prose and carries its operands alongside. A relation is neither: evaluating
`3x + 5 = 20` yields no number, and the answer is not a restatement of it but something
derived from the whole statement.

A relation's derived answer is not always a number, and where it is a number that number is
not always a solution. Where the answer is the value that makes an equality true,
verification SHALL derive that value. Where the answer is a **property of the statement** —
how many solutions it has, what its graph looks like, what it says in words — verification
SHALL derive that property from the carried terms and compare it against the identity of the
stated choice. Where the answer is a **relation** rather than a value, verification SHALL
derive both the solved boundary and the solved relation, including whether a negative
multiplier reversed it, and compare the pair against the identity of the stated choice. Where
the answer is a **count of the values satisfying the statement**, verification SHALL derive
that count over the stated range. Where the answer is an **expression in a second letter**,
verification SHALL derive that expression from the carried terms and compare it against the
stated expression. In every case the derivation SHALL run over the carried values, never over
the displayed text and never over the generator's stated answer.

Verification SHALL also confirm that the displayed statement agrees with the carried values,
so a generator cannot show one statement and carry another. Where the statement is presented
as structured notation rather than plain characters, the carried values SHALL still reproduce
the statement's text form, and that text SHALL remain its accessible name — so one comparison
covers both what is rendered and what is announced.

#### Scenario: A one-step solution is rebuilt from its constant and family

- **WHEN** a problem displays an equation adding or subtracting a constant from a variable
- **THEN** verification derives the exact answer from the carried constant, the carried
  right-hand value, and which operation the equation shows
- **AND** the payload carries no solution for it to read instead

#### Scenario: A two-step solution is rebuilt from its coefficient and constant

- **WHEN** a problem displays an equation applying a coefficient and a constant to a variable
- **THEN** verification derives the exact answer from the carried coefficient, constant,
  inner sign, and right-hand value independently

#### Scenario: A both-sides solution is rebuilt from all four carried terms

- **WHEN** a problem displays an equation with a variable term on each side
- **THEN** verification derives the exact answer from the two carried coefficients and the
  two carried constants independently

#### Scenario: A parenthesised solution is rebuilt before distributing

- **WHEN** a problem displays an equation whose variable side is a bracketed sum multiplied
  by a coefficient
- **THEN** verification derives the exact answer from the carried coefficient, inner
  constant, and right-hand value independently

#### Scenario: A cleared-denominator solution is rebuilt from the carried fraction

- **WHEN** a problem displays an equation whose variable side is a fraction over a
  denominator
- **THEN** verification derives the exact answer from the carried denominator, constant and
  right-hand value independently

#### Scenario: A solution count is rebuilt from the carried terms

- **WHEN** a problem displays an equation whose answer is how many solutions it has
- **THEN** verification derives that count by comparing the carried variable terms and the
  carried constants
- **AND** compares it against the identity of the stated choice rather than a number

#### Scenario: A rearranged expression is rebuilt from the carried coefficients

- **WHEN** a problem displays a two-letter equation whose answer is the subject letter
  expressed in the other
- **THEN** verification derives that expression from the carried coefficients and constant
- **AND** compares it against the stated expression answer

#### Scenario: A solved relation is rebuilt with its direction

- **WHEN** a problem displays an inequality whose answer is the solved relation
- **THEN** verification derives the boundary and the resulting relation from the carried
  relation, the carried right-hand value, and whichever of a constant or a multiplier that
  arm carries
- **AND** reverses the relation exactly when a carried multiplier is negative
- **AND** compares the derived statement against the identity of the stated choice

#### Scenario: A graph description is rebuilt from the carried relation

- **WHEN** a problem displays an inequality whose answer describes its graph
- **THEN** verification derives the circle type from whether the carried relation is strict
- **AND** derives the shading direction from which way the carried relation points

#### Scenario: A satisfying count is rebuilt over the stated range

- **WHEN** a problem displays a compound statement whose answer is how many whole numbers
  satisfy it
- **THEN** verification counts them over the carried range by testing each against the
  carried bounds and connective
- **AND** the payload carries no count for it to read instead

#### Scenario: The displayed equation must agree with the carried values

- **WHEN** the content check examines an equation problem
- **THEN** it fails and names the problem if the displayed equation does not follow from the
  carried source values

#### Scenario: The displayed inequality must agree with the carried values

- **WHEN** the content check examines a problem whose display is an inequality
- **THEN** it fails and names the problem if the displayed statement does not follow from the
  carried relation and quantities
- **AND** the check rebuilds the statement's text from those values rather than parsing what
  is shown

#### Scenario: A notated equation is checked against the same text

- **WHEN** an equation problem presents its equation as structured notation
- **THEN** it fails and names the problem if the equation rebuilt from its carried values
  does not equal that problem's equation text
- **AND** that text is the accessible name the rendered notation exposes
