# unit-01-addition Specification

## Purpose
Defines stacked-column working and quantitative carry behavior for addition content in Unit 1.
## Requirements
### Requirement: Column arithmetic supports a stack of more than two operands

A column problem SHALL be able to present more than two operands stacked over one rule, and
every guarantee the two-operand case already carries SHALL hold unchanged for it: the answer
is derived from the operands chosen, recomputable from the display alone, and every hint,
solution step and predicted misconception describes the same working.

The existing requirements are written against two operands throughout, and the machinery
behind them assumes it — a stack breaks that assumption in a way that is invisible until a
generator quietly states a wrong answer. Two consequences are stated separately below because
neither is implied by the binary case.

Where a stack presents its operands, the display SHALL carry every one of them. Recomputation
SHALL fold across all of the carried operands rather than the first two, so a problem cannot
display a third addend that the check does not see.

#### Scenario: Every stacked operand is carried and checked

- **WHEN** a problem displays three addends stacked in a column
- **THEN** the display carries all three operands
- **AND** the answer is re-derived by folding the operator across all three
- **AND** the check fails if that value differs from the answer the generator stated

#### Scenario: One operator governs the whole stack

- **WHEN** a column problem carries more than two operands
- **THEN** it names a single operator applying to all of them
- **AND** recomputation folds that one operator across the operands in the order carried

### Requirement: Unit 1 skills carry reviewed intro teaching lines

Each Stage B Unit 1 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `add-facts-small` | Addition combines two amounts into one total. |
| `add-facts` | Start with the larger number and count on the smaller number. |
| `add-tens` | Add the counts of tens, then read the result as tens. |
| `add-2digit-nocarry` | Line up ones under ones and tens under tens, then add each column. |
| `add-2digit-carry` | When the ones total 10 or more, write the ones digit and carry the ten. |
| `add-3digit` | Add from right to left, carrying into the next column when needed. |
| `add-three-numbers` | Add all three digits in each column, then carry every full ten. |
| `add-words` | Find the two amounts being combined, then add them. |

#### Scenario: Every Unit 1 intro uses its reviewed line

- **WHEN** the Unit 1 generator set is checked at its authored source
- **THEN** all eight ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits

#### Scenario: Unit 1 examples retain computed answers

- **WHEN** each Unit 1 intro generates its stable difficulty-1 example
- **THEN** the correct answer can be recomputed independently from the quantities visible in that example
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, or misconception

### Requirement: A column carry may exceed one

A column SHALL be able to carry more than a single unit into the place above. Adding two
digits can only ever carry one ten; adding three can carry two, and any rule that treats a
carry as a flag rather than a quantity is silently wrong for exactly the problems this
requirement exists to allow.

Anything derived from a carry — the working shown to the learner, and the value a predicted
misconception names — SHALL use the carry's actual size. In particular, the wrong answer
produced by dropping a carry SHALL be short by the full carried amount, not by one unit of the
place above.

#### Scenario: A carry is reported at its true size

- **WHEN** a column's digits and its incoming carry total twenty or more
- **THEN** the carry into the place above is the number of whole tens in that total
- **AND** the working shown for the place above adds that carry, not a single unit

#### Scenario: Dropping a carry of two predicts the right wrong answer

- **WHEN** a problem predicts the answer a learner reaches by dropping a carry of 2
- **THEN** the predicted value is the correct answer less two units of the place above

#### Scenario: Predicted values still never collide with the answer

- **WHEN** a stacked problem predicts the mistakes its arithmetic invites
- **THEN** no predicted value equals the correct answer
- **AND** no two predicted values are equal
