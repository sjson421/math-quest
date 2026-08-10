## ADDED Requirements

### Requirement: Numeric mistakes are diagnosed in every permitted entry form

A finite predicted misconception value SHALL be matchable from any submitted integer,
decimal, or simple-fraction form that represents that value exactly enough for the existing
numeric prediction. Parsing the entry for diagnosis SHALL preserve the existing behavior for
whole-number entries and numeric choice ids, and an unparseable entry SHALL match no
misconception.

#### Scenario: A slash-form mistake receives its diagnosis

- **WHEN** a learner submits a valid fraction equal to a predicted misconception value
- **THEN** the lesson returns that misconception's specific feedback
- **AND** records its stable tag with the incorrect attempt

#### Scenario: Existing scalar diagnosis remains intact

- **WHEN** a learner submits an integer, decimal, or numeric choice id matching a prediction
- **THEN** diagnosis produces the same matching misconception as before

#### Scenario: An unfinished fraction has no diagnosis

- **WHEN** a learner submits a fraction entry that cannot yet be parsed
- **THEN** no misconception is matched
- **AND** the existing unfinished-entry response remains responsible for the submission
