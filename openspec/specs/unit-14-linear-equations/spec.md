# Unit 14 Linear Equations Specification

## Purpose

Unit 14's first six skills teach solving a linear equation: that both sides stay equal under
the same operation, undoing one operation, undoing two in the right order, gathering
variables from both sides, and clearing parentheses first. It is the course's first content
to display an equation rather than an open expression.

## Requirements

### Requirement: Keeping the balance applies one operation to both sides

An `equation-balance` problem SHALL display a true numeric equality and state one operation
applied to both sides, and SHALL require the value each side becomes. It SHALL be answerable
on the existing numeric keypad and SHALL remain a `quick` skill, ending after five correct
answers as the manifest declares.

The displayed equality SHALL be a sum whose stated total is correct, so the learner reads a
balance that already holds before anything is applied to it. The skill teaches the axiom the
rest of the unit rests on — the same operation on both sides preserves equality — and does
not ask the learner to isolate a variable, which is the next skill's work.

#### Scenario: The same addition is applied to both sides

- **WHEN** a problem displays `7 + 8 = 15` and states that 6 is added to both sides
- **THEN** the exact answer is 21
- **AND** that value is what each side independently becomes

#### Scenario: The displayed equality holds before the operation

- **WHEN** an `equation-balance` problem is generated
- **THEN** the stated total equals the sum of the displayed operands

### Requirement: One-step equations undo a single operation

A `one-step-addsub` problem SHALL display an equation of the form `x + b = c` or `x − b = c`
and require the value of the variable. A `one-step-multdiv` problem SHALL display an
equation of the form `ax = c` or `x / a = c` and require the value of the variable. Both
SHALL be answered on the numeric keypad, and both SHALL have a whole-number solution.

Each SHALL predict the mistake of repeating the displayed operation instead of undoing it.
Both problems SHALL compose from the right-hand side rather than from the solution, because
that prediction runs through the right-hand side: repeating a multiplication is
`rightHand × coefficient` and repeating a division is `rightHand ÷ coefficient`.

A `one-step-multdiv` problem displaying a division SHALL therefore make the right-hand side
a multiple of the coefficient, which makes both the solution and the repeated-division
prediction whole. Its coefficient SHALL stay small, since the solution is then the
coefficient squared times the chosen multiple.

This bound guards a failure the existing checks do not see. A fractional prediction here is
still a *finite* number, so it survives the generator's filtering and counts as a surviving
misconception — while being a value no whole-number keypad can ever submit. It is dead
rather than dropped, and only a check on the predicted values themselves finds it.

#### Scenario: An addition is undone by subtracting

- **WHEN** a problem displays `x + 7 = 12`
- **THEN** the exact answer is 5
- **AND** a predicted misconception is 19, the result of adding 7 instead of subtracting it

#### Scenario: A multiplication is undone by dividing

- **WHEN** a problem displays `5x = 20`
- **THEN** the exact answer is 4
- **AND** a predicted misconception is 100, the result of multiplying instead of dividing

#### Scenario: A division equation solves to a whole number

- **WHEN** a `one-step-multdiv` problem displays `x ÷ 3 = 6`
- **THEN** the exact answer is 18
- **AND** a predicted misconception is 2, from dividing again instead of multiplying

#### Scenario: No predicted mistake is a value the keypad cannot submit

- **WHEN** any Unit 14a problem is generated at any difficulty
- **THEN** every predicted misconception that reaches the learner is a whole number

### Requirement: Two-step equations are composed so both wall predictions survive

A `two-step` problem SHALL display an equation of the form `ax + b = c` or `ax − b = c` and
require the value of the variable. As a wall, it SHALL predict at least two distinct
misconceptions that survive `generateProblem`'s answer-collision and dedup filtering:

- **undoing in the wrong order** — dividing by the coefficient before undoing the constant,
  giving `c / a − b` for an addition and `c / a + b` for a subtraction;
- **undoing with the wrong sign** — applying the displayed operation instead of its inverse,
  giving `(c + b) / a` for an addition and `(c − b) / a` for a subtraction.

