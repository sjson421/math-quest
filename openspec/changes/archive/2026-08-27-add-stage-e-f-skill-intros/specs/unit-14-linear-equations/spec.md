## ADDED Requirements

### Requirement: Unit 14 skills carry reviewed intro teaching lines

Each Stage E Unit 14 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `equation-balance` | An equation stays balanced when the same change is made to both sides. |
| `one-step-addsub` | Undo addition with subtraction, or subtraction with addition, on both sides. |
| `one-step-multdiv` | Undo multiplication with division, or division with multiplication, on both sides. |
| `two-step` | Undo operations in reverse order, doing the same thing to both sides. |
| `vars-both-sides` | Move variable terms to one side before solving. |
| `equation-parentheses` | Distribute first, then gather variable terms and solve. |
| `with-fractions` | Multiply every term on both sides by a common denominator before solving. |
| `special-solutions` | If the variable disappears, a false statement means no solution; a true one means every solution. |
| `equation-words` | Turn the story's steps into an equation, then undo them in reverse order. |
| `rearrange-formula` | Move every other term away from the requested letter, then divide by its coefficient. |

#### Scenario: Every Unit 14 intro uses its reviewed line

- **WHEN** the Unit 14 generator set is checked at its authored source
- **THEN** all ten ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one `equation` term

#### Scenario: Unit 14 examples retain equation answers

- **WHEN** each Unit 14 intro generates its stable difficulty-1 example
- **THEN** its balanced value, solution, solution-count choice, story value, or rearranged expression can be recomputed independently from the displayed equation and its semantic source data
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, frame, expression rule, story data, or misconception
