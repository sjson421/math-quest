# unit-05-order-of-operations Specification

## Purpose
Defines precedence evaluation, meaningful parentheses, and shipped playability for Unit 5 expressions.
## Requirements
### Requirement: A displayed expression is evaluated under operator precedence

Where a problem displays an expression with more than one operation, the correct answer SHALL
be the value of that expression under conventional operator precedence: parenthesised groups
first, then multiplication and division, then addition and subtraction, with operations of
equal precedence applied left to right.

Independent verification SHALL evaluate the displayed expression under those rules rather than
folding its operators in the order they appear. Folding left to right is itself the mistake
this unit teaches against, so a check that folded would agree with a generator that made it.

Answering an expression is distinct from answering a property of one. Where the answer is the
expression's value, the display carries no separate machine-readable operands, because
re-rendering carried operands into the expression already shown would verify the generator
against itself rather than against what the learner sees.

#### Scenario: Precedence is applied, not left-to-right order

- **WHEN** a problem displays an addition followed by a multiplication
- **THEN** verification multiplies before adding
- **AND** fails if the generator's stated answer is the left-to-right value instead

#### Scenario: Parenthesised groups are evaluated first

- **WHEN** a displayed expression contains a parenthesised group
- **THEN** verification evaluates that group before applying the operators outside it

#### Scenario: Equal precedence runs left to right

- **WHEN** a displayed expression applies two operators of the same precedence in sequence
- **THEN** verification applies the leftmost first
- **AND** fails if the stated answer follows the order the operators are named in PEMDAS

#### Scenario: An unreadable expression fails rather than passing

- **WHEN** a displayed expression cannot be read as operands, operators and balanced parentheses
- **THEN** verification fails and names the problem

### Requirement: Parentheses appear only where they change the value

A displayed expression SHALL show parentheses only around a group that precedence would not
have evaluated first. An expression whose brackets could be removed without changing its value
SHALL NOT display them.

Redundant parentheses make a problem about reading order into a problem with no order to read.
On a skill teaching that brackets come first, they also silently disarm the diagnosis for
ignoring them: the value reached by dropping the brackets equals the correct answer, the
prediction is filtered as a collision, and the skill ships looking like it diagnoses a mistake
it can never name.

#### Scenario: Brackets shown are brackets that matter

- **WHEN** a problem displays a parenthesised group
- **THEN** evaluating the same expression without those parentheses gives a different value

#### Scenario: Precedence-redundant brackets are not displayed

- **WHEN** a group would be evaluated first by precedence alone
- **THEN** the displayed expression omits its parentheses

### Requirement: Stage B Unit 5 is playable as generated content

The system SHALL generate all three Stage B Unit 5 skills under their manifest ids:
`two-operations`, `with-parentheses`, and `pemdas`. Each SHALL satisfy the existing
determinism, computed-answer, measurable-difficulty, variety, agreement, and content
requirements.

Every Unit 5 answer SHALL be a non-negative whole number entered on the custom numeric keypad.
Every intermediate value the working passes through, and every predicted misconception value,
SHALL likewise be a non-negative whole number. A negative intermediate would name a value the
course has not taught, and a fractional prediction is a diagnosis a whole-digit keypad can
never produce — it sits in the bank looking like coverage and never once fires.

No Unit 5 problem may require an input or rendering capability that has not been built, and no
Unit 5 problem may use an exponent, which `docs/curriculum.md` introduces at 12.10.

#### Scenario: Every Unit 5 manifest skill resolves as implemented

- **WHEN** the generator registry is resolved against the Stage B manifest
- **THEN** all three Unit 5 skill ids resolve as implemented
- **AND** the learner is offered them in curriculum order after Unit 4

#### Scenario: Nothing in an expression goes negative or fractional

- **WHEN** any Unit 5 problem is generated at any difficulty
- **THEN** its correct answer is a non-negative integer
- **AND** every intermediate value its worked solution names is a non-negative integer
- **AND** every predicted misconception value is a non-negative integer

#### Scenario: Unit 5 uses the existing keypad

- **WHEN** any Unit 5 problem is presented
- **THEN** the answer surface offers whole digits without invoking a system keyboard
- **AND** no capability outside `AVAILABLE_CAPABILITIES` is required to play it

#### Scenario: The ordering wall retains two diagnoses

- **WHEN** any `two-operations` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** one names the value reached by taking the operations in the order they are written
- **AND** one names the value of the operation precedence does first, answered alone

#### Scenario: Ignoring the brackets is diagnosed

- **WHEN** any `with-parentheses` problem reaches the learner
- **THEN** one predicted value is the expression evaluated as though its parentheses were absent
- **AND** one predicted value is the bracketed group's own value

#### Scenario: PEMDAS read as six steps is diagnosed

- **WHEN** a `pemdas` problem displays two operations of equal precedence in sequence
- **THEN** one predicted value follows multiplication before division, or addition before subtraction
- **AND** that value differs from the correct answer, which applies them left to right

#### Scenario: A division inside an expression comes out exactly

- **WHEN** a Unit 5 expression contains a division
- **THEN** that division's operands are composed so it divides without remainder
- **AND** the draw does not rely on rejecting candidates that would not

### Requirement: Unit 5 skills carry reviewed intro teaching lines

Each Stage B Unit 5 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `two-operations` | Multiply or divide before adding or subtracting. |
| `with-parentheses` | Work inside parentheses before using operations outside them. |
| `pemdas` | Use parentheses first, then multiply or divide left to right, then add or subtract left to right. |

#### Scenario: Every Unit 5 intro uses its reviewed line

- **WHEN** the Unit 5 generator set is checked at its authored source
- **THEN** all three ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces exponents before Unit 12

#### Scenario: Unit 5 examples retain precedence answers

- **WHEN** each Unit 5 intro generates its stable difficulty-1 example
- **THEN** its correct answer can be recomputed independently from the visible expression under the stated precedence rules
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, or misconception
