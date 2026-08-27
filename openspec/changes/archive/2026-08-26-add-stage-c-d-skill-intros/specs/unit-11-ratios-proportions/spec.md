## ADDED Requirements

### Requirement: Unit 11 skills carry reviewed intro teaching lines

Each Stage D Unit 11 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `write-ratios` | A ratio compares two amounts in the requested order. |
| `simplify-ratios` | Divide both parts of a ratio by their greatest common factor. |
| `unit-rate` | A unit rate compares cost or amount for exactly one item. |
| `solve-proportions` | In a proportion, cross-multiply, then divide to find the missing value. |
| `scale-drawings` | Use the stated scale factor to move between drawing and actual lengths. |
| `unit-conversion` | Multiply toward smaller units and divide toward larger units. |
| `ratio-words` | Decide whether the ratio compares two parts or one part with the whole. |

#### Scenario: Every Unit 11 intro uses its reviewed line

- **WHEN** the Unit 11 generator set is checked at its authored source
- **THEN** all seven ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `ratio`, `proportion`, or `unit rate`

#### Scenario: Unit 11 examples retain ratio and conversion answers

- **WHEN** each Unit 11 intro generates its stable difficulty-1 example
- **THEN** its ratio, unit-rate choice, missing term, scaled length, or converted amount can be recomputed independently from the visible or carried quantities
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, keypad rule, story data, or misconception
