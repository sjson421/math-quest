## ADDED Requirements

### Requirement: An answer may be an unordered pair of exact roots

A problem SHALL be able to carry two exact rational roots as one structured answer. Comparison SHALL use exact rational values and SHALL accept the two submitted roots in either order. It SHALL NOT round, apply a tolerance, interpret the pair as an ordered coordinate, or compare a learner-facing string.

Multiplicity SHALL remain meaningful: submitting the same value twice SHALL match only an answer that contains that value twice. Integer, decimal, and fraction entries SHALL compare by their exact rational values under the existing numeric parser.

#### Scenario: Reversed roots are correct

- **WHEN** the exact roots are `−3` and `4`
- **AND** the learner submits `4` and `−3`
- **THEN** the answer is correct

#### Scenario: Repeating one distinct root is wrong

- **WHEN** the exact roots are `−3` and `4`
- **AND** the learner submits `−3` and `−3`
- **THEN** the answer is incorrect

#### Scenario: Equivalent rational forms agree

- **WHEN** one exact root is one half
- **AND** the learner enters `0.5` or `2/4` for that slot
- **THEN** that submitted value matches the exact root

### Requirement: A root-pair entry has one private canonical submission form

The lesson SHALL carry a pending root pair through its existing single-entry boundary in one canonical internal form. That form SHALL preserve each slot's unfinished raw entry until checking, SHALL round-trip without confusing signs, slashes, decimals, or mixed-number spaces, and SHALL never be shown as authored learner-facing answer text.

#### Scenario: Both raw slots round-trip

- **WHEN** one pending slot contains `-3/4` and the other contains `1 1/2`
- **THEN** encoding and decoding the pending pair returns both raw entries unchanged

#### Scenario: Internal syntax stays private on screen

- **WHEN** a pending root pair is displayed in its two answer slots
- **THEN** learner-facing output shows the two raw numeric entries
- **AND** it does not expose the internal pair encoding

#### Scenario: Recorded answers are semantic

- **WHEN** a generated root-pair answer is recorded for review
- **THEN** recorded output names its two exact root values
- **AND** it does not expose the internal pair encoding

### Requirement: An unfinished root pair is not a wrong answer

A root-pair entry SHALL be unparseable when either slot is absent, malformed, or unfinished. If such an entry reaches the shared submission policy, the lesson SHALL keep the pair for editing and SHALL NOT record an attempt, requeue the problem, or show the worked solution.

#### Scenario: A half-typed root remains unfinished

- **WHEN** one root is complete and the other contains only `-` or `5/`
- **THEN** the pair is unparseable rather than incorrect
- **AND** no attempt is recorded and both entries remain available to edit

#### Scenario: Two complete but wrong roots are an attempt

- **WHEN** both root slots contain valid numbers that do not match the exact answer pair
- **THEN** the answer is incorrect rather than unparseable
- **AND** the ordinary wrong-answer policy applies
