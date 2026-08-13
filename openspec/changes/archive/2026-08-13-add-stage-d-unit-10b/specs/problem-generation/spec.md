## ADDED Requirements

### Requirement: Percent prose carries independently verifiable source data

A prose display whose answer is derived by a percent relationship SHALL carry the named
source quantities and operation separately from its learner-facing text. Independent
verification SHALL reconstruct both the visible statement and the exact answer from that
structured data, without parsing prose, consulting the generator's stated answer, or using
rounded floating-point intermediates.

#### Scenario: A percent relationship is verified from displayed quantities

- **WHEN** a problem states that 12 is what percent of 60
- **THEN** the display carries 12 as the part and 60 as the whole
- **AND** verification reconstructs the visible statement from those values
- **AND** verification derives 20 as the answer independently

#### Scenario: Applied money remains exact

- **WHEN** a percent problem applies a rate to a dollar amount
- **THEN** the display carries the amount as exact integer cents and the rate as a whole-number percent
- **AND** verification derives the answer without a floating-point money intermediate
