## ADDED Requirements

### Requirement: Unit 6 skills carry reviewed intro teaching lines

Each Stage C Unit 6 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `negatives-numberline` | Negative numbers sit to the left of zero on a number line. |
| `compare-negatives` | Farther left on the number line means smaller. |
| `add-neg-pos` | With different signs, subtract the sizes and keep the larger size's sign. |
| `add-two-negs` | Add the sizes of two negative numbers, then keep the negative sign. |
| `sub-negatives` | Subtracting a negative is the same as adding its positive size. |
| `mult-negatives` | When multiplying, matching signs give positive and different signs give negative. |
| `div-negatives` | When dividing, matching signs give positive and different signs give negative. |
| `absolute-value` | Absolute value is a number's distance from zero. |
| `negatives-mixed` | Choose the operation first, then apply its negative-number rule. |

#### Scenario: Every Unit 6 intro uses its reviewed line

- **WHEN** the Unit 6 generator set is checked at its authored source
- **THEN** all nine ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits

#### Scenario: Unit 6 examples retain computed answers

- **WHEN** each Unit 6 intro generates its stable difficulty-1 example
- **THEN** keypad values, comparison choices, and number-line targets can be recomputed independently from the values visible in that example
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, number line, or misconception
