## Purpose

Defines carried rows, aligned partial products, and shipped playability for multiplication content in Unit 3.

## ADDED Requirements

### Requirement: A multiplication row exposes its carried working

A multi-digit-by-one-digit column multiplication problem SHALL derive each written digit and
carry from the displayed multiplicand and one-digit multiplier. The working SHALL distinguish
the digit product from an incoming carry so hints, solution steps, and predicted
misconceptions can describe the same operation without recomputing it independently.

The final carry SHALL keep its true size. Multiplying a digit can carry more than one ten,
and learner-facing working MUST use that quantity rather than treating it as a binary flag.

#### Scenario: Each place includes the incoming carry

- **WHEN** a two-digit number is multiplied by one digit
- **THEN** the ones product determines the digit written and the carry into the tens
- **AND** the tens product adds that exact incoming carry after multiplying

#### Scenario: The final carry becomes leading digits

- **WHEN** the highest multiplicand digit produces a carry
- **THEN** that carry appears as the leading part of the stated product
- **AND** the written digits and carry together equal the independently recomputed answer

#### Scenario: Carrying mistakes remain diagnosable

- **WHEN** a `mult-2by1` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** each value follows from the displayed digits and carried working

### Requirement: Two-digit multiplication aligns partial products by place

A two-digit by two-digit multiplication problem SHALL derive one partial product from each
digit of the multiplier. Each row SHALL retain the multiplier digit's place, so the tens row
is worth ten times its unshifted digit product and carries a placeholder zero in its aligned
value. The stated answer SHALL equal the sum of the aligned rows.

#### Scenario: The ones row is unshifted

- **WHEN** the multiplier's ones digit is applied to the multiplicand
- **THEN** its partial product starts in the ones place

#### Scenario: The tens row is shifted one place

- **WHEN** the multiplier's tens digit is applied to the multiplicand
- **THEN** its partial product starts in the tens place
- **AND** its aligned value is ten times the unshifted digit product

#### Scenario: Partial products recombine to the answer

- **WHEN** every aligned partial product is added
- **THEN** the sum equals the product independently recomputed from the displayed operands

#### Scenario: The placeholder wall retains two diagnoses

- **WHEN** any `mult-2by2` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** one names an omitted tens-row placeholder

### Requirement: Stage B Unit 3 is playable as generated content

The system SHALL generate all 14 Stage B Unit 3 skills under their manifest ids:
`mult-meaning`, `times-2`, `times-10`, `times-5`, `times-3`, `times-4`, `times-6`,
`times-9`, `times-7-8`, `times-mixed`, `mult-by-10-100`, `mult-2by1`, `mult-2by2`,
and `mult-words`. Each SHALL satisfy the existing determinism, computed-answer,
measurable-difficulty, variety, agreement, phrasing, and content requirements.

Every Unit 3 problem SHALL answer with a non-negative whole number on the custom numeric
keypad. No Unit 3 problem may require an unbuilt input or rendering capability.

#### Scenario: Every Unit 3 manifest skill resolves as implemented

- **WHEN** the generator registry is resolved against the Stage B manifest
- **THEN** all 14 Unit 3 skill ids resolve as implemented
- **AND** the learner is offered them in curriculum order after Unit 2

#### Scenario: The table wall retains two diagnoses

- **WHEN** any `times-7-8` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** both values are products reached by using the wrong number of equal groups

#### Scenario: Multiplication stories remain independently verifiable

- **WHEN** a `mult-words` problem presents authored prose
- **THEN** it carries the two multiplied quantities and multiplication operator separately
- **AND** its answer is recomputed from those carried quantities rather than parsed prose

#### Scenario: Unit 3 uses the existing keypad

- **WHEN** any Unit 3 problem is presented
- **THEN** its correct answer is a non-negative integer
- **AND** the answer surface offers whole digits without invoking a system keyboard
