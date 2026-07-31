## ADDED Requirements

### Requirement: Authored text sources are checked at their source

Where learner-facing text comes from a fixed authored source rather than being computed per
problem, that source SHALL be checked directly, in addition to the sampling check over
generated problems. Sampling is sufficient while every string is derived from the operands of
the problem it belongs to, because drawing a thousand problems draws a thousand strings. It
stops being sufficient once text is selected from a bank: a rare entry can go undrawn across
an entire sample and still reach a learner.

#### Scenario: Unsampled authored text is still checked

- **WHEN** an authored text source contains an entry that no sampled problem used
- **THEN** that entry is still checked against the content contract

#### Scenario: The offending entry is named

- **WHEN** an authored entry breaks a content rule
- **THEN** the check fails and names the entry and the rule, not only the skill
