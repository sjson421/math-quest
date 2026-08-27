# unit-19-functions Specification

## Purpose
Teach function notation and comparison through generated, independently verifiable problems across equation, finite-relation, table, and graph representations.
## Requirements
### Requirement: Function notation distinguishes inputs from outputs

A `function-notation` problem SHALL present a generated statement `f(input) = output` and require an ordinary text choice that reads the input-output relationship correctly. Choice order SHALL vary without changing stable choice identities.

As a curriculum wall, every generated problem SHALL retain at least two distinct text-valued misconceptions after central answer-collision and duplicate filtering: reading `f(input)` as multiplication, and reversing which value is the input and which is the output.

#### Scenario: Function notation names the mapping

- **WHEN** the problem presents `f(3) = 7`
- **THEN** the correct choice states that input `3` gives output `7`
- **AND** neither multiplication nor input-output reversal is accepted

#### Scenario: Both wall diagnoses survive

- **WHEN** any `function-notation` problem is generated
- **THEN** two distinct misconception identities remain available to diagnose
- **AND** neither identity equals the correct reading or the other misconception

### Requirement: Function evaluation substitutes into a generated rule

An `evaluate-function` problem SHALL present a generated linear rule `f(x) = mx + b`, name one integer input, and require the exact integer output through the existing keypad. The visible rule and expected output SHALL both be derived from the same structured coefficient, constant, and input values.

#### Scenario: The named input replaces x

- **WHEN** the rule is `f(x) = 2x − 3` and the prompt asks for `f(4)`
- **THEN** the exact answer is `5`
- **AND** the worked solution substitutes `4` before evaluating the operations

### Requirement: Domain and range come from a finite relation

A `domain-range` problem SHALL plot a generated finite function containing at least three distinct integer points and ask for either its domain or its range. It SHALL require an ordinary text choice whose displayed set contains the distinct requested coordinate values and whose stable identity is derived from those plotted points.

Every plotted point SHALL use a distinct x-coordinate. The offered sets SHALL be distinct, and the coordinate list from the other axis SHALL remain a reachable wrong choice when it differs from the answer.

#### Scenario: Domain uses every distinct input

- **WHEN** the plotted points are `(−2, 3)`, `(0, 1)`, and `(2, 3)` and domain is requested
- **THEN** the correct set is `{−2, 0, 2}`
- **AND** repeated output `3` does not create a repeated domain value

#### Scenario: Range uses distinct outputs

- **WHEN** the same three points are shown and range is requested
- **THEN** the correct set is `{1, 3}`
- **AND** `{−2, 0, 2}` remains a wrong domain-for-range choice

### Requirement: Linearity is derived from plotted points

A `linear-vs-nonlinear` problem SHALL display at least three points from a finite function and require an ordinary choice between linear and nonlinear. A relation SHALL be correct as linear exactly when every consecutive point pair in x-order has the same exact slope; a nonlinear draw SHALL differ in at least one slope. The plane SHALL plot the points without drawing a line that reveals the answer.

#### Scenario: Constant rate is linear

- **WHEN** the plotted points are `(−1, −1)`, `(0, 1)`, and `(2, 5)`
- **THEN** the relation is identified as linear because each slope is `2`

#### Scenario: A changed rate is nonlinear

- **WHEN** at least one consecutive slope differs from the others
- **THEN** the relation is identified as nonlinear
- **AND** no connecting curve or line supplies the classification visually

### Requirement: Functions are compared across three representations

A `compare-functions` problem SHALL present three distinct generated linear functions at once: one as a semantic x/y table, one as a line on the existing coordinate plane, and one as a generated equation. It SHALL ask which representation has the uniquely greatest rate of change or the uniquely greatest initial value and require an ordinary choice among `Table`, `Graph`, and `Equation`.

The table rows, graph line, equation, requested property, and correct stable choice identity SHALL be independently recoverable from structured source values. Across sampled problems, every representation SHALL be correct in some draws and every choice-button position SHALL hold the correct answer in some draws.

For an initial-value comparison, the table SHALL include its row at `x = 0` and the graph's
y-intercept SHALL be an in-bounds visible y-axis tick. The graph SHALL NOT require the learner
to extrapolate beyond the displayed plane to recover the compared value.

#### Scenario: Greatest rate is compared across forms

- **WHEN** the table has rate `1`, the graph has rate `3`, and the equation has rate `−2`
- **THEN** `Graph` is the correct choice
- **AND** each rate is derived from its displayed representation

#### Scenario: Greatest initial value is compared across forms

- **WHEN** the table contains its value at `x = 0`, the graph crosses the y-axis, and the equation has a constant term
- **THEN** the correct choice identifies the uniquely greatest value at `x = 0`

### Requirement: Unit 19 completes Stage F

The system SHALL register `function-notation`, `evaluate-function`, `domain-range`, `linear-vs-nonlinear`, and `compare-functions` in manifest order. All five SHALL resolve as implemented with no new manifest capability, and their generated learner text SHALL satisfy the course content contract.

#### Scenario: The selected increment becomes playable

- **WHEN** all five Unit 19 generators are registered
- **THEN** every Unit 19 skill resolves as implemented
- **AND** all 28 Stage F skills are implemented
- **AND** the playable skill total is 173

### Requirement: Unit 19 skills carry reviewed intro teaching lines

Each Stage F Unit 19 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `function-notation` | Function notation shows an input inside parentheses and its output after the equals sign. |
| `evaluate-function` | Replace x with the given input, then calculate the output. |
| `domain-range` | The domain contains every input; the range contains every distinct output. |
| `linear-vs-nonlinear` | A relationship is linear when its rate of change stays constant. |
| `compare-functions` | Compare matching rates of change or starting values across all three forms. |

#### Scenario: Every Unit 19 intro uses its reviewed line

- **WHEN** the Unit 19 generator set is checked at its authored source
- **THEN** all five ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `function` or `domain`

#### Scenario: Unit 19 examples retain function answers across representations

- **WHEN** each Unit 19 intro generates its stable difficulty-1 example
- **THEN** its input-output choice, evaluated value, domain or range choice, linearity choice, or greatest-property choice can be recomputed independently from the visible equation, plotted points, table, and semantic function data
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, equation, table, plane, or misconception
