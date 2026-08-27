## ADDED Requirements

### Requirement: Unit 9 skills carry reviewed intro teaching lines

Each Stage D Unit 9 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `decimal-place-value` | Count places to the right of the decimal point. |
| `read-decimals` | The word "and" marks the decimal point when writing digits. |
| `compare-decimals` | Add ending zeros, then compare matching places from left to right. |
| `round-decimals` | Check the next digit: 5 or more rounds up. |
| `add-decimals` | Line up decimal points, then add matching places. |
| `sub-decimals` | Line up decimal points, then subtract matching places. |
| `mult-decimals` | Multiply as whole numbers, then restore all decimal places. |
| `div-decimal-by-whole` | Divide as whole numbers and bring the decimal point straight up. |
| `div-by-decimal` | Shift both decimal points equally until the divisor is whole. |
| `fraction-to-decimal` | Divide the top number by the bottom number to write a decimal. |
| `decimal-to-fraction` | Write a decimal's digits over their place value, then reduce. |
| `money-problems` | Multiply the price by the needed quantity, then write the total in dollars. |

#### Scenario: Every Unit 9 intro uses its reviewed line

- **WHEN** the Unit 9 generator set is checked at its authored source
- **THEN** all 12 ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `decimal`, `tenths`, or `hundredths`

#### Scenario: Unit 9 examples retain exact decimal answers

- **WHEN** each Unit 9 intro generates its stable difficulty-1 example
- **THEN** its answer can be recomputed independently from the visible decimal, fraction, column, choice, or carried money quantities, including required decimal and fraction forms
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, keypad rule, story frame, or misconception
