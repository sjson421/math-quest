## ADDED Requirements

### Requirement: Unit 4 skills carry reviewed intro teaching lines

Each Stage B Unit 4 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `div-meaning` | Division shares a total equally or counts equal groups. |
| `div-facts` | Use a multiplication fact backward to find how many groups fit. |
| `div-remainder` | A remainder is what stays after making every full group. |
| `div-by-10-100` | Dividing by 10 or 100 shifts every digit right one or two places. |
| `long-div-1digit` | Repeat divide, multiply, subtract, and bring down for each digit. |
| `long-div-remainder` | Count only full groups; an unfinished group does not add one. |
| `long-div-2digit` | Estimate each quotient digit, multiply to check, then adjust if needed. |
| `factors` | A factor divides a number exactly with nothing left over. |
| `multiples` | A multiple comes from multiplying a number by a whole number. |
| `primes` | A prime number can be divided exactly only by 1 and itself. |
| `div-words` | Find the total and number of equal groups, then divide. |

#### Scenario: Every Unit 4 intro uses its reviewed line

- **WHEN** the Unit 4 generator set is checked at its authored source
- **THEN** all 11 ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `remainder`, `factor`, `multiple`, `prime`, or `composite`

#### Scenario: Unit 4 examples retain computed answers

- **WHEN** each Unit 4 intro generates its stable difficulty-1 example
- **THEN** keypad answers and choice labels can be recomputed independently from the quantities visible in that example
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, or misconception
