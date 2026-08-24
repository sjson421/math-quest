## ADDED Requirements

### Requirement: Function representations share one coordinate comparison composition

A coordinate-plane problem SHALL be able to present one structured x/y table and one structured linear equation alongside its existing graph. The table SHALL retain semantic table, header, and cell markup; the equation SHALL expose one complete accessible reading; and the graph SHALL retain its single derived image name.

The three representations SHALL remain one lesson display with one declared choice answer surface. They SHALL NOT introduce a second graph, chart capability, canvas, authored drawing, external asset, or runtime dependency. At a 375-pixel viewport the composition MAY stack its representations, but every table value, equation term, graph mark, and choice SHALL remain visible and legible without horizontal overflow.

#### Scenario: Table, graph, and equation appear together

- **WHEN** a function-comparison problem declares a table rule, a graph line, and an equation rule
- **THEN** the learner receives all three representations in one composition
- **AND** assistive technology receives table semantics, the equation reading, and one graph image name

#### Scenario: Ordinary choices remain the only answer surface

- **WHEN** a three-representation function problem declares choice input
- **THEN** `Table`, `Graph`, and `Equation` choices own the answer surface
- **AND** the coordinate display does not repeat the selected choice as an answer echo

#### Scenario: The comparison fits the installed phone width

- **WHEN** representative table, graph, equation, and choice content is presented at 375 pixels wide
- **THEN** the page and comparison composition do not overflow horizontally
- **AND** every representation remains distinguishable without shrinking graph labels below the existing contract