Both predicted values are whole numbers only when the coefficient divides the constant.
Operands SHALL therefore be **composed** from a chosen solution and a chosen multiple of the
coefficient, rather than drawn and filtered: a filtered draw for three simultaneous
divisibility properties is the shape that exhausted `sub-across-zero`'s draw in front of a
learner, and a fractional prediction is dropped before the learner ever sees it, leaving the
wall with fewer than the two distinct diagnoses the content contract requires.

The composition SHALL keep the constant a non-zero multiple of the coefficient and the
coefficient greater than one. Both bounds are load-bearing and they fail differently: at
`b = 0` **both** predictions collapse onto the correct answer, and at `a = 1` the
wrong-order one does.

#### Scenario: Both wall predictions are whole numbers

- **WHEN** a problem displays `3x + 6 = 21`
- **THEN** the exact answer is 5
- **AND** a predicted misconception is 1, from dividing before subtracting
- **AND** a predicted misconception is 9, from adding the constant instead of subtracting it

#### Scenario: Every two-step problem carries two surviving diagnoses

- **WHEN** any `two-step` problem is generated at any difficulty
- **THEN** at least two distinct predicted misconceptions survive to the learner
- **AND** neither equals the correct answer

### Requirement: Variables on both sides are gathered before solving

A `vars-both-sides` problem SHALL display an equation with a variable term on each side and
require the value of the variable. Its operands SHALL be composed from a chosen solution so
that the solution is a whole number, and the two coefficients SHALL differ so the variable
does not cancel. The left constant SHALL be composed as a multiple of the difference between
the coefficients, so that the second prediction below is also a whole number.

It SHALL predict two mistakes:

- **gathering the coefficients in the wrong direction**, subtracting the larger from the
  smaller, which yields the negation of the correct answer;
- **moving the variable terms but leaving the constants unmoved**, which yields the
  right-hand constant divided by the difference of the coefficients.

#### Scenario: Variable terms are gathered to one side

- **WHEN** a problem displays `5x + 3 = 2x + 12`
- **THEN** the exact answer is 3
- **AND** a predicted misconception is −3, from subtracting the coefficients the wrong way
- **AND** a predicted misconception is 4, from leaving the constants unmoved

#### Scenario: A negated prediction permits a sign

- **WHEN** a `vars-both-sides` problem predicts the negation of its own answer
- **THEN** that problem permits a sign on the keypad, so the mistake can be entered

### Requirement: Parenthesised equations distribute before solving

An `equation-parentheses` problem SHALL display an equation of the form `a(x + b) = c` or
`a(x − b) = c` and require the value of the variable. Its operands SHALL be composed from a
chosen solution so that the solution is a whole number.

It SHALL predict the mistake Unit 13's `distributive` names — multiplying the coefficient
into the first term only, leaving the constant undistributed. That mistake yields
`(c − b) / a`, which is a whole number only when the coefficient divides the inner constant.
The inner constant SHALL therefore be composed as a non-zero multiple of the coefficient,
and the coefficient SHALL be greater than one.

This is a single-prediction skill rather than a wall, but the bound is not optional for it
either: a prediction that never survives filtering fails the check that a declared
misconception must actually reach a learner.

#### Scenario: A bracket is distributed before solving

- **WHEN** a problem displays `3(x + 3) = 21`
- **THEN** the exact answer is 4
- **AND** a predicted misconception is 6, from solving `3x + 3 = 21` after distributing to
  the first term only

#### Scenario: The predicted mistake is a whole number on every problem

- **WHEN** any `equation-parentheses` problem is generated at any difficulty
- **THEN** its predicted misconception is a whole number
- **AND** it differs from the correct answer

### Requirement: Every Unit 14a problem declares the entry it permits

Every problem in `equation-balance`, `one-step-addsub`, `one-step-multdiv`, `two-step`,
`vars-both-sides` and `equation-parentheses` SHALL use the existing numeric keypad. A
problem SHALL permit a sign exactly when a negative value is plausible for it — its own
answer or one of its predicted mistakes — which is the rule `answer-entry` already states
and Unit 6 established.

No skill in this increment SHALL require a new capability; all six SHALL resolve as
`implemented` under the capabilities Stage E already declares.

#### Scenario: A sign is offered when a predicted mistake is negative

- **WHEN** a `two-step` problem's wrong-order prediction is a negative number
- **THEN** that problem permits a sign on the keypad

