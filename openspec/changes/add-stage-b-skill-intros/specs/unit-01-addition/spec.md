## ADDED Requirements

### Requirement: Unit 1 skills carry reviewed intro teaching lines

Each Stage B Unit 1 generator SHALL carry exactly the teaching line assigned below. Its intro
SHALL pair that line with the generator's stable difficulty-1 worked example, correct answer,
and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `add-facts-small` | Addition combines two amounts into one total. |
| `add-facts` | Start with the larger number and count on the smaller number. |
| `add-tens` | Add the counts of tens, then read the result as tens. |
| `add-2digit-nocarry` | Line up ones under ones and tens under tens, then add each column. |
| `add-2digit-carry` | When the ones total 10 or more, write the ones digit and carry the ten. |
| `add-3digit` | Add from right to left, carrying into the next column when needed. |
| `add-three-numbers` | Add all three digits in each column, then carry every full ten. |
| `add-words` | Find the two amounts being combined, then add them. |

#### Scenario: Every Unit 1 intro uses its reviewed line

- **WHEN** the Unit 1 generator set is checked at its authored source
- **THEN** all eight ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits

#### Scenario: Unit 1 examples retain computed answers

- **WHEN** each Unit 1 intro generates its stable difficulty-1 example
- **THEN** the correct answer can be recomputed independently from the quantities visible in that example
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, or misconception
