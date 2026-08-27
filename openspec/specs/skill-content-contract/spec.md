# Skill Content Contract

## Purpose

Limits on the learner-facing text a generator produces. Brevity is a requirement,
not a preference: a worked example outperforms prose for a novice, and long explanations are
where a learner disengages.

Because the text is generated rather than authored, these are enforced at test time over
sampled problems rather than by reading source.

## Requirements

### Requirement: Learner-facing text stays within complete authoring limits

Every generated problem SHALL continue to satisfy the fixed hint and solution limits below.
Every playable generator SHALL also carry exactly one authored teaching line and present
exactly one generated worked example. A newly playable generator SHALL NOT omit its teaching
line or fall back to a problem-first lesson.

Limits per skill:

| Element | Limit |
|---|---|
| Teaching line | exactly 1; 1 sentence |
| Worked example | exactly 1 |
| Hint | 1 sentence |
| Solution steps | at most 4 |
| Words per solution step | at most 12 |
| New vocabulary words | at most 1 per teaching line |

Teaching lines are fixed authored sources, so their checks SHALL run directly over every
playable generator rather than rely on generated-problem sampling. The same curated
vocabulary authority used for forward references SHALL reject a later-unit term and SHALL
count terms introduced in the current unit, rejecting a teaching line that introduces more
than one.

#### Scenario: Solution step count is enforced

- **WHEN** a generator produces a problem with 5 or more solution steps
- **THEN** the content check fails and names the skill

#### Scenario: Solution step length is enforced

- **WHEN** any solution step's text exceeds 12 words
- **THEN** the content check fails and reports the step and its word count

#### Scenario: Hint is a single sentence

- **WHEN** a generator produces a problem with a hint containing more than one sentence
- **THEN** the content check fails

#### Scenario: Every problem carries a hint and a solution

- **WHEN** a generator produces a problem
- **THEN** the hint is non-empty
- **AND** at least one solution step is present

#### Scenario: A required teaching line is checked at its source

- **WHEN** a playable generator has an empty or multi-sentence teaching line
- **THEN** the content check fails and names the skill and teaching-line rule

#### Scenario: A teaching line introduces too much vocabulary

- **WHEN** a teaching line contains more than one curated term introduced in that skill's unit
- **THEN** the content check fails and names the terms

#### Scenario: A future playable generator cannot omit teaching content

- **WHEN** a generator is added for a planned Stage G or Stage H skill
- **THEN** its declaration requires one authored teaching line
- **AND** its lesson presents the existing stable worked example before first practice

### Requirement: Solution steps show their arithmetic

A solution step SHALL be able to carry a `detail` line holding the concrete arithmetic for
that step, separate from its prose. The prose says what to do; the detail shows it done
with the actual numbers.

#### Scenario: Detail carries real operands

- **WHEN** a step describes adding the ones column of 27 + 45
- **THEN** its detail shows `7 + 5 = 12` using the operands actually displayed

#### Scenario: Detail is optional

- **WHEN** a step is purely instructional with no arithmetic
- **THEN** it may omit the detail line

### Requirement: No forward references

Skill text SHALL NOT mention a concept introduced in a later unit, even in passing. A
learner meeting an unexplained term concludes they have missed something, which is the
exact failure this course is built to avoid.

#### Scenario: Later-unit vocabulary is rejected

- **WHEN** a skill's text uses a term whose introducing unit comes later in the manifest
- **THEN** the content check fails and names the term and both units

### Requirement: Feedback tone is warm and specific

Misconception text SHALL name the actual error and SHALL NOT scold. It SHALL be phrased as
a correction of the work rather than of the learner, and MUST NOT use failure language.

#### Scenario: Misconception names the real error

- **WHEN** a learner's answer matches a predicted misconception
- **THEN** the feedback describes that specific mistake rather than saying "incorrect"

#### Scenario: No scolding language

- **WHEN** misconception text is authored
- **THEN** it contains no failure or blame wording

### Requirement: Wall skills carry misconception coverage

A skill flagged as a difficulty wall in the manifest SHALL predict at least two distinct
misconceptions. These are the points where learners historically quit, and a bare
"incorrect" there is the most costly response the app can give.

#### Scenario: Wall skill without predictions is rejected

- **WHEN** a skill marked as a wall predicts fewer than 2 misconceptions
- **THEN** the content check fails and names the skill

#### Scenario: Predicted value never equals the answer

- **WHEN** a misconception's predicted value equals the correct answer
- **THEN** it is discarded before the problem reaches the learner

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
