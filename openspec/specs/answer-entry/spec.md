# Answer Entry

## Purpose

How a learner types an answer and what the lesson does with each possible result of checking
it: which keys a problem offers, that what the pad shows and what entry accepts are the same
rule rather than two, and that an answer which is right in value but wrong in form — or an
entry that is simply unfinished — is answered on its own terms instead of as a plain miss.

## Requirements

### Requirement: A problem declares what its answer may contain

A problem SHALL be able to declare the character classes its answer may use — a negative sign,
a decimal point, a fraction slash. A problem that declares nothing SHALL be answerable with
whole digits only.

The declaration belongs to the problem rather than to the skill, the unit, or a stage-wide
capability. A generator knows the shape of the answer it has just computed; nothing above it
does, and a course that gates the minus key on a stage would hold back the eight skills in
Unit 6 that answer positively.

Whole digits only is the default because it is what every skill built so far wants, so a
generator that says nothing keeps behaving exactly as it did.

#### Scenario: A problem that declares nothing takes whole digits

- **WHEN** a problem carries no answer-entry declaration
- **THEN** its answer may contain digits only
- **AND** no sign, decimal point, or fraction slash can be entered

#### Scenario: A problem declares the classes its answer needs

- **WHEN** a problem's answer is negative and it declares that a sign is allowed
- **THEN** a sign may be entered for that problem
- **AND** the declaration applies to that problem alone, not to the skill or the stage

### Requirement: The pad offers exactly the keys the problem permits

The answer pad SHALL show a key for a character class only when the current problem permits
that class, and SHALL keep its layout stable whether or not a key is shown.

A key that cannot be used is worse than absent: it invites a tap that does nothing, which
reads as the app being broken. A pad that reflows as the course advances is a second problem —
the digits must stay where the learner's thumb expects them.

#### Scenario: A permitted class gets a key

- **WHEN** the current problem permits a fraction slash
- **THEN** the pad shows a fraction key

#### Scenario: An unpermitted class gets no key

- **WHEN** the current problem permits no decimal point
- **THEN** the pad shows no decimal key
- **AND** the digit keys stay in the same positions they occupy for every other problem

### Requirement: What the pad shows and what entry accepts are one rule

The rules governing which keys are displayed and the rules governing which characters an entry
may accept SHALL be the same declaration, read from the current problem in both places.

Two copies of this rule would drift, and drift here is invisible: a pad that offers a key the
entry logic silently discards looks identical to a broken key.

#### Scenario: A disallowed character is refused however it arrives

- **WHEN** a key press for a class the current problem does not permit reaches the entry
- **THEN** the entry is left unchanged

#### Scenario: Display and entry read the same declaration

- **WHEN** the current problem's declaration permits a class
- **THEN** that class both appears on the pad and is accepted into the entry

### Requirement: An answer that is right in value but wrong in form is answered as such

When a submitted answer matches the expected value but not the form the skill is teaching, the
lesson SHALL respond to that specifically: it SHALL tell the learner the value is right and ask
for the form, and it SHALL NOT show the worked solution.

The lesson SHALL treat it as not yet complete — the correct-answer count does not advance and
the problem returns later in the session, exactly as any other unfinished problem does. The
attempt SHALL be recorded as incorrect, with no misconception tag, since the mistake is one the
generator did not predict a value for.

Withholding the worked solution is the point. Partial simplification is the named wall at
`simplify-fractions`, and a learner who reached the right value has done the arithmetic; handing
them the full working answers a question they did not get wrong and removes the only step left
to take.

#### Scenario: An unreduced answer is acknowledged, not corrected

- **WHEN** a learner submits a numerically correct answer that is not in the required form
- **THEN** the learner is told the value is right and asked for the required form
- **AND** the worked solution is not shown

#### Scenario: An unreduced answer does not complete the problem

- **WHEN** a learner submits a numerically correct answer that is not in the required form
- **THEN** the correct-answer count does not advance
- **AND** the problem returns later in the same session
- **AND** the attempt is recorded as incorrect with no misconception tag

### Requirement: An unfinished entry is not a wrong answer

When a submitted entry cannot be read as a number at all, the lesson SHALL return the learner
to the pad with the entry intact and SHALL NOT record an attempt, re-queue the problem, or show
the worked solution.

This becomes reachable the moment a sign or a slash is on the pad: `-` alone and `5/` are both
partial entries, not answers. Charging an attempt for a half-typed number punishes typing
speed, and the worked solution spoils a problem the learner has not yet attempted.

#### Scenario: A half-typed number returns to the pad

- **WHEN** a learner submits an entry that cannot be read as a number
- **THEN** the learner is told the entry is incomplete rather than wrong
- **AND** the entry is left in place to be finished
- **AND** no attempt is recorded and the worked solution is not shown

#### Scenario: A genuine wrong answer is unaffected

- **WHEN** a learner submits an entry that reads as a number and is not the expected value
- **THEN** it is diagnosed and answered as a wrong answer, as before

