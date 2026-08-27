## ADDED Requirements

### Requirement: Unit 8 skills carry reviewed intro teaching lines

Each Stage D Unit 8 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `add-frac-same-den` | Add the top numbers and keep the shared denominator. |
| `sub-frac-same-den` | Subtract the top numbers and keep the shared denominator. |
| `common-denominator` | A common denominator is a shared multiple of both bottom numbers. |
| `add-frac-diff-den` | Rename both fractions with a common denominator before adding their top numbers. |
| `sub-frac-diff-den` | Rename both fractions with a common denominator before subtracting their top numbers. |
| `improper-to-mixed` | Divide an improper fraction's top by its bottom to find the whole and remainder. |
| `mixed-to-improper` | For a mixed number, multiply the whole by the bottom, then add the top. |
| `add-mixed` | Add whole parts and fraction parts, then regroup any extra whole. |
| `sub-mixed` | Borrow one whole as equal fraction parts before subtracting. |
| `mult-fractions` | Multiply top numbers together, bottom numbers together, then reduce. |
| `div-fractions` | Keep the first fraction, then multiply by the second fraction's reciprocal. |
| `fraction-words` | Find the named part and whole, then write part over whole. |

#### Scenario: Every Unit 8 intro uses its reviewed line

- **WHEN** the Unit 8 generator set is checked at its authored source
- **THEN** all 12 ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `improper fraction`, `mixed number`, `common denominator`, or `reciprocal`

#### Scenario: Unit 8 examples retain exact fraction answers

- **WHEN** each Unit 8 intro generates its stable difficulty-1 example
- **THEN** its exact answer can be recomputed independently from the visible fraction or carried story quantities, including required mixed, fraction, and lowest-terms forms
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, keypad rule, story frame, or misconception
