## ADDED Requirements

### Requirement: Unit 3 skills carry reviewed intro teaching lines

Each Stage B Unit 3 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `mult-meaning` | Multiplication counts equal groups of the same size. |
| `times-2` | Multiplying by 2 doubles the other number. |
| `times-10` | Multiplying by 10 shifts every digit one place left. |
| `times-5` | Five equal groups make half of ten equal groups. |
| `times-3` | Multiplying by 3 adds three equal groups. |
| `times-4` | Multiply by 4 by doubling the number, then doubling again. |
| `times-6` | Six equal groups are five equal groups plus one more. |
| `times-9` | Nine equal groups are ten equal groups minus one group. |
| `times-7-8` | Build seven or eight equal groups from five groups plus the rest. |
| `times-mixed` | Either number can be the group size; the other tells how many groups. |
| `mult-by-10-100` | Multiplying by 10 or 100 shifts every digit left one or two places. |
| `mult-2by1` | Multiply the ones first, write the ones digit, then multiply tens and add the carry. |
| `mult-2by2` | Make one row for each bottom digit, shift the tens row, then add both rows. |
| `mult-words` | Use multiplication when equal groups hold the same amount. |

#### Scenario: Every Unit 3 intro uses its reviewed line

- **WHEN** the Unit 3 generator set is checked at its authored source
- **THEN** all 14 ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits

#### Scenario: Unit 3 examples retain computed answers

- **WHEN** each Unit 3 intro generates its stable difficulty-1 example
- **THEN** the correct answer can be recomputed independently from the quantities visible in that example
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, or misconception
