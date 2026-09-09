# unit-22-test-preparation Specification

## Purpose

Defines Unit 22's untimed GED preparation: calculator-key practice, selecting supplied
formulas, and mixed reviews over the implemented course before full-length timed forms.

## Requirements

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

### Requirement: Each timed practice skill starts a full-length sampled form

Starting individual practice for `timed-practice-1` or `timed-practice-2` SHALL start a 46-question form. Each form SHALL contain exactly 21 quantitative questions from the same Units 0–11, 20 and 21 pool as `review-quantitative`, and 25 algebraic questions from the same Units 12–19 pool as `review-algebraic`. Selection within each pool SHALL be uniform with replacement. The two skills SHALL share this contract and SHALL draw fresh samples for every new session rather than identify fixed published papers.

The area order SHALL be shuffled once when a form starts and remain stable throughout that session. Every live question SHALL use generator difficulty 3, including the opening question and questions after misses, regardless of mastery. Given the same seed and form id, the complete question sequence SHALL be reproducible. Repeated source skills and chance repeated problems SHALL be valid; fresh sampling SHALL NOT require disjoint papers.

Every delegated problem SHALL retain the source's identity, prompt, answer rules, display, input control, hint, worked solution and predicted misconceptions. Unit 22 SHALL be excluded from both source pools. No new source answers or misconceptions SHALL be authored by the form wrappers.

#### Scenario: Both forms have the approved composition

- **WHEN** either skill starts a full-length session
- **THEN** its 46 slots contain 21 quantitative sources and 25 algebraic sources in a shuffled order
- **AND** every problem comes from the appropriate existing pool with no Unit 22 source

#### Scenario: Seeded sampling is stable without promising unique papers

- **WHEN** the same form id and seed are used again
- **THEN** the same ordered problems result
- **AND** later independent launches use fresh sampling without excluding repeated sources

#### Scenario: Live difficulty is fixed

- **WHEN** a learner starts either form at any mastery or records three consecutive misses
- **THEN** its opening and remaining questions use difficulty 3
- **AND** no warm-up reduction or recovery adjustment occurs

#### Scenario: Delegation preserves source content

- **WHEN** a source problem is presented through a form
- **THEN** its source identity, answer and answer-form rules, input and display, worked steps and misconceptions are preserved
- **AND** its stored source progress is not changed by presenting it

### Requirement: Each form question contributes at most one scored answer

A form SHALL consume one question for every recorded answer and finish after 46 recorded answers, even if none is correct. A correct answer SHALL earn one point; a wrong value or a right value in the wrong required form SHALL earn zero. An unfinished or unparseable entry SHALL retain the current question and entry, record no attempt, earn no point and allow correction. No scored question SHALL return for a retry.

The form SHALL offer no pre-answer hint. Existing post-answer feedback SHALL remain available: wrong values show their diagnostic nudge and worked solution, while right-value/wrong-form responses explain the form without misdiagnosing the arithmetic. Dismissing miss feedback SHALL advance to the next question, without offering a retry. Correct feedback SHALL use the existing short transition. The form SHALL not offer question skipping or backward navigation.

Progress SHALL count consumed questions out of 46, rather than questions answered correctly. Duplicate taps, overlapping submission controls, feedback dismissal and delayed callbacks SHALL NOT consume a question, record an attempt or complete the form more than once. Leaving SHALL cancel pending transitions.

#### Scenario: A miss consumes a question

- **WHEN** a learner submits a wrong value and dismisses its feedback
- **THEN** the next question appears, one question has been consumed, and zero points were earned
- **AND** the missed question is not requeued

#### Scenario: Wrong form is scored once

- **WHEN** a correct value is submitted in a form rejected by that problem's existing answer rules
- **THEN** the answer earns zero points and records one miss
- **AND** form feedback explains the issue before advancing without a retry

#### Scenario: An unfinished entry remains editable

- **WHEN** a learner submits an unfinished fraction or another unparseable entry
- **THEN** the same question and entry remain available
- **AND** no question, point or attempt is counted until a scored answer is submitted

#### Scenario: Every completed paper has the same denominator

- **WHEN** the 46th recorded answer finishes its feedback transition
- **THEN** the form completes with the number of correct answers out of 46
- **AND** both 0 of 46 and 46 of 46 are valid completed forms

#### Scenario: Repeated submissions cannot inflate results

- **WHEN** submission or dismissal is triggered repeatedly during one answer transition
- **THEN** only one question and one attempt are counted
- **AND** the final transition can award completion only once

