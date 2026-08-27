# unit-15-inequalities Specification

## Purpose
Unit 15 teaches inequalities: reading the four relation symbols, the graph a relation
produces on a line, solving in one step and in several, the sign reversal that multiplying or
dividing by a negative forces, and compound statements joined by `and`, by `or`, or written
as a range. It is the course's first content whose answers are relations rather than values,
and it completes Stage E.
## Requirements
### Requirement: A displayed inequality is a statement, never a framed expression

Every Unit 15 problem SHALL present its inequality as a statement that already carries its
relation, and SHALL NOT append an equals sign and an answer slot **to the statement itself**.

Whether a **separate framed answer row** is drawn beneath SHALL follow what the answer is. The
frame is a claim — that the answer is a value of the thing it names — so a problem SHALL
declare a frame label exactly where that claim is true. It is false of a reading, a graph and a
solved relation, and true of a count, so the five choice-answered skills SHALL declare none and
`compound-inequalities` SHALL declare one.

A problem answered on the keypad SHALL always draw a slot, whatever it is asking. Without one
the learner presses a digit and nothing on screen changes, which is the same defect as an
unlabelled slot on a screen with no keypad, reached from the other side.

The displayed statement SHALL carry its source relation and quantities separately from its
text, so verification derives the answer from those values rather than from the sentence.

#### Scenario: A choice-answered inequality draws no answer frame

- **WHEN** a Unit 15 problem is answered by choosing among options
- **THEN** its display carries no frame label
- **AND** the rendered problem shows the statement alone, with no trailing equals sign and no
  entry slot beneath it

#### Scenario: The counting skill frames the value it asks for

- **WHEN** a `compound-inequalities` problem is generated
- **THEN** its display carries a frame label naming what is being counted
- **AND** the rendered problem echoes each typed digit in the slot beside that label

#### Scenario: The displayed statement agrees with its carried values

- **WHEN** the content check examines a Unit 15 problem
- **THEN** it fails and names the problem if the displayed statement does not follow from the
  carried relation and quantities

### Requirement: A relation answer is offered as four distinct statements

Where a Unit 15 answer is a relation rather than a value, the problem SHALL offer exactly
four options, exactly one of which is correct, and all four SHALL be distinct.

The options SHALL be ordered by a permutation drawn from the problem's own generator, so that
the correct option is reachable at every one of the four positions. Ordering them by their own
content is **not** sufficient and SHALL NOT be used: the three distractors are derived from
the correct answer by reversing its relation, swapping its strictness, or substituting a wrong
boundary, so any ordering that reads only the options' content stays correlated with which one
is right. Under the ordering `<`, `≤`, `>`, `≥`, `solve-one-step-ineq`'s correct option lands
at position 1, 2, 2 and 3 as the displayed relation runs through the four symbols — never at
position 4 — and `flip-the-sign`'s, whose four options differ only in a relation and a sign,
reaches fewer still.

Where an option **is** a statement — the three solving skills — its identity SHALL be that
statement written in the characters the checker reads, while its label SHALL be the statement
written in the characters the learner reads: the same split between a submitted value and a
drawn one that the number line already keeps between a tick's entry and its label. Where an
option describes something else, as `graph-inequality`'s do, its identity SHALL name the
features it describes rather than a statement it does not contain. A predicted mistake SHALL
name the option identity it produces, whichever kind that is.

Every predicted identity SHALL be one of the three wrong options, and SHALL NOT equal the
correct one. This is checked per skill rather than left to the central filter: that filter
drops a prediction equal to the answer only when both are numbers, and a text-valued
prediction against a choice answer is compared to a number parsed from the choice's id, which
for these ids is never a number at all. A prediction that silently equals the answer would
therefore survive here where it could not survive on a keypad skill.

#### Scenario: Four distinct options, one correct

- **WHEN** a problem whose answer is a relation is generated
- **THEN** it offers four options
- **AND** exactly one matches the correct relation and boundary
- **AND** no two options are identical

#### Scenario: The correct option reaches every position

- **WHEN** a skill whose answer is a relation is generated across many seeds
- **THEN** the correct option appears at each of the four positions
- **AND** the order for one seed is reproducible from that seed alone

#### Scenario: A negative boundary reads and submits differently

- **WHEN** an option states a negative boundary
- **THEN** its label uses the typographic minus every display in the course uses
- **AND** its identity uses the plain characters a predicted mistake is matched against

#### Scenario: An option that describes rather than states is identified by its features

- **WHEN** a `graph-inequality` problem offers its four graphs
- **THEN** each option's identity names its circle type and its shading direction
- **AND** its label names the same two features and the boundary they sit at

### Requirement: Reading an inequality names what it says

