## ADDED Requirements

### Requirement: Unit 12 skills carry reviewed intro teaching lines

Each Stage E Unit 12 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `exponent-meaning` | An exponent tells how many times to use the base as a factor. |
| `evaluate-powers` | A power uses its base as a factor as many times as the exponent says. |
| `perfect-squares` | Squaring a number multiplies it by itself; finding a square root reverses that. |
| `estimate-roots` | Compare nearby whole-number squares to find which two the root lies between. |
| `exponent-multiply` | For matching bases multiplied together, add the exponents. |
| `exponent-divide` | For matching bases divided, subtract the second exponent from the first. |
| `power-of-power` | When a power is raised again, multiply the two exponents. |
| `zero-neg-exponents` | A zero exponent gives 1; a negative exponent gives one over the positive power. |
| `scientific-notation` | A positive exponent moves the decimal right; a negative exponent moves it left. |
| `pemdas-exponents` | Evaluate parentheses first, then powers, multiplication or division, and addition or subtraction. |

#### Scenario: Every Unit 12 intro uses its reviewed line

- **WHEN** the Unit 12 generator set is checked at its authored source
- **THEN** all ten ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `exponent`, `square root`, `perfect square`, or `scientific notation`

#### Scenario: Unit 12 examples retain exponent and root answers

- **WHEN** each Unit 12 intro generates its stable difficulty-1 example
- **THEN** its factor count, power, square, root bound, resulting exponent, reciprocal, ordinary number, or operation result can be recomputed independently from its semantic power data
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, keypad rule, or misconception
