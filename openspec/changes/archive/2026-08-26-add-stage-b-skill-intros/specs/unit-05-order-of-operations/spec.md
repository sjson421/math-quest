## ADDED Requirements

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
