## ADDED Requirements

### Requirement: Function equations carry independently verifiable source data

A generated function equation SHALL carry a closed operation-specific source record beside
its visible statement. A notation-reading record SHALL contain the displayed input and output.
An evaluation record SHALL contain the displayed linear coefficient and constant, the requested
input, and the requested-input label used by the separate answer row.

Independent verification SHALL rebuild the complete visible function statement and requested
input from those values. It SHALL derive the one correct reading choice or exact evaluated
output without parsing learner-facing text or trusting the generator's stated answer.

#### Scenario: A function mapping is rebuilt from its two values

- **WHEN** a notation problem carries input `3` and output `7`
- **THEN** verification rebuilds `f(3) = 7`
- **AND** derives the stable choice meaning input `3` gives output `7`

#### Scenario: An evaluated output is rebuilt from its rule

- **WHEN** an evaluation problem carries coefficient `2`, constant `−3`, and requested input `4`
- **THEN** verification rebuilds `f(x) = 2x − 3` and the answer label `f(4)`
- **AND** derives the exact output `5`

### Requirement: Function coordinate operations reach every authored-content gate

A generated function coordinate problem SHALL distinguish domain or range selection,
linearity classification, and three-representation comparison as closed coordinate operations.
Independent verification SHALL derive domain and range from visible points, derive linearity
from exact point differences, and derive table, graph, and equation properties from their
separate structured sources. It SHALL reject missing operation data, duplicate function inputs,
ambiguous sets, mismatched classifications, hidden initial-value intercepts, comparison ties,
and any table, graph, equation, answer, or choice identity that disagrees with those sources.

Learner-text collection SHALL include every function value rendered beside or inside the graph.
Recorded output SHALL state the operation and every source point, table row, equation
coefficient, requested property, and graph declaration needed to reproduce the visible problem.
Difficulty evidence SHALL come from those displayed source values and graph bounds rather than
the stated answer.

#### Scenario: A finite relation supplies domain, range, and linearity

- **WHEN** a coordinate operation carries a finite function as plotted points
- **THEN** verification derives each distinct coordinate set and every consecutive exact slope
- **AND** it does not consult the attached choice answer to decide the requested set or class

#### Scenario: A comparison winner is rebuilt across three forms

- **WHEN** a comparison carries table rows, one graph line, one equation rule, and a requested property
- **THEN** verification derives all three rates or initial values independently
- **AND** exactly one stable `Table`, `Graph`, or `Equation` choice is the derived winner

#### Scenario: Initial-value graph evidence remains visible

- **WHEN** a comparison asks for the greatest initial value
- **THEN** verification requires the graph's y-intercept to lie on a visible y-axis tick
- **AND** requires the table to expose its row at `x = 0`

#### Scenario: New function operations cannot disappear silently

- **WHEN** either closed function operation union gains an unhandled arm
- **THEN** independent verification, learner-text collection, difficulty evidence, or recorded output fails exhaustively
- **AND** the new arm cannot inherit unrelated equation or graph semantics
