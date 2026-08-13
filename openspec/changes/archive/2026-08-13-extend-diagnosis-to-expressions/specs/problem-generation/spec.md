## ADDED Requirements

### Requirement: A predicted misconception may carry a non-numeric value

A generator MAY predict a mistake whose result is not a plain number (for example, an
unsimplified or mis-transformed algebraic expression). Such a prediction SHALL reach the
learner and be diagnosable on exactly the same terms as a numeric prediction: it is carried
unless blank, deduplicated against other predictions of the same kind, and matched against
the learner's raw entry by direct comparison. No equivalence beyond exact match is
performed — a generator MAY declare only the exact text form it means to predict, and the
system SHALL NOT attempt to determine that two different non-numeric predictions describe
the same underlying mistake.

#### Scenario: A non-numeric prediction reaches the learner

- **WHEN** a generator predicts a mistake whose value is not a number
- **THEN** the prediction is carried in the problem's misconceptions unless it is blank or
  duplicates another prediction of the same kind

#### Scenario: A non-numeric prediction is diagnosed on submission

- **WHEN** a learner's raw entry, trimmed, exactly matches a carried non-numeric prediction
- **THEN** that prediction is returned as the diagnosis

#### Scenario: A blank non-numeric prediction is dropped

- **WHEN** a generator predicts a mistake whose value is an empty or whitespace-only string
- **THEN** the prediction does not reach the learner

#### Scenario: Non-numeric and numeric predictions do not collide

- **WHEN** a problem carries both numeric and non-numeric predicted misconceptions
- **THEN** deduplication and the correct-answer exclusion apply within each kind
  independently, and a non-numeric prediction is never compared against a numeric one
