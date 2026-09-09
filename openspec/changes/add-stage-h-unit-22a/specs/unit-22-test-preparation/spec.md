## Purpose

Defines Unit 22's untimed GED preparation: calculator-key practice, selecting supplied
formulas, and mixed reviews over the implemented course before full-length timed forms.

## ADDED Requirements

### Requirement: Calculator practice teaches readable key sequences

`calculator-skills` SHALL teach TI-30XS operation using text key sequences, existing choice
buttons and the numeric keypad. It SHALL cover negation versus subtraction, parentheses
against ordinary operator precedence, and the exact/decimal answer toggle. Each problem
SHALL be answerable without a physical calculator, using the visible sequence and instructions.

The exercise SHALL either ask for a sequence's numeric result, ask which sequence produces
a target, or ask for a result in a stated fraction or decimal form. Key notation SHALL
distinguish the sign-change key from subtraction. Supported keys and wording SHALL match
the device's documented behavior; the app SHALL NOT emulate the device or claim support for
other calculator functions.

Sequence-choice buttons SHALL own their answer surface; no numeric equality or empty entry
frame SHALL appear beside the target. Numeric sequence exercises SHALL retain keypad entry.
Answer-form exercises SHALL permit both fraction and decimal entry through visible, usable
slash and decimal-point keys, preserving digit positions and the existing form-specific feedback.
The shared keypad repair SHALL preserve single-form pads and also make both forms enterable
in the existing Unit 9 conversion exercises.

#### Scenario: A sequence is evaluated

- **WHEN** the learner sees a valid key sequence
- **THEN** the requested answer is the result computed from those keys
- **AND** the sequence and numeric result are independently verifiable

#### Scenario: Negation and subtraction are distinguished

- **WHEN** a problem contrasts a sign-change sequence with a valid subtraction alternative
- **THEN** their distinct results or choices support a predicted misconception
- **AND** its nudge explains the sign-change key versus the subtraction operator

#### Scenario: A sequence is selected for its result

- **WHEN** a target and two key sequences are displayed
- **THEN** exactly one sequence produces that target
- **AND** selecting it uses the existing choice control without an empty numeric frame

#### Scenario: Parentheses change the result

- **WHEN** a sequence groups addition before multiplication
- **THEN** dropping the needed parentheses produces a distinct predicted wrong result or choice
- **AND** the explanation identifies the grouping difference

#### Scenario: The answer toggle teaches form

- **WHEN** a sequence has a non-whole result representable as both a fraction and a finite decimal
- **THEN** the prompt states which form is wanted and relates the two forms to the answer toggle
- **AND** the other form receives the existing wrong-form response
- **AND** no misconception is predicted merely for an equal value in the other form
- **AND** both form keys are visible, and the requested form can complete the requeued problem

#### Scenario: Shared conversion entry remains usable

- **WHEN** `fraction-to-decimal` or `decimal-to-fraction` offers its existing both-form declaration
- **THEN** the learner can enter either form with the numeric pad
- **AND** the requested form is accepted and the other form receives the existing form response
- **AND** digit positions and single-form key layouts remain unchanged

### Requirement: Formula-sheet practice selects a supplied formula for a measurement

`formula-sheet` SHALL show a labelled geometry figure and its existing pair of structured
formula references, then ask which formula finds the named measurement. Its two choices SHALL
use the pair's existing accessible labels. Exactly one SHALL match the requested measurement;
the other SHALL be diagnosed by explaining which measurement it finds instead.

The exercise SHALL use existing geometry figures and formula declarations without changing
their notation, labels or order. Formula selection SHALL distinguish a Pythagorean
hypotenuse from a leg. Similar-figure proportions and composite-area figures SHALL be
excluded because their pairs do not offer a single distinct formula for this exercise.

Valid figure dimensions SHALL vary to provide more than twenty distinct sampled displays.
Difficulty SHALL vary the structural complexity of the requested formula, with a greater
mean notation-node count at difficulty 5 than difficulty 1. Larger figure dimensions alone
SHALL NOT be treated as harder formula selection. A reverse formula-only question is not
required.

#### Scenario: A figure selects its formula

- **WHEN** a rectangle asks for the perimeter formula
- **THEN** its existing perimeter and area references are shown in structured notation
- **AND** the perimeter choice is correct and the area choice names the misconception

