# Problem Generation

## Purpose

The contract every problem generator meets: what it must compute for itself, what must be
recoverable from what the learner sees, and what must stay true when the machinery behind it
is rewritten.

These rules already hold in practice but have never been written down. Stating them matters
now because 195 generators are still to be authored, and a rule enforced only by a test that
someone remembers to copy is a rule that will eventually be skipped.

## Requirements

### Requirement: A problem is fully determined by its skill, seed, and difficulty

Generating a problem from the same skill, seed, and difficulty SHALL produce an identical
problem every time, including its prose. Nothing in generation may read the clock, a global
counter, or an unseeded random source. Reproducibility is what makes a reported wrong answer
investigable — without it, a bad problem cannot be recovered from a bug report.

#### Scenario: Same seed yields the same problem

- **WHEN** a skill generates at seed 12345 and difficulty 3 twice
- **THEN** the two problems are deeply equal
- **AND** their displayed text, hint, solution steps and misconceptions all match

#### Scenario: Every generated string is seeded

- **WHEN** a generator selects among alternative wordings
- **THEN** the selection is drawn from the seeded generator passed to it
- **AND** never from an unseeded random source

### Requirement: Generators compute their own answers

A generator SHALL derive its answer from the operands it has just chosen. Answers MUST NOT be
hardcoded, looked up from a table, or obtained from any runtime service. This is the property
that makes correctness structural rather than a matter of proofreading.

#### Scenario: Answer follows from the chosen operands

- **WHEN** a generator picks operands and builds a problem
- **THEN** the stated answer is computed from those operands

### Requirement: A displayed problem carries enough to recompute its answer

Whatever a problem shows the learner SHALL be sufficient to re-derive the correct answer
independently, without consulting the answer the generator stated. A problem whose answer can
only be taken on trust is not verifiable, and a wrong answer key is the one defect this app
cannot survive.

#### Scenario: Answer is recomputed from the display, not the generator

- **WHEN** the content check examines a generated problem
- **THEN** it re-derives the answer from the displayed operands and operator alone
- **AND** fails if that value differs from the answer the generator stated

#### Scenario: Prose alone is not sufficient

- **WHEN** a problem presents its quantities as prose rather than as an expression
- **THEN** it also carries those quantities in machine-readable form
- **AND** the recomputation uses those rather than parsing the prose

### Requirement: Difficulty scales the problem measurably

Raising a skill's difficulty SHALL make its problems harder in a way that can be checked, not
merely declared. Difficulty is derived from the learner's mastery, so a band that does not
actually change the work leaves a learner repeating the same problem at every level.

#### Scenario: Higher difficulty produces larger work

- **WHEN** a skill is sampled across its full difficulty range
- **THEN** problems at the highest difficulty are measurably larger than at the lowest

#### Scenario: A flat difficulty ladder is rejected

- **WHEN** a skill produces the same operand range at every difficulty
- **THEN** the check fails and names the skill

### Requirement: Degenerate problems never reach the learner

A generator SHALL reject operand choices that teach nothing — a quantity multiplied by zero,
a value subtracted from itself, an operand of 1 where the skill is about combining — and draw
again rather than contorting its selection logic to avoid them. It SHALL also produce varied
problems rather than repeating a small handful across a lesson.

#### Scenario: Trivial operands are redrawn

- **WHEN** a draw produces operands the skill considers degenerate
- **THEN** the draw is rejected and repeated

#### Scenario: Sampling shows variety

- **WHEN** a skill is sampled across its difficulty range
- **THEN** the sample contains many distinct problems rather than a few repeated ones

### Requirement: Every part of a problem agrees with every other part

A problem's display, hint, solution steps, and predicted misconceptions SHALL all describe
the same arithmetic on the same operands. A hint naming digits the display does not show, or
a solution step whose stated result contradicts the answer, is a defect even though every
individual piece is well-formed.

#### Scenario: Solution detail matches the displayed operands

- **WHEN** a solution step shows the arithmetic for a column
- **THEN** the digits it names are the digits of the operands actually displayed

#### Scenario: Predicted misconception follows the same working

- **WHEN** a misconception predicts the value a named mistake produces
- **THEN** that value is derived from the same operands the problem displays

### Requirement: Reworking how a generator is built does not change what it produces

When a generator is rewritten onto shared machinery without any intended change to its
content, its output SHALL remain identical for every seed and difficulty. The learner-facing
text of a working skill is authored content, and a refactor that quietly rewords a hint has
changed the course while claiming to change nothing.

#### Scenario: Refactor is checked against recorded output

- **WHEN** a generator is rebuilt on shared helpers with no intended content change
- **THEN** its sampled output matches the output recorded before the rebuild
- **AND** any difference fails the check and shows what changed

#### Scenario: Intended content changes are recorded deliberately

- **WHEN** a generator's content is deliberately changed
- **THEN** the recorded output is updated in the same change as a reviewable difference

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

