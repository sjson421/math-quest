## ADDED Requirements

### Requirement: Single-variable expression displays carry independently verifiable source data

An `inline` display whose learner-facing text names a single declared variable SHALL carry
the source coefficients, constants, and any family selector separately from that text, as
`AlgebraData`. Independent verification SHALL derive the exact numeric answer, the expected
canonical expression, or the one correct choice from that structured data without parsing
the displayed text or trusting the generator's stated answer.

#### Scenario: A one-term substitution is rebuilt from its coefficient and value

- **WHEN** a problem asks for the value of a one-term expression after substituting a given
  value for its variable
- **THEN** verification derives the exact numeric answer by multiplying the carried
  coefficient by the carried value independently

#### Scenario: A translated phrase is rebuilt from its named number and family

- **WHEN** a problem asks for the expression matching an order-sensitive subtraction phrase
- **THEN** verification derives the expected canonical expression from the carried number
  and phrase family independently

#### Scenario: A like-term choice is rebuilt from its coefficients and letter

- **WHEN** a problem asks which offered term is a like term to a displayed target
- **THEN** verification derives the one correct choice from the carried target letter and
  matching coefficient independently

#### Scenario: A multi-term substitution is rebuilt from its coefficient, constant, and value

- **WHEN** a problem asks for the value of a two-term expression after substituting a given
  value for its variable
- **THEN** verification derives the exact numeric answer from the carried coefficient,
  constant, sign, and value independently

#### Scenario: Combined or distributed terms are rebuilt from their source coefficients

- **WHEN** a problem asks for the combined form of like terms, or the distributed form of a
  coefficient across a parenthesized sum
- **THEN** verification derives the expected canonical expression from the carried source
  coefficients and constant independently
