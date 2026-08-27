## ADDED Requirements

### Requirement: Unit 2 skills carry reviewed intro teaching lines

Each Stage B Unit 2 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `sub-facts-small` | Subtraction takes one amount away from another. |
| `sub-facts` | Start with the first number and count back the amount taken away. |
| `sub-tens` | Subtract the counts of tens, then read the result as tens. |
| `sub-2digit-noborrow` | Line up ones under ones and tens under tens, then subtract each column. |
| `sub-2digit-borrow` | When the top ones are smaller, trade one ten for 10 ones. |
| `sub-3digit-borrow` | Subtract from right to left, borrowing from the next column when needed. |
| `sub-across-zero` | Borrow through a zero by making 10 tens, then lending one ten onward. |
| `sub-words` | Find the whole and the amount removed, then subtract. |

#### Scenario: Every Unit 2 intro uses its reviewed line

- **WHEN** the Unit 2 generator set is checked at its authored source
- **THEN** all eight ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits

#### Scenario: Unit 2 examples retain computed answers

- **WHEN** each Unit 2 intro generates its stable difficulty-1 example
- **THEN** the correct answer can be recomputed independently from the quantities visible in that example
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, or misconception