An `inequality-symbols` problem SHALL display a relation between the variable and a whole
number and SHALL require the plain-English reading of that relation. It SHALL remain a
`quick` skill, ending after five correct answers as the manifest declares.

The four options SHALL cover both distinctions the symbols carry at once: which side of the
boundary the variable falls on, and whether the boundary itself is included. A strict
relation SHALL read as "less than" or "more than"; an inclusive relation SHALL read as "at
most" or "at least".

The problem SHALL predict two mistakes: reading the relation in the wrong direction, and
losing or gaining the boundary itself.

#### Scenario: An inclusive relation reads as a bound

- **WHEN** a problem displays `x ≤ 9`
- **THEN** the correct option reads that x is at most 9
- **AND** the option reading that x is at least 9 is predicted as the reversed direction
- **AND** the option reading that x is less than 9 is predicted as the lost boundary

#### Scenario: A strict relation excludes its boundary

- **WHEN** a problem displays `x > 3`
- **THEN** the correct option reads that x is more than 3
- **AND** no correct reading includes 3 itself

### Requirement: An inequality's graph is named by its circle and its direction

A `graph-inequality` problem SHALL display a relation between the variable and an integer
and SHALL require the description of the graph that relation produces: whether the circle at
the boundary is open or closed, and which way the shading runs.

The four options SHALL be the four combinations of those two features, so neither can be
guessed from the other. A strict relation SHALL produce an open circle and an inclusive
relation a closed one; a "greater" relation SHALL shade right and a "less" relation left.

Boundaries SHALL include negative values, so that shading right is not reliably the same as
shading toward the larger-looking number.

The problem SHALL predict two mistakes: drawing the wrong circle for the relation's
strictness, and shading the wrong way.

#### Scenario: A strict relation opens its circle

- **WHEN** a problem displays `x > 3`
- **THEN** the correct option describes an open circle at 3 with shading to the right
- **AND** the option describing a closed circle at 3 shaded right is predicted as the
  strictness mistake
- **AND** the option describing an open circle at 3 shaded left is predicted as the direction
  mistake

#### Scenario: An inclusive relation closes its circle

- **WHEN** a problem displays `x ≤ −4`
- **THEN** the correct option describes a closed circle at −4 with shading to the left

#### Scenario: All four combinations are offered

- **WHEN** a `graph-inequality` problem is generated
- **THEN** its options are the four pairings of circle type with shading direction

### Requirement: One-step inequalities are answered as a whole relation

A `solve-one-step-ineq` problem SHALL display an inequality that undoes in a single
operation, in one of two families: a constant added to or subtracted from the variable, or
the variable multiplied or divided by a **positive** whole number. The answer SHALL be the
solved relation in full — its direction, its strictness, and its boundary together — and
SHALL be reached without reversing the relation, since no negative multiplier appears here.

The solved boundary SHALL be an integer.

The problem SHALL predict two mistakes: repeating the displayed operation instead of undoing
it, and reversing the relation where nothing calls for it.

#### Scenario: A constant is undone without touching the relation

- **WHEN** a problem displays `x + 7 > 12`
- **THEN** the correct option is that x is greater than 5
- **AND** the option stating x is greater than 19 is predicted as the repeated operation
- **AND** the option stating x is less than 5 is predicted as the needless reversal

#### Scenario: A positive coefficient is undone without reversing

- **WHEN** a problem displays an inequality whose variable carries a positive coefficient
- **THEN** the correct option keeps the displayed relation and states the divided boundary

### Requirement: Multi-step inequalities undo in the right order

A `solve-multi-step-ineq` problem SHALL display an inequality applying both a positive
coefficient and a constant to the variable, and SHALL require the solved relation in full.
The relation SHALL NOT reverse, since the coefficient is positive.

The draw SHALL be composed so that undoing in the wrong order — dividing before the constant
is cleared — lands on an integer distinct from the correct boundary, so that mistake is
offered as a real option rather than an unreachable one. Both the constant and the right-hand
value SHALL therefore be multiples of the coefficient, since the wrong order divides the
right-hand value alone. The coefficient SHALL exceed one and the constant SHALL be non-zero,
since the two orders agree otherwise.

The problem SHALL predict two mistakes: undoing in the wrong order, and reversing the
relation where nothing calls for it.

#### Scenario: The wrong order is a reachable integer

- **WHEN** a `solve-multi-step-ineq` problem is generated
- **THEN** dividing the right-hand value before clearing the constant yields an integer
- **AND** that number differs from the correct boundary

#### Scenario: Both steps are undone in order

- **WHEN** a problem displays `3x + 6 ≤ 21`
- **THEN** the correct option is that x is at most 5
- **AND** the option stating x is at most 1 is predicted as the wrong order, since dividing
  21 by 3 before clearing the 6 lands there

