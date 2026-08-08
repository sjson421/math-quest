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

A displayed expression MAY contain more than one operation. Recomputation SHALL read every
operand and every operator the display shows, so an expression cannot present a term the check
does not see.

#### Scenario: Answer is recomputed from the display, not the generator

- **WHEN** the content check examines a generated problem
- **THEN** it re-derives the answer from the displayed operands and operators alone
- **AND** fails if that value differs from the answer the generator stated

#### Scenario: Prose alone is not sufficient

- **WHEN** a problem presents its quantities as prose rather than as an expression
- **THEN** it also carries those quantities in machine-readable form
- **AND** the recomputation uses those rather than parsing the prose

#### Scenario: Every operation in a displayed expression is read

- **WHEN** a problem displays an expression containing more than one operator
- **THEN** recomputation reads every operand and operator shown
- **AND** fails and names the problem if the display cannot be read as an expression

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

### Requirement: Whole-number representation problems are independently verifiable

A problem that asks about a whole number without presenting binary arithmetic SHALL carry the
learner-visible values and the requested operation in machine-readable form. The correct
answer SHALL be independently derivable from that display data without trusting the answer
declared by the generator or parsing learner-facing prose.

This covers a property of a single number as much as its representation: which numbers divide
it, which numbers it divides into, and whether it has any divisor besides one and itself are
all derivable from the displayed value and the named operation.

For a choice problem, verification SHALL derive the expected learner-facing label from the
display data and then resolve the id of the declared choice carrying that label. Choice ids
SHALL be unique within the problem. These rules keep the internal id out of the lesson surface
without making it an unverifiable answer key or allowing two buttons to submit one answer.

#### Scenario: A keypad answer is recomputed from displayed number data

- **WHEN** a problem asks the learner to read, expand, inspect, or round a displayed whole number
- **THEN** verification computes the expected number from the displayed value and operation
- **AND** fails if it differs from the numeric answer the generator declared

#### Scenario: A choice answer is recomputed through its visible label

- **WHEN** a problem asks the learner to compare or order displayed numbers
- **THEN** verification computes the expected choice label from those numbers and the operation
- **AND** resolves the stable id of the declared choice carrying that label
- **AND** fails if that id differs from the choice answer the generator declared

#### Scenario: A number-property answer is recomputed through its visible label

- **WHEN** a problem asks which numbers are factors or multiples of a displayed value, or whether it is prime
- **THEN** verification derives the expected label from that value and the named operation
- **AND** resolves the stable id of the declared choice carrying that label
- **AND** fails if that id differs from the choice answer the generator declared

#### Scenario: Display metadata and visible choices cannot disagree silently

- **WHEN** the expected label derived from a whole-number display is absent or duplicated
- **THEN** verification fails and names the problem instead of accepting its stored answer

#### Scenario: Choice ids are unique

- **WHEN** a whole-number problem declares authored choices
- **THEN** every declared choice has a different stable id
- **AND** verification fails if two buttons would submit the same id

### Requirement: Stage A Unit 0 is playable as generated content

The system SHALL generate all eight Stage A Unit 0 skills under their manifest ids:
`read-numbers`, `place-value-tens`, `place-value-hundreds`, `expanded-form`,
`compare-numbers`, `order-numbers`, `round-to-10`, and `round-to-100`. Each SHALL satisfy the
existing determinism, computed-answer, measurable-difficulty, variety, agreement, and content
requirements.

Compare and order problems SHALL use authored choice controls. Read, place-value,
expanded-form, and rounding problems SHALL use the custom numeric keypad. No Unit 0 problem
may invoke a system keyboard.

#### Scenario: Every Unit 0 manifest skill resolves as implemented

- **WHEN** the generator registry is resolved against the Stage A manifest
- **THEN** all eight Unit 0 skill ids resolve as implemented
- **AND** the learner is offered them in curriculum order

#### Scenario: Comparison and ordering use authored choices

- **WHEN** a comparison or ordering problem is generated
- **THEN** its declared choices contain exactly one label derived as correct from the displayed numbers
- **AND** the answer is the stable id of that choice

#### Scenario: The midpoint rounds upward

- **WHEN** a `round-to-10` or `round-to-100` problem displays a value exactly halfway between neighbours
- **THEN** the computed answer is the higher neighbour

#### Scenario: The rounding wall retains two diagnoses

- **WHEN** any `round-to-100` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** each names a rounding error that produces its predicted value

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

### Requirement: Long division exposes its per-digit working

A long-division problem SHALL derive its quotient from the displayed dividend and divisor one
quotient digit at a time. Each step SHALL distinguish the dividend digit brought down, the
working value that digit joins, the quotient digit chosen for that place, the amount
subtracted, and the remainder carried into the next step.