#### Scenario: No new capability is required

- **WHEN** the six skills of this increment gain generators
- **THEN** each resolves as `implemented`
- **AND** `AVAILABLE_CAPABILITIES` is unchanged

### Requirement: Equations with fractions are cleared by the denominator

A `with-fractions` problem SHALL display an equation containing a stacked fraction whose
numerator carries the variable, and SHALL require the value of the variable on the numeric
keypad. The fraction SHALL be rendered as structured notation, not as a slash between plain
characters, because a fraction that renders as text is what `math-notation` exists to
prevent.

Its operands SHALL be **composed** from a chosen whole-number solution rather than drawn and
filtered, which is the rule the rest of Unit 14 already states: the numerator is built from
the solution and the denominator, so clearing the denominator leaves a whole number at every
difficulty without a draw that can exhaust.

It SHALL predict the mistake of applying the multiplication to one side only — multiplying
the fraction out while leaving the other side of the equation untouched. That prediction
SHALL be a whole number on every problem, since a fractional prediction survives filtering
and is a value the numeric keypad can never submit.

#### Scenario: A denominator is cleared by multiplying both sides

- **WHEN** a problem displays an equation whose left side is the variable over 3, plus 2,
  and whose right side is 7
- **THEN** the exact answer is 15
- **AND** the fraction is presented as stacked notation with one accessible name

#### Scenario: The solution is whole at every difficulty

- **WHEN** any `with-fractions` problem is generated at any difficulty
- **THEN** its exact answer is a whole number
- **AND** every predicted misconception that reaches the learner is a whole number

### Requirement: Special solutions are answered as a property of the equation

A `special-solutions` problem SHALL display an equation with a variable term on each side and
SHALL require the learner to identify **how many solutions it has**, not a value. It SHALL
use choice input, since the answer — no solution, infinitely many, or exactly one — is not a
value any keypad can express.

The problem SHALL offer all three cases as choices and SHALL draw all three as real
problems, so the skill is not passable by choosing between two outcomes whenever the variable
appears twice. The three cases SHALL be produced structurally:

- **no solution** — the variable terms match and the constants differ;
- **infinitely many** — both the variable terms and the constants match;
- **exactly one** — the variable terms differ.

Because the answer is not a value of the variable, the equation SHALL NOT be framed with a
`variable =` label above the answer surface. Predicted misconceptions SHALL be expressed as
the identity of the wrong choice rather than as a number, so a learner who confuses a
vanishing variable for no solution is diagnosed rather than merely marked wrong.

#### Scenario: Matching variable terms with different constants have no solution

- **WHEN** a problem displays `4x + 3 = 4x + 9`
- **THEN** the correct choice is that the equation has no solution
- **AND** choosing "infinitely many solutions" is diagnosed as a predicted mistake

#### Scenario: An identical equation has infinitely many solutions

- **WHEN** a problem displays `4x + 3 = 4x + 3`
- **THEN** the correct choice is that every value of the variable works

#### Scenario: Differing variable terms have exactly one solution

- **WHEN** a problem displays `5x + 3 = 2x + 12`
- **THEN** the correct choice is that the equation has exactly one solution

#### Scenario: No variable frame is shown for a non-value answer

- **WHEN** a `special-solutions` problem is presented
- **THEN** the answer surface is not labelled with the variable and an equals sign

### Requirement: Equation word problems are stated in prose and solved as equations

An `equation-words` problem SHALL present a word problem whose structure is a linear equation
and SHALL require the value the situation asks for, on the numeric keypad. Its prose SHALL be
drawn from a fixed set of authored frames rather than composed freely, and the frame set
SHALL be registered so it is checked alongside every other frame bank.

The problem SHALL carry the equation's source terms separately from its prose, so the answer
is derivable without reading English. Its operands SHALL be composed from a chosen
whole-number solution.

It SHALL predict the mistake of undoing the two steps in the wrong order, which is the wall
the unit already names at `two-step` and which a word problem invites again by stating the
steps in the order they are applied rather than the order they are undone. That prediction is
`result ÷ coefficient − constant`, which is whole only when the coefficient divides both the
result and the constant. The constant SHALL therefore be **composed** as a non-zero multiple
of the coefficient, exactly as `two-step` composes its own, and the prediction SHALL be a
whole number on every problem — a fractional one survives filtering and is a value the
numeric keypad can never submit.

