## ADDED Requirements

### Requirement: Unit 7 skills carry reviewed intro teaching lines

Each Stage D Unit 7 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `fraction-meaning` | A fraction writes selected equal parts over all equal parts. |
| `fraction-of-shape` | Count shaded equal parts over all equal parts in the shape. |
| `name-parts` | A fraction's top number counts selected parts; its bottom counts all equal parts. |
| `fractions-numberline` | Split the space from zero to one into equal parts, then count right. |
| `equivalent-visual` | Equivalent fractions name the same amount with different equal pieces. |
| `equivalent-multiply` | Multiply or divide both fraction parts by the same number. |
| `simplify-fractions` | Lowest terms use no shared factor except 1. |
| `compare-same-den` | With matching denominators, the larger top number makes the larger fraction. |
| `compare-diff-den` | Rename both fractions with one shared denominator, then compare their top numbers. |

#### Scenario: Every Unit 7 intro uses its reviewed line

- **WHEN** the Unit 7 generator set is checked at its authored source
- **THEN** all nine ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `numerator`, `denominator`, `equivalent fraction`, or `lowest terms`

#### Scenario: Unit 7 examples retain represented answers

- **WHEN** each Unit 7 intro generates its stable difficulty-1 example
- **THEN** exact fractions, choice labels, number-line targets, and shaded amounts can be recomputed independently from the visible notation or diagram
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, number line, or misconception
