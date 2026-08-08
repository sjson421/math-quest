## MODIFIED Requirements

### Requirement: A problem declares what its answer may contain

A problem SHALL be able to declare the character classes its answer may use — a negative sign,
a decimal point, a fraction slash. A problem that declares nothing SHALL be answerable with
whole digits only.

A problem SHALL permit a sign whenever a negative value is a plausible answer to it — either
the correct answer, or a mistake the generator predicts. Permitting it only where the correct
answer is negative withholds the key on exactly the problems where the sign is the question:
the mistake `−3 + 5` invites is `−8`, and subtracting a negative invites negating the whole
result. A learner making either cannot enter it, so it is never named — and worse, the absent
key tells them the answer is not negative, which is the one thing those skills are asking.

The declaration belongs to the problem rather than to the skill, the unit, or a stage-wide
capability. A generator knows the shape of the answer it has just computed and the mistakes it
has just predicted; nothing above it does, and a course that gated the minus key on a stage
would hold the key off every skill in the stage or force it onto all of them.

Whole digits only is the default because it is what most skills built so far want, so a
generator that says nothing keeps behaving exactly as it did.

#### Scenario: A problem that declares nothing takes whole digits

- **WHEN** a problem carries no answer-entry declaration
- **THEN** its answer may contain digits only
- **AND** no sign, decimal point, or fraction slash can be entered

#### Scenario: A problem declares the classes its answer needs

- **WHEN** a problem's answer is negative and it declares that a sign is allowed
- **THEN** a sign may be entered for that problem
- **AND** the declaration applies to that problem alone, not to the skill or the stage

#### Scenario: A predicted negative mistake is enterable

- **WHEN** a problem's correct answer is positive but it predicts a mistake below zero
- **THEN** the problem permits a sign to be entered
- **AND** a learner submitting that predicted value is diagnosed rather than blocked

## ADDED Requirements

### Requirement: The answer slot echoes an entry in the notation the problem uses

Where a submitted answer is shown back to the learner, it SHALL be drawn in the same notation
the problem itself is drawn in. What is submitted and what is checked SHALL be unaffected.

The two are already allowed to differ, and must: the checker parses a plain hyphen while
everything a learner reads carries the typographic minus the pad's own key is labelled with.
Echoing the submitted form verbatim puts both on screen at once — one sign in the problem,
another in the slot beside it — which is the control disagreeing with itself about what it
just did, and is indistinguishable from a broken control.

#### Scenario: A typed negative reads as the problem reads

- **WHEN** a learner enters a negative value on the pad
- **THEN** the answer slot shows it with the same sign notation the problem uses
- **AND** the value submitted for checking is unchanged

#### Scenario: A positive entry is unaffected

- **WHEN** a learner enters a value with no sign
- **THEN** the answer slot shows exactly what was entered

#### Scenario: A partial entry is still shown

- **WHEN** a learner has entered a sign and no digits yet
- **THEN** the answer slot shows the sign in the problem's notation
- **AND** submitting it is still treated as an unfinished entry rather than a wrong answer
