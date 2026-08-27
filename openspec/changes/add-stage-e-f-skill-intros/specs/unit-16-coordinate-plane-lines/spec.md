## ADDED Requirements

### Requirement: Unit 16 skills carry reviewed intro teaching lines

Each Stage F Unit 16 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `plot-points` | In an ordered pair, the first coordinate moves left or right and the second moves up or down. |
| `quadrants` | A quadrant is one of four regions named counterclockwise from the upper right. |
| `table-to-graph` | Each table row gives one point to place on the graph. |
| `slope-from-graph` | Slope is vertical change divided by horizontal change between two points. |
| `slope-from-points` | Find slope by subtracting both pairs in the same point order. |
| `y-intercept` | The y-intercept is where a line crosses the vertical axis. |
| `slope-intercept` | In y = mx + b, m gives rise over run and b gives the vertical crossing. |
| `graph-from-equation` | Use b for the vertical crossing, then m for rise over run. |
| `equation-from-graph` | Read the vertical crossing and rise over run to write the line's rule. |
| `parallel-perpendicular` | Parallel lines keep the same slope; perpendicular lines use its negative reciprocal. |

#### Scenario: Every Unit 16 intro uses its reviewed line

- **WHEN** the Unit 16 generator set is checked at its authored source
- **THEN** all ten ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `coordinate`, `quadrant`, `slope`, or `intercept`

#### Scenario: Unit 16 examples retain plane, choice, numeric, and expression answers

- **WHEN** each Unit 16 intro generates its stable difficulty-1 example
- **THEN** its point, quadrant choice, slope, intercept, matching line, equation expression, or related slope can be recomputed independently from the semantic coordinate-plane data and rendered lines
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, choice, plane, input rule, or misconception