Steps SHALL run from the highest place to the lowest, which is the order the work is done. The
quotient digits together with the final remainder SHALL reconstruct the dividend exactly, so
hints, solution steps, and predicted misconceptions describe the same working rather than each
recomputing the division on their own terms.

#### Scenario: A step divides the remainder carried into it, not the digit alone

- **WHEN** a step follows one that left a non-zero remainder
- **THEN** the value it divides is that remainder shifted one place plus the digit brought down
- **AND** its quotient digit is chosen against that combined value

#### Scenario: The working reconstructs the dividend

- **WHEN** every step of a long division is complete
- **THEN** the quotient multiplied by the divisor, plus the final remainder, equals the dividend
- **AND** the quotient equals the value independently recomputed from the displayed operands

#### Scenario: The algorithm wall retains two diagnoses

- **WHEN** any `long-div-1digit` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** one names a final digit that was never brought down
- **AND** one names a step remainder that was never carried forward

#### Scenario: The estimating wall retains two diagnoses

- **WHEN** any `long-div-2digit` problem reaches the learner
- **THEN** at least two distinct predicted misconception values remain after filtering
- **AND** both follow from estimating one quotient digit too high or too low in its own place

### Requirement: A displayed expression may be asked for a property of its result

A problem MAY display an arithmetic expression whose correct answer is a property of that
arithmetic rather than its value — the remainder of a division, or its whole-number quotient
where a remainder is discarded. Such a problem SHALL carry the displayed operands and the
property requested in machine-readable form, and its prompt SHALL name which is wanted.

Independent verification SHALL derive the answer from the carried operands and the named
property. Evaluating the displayed expression alone SHALL NOT be treated as the answer,
because for these problems it is not.

#### Scenario: A remainder answer is verified as a remainder

- **WHEN** a problem displays a division and asks what is left over
- **THEN** verification computes the remainder from the carried dividend and divisor
- **AND** fails if it differs from the answer the generator declared

#### Scenario: A quotient answer discards its remainder

- **WHEN** a problem displays a division that does not come out exactly and asks for the quotient
- **THEN** verification computes the whole-number quotient from the carried operands
- **AND** the stated answer excludes the remainder, which the worked solution still names

#### Scenario: The displayed expression and the carried operands agree

- **WHEN** a problem carries operands alongside a displayed expression
- **THEN** the expression shown to the learner is built from exactly those operands
- **AND** verification fails and names the problem if they disagree

### Requirement: Stage B Unit 4 is playable as generated content

The system SHALL generate all 11 Stage B Unit 4 skills under their manifest ids:
`div-meaning`, `div-facts`, `div-remainder`, `div-by-10-100`, `long-div-1digit`,
`long-div-remainder`, `long-div-2digit`, `factors`, `multiples`, `primes`, and `div-words`.
Each SHALL satisfy the existing determinism, computed-answer, measurable-difficulty, variety,
agreement, phrasing, and content requirements.

Every Unit 4 answer SHALL be a non-negative whole number entered on the custom numeric keypad,
or a choice among declared options. No Unit 4 problem may require an input or rendering
capability that has not been built, and no Unit 4 answer may be a fraction or a decimal.

#### Scenario: Every Unit 4 manifest skill resolves as implemented

- **WHEN** the generator registry is resolved against the Stage B manifest
- **THEN** all 11 Unit 4 skill ids resolve as implemented
- **AND** the learner is offered them in curriculum order after Unit 3

#### Scenario: Division never produces a fractional answer

- **WHEN** any Unit 4 problem is generated at any difficulty
- **THEN** its correct answer is a non-negative integer
- **AND** a division that does not come out exactly is asked as a remainder or a whole quotient

#### Scenario: Set-valued skills answer through choices rather than a new input mode

- **WHEN** `factors`, `multiples`, or `primes` presents a problem
- **THEN** the learner picks among declared options rather than entering several values
- **AND** no capability outside `AVAILABLE_CAPABILITIES` is required to play it

#### Scenario: Division stories remain independently verifiable

- **WHEN** a `div-words` problem presents authored prose
- **THEN** it carries the two divided quantities and the division operator separately
- **AND** its answer is recomputed from those carried quantities rather than parsed prose

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

### Requirement: A displayed value may be asked for its distance from zero

A problem MAY display a value and ask how far it lies from zero rather than what it evaluates
to. Such a problem SHALL carry the displayed value and the requested operation in
machine-readable form, and independent verification SHALL derive the answer from that carried
value.

Reading the display as arithmetic SHALL NOT be treated as the answer. Distance from zero is
not an arithmetic operator, so the display is not an expression that can be evaluated — and
if the sign were simply dropped from the display to make it one, the problem would stop
asking its question. This is the same separation `divide-remainder` needed: the answer is a
property of what is shown, not its value.

#### Scenario: A distance-from-zero answer is verified from the carried value