#### Scenario: A two-step situation resolves to a whole number

- **WHEN** a problem states that a number is multiplied by 4, then 8 is added, giving 36
- **THEN** the exact answer is 7
- **AND** a predicted misconception is 1, from dividing before subtracting

#### Scenario: The predicted mistake is a whole number on every problem

- **WHEN** any `equation-words` problem is generated at any difficulty
- **THEN** its predicted misconception is a whole number
- **AND** it differs from the correct answer

#### Scenario: The prose comes from a checked frame bank

- **WHEN** an `equation-words` problem is generated
- **THEN** its sentence comes from the registered equation frame set
- **AND** its carried terms reproduce both the sentence and the answer

### Requirement: A formula is rearranged into an expression in the other letter

A `rearrange-formula` problem SHALL display a two-letter linear equation and SHALL require
the subject letter expressed in terms of the other letter. It SHALL use expression input, and
its answer SHALL be compared under the `expanded` form, so `5 − 2x` and `−2x + 5` are one
answer.

The answer SHALL contain exactly one letter — the one the learner types — and the subject
letter SHALL appear only in the frame above the answer surface. This is what keeps the skill
inside the single-variable expression grammar already shipped, which admits one letter,
integer coefficients, `+`, `−` and parentheses, and admits no division.

Its operands SHALL therefore be **composed** so that the subject's coefficient divides both
the other term's coefficient and the constant, which makes the rearranged expression's
coefficients whole and keeps division out of the answer entirely. A draw that filtered for
that property instead is the shape Unit 14 already rules out.

It SHALL predict two mistakes, both expressed as expressions rather than numbers:

- **moving a term without changing its sign**;
- **dividing only one term** by the subject's coefficient.

The subject's coefficient SHALL be greater than one. At one, dividing only one term does
nothing and that prediction collapses onto the correct answer, leaving the skill claiming a
diagnosis that never reaches a learner.

#### Scenario: A term that crosses the equals sign changes its sign

- **WHEN** a problem displays `2y + 4x = 10` and asks for `y`
- **THEN** the exact answer is the expression `−2x + 5`
- **AND** `2x + 5`, from moving the term without changing its sign, is a predicted mistake

#### Scenario: Both sides are divided, not one term

- **WHEN** a problem displays `3y + 6x = 18` and asks for `y`
- **THEN** the exact answer is the expression `−2x + 6`
- **AND** `−6x + 6`, from dividing only the constant, is a predicted mistake

#### Scenario: Both predictions survive on every problem

- **WHEN** any `rearrange-formula` problem is generated at any difficulty
- **THEN** two distinct predicted misconceptions survive to the learner
- **AND** neither equals the correct answer

#### Scenario: The answer never leaves the expression grammar

- **WHEN** any `rearrange-formula` problem is generated at any difficulty
- **THEN** its answer parses under the single-variable expression grammar
- **AND** every coefficient in it is a whole number
- **AND** the answer contains only the letter offered on the pad

### Requirement: Unit 14 is complete and adds no capability

With this increment, every skill in Unit 14 SHALL resolve as `implemented`, and
`AVAILABLE_CAPABILITIES` SHALL be unchanged. The three answer surfaces these four skills use
— numeric keypad, choice input and expression input — are all built, and every capability
they need has been available since before Stage E opened.

Stage E's declared `requires` SHALL name `choice-input`. A stage's `requires` states what its
own skills need, not only what it introduced, and Stage E has had a choice-input consumer
since `identify-like-terms` without declaring one. Nothing waits on this — the capability has
shipped since item 5 — but an undeclared need is the manifest disagreeing with the course,
which is the correction Stage B already received when Unit 4 chose choice input.

#### Scenario: Every Unit 14 skill is playable

- **WHEN** the four skills of this increment gain generators
- **THEN** no skill in Unit 14 resolves as `planned`
- **AND** `AVAILABLE_CAPABILITIES` is unchanged

#### Scenario: Stage E declares the capability its choice skills use

- **WHEN** Stage E's declared capabilities are read
- **THEN** they include `choice-input`
- **AND** every declared capability is one that is already available

