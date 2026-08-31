## ADDED Requirements

### Requirement: Probability displays carry independently verifiable counts

A generated probability problem SHALL carry a closed operation-specific source record beside
its visible story. A single-event operation SHALL carry its favourable count and its total
count. A compound operation SHALL carry both events' favourable and total counts and the cue
that combines them. A counting operation SHALL carry every independent stage's choice count in
visible order.

Independent verification SHALL rebuild each visible count, prompt, and answer from those
sources. It SHALL reject missing operation data, unsupported display and operation pairings,
a favourable count outside its total, a probability that reaches 0 or 1, mismatched visible
text or prompts, and any stated answer that disagrees with the derivation.

#### Scenario: A single-event probability is rebuilt from its counts

- **WHEN** a basic-probability operation carries its favourable and total counts
- **THEN** verification rebuilds the visible situation and derives the exact fraction
- **AND** it does not parse learner-facing text or trust the attached answer

#### Scenario: A compound probability is rebuilt from both events and its cue

- **WHEN** a compound operation carries two events and the cue combining them
- **THEN** verification multiplies for `and` and adds for `or` before comparing
- **AND** it rejects a carried cue that disagrees with the visible wording

#### Scenario: A counting answer is the product of its stages

- **WHEN** a counting operation carries every stage's choice count
- **THEN** verification derives the product as an exact whole number
- **AND** changing any stage count changes the derived answer

#### Scenario: Degenerate probability data fails closed

- **WHEN** a carried favourable count is zero, negative, or equal to its total
- **THEN** verification names the problem and rejects it
- **AND** no probability display can present a certain or impossible event

### Requirement: Fractional answers are verified exactly

Independent verification SHALL compare a fractional stated answer against a derivation
computed from the carried counts, without rounding or tolerance. An unreduced derivation and
its reduced stated answer SHALL compare equal, and any difference in value SHALL be reported
with both the stated and the derived value.

#### Scenario: Reduction does not hide a wrong answer

- **WHEN** a derivation yields `4/8` and the stated answer is `1/2`
- **THEN** verification accepts them as one value
- **AND** a stated answer of `1/3` is reported against the derived `1/2`

### Requirement: Probability source data reaches every authored-content gate

Recorded output SHALL state each probability operation and every favourable count, total
count, cue, and stage count needed to reproduce the visible problem, together with the
required fraction form where one applies. Learner-text collection SHALL include every
displayed count. Difficulty evidence SHALL come from the visible counts rather than from the
stated answer.

#### Scenario: Changing a probability source changes its record

- **WHEN** any favourable count, total count, cue, or stage count changes
- **THEN** the recorded output changes with it
- **AND** no authored source field disappears from review

#### Scenario: New probability operations cannot inherit unrelated semantics

- **WHEN** the closed statistics operation union gains an unhandled probability arm
- **THEN** independent verification, learner-text collection, difficulty evidence, or recorded
  output fails exhaustively
- **AND** the new arm cannot silently use another operation's answer rule or whole-number
  entry check
