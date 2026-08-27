## ADDED Requirements

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
