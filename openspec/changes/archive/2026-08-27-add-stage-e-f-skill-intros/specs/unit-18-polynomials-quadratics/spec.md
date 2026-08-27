## ADDED Requirements

### Requirement: Unit 18 skills carry reviewed intro teaching lines

Each Stage F Unit 18 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `add-polynomials` | Add polynomials by combining number parts on terms with the same power. |
| `sub-polynomials` | Subtract a polynomial by changing every term's sign before combining. |
| `mult-monomial` | Multiply the outside term by every term inside the brackets. |
| `foil` | Multiply each term in one binomial by each term in the other. |
| `factor-gcf-poly` | Take the shared number and x outside, then divide each term by both. |
| `factor-trinomial` | Find two numbers whose product is the last term and whose sum is the middle number. |
| `difference-of-squares` | Two squares subtracted factor into matching brackets with opposite signs. |
| `solve-by-factoring` | Set each factor equal to zero; every result is a root. |
| `quadratic-formula` | Substitute a, b, and c into the supplied quadratic formula, then use both signs. |

#### Scenario: Every Unit 18 intro uses its reviewed line

- **WHEN** the Unit 18 generator set is checked at its authored source
- **THEN** all nine ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `polynomial`, `binomial`, or `quadratic`

#### Scenario: Unit 18 examples retain expression and root-pair answers

- **WHEN** each Unit 18 intro generates its stable difficulty-1 example
- **THEN** its expanded or factored expression or unordered root pair can be recomputed independently from its semantic polynomial data and visible coefficients
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, expression rule, root-pair rule, formula, or misconception
