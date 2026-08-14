## MODIFIED Requirements

### Requirement: A predicted misconception may carry a non-numeric value

A generator MAY predict a mistake whose result is not a plain number (for example, an
unsimplified or mis-transformed algebraic expression). Such a prediction SHALL reach the
learner and be diagnosable on exactly the same terms as a numeric prediction: it is carried
unless blank, deduplicated against other predictions of the same kind, and matched against
the learner's raw entry by direct comparison. No equivalence beyond exact match is
performed — a generator MAY declare only the exact text form it means to predict, and the
system SHALL NOT attempt to determine that two different non-numeric predictions describe
the same underlying mistake.

The correct-answer exclusion that drops a numeric prediction equal to the answer SHALL NOT
be applied to a non-numeric prediction: an expression answer has no numeric value to compare
against, and no algebraic comparison is performed. A generator predicting a non-numeric
mistake is therefore responsible for constructing it so it cannot coincide with its own
answer for any draw it allows.

#### Scenario: A non-numeric prediction reaches the learner

- **WHEN** a generator predicts a mistake whose value is not a number
- **THEN** the prediction is carried in the problem's misconceptions unless it is blank or
  duplicates another prediction of the same kind

#### Scenario: A non-numeric prediction is diagnosed on submission

- **WHEN** a learner's raw entry, trimmed, exactly matches a carried non-numeric prediction
- **THEN** that prediction is returned as the diagnosis

#### Scenario: A blank non-numeric prediction is dropped

- **WHEN** a generator predicts a mistake whose value is an empty or whitespace-only string
- **THEN** the prediction does not reach the learner

#### Scenario: Non-numeric and numeric predictions do not collide

- **WHEN** a problem carries both numeric and non-numeric predicted misconceptions
- **THEN** deduplication applies within each kind independently, and a non-numeric
  prediction is never compared against a numeric one

#### Scenario: A non-numeric prediction equal to the answer is not dropped for the generator

- **WHEN** a generator predicts a non-numeric mistake whose text equals its own canonical
  answer
- **THEN** the prediction is still carried, because no correct-answer exclusion runs for
  this kind

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

#### Scenario: A negative distribution is rebuilt from its coefficient, constant, and inner sign

- **WHEN** a problem asks for the distributed form of a negative coefficient across a
  parenthesized sum or difference
- **THEN** verification derives the expected canonical expression from the carried
  coefficient, constant, and inner sign independently, including the sign of both resulting
  terms

#### Scenario: A factored form is rebuilt from its common factor and inner terms

- **WHEN** a problem asks for the factored form of a sum whose terms share a common factor
- **THEN** verification derives the expected canonical expression from the carried common
  factor and the inner coefficient and constant independently, and derives the displayed
  expanded sum from the same data
