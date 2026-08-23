## MODIFIED Requirements

### Requirement: Single-variable expression displays carry independently verifiable source data

A display whose learner-facing content names a single declared variable SHALL carry the source coefficients, constants, and any family selector separately from its rendered text. Unit 13 expression work SHALL use `AlgebraData`; Unit 18 polynomial work SHALL use operation-specific `PolynomialData`. Independent verification SHALL derive the exact numeric answer, expected canonical expression, or one correct choice from that structured data without parsing learner-facing text or trusting the generator's stated answer.

The structured data SHALL also be sufficient to rebuild the complete visible expression and provide difficulty evidence from source operands. A polynomial factoring payload SHALL carry the displayed coefficients or factors from which verification can independently derive the requested factorization; it SHALL NOT carry an opaque canonical answer string.

#### Scenario: A one-term substitution is rebuilt from its coefficient and value

- **WHEN** a problem asks for the value of a one-term expression after substituting a given value for its variable
- **THEN** verification derives the exact numeric answer by multiplying the carried coefficient by the carried value independently

#### Scenario: A translated phrase is rebuilt from its named number and family

- **WHEN** a problem asks for the expression matching an order-sensitive subtraction phrase
- **THEN** verification derives the expected canonical expression from the carried number and phrase family independently

#### Scenario: A like-term choice is rebuilt from its coefficients and letter

- **WHEN** a problem asks which offered term is a like term to a displayed target
- **THEN** verification derives the one correct choice from the carried target letter and matching coefficient independently

#### Scenario: A multi-term substitution is rebuilt from its coefficient, constant, and value

- **WHEN** a problem asks for the value of a two-term expression after substituting a given value for its variable
- **THEN** verification derives the exact numeric answer from the carried coefficient, constant, sign, and value independently

#### Scenario: Combined or distributed terms are rebuilt from their source coefficients

- **WHEN** a problem asks for the combined form of like terms, or the distributed form of a coefficient across a parenthesized sum
- **THEN** verification derives the expected canonical expression from the carried source coefficients and constant independently

#### Scenario: A negative distribution is rebuilt from its coefficient, constant, and inner sign

- **WHEN** a problem asks for the distributed form of a negative coefficient across a parenthesized sum or difference
- **THEN** verification derives the expected canonical expression from the carried coefficient, constant, and inner sign independently, including the sign of both resulting terms

#### Scenario: A factored form is rebuilt from its common factor and inner terms

- **WHEN** a problem asks for the factored form of a sum whose terms share a common factor
- **THEN** verification derives the expected canonical expression from the carried common factor and the inner coefficient and constant independently, and derives the displayed expanded sum from the same data

#### Scenario: Polynomial arithmetic is rebuilt from visible source operands

- **WHEN** a Unit 18 problem adds or subtracts two polynomials, distributes a monomial, or multiplies two binomials
- **THEN** verification independently derives every result coefficient from the carried visible operands
- **AND** rejects a display or answer that disagrees with that derivation

#### Scenario: Polynomial factoring is derived rather than read back

- **WHEN** a Unit 18 problem factors a greatest common monomial or a monic trinomial
- **THEN** verification derives the factorization from the carried expanded coefficients
- **AND** confirms that the factors rebuild the displayed polynomial

#### Scenario: Polynomial data reaches every authored-content gate

- **WHEN** the closed polynomial operation data gains a new arm
- **THEN** independent answer verification, source-magnitude evidence, learner-text collection, and recorded output require explicit handling
- **AND** the operation cannot silently inherit unrelated algebra semantics
