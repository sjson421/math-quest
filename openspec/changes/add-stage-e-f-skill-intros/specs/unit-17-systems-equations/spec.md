## ADDED Requirements

### Requirement: Unit 17 skills carry reviewed intro teaching lines

Each Stage F Unit 17 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `system-by-graphing` | The point where both lines meet solves both equations. |
| `substitution` | Replace an isolated letter with its equal expression in the other equation. |
| `elimination` | Scale every term in one equation, then add or subtract to cancel one letter. |
| `system-words` | Translate total count and total value into two equations, then solve them together. |

#### Scenario: Every Unit 17 intro uses its reviewed line

- **WHEN** the Unit 17 generator set is checked at its authored source
- **THEN** all four ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits

#### Scenario: Unit 17 examples retain system solution points

- **WHEN** each Unit 17 intro generates its stable difficulty-1 example
- **THEN** its intersection point can be recomputed independently from the two visible structured equations or carried story quantities
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, plane, story data, or misconception
