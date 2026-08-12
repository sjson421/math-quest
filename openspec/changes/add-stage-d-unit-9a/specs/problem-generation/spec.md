## ADDED Requirements

### Requirement: Decimal displays carry exact base-ten semantics

A displayed decimal problem SHALL carry integer source digits and their base-ten scales for
every visible decimal, together with the operation or property being asked. Verification
SHALL reconstruct the visible decimal text from those fields and SHALL derive the answer with
exact rational arithmetic rather than binary floating-point arithmetic.

#### Scenario: Visible decimal text agrees with semantic data

- **WHEN** a decimal problem carries coefficient `304` at scale `2`
- **THEN** verification reconstructs the visible value as `3.04`
- **AND** fails if the displayed digits, decimal point, or retained place disagree

#### Scenario: Decimal arithmetic is recomputed exactly

- **WHEN** a decimal addition display carries `0.1 + 0.2`
- **THEN** verification derives the exact value `3/10`
- **AND** it does not depend on the host language's floating-point result

#### Scenario: Decimal properties use the carried operation

- **WHEN** a decimal display asks for a place digit, reading, comparison, or rounding result
- **THEN** verification derives that result from the carried coefficients, scales, requested
  place, and operation
- **AND** fails if the generator's stated answer disagrees
