## ADDED Requirements

### Requirement: Equation displays carry independently verifiable source data

A display whose learner-facing text is an **equation** — a statement already containing a
relation, whose answer is the value that makes it true — SHALL carry that equation's source
coefficients, constants, right-hand value, and family selector separately from the text, as
`EquationData`. Independent verification SHALL derive the exact answer from that structured
data alone, without parsing the displayed equation and without trusting the generator's
stated answer.

The carried data SHALL NOT include the solution itself. A payload that carries the answer
and a verification that reads it back is the generator's stated answer under another name,
which is the one thing this capability's independence rule exists to prevent. Every carried
value SHALL be a quantity the equation puts on screen.

This is the third case of what a display's answer is, and it is why the existing arms cannot
serve it. Where a displayed expression's answer is **the value of what is shown**,
recomputation may evaluate the display. Where the answer is **a rewriting of what is shown**,
the display is prose and carries its operands alongside. An equation is neither: evaluating
`3x + 5 = 20` yields no number, and the answer is not a restatement of it but the one value
of the variable under which it holds.

Verification SHALL also confirm that the displayed equation agrees with the carried values,
so a generator cannot show one equation and carry another.

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

#### Scenario: The displayed equation must agree with the carried values

- **WHEN** the content check examines an equation problem
- **THEN** it fails and names the problem if the displayed equation does not follow from the
  carried source values