- **WHEN** a problem displays a value and asks how far it is from zero
- **THEN** verification computes the magnitude of the carried value
- **AND** fails if it differs from the answer the generator declared

#### Scenario: A negative value and its magnitude are not confused

- **WHEN** a problem displays a negative value and asks how far it is from zero
- **THEN** the expected answer is the value without its sign
- **AND** verification fails if the generator declared the signed value instead

#### Scenario: The displayed value and the carried value agree

- **WHEN** a problem carries a value alongside a distance-from-zero display
- **THEN** the value shown to the learner is the carried value
- **AND** verification fails and names the problem if they disagree

### Requirement: A signed value is displayed and verified as one value

A problem MAY display a negative value, and MAY predict a mistake whose value is negative.
Where a sign is shown to the learner it SHALL use the same notation the rest of the course
uses for subtraction, and independent verification SHALL read a displayed sign as part of the
value it belongs to rather than as an operation applied to it.

One notation, in one place, is the requirement. The notation a learner reads and the notation
an answer is submitted in are allowed to differ — they already do — but a value that appears
twice in one view SHALL appear the same way both times. A display showing one sign glyph
beside an answer slot showing another is the control disagreeing with itself about what it
just did, which reads as a defect and cannot be distinguished from one.

#### Scenario: A signed display is recomputed correctly

- **WHEN** a problem displays arithmetic with one or more negative operands
- **THEN** verification evaluates it with each sign attached to its own value
- **AND** fails if the result differs from the answer the generator declared

#### Scenario: A predicted mistake may be negative

- **WHEN** a generator predicts a mistake whose value is below zero
- **THEN** the prediction is carried and diagnosed like any other
- **AND** it is filtered only if it equals the correct answer or another prediction

#### Scenario: One value does not appear in two notations at once

- **WHEN** a value the learner has entered is shown back beside a problem that also shows a sign
- **THEN** both are drawn with the same sign notation

### Requirement: The wording gate records every field a generator sets

The per-unit recorded-output gate SHALL render every field a problem carries, and SHALL fail
naming any field a generator sets that it does not render.

A field the gate does not render is a field the gate does not protect. What a problem permits
to be typed into it, and which line a value is placed on, are both authored decisions that
change what the learner sees and can be got wrong silently — so both are recorded alongside
the prompt, the display and the answer rather than left to a reviewer to notice missing.

#### Scenario: An answer-entry declaration is recorded

- **WHEN** a generator declares which character classes its answer may use
- **THEN** the recorded output for that problem shows the declaration

#### Scenario: A declared number line is recorded

- **WHEN** a generator declares the line its answer is placed on
- **THEN** the recorded output for that problem shows that line

#### Scenario: An unrendered field fails the gate

- **WHEN** a generator sets a field the gate does not render
- **THEN** the gate fails and names that field

### Requirement: Stage C Unit 6 is playable as generated content

The system SHALL generate all nine Stage C Unit 6 skills under their manifest ids:
`negatives-numberline`, `compare-negatives`, `add-neg-pos`, `add-two-negs`, `sub-negatives`,
`mult-negatives`, `div-negatives`, `absolute-value`, and `negatives-mixed`. Each SHALL satisfy
the existing determinism, computed-answer, measurable-difficulty, variety, agreement, and
content requirements.

Every Unit 6 value SHALL be a whole number, positive or negative. No Unit 6 problem may
require a rendering or input mode Stage C does not already declare: answers are typed on the
custom keypad, chosen among declared options, or placed on a declared number line.

`negatives-numberline` SHALL place its value on a line rather than typing it, and
`compare-negatives` SHALL answer among declared choices. Every other Unit 6 skill SHALL answer
on the keypad.

The two skills the curriculum document marks as walls, and the one it marks a major wall,
SHALL each carry at least two distinct predicted mistakes that survive collision filtering on
**every** problem they generate, not on average.

#### Scenario: Every Unit 6 skill resolves as playable

- **WHEN** the course is derived from the manifest and the generator registry
- **THEN** all nine Unit 6 skills resolve as implemented
- **AND** they are offered in curriculum order

#### Scenario: Unit 6 values stay whole

- **WHEN** any Unit 6 problem is generated at any difficulty
- **THEN** its correct answer is a whole number
- **AND** every value it predicts as a mistake is a whole number

#### Scenario: A negative answer can be entered

- **WHEN** a Unit 6 problem's correct answer is below zero
- **THEN** the problem permits a sign to be entered

#### Scenario: The walls keep two diagnoses on every problem

- **WHEN** a Unit 6 wall skill generates a problem at any difficulty
- **THEN** at least two distinctly tagged predicted mistakes survive to the learner

#### Scenario: Opening Stage C makes it completable

- **WHEN** the last Unit 6 skill is mastered
- **THEN** the Stage C checkpoint is reached, because Unit 6 is the whole of Stage C

