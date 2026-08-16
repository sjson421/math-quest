## ADDED Requirements

### Requirement: An answer may be an exact ordered point

A problem SHALL be able to carry a structured point answer with an integer x-coordinate and
integer y-coordinate. A submitted point SHALL be correct only when both coordinates equal the
answer in the declared order. The point's internal submitted form SHALL be canonical and SHALL
NOT be presented to the learner as authored answer text.

Point comparison SHALL be exact. It SHALL NOT swap coordinates, round, apply a tolerance, or
coerce the ordered pair to a scalar.

#### Scenario: Both coordinates match in order

- **WHEN** the answer is `(3, 2)` and the confirmed placement is `(3, 2)`
- **THEN** the answer is correct

#### Scenario: Swapped coordinates are different

- **WHEN** the answer is `(3, 2)` and the confirmed placement is `(2, 3)`
- **THEN** the answer is incorrect

#### Scenario: A malformed point is unfinished rather than a value

- **WHEN** a point answer is checked against an entry that is not the canonical form of two
  finite integer coordinates
- **THEN** the entry is unparseable
- **AND** it does not compare as a numeric, choice, or expression answer

### Requirement: Coordinate-plane input is an exhaustive lesson input mode

The lesson SHALL route a problem declaring coordinate-plane input only to the point-placement
surface. Every exhaustive input-mode consumer SHALL handle coordinate-plane input explicitly,
including lesson control selection, visible-entry dispatch, answer-slot policy, capability
coverage, and recorded output.

#### Scenario: Point input cannot fall through to a keypad

- **WHEN** a problem declares coordinate-plane input
- **THEN** no numeric or expression keypad is presented
- **AND** the coordinate-plane placement surface is the only answer control

#### Scenario: Recorded output identifies point input and answer

- **WHEN** a point-answer problem is recorded for review
- **THEN** its output identifies the coordinate-plane input mode
- **AND** its exact ordered point answer is stated unambiguously
