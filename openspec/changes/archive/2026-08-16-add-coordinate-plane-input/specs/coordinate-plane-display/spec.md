## MODIFIED Requirements

### Requirement: A coordinate-plane display uses the existing lesson entry

A problem SHALL be able to present a coordinate plane as its display while continuing to use
the answer control declared by its input mode. Coordinate-plane display by itself SHALL NOT
introduce point placement, another answer value, another submission path, or capability
availability. When the input mode is choice, the choices SHALL own the answer surface and the
display SHALL NOT repeat the selected choice as an answer echo. Number-line input SHALL
likewise keep its number line as the answer surface without a display-owned echo. When the
input mode is keypad or expression, the display SHALL frame the existing entry neutrally as
`Answer`. No input mode SHALL assert that the coordinate plane equals the answer entry.

When the problem explicitly declares coordinate-plane input, the same coordinate-plane
declaration SHALL instead supply the interactive point surface specified by
`coordinate-plane-input`. That mode SHALL replace the passive graph in the lesson rather than
rendering a second copy.

#### Scenario: A graph-reading problem keeps its declared answer control

- **WHEN** a problem presents a coordinate plane and declares choice input
- **THEN** the lesson presents the graph with its existing choice answer surface
- **AND** the selected choice continues through the ordinary answer checker
- **AND** the display does not repeat the selected choice or present a graph-equals-choice
  relationship

#### Scenario: A keypad or expression graph answer uses neutral framing

- **WHEN** a problem presents a coordinate plane and declares keypad or expression input
- **THEN** the lesson presents its existing entry slot beneath a neutral `Answer` label
- **AND** the display does not assert that the coordinate plane equals the typed value

#### Scenario: Number-line input keeps its own answer surface

- **WHEN** a problem presents a coordinate plane and declares number-line input
- **THEN** the lesson presents its existing number-line answer surface without a display-owned
  entry echo
- **AND** the display does not assert that the coordinate plane equals the placed value

#### Scenario: Coordinate-plane input replaces the passive graph

- **WHEN** a problem presents a coordinate plane and declares coordinate-plane input
- **THEN** the lesson presents one interactive graph derived from that display declaration
- **AND** it does not also present the passive graph or another answer surface

#### Scenario: Display infrastructure does not make Stage F playable

- **WHEN** coordinate-plane display exists without coordinate-plane input
- **THEN** the coordinate-plane manifest capability remains unavailable
- **AND** every Stage F skill remains planned