#### Scenario: Missing-side roles determine the Pythagorean choice

- **WHEN** the figure asks for a missing hypotenuse or a missing leg
- **THEN** the sum-of-squares or difference-of-squares reference is selected respectively
- **AND** the visible missing-side role agrees with the requested measurement and answer

#### Scenario: Formula practice reuses existing references

- **WHEN** an exercise's references are compared with an ordinary geometry problem for that figure
- **THEN** notation, labels and pair order match
- **AND** neither consumer owns a separately authored formula copy

#### Scenario: Variety and difficulty measure different properties

- **WHEN** the formula skill is sampled over its difficulty range
- **THEN** valid dimension variation yields more than twenty distinct displays
- **AND** the requested formulas have greater mean node count at the highest difficulty

### Requirement: Mixed reviews sample the course by GED area

A mixed review here is one of these two Unit 22 skills, not the spaced-review lesson mode that
`review-scheduling` and `timed-mode` call by the same name; this increment changes neither.

`review-quantitative` SHALL sample the registered generators of Units 0–11, 20 and 21.
`review-algebraic` SHALL sample Units 12–19. Together their pools SHALL partition the playable
course outside Unit 22, excluding every Unit 22 skill. Selection SHALL be uniform with
replacement, so repeated sources within a lesson are valid. The curriculum's approximate
45%/55% test-area shares SHALL NOT act as sampling weights.

Each review SHALL use ordinary untimed lesson behavior: ten correct answers, adaptation
from the review skill's mastery, lazy generation, exact-problem re-queues and normal lesson
completion. Per-attempt recording and completion SHALL credit the review skill, while the
delegated problem SHALL retain its source identity. Source skill progress SHALL remain
unchanged by that review lesson.

#### Scenario: Every draw belongs to the requested area

- **WHEN** either mixed review generates a problem
- **THEN** its source belongs to that review's pool
- **AND** no Unit 22 skill is selected

#### Scenario: The pools partition the course

- **WHEN** the two pools are compared with all implemented generators outside Unit 22
- **THEN** every such generator appears exactly once across the pools
- **AND** no unregistered generator appears

#### Scenario: Repeated sources remain valid

- **WHEN** two successive seeded draws select the same source
- **THEN** both draws are valid review problems
- **AND** a lesson is not required to contain multiple distinct sources

#### Scenario: Review credit follows the lesson

- **WHEN** either mixed review records attempts and completes
- **THEN** attempts and completion update that review skill's own progress
- **AND** sampled source progress, including mastery and review counters, is unchanged

#### Scenario: Review recovery preserves the exact problem

- **WHEN** a mixed-review answer is wrong and the problem is queued again
- **THEN** the same source problem object returns
- **AND** only unseen slots generate new problems at the adjusted difficulty

### Requirement: Each preparation skill has a stable teaching example

All four skills SHALL have an authored teaching line and a stable worked example through the
existing skill-intro behavior. A mixed review's teaching line SHALL explain the scope of the pool
it samples rather than describe one source skill, and its example SHALL be the representative
source problem its own generator draws at the fixed intro seed and difficulty 1. How those intros
render, what they suppress, and how they fit the phone are stated in the `skill-intros` delta.

#### Scenario: Every preparation skill carries its own teaching line

- **WHEN** the four Stage H skills are checked against the content contract
- **THEN** each carries one authored teaching line that passes the existing teaching-line checks
- **AND** each mixed review's line names the scope of its pool rather than a single source skill

#### Scenario: A mixed-review example is representative and reproducible

- **WHEN** either mixed review is asked for its intro example twice
- **THEN** the same delegated source problem is produced, carrying its source identity
- **AND** it is one of that review's own pool members

### Requirement: Unit 22 stays incomplete until its timed forms ship

After this increment, `timed-practice-1` and `timed-practice-2` SHALL remain planned and
absent from the playable tree. Stage H SHALL contain four playable Unit 22 skills, and
roadmap item 30 SHALL remain open until increment 30b ships. None of the four new lessons
SHALL start a timer or produce a full-length-form score.

#### Scenario: The first increment opens four untimed lessons

- **WHEN** the playable course is derived after 30a
- **THEN** Stage H contains exactly its first four skills in manifest order
- **AND** both timed forms remain planned, item 30 stays open, and the four lessons have no clock
