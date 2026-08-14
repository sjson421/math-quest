## MODIFIED Requirements

### Requirement: The answer slot echoes an entry in the notation the problem uses

Where a submitted answer is shown back to the learner, it SHALL be drawn in the same notation
the problem itself is drawn in. What is submitted and what is checked SHALL be unaffected.

The two are already allowed to differ, and must: the checker parses a plain hyphen while
everything a learner reads carries the typographic minus the pad's own key is labelled with.
Echoing the submitted form verbatim puts both on screen at once — one sign in the problem,
another in the slot beside it — which is the control disagreeing with itself about what it
just did, and is indistinguishable from a broken control.

This SHALL hold for every sign in the entry, not only the first. A numeric entry carries at
most one, but an expression entry may carry several, and converting the leading sign alone
puts both notations inside a single answer slot — the same disagreement, one line lower.

#### Scenario: A typed negative reads as the problem reads

- **WHEN** a learner enters a negative value on the pad
- **THEN** the answer slot shows it with the same sign notation the problem uses
- **AND** the value submitted for checking is unchanged

#### Scenario: An expression entry with two signs reads consistently

- **WHEN** a learner enters an expression whose terms are both negative
- **THEN** every sign in the answer slot is drawn in the problem's notation
- **AND** the value submitted for checking is unchanged

#### Scenario: A positive entry is unaffected

- **WHEN** a learner enters a value with no sign
- **THEN** the answer slot shows exactly what was entered

#### Scenario: A partial entry is still shown

- **WHEN** a learner has entered a sign and no digits yet
- **THEN** the answer slot shows the sign in the problem's notation
- **AND** submitting it is still treated as an unfinished entry rather than a wrong answer
