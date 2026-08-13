## ADDED Requirements

### Requirement: Power and root displays carry independently verifiable source data

A structured-math display whose answer is derived from an exponent, a perfect square, a
root estimate, or a same-base power multiplication or division SHALL carry the base,
exponent(s), or radicand separately from its learner-facing notation and label.
Independent verification SHALL reconstruct the visible notation and label and derive the
exact answer from that structured data without trusting the generator's stated answer.

#### Scenario: An evaluated power is rebuilt from base and exponent

- **WHEN** a problem asks for the evaluated value of a displayed power
- **THEN** verification reconstructs the superscript notation from the carried base and
  exponent
- **AND** it derives the exact answer by raising the base to the exponent independently

#### Scenario: A same-base power result is rebuilt from both exponents

- **WHEN** a problem asks for the resulting exponent of a same-base multiplication or
  division of two displayed powers
- **THEN** verification reconstructs both displayed powers from the carried base and
  exponents
- **AND** it derives the exact resulting exponent by adding or subtracting the carried
  exponents independently
