## ADDED Requirements

### Requirement: Unit 15 skills carry reviewed intro teaching lines

Each Stage E Unit 15 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `inequality-symbols` | An inequality shows which side is larger and whether the boundary is included. |
| `graph-inequality` | Use an open circle for a strict boundary and a closed circle when included. |
| `solve-one-step-ineq` | Undo one operation on both sides without changing the inequality sign. |
| `solve-multi-step-ineq` | Undo the constant first, then undo the positive coefficient. |
| `flip-the-sign` | Multiplying or dividing both sides by a negative reverses the inequality sign. |
| `compound-inequalities` | For and, keep values that satisfy both; for or, keep values that satisfy at least one. |

#### Scenario: Every Unit 15 intro uses its reviewed line

- **WHEN** the Unit 15 generator set is checked at its authored source
- **THEN** all six ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one `inequality` term

#### Scenario: Unit 15 examples retain relation and count answers

- **WHEN** each Unit 15 intro generates its stable difficulty-1 example
- **THEN** its reading, graph description, solved relation, or satisfying-value count can be recomputed independently from the displayed relation and semantic inequality data
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, frame, relation ordering, or misconception
