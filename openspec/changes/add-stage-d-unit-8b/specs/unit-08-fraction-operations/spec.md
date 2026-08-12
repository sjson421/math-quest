## ADDED Requirements

### Requirement: The final six Unit 8 skills are playable as fraction-operation content

The system SHALL generate Stage D Unit 8 skills `mixed-to-improper`, `add-mixed`,
`sub-mixed`, `mult-fractions`, `div-fractions`, and `fraction-words` under their manifest ids.
Each SHALL satisfy the existing determinism, computed-answer, measurable-difficulty, variety,
display-agreement, and content requirements using only Stage D's available capabilities.

#### Scenario: Each skill uses its intended representation and control

- **WHEN** the six generators are sampled across every difficulty
- **THEN** mixed conversion and arithmetic and fraction multiplication and division use
  structured fraction notation with keypad entry
- **AND** fraction word problems use fixed story frames with fraction keypad entry

#### Scenario: Unit 8 becomes complete in curriculum order

- **WHEN** the course is derived from the manifest and generator registry
- **THEN** all twelve Unit 8 skills resolve as implemented in manifest order
- **AND** Unit 9 remains planned

### Requirement: A mixed number converts to its exact improper fraction

A `mixed-to-improper` problem SHALL display a positive mixed number and derive its improper
fraction by multiplying the whole part by the denominator and adding the numerator. The
answer SHALL require lowest terms and SHALL be enterable through the fraction keypad.

#### Scenario: Whole and fraction parts form the numerator

- **WHEN** a problem displays `2 3/4`
- **THEN** the exact answer is `11/4`
- **AND** the displayed whole, numerator, and denominator are sufficient to re-derive it

#### Scenario: A dropped fraction part is diagnosed

- **WHEN** the learner converts only the whole part and enters `8/4` for `2 3/4`
- **THEN** the submission matches a prediction that names the omitted numerator

### Requirement: Mixed-number arithmetic requires a genuine mixed result

An `add-mixed` or `sub-mixed` problem SHALL display two positive mixed numbers and SHALL
derive an exact positive answer from every displayed part. The answer SHALL require genuine
mixed form and lowest terms through the existing mixed-number keypad behavior.

Every `sub-mixed` problem SHALL require borrowing one whole because the minuend's fractional
part is smaller than the subtrahend's. It SHALL retain two distinct diagnosable mistakes after
the central filter: reversing the fractional subtraction without borrowing, and reducing the
whole while adding one piece rather than one denominator of pieces.

#### Scenario: Addition regroups an improper fractional part

- **WHEN** the displayed fractional parts add to more than one whole
- **THEN** the answer carries that whole into the result
- **AND** an equivalent entry with an improper fractional part receives the existing
  right-value-wrong-form response

#### Scenario: Subtraction borrows from the whole

- **WHEN** the minuend's fractional numerator is smaller than the subtrahend's over their
  shared denominator
- **THEN** one whole is rewritten as one denominator of fractional pieces before subtraction

#### Scenario: Both borrowing mistakes remain diagnosable

- **WHEN** any `sub-mixed` problem is generated
- **THEN** the two required predicted values are distinct from each other and the answer
- **AND** either value can be entered with the problem's keypad

### Requirement: Fraction multiplication and division use exact rational operations

A `mult-fractions` or `div-fractions` problem SHALL display two positive proper fractions,
derive the exact result from both displayed fractions and the operator, and require lowest
terms through fraction keypad entry.

Every `div-fractions` problem SHALL use unequal operands and retain two distinct diagnosable
mistakes after the central filter: inverting the first fraction instead of the second, and
multiplying straight across without inverting either fraction.

#### Scenario: Multiplication works straight across

- **WHEN** a multiplication problem displays `2/3 × 3/5`
- **THEN** the answer is the reduced value of `6/15`

#### Scenario: Division flips only the divisor

- **WHEN** a division problem displays `2/3 ÷ 4/5`
- **THEN** the answer is the reduced value of `2/3 × 5/4`

#### Scenario: Both division-wall mistakes survive

- **WHEN** any `div-fractions` problem is generated
- **THEN** flipping the first fraction and multiplying without flipping remain distinct from
  each other and from the answer

### Requirement: Fraction word problems ask for a proper part-over-whole fraction

A `fraction-words` problem SHALL select a fixed adult-situation frame, mention a part, its
whole, and an irrelevant quantity, and ask what fraction of the whole the part represents.
It SHALL carry the relevant part and whole as machine-readable division operands, require the
answer in lowest terms, and predict the three comprehension errors invited by the frame.

#### Scenario: The story answer is exact and recomputable

- **WHEN** a story says 5 of 12 items have a property
- **THEN** its exact answer is `5/12`
- **AND** verification derives that answer from carried operands rather than parsing prose

#### Scenario: The irrelevant quantity remains irrelevant

- **WHEN** the learner divides the named part by the story's irrelevant quantity
- **THEN** the submission matches the frame's wrong-pair diagnosis
