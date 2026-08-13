## ADDED Requirements

### Requirement: Ratio and proportion displays carry independently verifiable source data

A prose or structured-math display whose answer is derived from a ratio, unit rate,
proportion, scale drawing, or unit conversion SHALL carry the named source quantities,
units, and operation separately from its learner-facing output. Independent verification
SHALL reconstruct the visible statement or notation and derive the exact numeric answer or
unique choice from that structured data without parsing prose or consulting the generator's
stated answer.

#### Scenario: A directed ratio is rebuilt from category counts

- **WHEN** a problem asks for the ratio of one stated category count to another
- **THEN** verification reconstructs the category order and visible statement from the
  carried counts and labels
- **AND** it derives the exact first-to-second rational value independently

#### Scenario: A best-value choice is rebuilt from both offers

- **WHEN** a problem asks which of two offers has the lower unit price
- **THEN** verification reconstructs both visible offers from their carried counts and
  prices
- **AND** it derives the unique choice by comparing both exact per-item rates

#### Scenario: A proportion or conversion keeps its displayed relation honest

- **WHEN** a problem displays an equal-ratio, scale, or measurement-conversion relation
- **THEN** verification reconstructs every visible value, blank, and unit from structured
  data
- **AND** it fails if the visible relation or stated answer disagrees with that data
