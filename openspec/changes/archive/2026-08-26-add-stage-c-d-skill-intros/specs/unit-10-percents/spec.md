## ADDED Requirements

### Requirement: Unit 10 skills carry reviewed intro teaching lines

Each Stage D Unit 10 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `percent-meaning` | A percent tells how many parts out of 100. |
| `percent-to-decimal` | Divide a percent by 100, moving the decimal point two places left. |
| `decimal-to-percent` | Multiply a decimal by 100 to write its percent. |
| `percent-to-fraction` | Write the percent over 100, then reduce the fraction. |
| `percent-of` | Multiply the quantity by the percent written as a decimal. |
| `find-the-percent` | Divide the part by the whole, then multiply by 100. |
| `find-the-whole` | Divide the part by the percent written as a decimal. |
| `percent-change` | Divide the change by the original amount, then multiply by 100. |
| `discount-tax-tip` | Find the percent amount, then add or subtract it from the price. |
| `simple-interest` | Use I = Prt, writing the percent rate as a decimal. |

#### Scenario: Every Unit 10 intro uses its reviewed line

- **WHEN** the Unit 10 generator set is checked at its authored source
- **THEN** all ten ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one current-unit `percent` term

#### Scenario: Unit 10 examples retain exact percent answers

- **WHEN** each Unit 10 intro generates its stable difficulty-1 example
- **THEN** its percent, part, whole, change, final money total, or interest answer can be recomputed independently from the visible or carried quantities
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, keypad rule, story data, or misconception
