## MODIFIED Requirements

### Requirement: A predicted misconception may carry a non-numeric value

A generator MAY predict a mistake whose result is not a plain number. Text-valued predictions
represent exact authored forms such as an unsimplified or mis-transformed algebraic expression;
point-valued predictions represent an exact structured integer ordered pair; root-pair
predictions represent two exact rational roots whose order is not meaningful. Each kind SHALL
reach the learner and be diagnosable on the same terms as a numeric prediction, subject to the
kind-specific validation and comparison below.

A text prediction SHALL be carried unless blank, deduplicated against identical text
predictions, and matched against the learner's trimmed raw entry by direct comparison. No
algebraic equivalence is performed. The correct-answer exclusion SHALL NOT be applied to text:
an expression answer has no numeric value to compare against, so a generator remains
responsible for constructing text predictions that cannot coincide with its answer.

A point prediction SHALL contain two finite integers. It SHALL be carried unless it equals the
structured point answer, duplicates an earlier ordered point, or cannot be placed on the
declared lattice of its coordinate-plane input problem. It SHALL be diagnosed only when the
learner's parsed point has the same x and y in the same order. `(3, 2)` and `(2, 3)` are
distinct predictions.

A root-pair prediction SHALL contain two valid exact rationals and belong to a problem whose
answer and input mode both declare a root pair. It SHALL be carried unless it equals the
structured root-pair answer or duplicates an earlier root-pair prediction after exact rational
normalization and order-insensitive comparison. A malformed pair, including a non-finite
component or zero denominator, or a pair attached to another answer surface SHALL be dropped.
It SHALL be diagnosed only when both submitted roots match the prediction, in either order.
Reversing a pair SHALL NOT create a second prediction; repeating one root SHALL remain distinct
from a pair of two different roots.

Numeric, text, point, and root-pair predictions SHALL be validated and deduplicated within
their own kinds. Similar written forms across kinds SHALL NOT collide.

#### Scenario: A non-numeric prediction reaches the learner

- **WHEN** a generator predicts a non-blank text mistake
- **THEN** the prediction is carried in the problem's misconceptions unless it duplicates
  another text prediction

#### Scenario: A non-numeric prediction is diagnosed on submission

- **WHEN** a learner's raw entry, trimmed, exactly matches a carried text prediction
- **THEN** that prediction is returned as the diagnosis

#### Scenario: A blank non-numeric prediction is dropped

- **WHEN** a generator predicts a mistake whose value is an empty or whitespace-only string
- **THEN** the prediction does not reach the learner

#### Scenario: Non-numeric and numeric predictions do not collide

- **WHEN** a problem carries numeric, text, point, and root-pair predicted misconceptions with
  similar written forms
- **THEN** deduplication applies within each kind independently
- **AND** otherwise-valid predictions are never compared across kinds

#### Scenario: A non-numeric prediction equal to the answer is not dropped for the generator

- **WHEN** a generator predicts a text mistake whose text equals its own canonical expression
  answer
- **THEN** the prediction is still carried, because no correct-answer exclusion runs for text

#### Scenario: A point prediction equal to the answer is dropped

- **WHEN** a point-answer problem predicts the same ordered point as its answer
- **THEN** that prediction does not reach the learner

#### Scenario: Duplicate point predictions keep the first diagnosis

- **WHEN** two predictions carry the same ordered point under different tags
- **THEN** only the first prediction reaches the learner
- **AND** a prediction carrying the swapped point remains distinct

#### Scenario: Invalid or unreachable point predictions are dropped

- **WHEN** a point prediction contains a non-finite or non-integer coordinate, or is not a
  target on its coordinate-plane input surface
- **THEN** that prediction does not reach the learner

#### Scenario: Swapped coordinates receive their diagnosis

- **WHEN** `(2, 3)` is carried as the coordinate-order misconception for answer `(3, 2)`
- **AND** the learner confirms `(2, 3)`
- **THEN** diagnosis returns the coordinate-order misconception and its stable tag

#### Scenario: An unpredicted point has no diagnosis

- **WHEN** the learner confirms a valid wrong point not carried by any misconception
- **THEN** diagnosis returns no misconception

#### Scenario: Invalid point input has no diagnosis

- **WHEN** an entry cannot be parsed as a finite integer point
- **THEN** it matches no structured point misconception

#### Scenario: A root-pair prediction equal to the answer is dropped

- **WHEN** a root-pair problem predicts its exact answer with the two roots reversed
- **THEN** that prediction does not reach the learner

#### Scenario: Duplicate root-pair predictions keep the first diagnosis

- **WHEN** two predictions carry the same exact roots in opposite orders under different tags
- **THEN** only the first prediction reaches the learner

#### Scenario: A predicted root pair is diagnosed in either order

- **WHEN** roots `−3` and `−3` are carried as the repeated-root misconception
- **AND** the learner submits those two values in either slot order
- **THEN** diagnosis returns the repeated-root misconception and its stable tag

#### Scenario: An invalid authored root-pair prediction is dropped

- **WHEN** a generator predicts a root pair with a non-finite component, a zero denominator,
  or no matching root-pair answer and input mode
- **THEN** that prediction does not reach the learner

#### Scenario: An invalid root pair has no diagnosis

- **WHEN** either submitted root cannot be parsed as an exact rational
- **THEN** the entry matches no structured root-pair misconception