### Requirement: Forms compose the existing clock and score estimate

The form SHALL use the existing elapsed clock, starting only when live practice begins after any automatic intro. Reviewing the intro SHALL not pause or reset it. No elapsed duration SHALL end the form, submit an answer or change the score. The clock SHALL stop when the form completes or is left.

Completion SHALL show the earned points out of 46 through the existing approximate GED score presentation, with its estimated band, always-visible official-score caveat and inspectable mapping. The result SHALL be based only on that completed session's first scored answers, not cumulative skill accuracy, elapsed time or retries. A completed form's score SHALL not be presented as an official pass result.

Form sequence, partial points, clock and score result SHALL be session-local and discarded when the session is left or reloaded. Leaving an incomplete form SHALL not produce a completed-form estimate or completion reward. Already recorded attempts SHALL remain recorded. A later launch SHALL start a new form and clock; it SHALL not restore the abandoned form.

#### Scenario: Intro reading does not spend session time

- **WHEN** a form's automatic intro is shown before practice
- **THEN** no clock runs until the learner starts practice
- **AND** that action begins the first live question with a clock at zero

#### Scenario: A long session does not expire

- **WHEN** the elapsed clock passes any duration, including while reviewing the intro
- **THEN** the current form remains active with unchanged questions and points
- **AND** the same original clock continues

#### Scenario: Completed points feed the existing estimate

- **WHEN** a learner completes a form with 20 correct answers
- **THEN** the result shows 20 of 46 practice points and the existing approximate estimate for that ratio
- **AND** the caveat and mapping remain available offline

#### Scenario: Leaving cancels an incomplete form

- **WHEN** a learner leaves or reloads after some recorded answers
- **THEN** partial form state and pending callbacks are discarded without a completion reward or completed score
- **AND** recorded attempts survive and a later launch starts fresh

### Requirement: Form credit belongs to the selected form skill

Each recorded form answer SHALL use ordinary per-attempt recording for the selected `timed-practice-1` or `timed-practice-2` skill, including existing misconception-tag accounting. Completing all 46 questions SHALL invoke ordinary skill completion exactly once, including the existing mastery cap, XP, coins, streak, review schedule and completion milestones, regardless of score. The estimate itself SHALL have no progress side effects.

Sampled source skills SHALL receive no attempt, correct count, mastery, intro flag, practice date or review-counter changes from a form. Existing manifest prerequisites and practised-skill unlock behavior SHALL continue to determine access to both forms; no estimated-score threshold SHALL be introduced.

#### Scenario: Low scores still complete practice

- **WHEN** a learner completes a form with zero correct answers
- **THEN** the form skill records 46 attempts and zero correct answers
- **AND** ordinary completion credit is granted exactly once without a score threshold

#### Scenario: Source progress stays unchanged

- **WHEN** a form samples multiple source skills and completes
- **THEN** only the selected form skill receives per-skill attempt and completion updates
- **AND** every sampled source skill retains its previous progress

### Requirement: Form behavior is confined to individual form practice

The four existing Unit 22 lessons SHALL retain ordinary untimed behavior. Standard lessons, spaced-review sessions and skip checks SHALL retain their existing pacing, answer, credit and timing rules. A form generator selected as one source in spaced review or a skip check SHALL produce one delegated problem at the caller's requested difficulty and SHALL not start a full form, clock or score result. Existing review selection and skip eligibility SHALL remain unchanged.

Both forms' intros, practice header and all inherited answer surfaces SHALL fit a 375-by-812-pixel viewport without horizontal page overflow or clipped controls. The completed result, ordinary completion actions and expanded score mapping SHALL be legible and reachable by scrolling as needed. Timing accessibility and score-section semantics SHALL retain their existing contracts.

#### Scenario: Other consumers still receive one problem

- **WHEN** spaced review or a skip check samples either form generator
- **THEN** it receives one source problem at the requested difficulty
- **AND** the enclosing session retains its own pacing, credit and untimed default without a form score

#### Scenario: Ordinary preparation remains untimed

- **WHEN** any of the first four Unit 22 skills starts
- **THEN** it uses the same ordinary lesson mechanics as before
- **AND** no form clock or full-length score appears

#### Scenario: Form controls and results fit the phone

- **WHEN** either form is exercised at 375 by 812 pixels through intro, inherited inputs, feedback and completion
- **THEN** actions, elapsed time and question count remain legible and usable without horizontal overflow
- **AND** the complete score caveat and expanded mapping remain reachable