### Requirement: Multiplying or dividing by a negative reverses the relation

A `flip-the-sign` problem SHALL display an inequality whose variable is multiplied or divided
by a **negative** integer, and SHALL require the solved relation in full. The correct answer
SHALL carry the reversed relation.

Its four options SHALL be the four combinations of two independent mistakes: whether the
relation was reversed, and whether the sign of the resulting boundary was kept. The solved
boundary SHALL be a non-zero integer, so those four are distinct.

The right-hand value SHALL be drawn with either sign, so the solved boundary is negative on
some draws and positive on others. Drawing it positive throughout would make the correct
option the negative-boundary one every time, and picking the negative option would then be
right without reversing anything — which is the exact reasoning this skill exists to make
unavoidable.

As a wall skill it SHALL predict at least two distinct mistakes, and SHALL in fact predict
three: failing to reverse the relation, losing the sign of the boundary, and doing both.

#### Scenario: A negative coefficient reverses the relation

- **WHEN** a problem displays `−3x > 12`
- **THEN** the correct option is that x is less than −4
- **AND** the option stating x is greater than −4 is predicted as the missing reversal
- **AND** the option stating x is less than 4 is predicted as the lost sign
- **AND** the option stating x is greater than 4 is predicted as both

#### Scenario: A negative divisor reverses the relation too

- **WHEN** a problem displays an inequality dividing the variable by a negative integer
- **THEN** the correct option carries the reversed relation and the negated boundary

#### Scenario: The solved boundary is negative on some draws and positive on others

- **WHEN** `flip-the-sign` is generated across many seeds
- **THEN** the correct option's boundary is negative on some of them and positive on others
- **AND** choosing the negative-boundary option every time is wrong more often than not

#### Scenario: The wall predicts enough to diagnose

- **WHEN** any `flip-the-sign` problem is generated
- **THEN** it carries at least two predicted mistakes under distinct tags
- **AND** no predicted identity equals the correct option's identity

### Requirement: A compound statement is answered by how many whole numbers satisfy it

A `compound-inequalities` problem SHALL display a statement in one of three forms — two
relations joined by `and`, two joined by `or`, or a range written as one chained statement —
and SHALL require how many whole numbers in a stated range make it true. The answer is a
count, so this skill SHALL be answered on the numeric keypad rather than by choice.

The range the count runs over SHALL be stated in the problem's own words, so the learner is
never asked to count over an unstated universe. The count SHALL be neither zero nor the whole
range, so a learner who ignores the statement cannot be right.

The problem SHALL predict two mistakes: treating a strict boundary as if it were inclusive,
and counting the numbers the statement excludes instead of those it admits.

#### Scenario: A range counts the numbers between its bounds

- **WHEN** a problem asks how many whole numbers from 0 to 10 satisfy `2 < x ≤ 6`
- **THEN** the exact answer is 4
- **AND** 5 is predicted as counting the excluded lower boundary
- **AND** 7 is predicted as counting what the statement leaves out

#### Scenario: A disjunction counts both sides

- **WHEN** a problem asks how many whole numbers from 0 to 10 satisfy `x < 2 or x > 7`
- **THEN** the exact answer counts the numbers below the first bound together with those
  above the second

#### Scenario: Neither everything nor nothing satisfies the statement

- **WHEN** a `compound-inequalities` problem is generated
- **THEN** its answer is greater than zero
- **AND** its answer is fewer than every whole number in the stated range

#### Scenario: Each predicted count is a reachable whole number

- **WHEN** a `compound-inequalities` problem is generated
- **THEN** every predicted value is a whole number the keypad can submit
- **AND** no predicted value equals the correct count

### Requirement: Unit 15 skills carry reviewed intro teaching lines

Each Stage E Unit 15 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `inequality-symbols` | An inequality shows which side is larger and whether the boundary is included. |
| `graph-inequality` | Use an open circle for a strict boundary and a closed circle when included. |
| `solve-one-step-ineq` | Undo one operation on both sides without changing the inequality sign. |
| `solve-multi-step-ineq` | Undo the constant first, then undo the positive coefficient. |
| `flip-the-sign` | Multiplying or dividing both sides by a negative reverses the inequality sign. |
| `compound-inequalities` | For and, keep values that satisfy both; for or, keep values that satisfy at least one. |

#### Scenario: Every Unit 15 intro uses its reviewed line

- **WHEN** the Unit 15 generator set is checked at its authored source
- **THEN** all six ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one `inequality` term

#### Scenario: Unit 15 examples retain relation and count answers

- **WHEN** each Unit 15 intro generates its stable difficulty-1 example
- **THEN** its reading, graph description, solved relation, or satisfying-value count can be recomputed independently from the displayed relation and semantic inequality data
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, frame, relation ordering, or misconception
