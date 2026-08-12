## ADDED Requirements

### Requirement: Proper-fraction stories use authored source-checked frames

A word problem asking for a part-over-whole fraction SHALL draw from a bank of at least eight
fixed adult-situation frames. Frame selection SHALL use the problem's seeded generator, and
every frame SHALL be checked directly against the content contract using quantity sets that
produce a positive proper fraction and three distinct surviving comprehension predictions.

#### Scenario: Every fraction frame is checked even when unsampled

- **WHEN** the source-level frame check runs
- **THEN** every authored fraction frame is checked and identified by its stable id
- **AND** an unregistered fraction frame bank fails the check

#### Scenario: Fraction check quantities match generated stories

- **WHEN** a fraction frame is instantiated for source checking
- **THEN** its part is positive and smaller than its whole
- **AND** its irrelevant quantity differs from the whole and is greater than one

#### Scenario: Three comprehension predictions survive

- **WHEN** a fraction frame combines its checked quantities
- **THEN** multiplying part and whole, dividing the part by the irrelevant quantity, and
  answering with the part produce three distinct values
- **AND** none equals the correct part-over-whole fraction
