## MODIFIED Requirements

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

An equation's derived answer is not always a number. Where the answer is a **property of the
equation**, verification SHALL derive that property from the carried terms and compare it
against the identity of the stated choice. Where the answer is an **expression in a second
letter**, verification SHALL derive that expression from the carried terms and compare it
against the stated expression. In both cases the derivation SHALL run over the carried
values, never over the displayed text and never over the generator's stated answer.

Verification SHALL also confirm that the displayed equation agrees with the carried values,
so a generator cannot show one equation and carry another. Where the equation is presented as
structured notation rather than plain characters, the carried values SHALL still reproduce
the equation's text form, and that text SHALL remain the equation's accessible name — so one
comparison covers both what is rendered and what is announced.

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

#### Scenario: The displayed equation must agree with the carried values

- **WHEN** the content check examines an equation problem
- **THEN** it fails and names the problem if the displayed equation does not follow from the
  carried source values

#### Scenario: A notated equation is checked against the same text

- **WHEN** an equation problem presents its equation as structured notation
- **THEN** it fails and names the problem if the equation rebuilt from its carried values
  does not equal that problem's equation text
- **AND** that text is the accessible name the rendered notation exposes

### Requirement: The wording gate records every field a generator sets

The per-unit recorded-output gate SHALL render every field a problem carries, and SHALL fail
naming any field a generator sets that it does not render.

A field the gate does not render is a field the gate does not protect. What a problem permits
to be typed into it, and which line a value is placed on, are both authored decisions that
change what the learner sees and can be got wrong silently — so both are recorded alongside
the prompt, the display and the answer rather than left to a reviewer to notice missing.

This SHALL extend to the fields **inside** a display, including optional ones. The gate's
automatic failure names a problem's own fields; the interior of a display is checked by
nothing, so an unrendered display field passes in silence — and an optional display field
that is absent SHALL be recorded as absent rather than printed as a missing value. A change
whose whole surface is a new display field would otherwise leave the gate reporting no
difference, which is precisely the assurance the gate exists to give.

#### Scenario: An answer-entry declaration is recorded

- **WHEN** a generator declares which character classes its answer may use
- **THEN** the recorded output for that problem shows the declaration

#### Scenario: A declared number line is recorded

- **WHEN** a generator declares the line its answer is placed on
- **THEN** the recorded output for that problem shows that line

#### Scenario: An unrendered field fails the gate

- **WHEN** a generator sets a field the gate does not render
- **THEN** the gate fails and names that field

#### Scenario: An omitted optional frame label is recorded as absent

- **WHEN** an equation display carries no variable frame label
- **THEN** the recorded output states that it has none rather than printing an absent value

#### Scenario: Structured equation notation reaches the snapshot

- **WHEN** an equation display carries structured notation
- **THEN** the recorded output renders that notation

#### Scenario: A prose display's equation payload reaches the snapshot

- **WHEN** a story display carries equation source data
- **THEN** the recorded output renders those carried terms rather than falling through to a
  payload it does not have

## ADDED Requirements

### Requirement: A prose problem whose structure is an equation carries its equation terms

A word problem whose underlying structure is a linear equation SHALL carry that equation's
source terms alongside its prose, in the same structured form an equation display carries.
Independent verification SHALL derive the answer from those terms without reading the
sentence.

A word problem deliberately mentions quantities its answer does not use, so its prose is for
the learner and never a data format. The existing prose payloads cannot serve this case: a
pair of operands and one operator states a single operation, and an equation word problem
states two applied in sequence.

#### Scenario: A two-step story is solved from its carried terms

- **WHEN** a word problem describes a number multiplied by a coefficient with a constant then
  added, giving a stated result
- **THEN** verification derives the exact answer from the carried coefficient, constant and
  result
- **AND** does not parse the sentence to do so

#### Scenario: The sentence agrees with the carried terms

- **WHEN** the content check examines an equation word problem
- **THEN** the sentence rebuilt from its frame and carried terms equals the sentence on screen
