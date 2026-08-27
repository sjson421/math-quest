## ADDED Requirements

### Requirement: Unit 13 skills carry reviewed intro teaching lines

Each Stage E Unit 13 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `variable-meaning` | A variable is a letter whose value can change. |
| `evaluate-expression` | Replace the variable with its given value before calculating. |
| `words-to-expression` | Translate each phrase in order, but reverse less than and subtracted from. |
| `identify-like-terms` | Like terms match in every letter and power. |
| `combine-like-terms` | Combine like terms by adding their number parts and keeping their letter parts. |
| `distributive` | Distribute by multiplying the outside number by every term inside the brackets. |
| `distribute-negative` | A negative outside brackets changes every term's sign when you distribute. |
| `factor-gcf` | Take the greatest common factor outside the brackets, leaving each quotient inside. |

#### Scenario: Every Unit 13 intro uses its reviewed line

- **WHEN** the Unit 13 generator set is checked at its authored source
- **THEN** all eight ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `variable`, `coefficient`, `like terms`, or `distribute`

#### Scenario: Unit 13 examples retain numeric, choice, and expression answers

- **WHEN** each Unit 13 intro generates its stable difficulty-1 example
- **THEN** its value, matching choice, translated expression, expanded expression, or exact factored form can be recomputed independently from the visible source expression or phrase
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, expression rule, or misconception
