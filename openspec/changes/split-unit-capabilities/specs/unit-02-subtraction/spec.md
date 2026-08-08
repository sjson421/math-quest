## Purpose

Defines borrow-chain working, diagnoses, and shipped playability for subtraction content in Unit 2.

## ADDED Requirements

### Requirement: A borrow may travel across more than one column

A subtraction problem SHALL be able to present a column that cannot lend the ten asked of it,
so that the borrow travels a further column before anything can be subtracted. Everything the
learner is shown about that column SHALL be a value they would write down.

Taking one ten from a column already standing at zero yields a negative intermediate. That
value is arithmetically consistent and is what a naive column-by-column derivation produces,
but nobody writes it: the working a learner does is to reduce the first column that has
something to lend, leave nine standing in each column the borrow passed through, and only then
subtract. A hint, solution step, or predicted misconception showing the negative intermediate
describes working nobody does, on the one skill in the unit where the working is the whole
lesson.

The chained value SHALL be derivable for every column of a subtraction, whether or not that
column participates in a chain, so that a single-borrow skill and a chained one describe their
columns the same way.

#### Scenario: A column the borrow passes through reads as nine

- **WHEN** a subtraction borrows through a column standing at zero
- **THEN** that column is shown as nine after the borrow has passed through it
- **AND** no learner-facing text names a negative value for it

#### Scenario: The reduction lands on the column that could lend

- **WHEN** a borrow travels past one or more columns that cannot lend
- **THEN** the first column able to lend is shown reduced by one
- **AND** every column between it and the borrowing column is shown as nine

#### Scenario: The chained view agrees with the stated answer

- **WHEN** a chained borrow problem is checked
- **THEN** the digits its solution names, read in place order, are the digits of the stated answer
- **AND** the check fails if they differ

#### Scenario: A single-borrow column is described the same way

- **WHEN** a subtraction borrows from a column that can lend directly
- **THEN** the chained view reports that column reduced by one and no column standing at nine

### Requirement: A borrow-chain misconception spans the columns the chain crossed

A predicted misconception about a borrow SHALL account for every column the borrow crossed,
not only the two columns nearest it. Predictions written against a single borrow are silently
wrong on a chained one — they name a value the learner could not have reached — and a wall
skill whose predictions never fire gives the bare "not quite" that the diagnosis rule exists
to prevent.

#### Scenario: Borrowing without reducing is predicted across the whole chain

- **WHEN** a problem predicts the answer a learner reaches by taking the ten but never reducing
- **THEN** the predicted value reflects every column the borrow crossed left un-reduced
- **AND** it is a number, not an unrepresentable value produced by a column going negative

#### Scenario: A stopped chain is predicted distinctly

- **WHEN** a problem predicts the answer a learner reaches by completing the chain's first leg only
- **THEN** the predicted value differs from both the correct answer and every other prediction

#### Scenario: The wall keeps two diagnoses

- **WHEN** any `sub-across-zero` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** each names a borrowing error that produces its predicted value

### Requirement: Stage B Unit 2 is playable as generated content

The system SHALL generate all eight Stage B Unit 2 skills under their manifest ids:
`sub-facts-small`, `sub-facts`, `sub-tens`, `sub-2digit-noborrow`, `sub-2digit-borrow`,
`sub-3digit-borrow`, `sub-across-zero`, and `sub-words`. Each SHALL satisfy the existing
determinism, computed-answer, measurable-difficulty, variety, agreement, and content
requirements.

Every Unit 2 problem SHALL answer with a whole number on the custom numeric keypad. No Unit 2
problem may present a negative difference, invoke a system keyboard, or require an input mode
the system does not have.

#### Scenario: Every Unit 2 manifest skill resolves as implemented

- **WHEN** the generator registry is resolved against the Stage B manifest
- **THEN** all eight Unit 2 skill ids resolve as implemented
- **AND** the learner is offered them in curriculum order

#### Scenario: Differences stay non-negative

- **WHEN** any Unit 2 problem is generated
- **THEN** its correct answer is zero or greater
- **AND** the keypad it is answered on offers digits only

#### Scenario: Borrowing skills actually borrow

- **WHEN** a `sub-2digit-borrow`, `sub-3digit-borrow`, or `sub-across-zero` problem is generated
- **THEN** at least one column requires a borrow
- **AND** a `sub-2digit-noborrow` problem requires none
