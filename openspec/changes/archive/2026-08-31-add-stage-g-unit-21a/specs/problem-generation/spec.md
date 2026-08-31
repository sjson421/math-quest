## ADDED Requirements

### Requirement: Statistics displays carry independently verifiable source data

A generated statistics problem SHALL carry a closed operation-specific source record beside
its visible value list or chart. List operations SHALL carry every value in visible order and,
for weighted mean, every paired weight. Categorical chart operations SHALL select one category
and series from the chart declaration. Scatter operations SHALL identify the trend question
while leaving its direction to be derived from plotted points.

Independent verification SHALL rebuild each list, value-and-weight pairing, target label, and
answer from those sources. It SHALL reject missing operation data, unsupported display and
operation pairings, out-of-range chart selectors, mismatched visible text or prompts,
non-integral targets where whole-number entry is required, ambiguous mode or trend data, and
any stated answer or choice identity that disagrees with the derivation.

#### Scenario: A list answer is rebuilt from visible values

- **WHEN** a mean, median, mode, or range operation carries its ordered values
- **THEN** verification rebuilds the displayed list and derives the requested exact result
- **AND** it does not parse learner-facing text or trust the attached answer

#### Scenario: A weighted answer uses every visible pair

- **WHEN** a weighted-mean operation carries values and their weights
- **THEN** verification rebuilds every visible pair and divides weighted total by total weight
- **AND** it rejects a missing, non-positive, or mismatched weight

#### Scenario: A chart target is derived by selector

- **WHEN** a categorical chart operation selects one valid series and category
- **THEN** verification derives the named prompt target and exact value at their intersection
- **AND** changing the selector or source value changes the derived answer

#### Scenario: A scatter trend is derived from points

- **WHEN** a scatter trend operation carries plotted points and requests a derived trend line
- **THEN** verification derives increasing, decreasing, or flat from the exact least-squares
  slope
- **AND** it does not accept a carried direction as evidence

#### Scenario: Statistics without operation data still fails closed

- **WHEN** a generated list or chart reaches verification without recognized statistics data
- **THEN** verification names the problem and rejects it
- **AND** the existing generic chart declaration does not invent answer meaning

### Requirement: Statistics source data reaches every authored-content gate

Recorded output SHALL state each statistics operation and every ordered value, weight,
category selector, series selector, chart source, and trend-line request needed to reproduce
the visible problem. Learner-text collection SHALL include every displayed list value,
value-and-weight pair, chart label, and chart value. Difficulty evidence SHALL come from the
visible source counts and magnitudes rather than from the stated answer.

#### Scenario: Changing a statistics source changes its record

- **WHEN** any list value, weight, chart selector, chart source value, point, or trend request
  changes
- **THEN** the recorded output changes with it
- **AND** no authored source field disappears from review

#### Scenario: New statistics operations cannot inherit unrelated semantics

- **WHEN** the closed statistics operation union gains an unhandled arm
- **THEN** independent verification, learner-text collection, difficulty evidence, or recorded
  output fails exhaustively
- **AND** the new arm cannot silently use another operation's answer rule
